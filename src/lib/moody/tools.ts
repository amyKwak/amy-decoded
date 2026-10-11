import type Anthropic from "@anthropic-ai/sdk";
import { computeStats, filterByDate, GROUP_BYS, METRICS, type GroupBy, type Metric } from "./stats";
import type { Entry } from "./types";

/**
 * Tool definitions sent to Claude by the /api/moody/ask route. The
 * implementations below run in the browser, against IndexedDB data, so the
 * server never sees entries unless the model asks for them.
 */
export const MOODY_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_entries",
    description:
      "Get the user's mood entries, newest first, in a compact form. Each entry has the date, self-reported valence (v, 1 unpleasant to 9 pleasant) and arousal (a, 1 low energy to 9 high energy), sleep, confirmed feeling words, people, activities, triggers, a summary, and a snippet of the journal in the user's own words. Use a date range to focus on a period.",
    input_schema: {
      type: "object",
      properties: {
        start_date: { type: "string", description: "Inclusive, YYYY-MM-DD" },
        end_date: { type: "string", description: "Inclusive, YYYY-MM-DD" },
        limit: { type: "integer", description: "Max entries to return, 1 to 31. Default 14." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_stats",
    description:
      "Compute the average of a metric overall and grouped by a dimension. Returns mean, n, and difference from the overall average for each group. Groups with fewer than 3 data points are marked reliable: false; do not draw conclusions from them. sleepQuality is scored 1 (very poor) to 5 (very good). phq4 is the weekly screening total, 0 to 12.",
    input_schema: {
      type: "object",
      properties: {
        metric: { type: "string", enum: [...METRICS] },
        group_by: { type: "string", enum: [...GROUP_BYS] },
        start_date: { type: "string", description: "Inclusive, YYYY-MM-DD" },
        end_date: { type: "string", description: "Inclusive, YYYY-MM-DD" },
      },
      required: ["metric", "group_by"],
      additionalProperties: false,
    },
  },
  {
    name: "search_entries",
    description:
      "Keyword search over journal text, feeling words, people, activities, triggers, and summaries. Returns the best matching compact entries, newest first among ties.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "A few keywords, for example 'deadline work'" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
];

export interface CompactEntry {
  date: string;
  v: number;
  a: number;
  sleep_h: number | null;
  sleep_q: string | null;
  feelings: string[];
  people: string[];
  activities: string[];
  triggers: string[];
  summary: string;
  journal: string;
  phq4_total?: number;
}

const SNIPPET_CHARS = 220;

/** Short keys and a truncated journal keep tool results cheap in tokens. */
export function compactEntry(e: Entry): CompactEntry {
  const journal =
    e.journal.length > SNIPPET_CHARS ? `${e.journal.slice(0, SNIPPET_CHARS).trimEnd()}...` : e.journal;
  const c: CompactEntry = {
    date: e.date,
    v: e.valence,
    a: e.arousal,
    sleep_h: e.sleepHours,
    sleep_q: e.sleepQuality,
    feelings: e.emotions,
    people: e.people,
    activities: e.activities,
    triggers: e.triggers,
    summary: e.summary,
    journal,
  };
  if (e.phq4) c.phq4_total = e.phq4.reduce((a, b) => a + b, 0);
  return c;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const asDate = (x: unknown) => (typeof x === "string" && DATE_RE.test(x) ? x : undefined);
const byNewest = (a: Entry, b: Entry) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt;

const STOPWORDS = new Set([
  "the", "and", "for", "with", "was", "were", "that", "this", "have", "had", "when", "what",
  "how", "did", "does", "feel", "felt", "about", "from", "into", "days", "day", "my", "me",
]);

function getEntries(entries: Entry[], input: Record<string, unknown>) {
  const range = { start_date: asDate(input.start_date), end_date: asDate(input.end_date) };
  const rawLimit = typeof input.limit === "number" ? Math.floor(input.limit) : 14;
  const limit = Math.min(31, Math.max(1, rawLimit));
  const matched = filterByDate(entries, range).sort(byNewest);
  return {
    total_matching: matched.length,
    returned: Math.min(limit, matched.length),
    entries: matched.slice(0, limit).map(compactEntry),
  };
}

function getStats(entries: Entry[], input: Record<string, unknown>) {
  const metric = input.metric as Metric;
  const groupBy = input.group_by as GroupBy;
  if (!METRICS.includes(metric)) throw new Error(`metric must be one of ${METRICS.join(", ")}`);
  if (!GROUP_BYS.includes(groupBy)) throw new Error(`group_by must be one of ${GROUP_BYS.join(", ")}`);
  return computeStats(entries, metric, groupBy, {
    start_date: asDate(input.start_date),
    end_date: asDate(input.end_date),
  });
}

function searchEntries(entries: Entry[], input: Record<string, unknown>) {
  const query = typeof input.query === "string" ? input.query.toLowerCase() : "";
  const terms = [...new Set(query.split(/[^a-z0-9']+/))].filter(
    (t) => t.length >= 3 && !STOPWORDS.has(t),
  );
  if (terms.length === 0) throw new Error("query needs at least one keyword of 3 or more letters");

  const scored = entries
    .map((e) => {
      const haystack = [e.journal, e.summary, ...e.emotions, ...e.people, ...e.activities, ...e.triggers]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.e, b.e));

  return {
    terms,
    total_matching: scored.length,
    entries: scored.slice(0, 10).map((x) => compactEntry(x.e)),
  };
}

export const TOOL_IMPLEMENTATIONS: Record<
  string,
  (entries: Entry[], input: Record<string, unknown>) => unknown
> = {
  get_entries: getEntries,
  get_stats: getStats,
  search_entries: searchEntries,
};

/** Runs one tool call locally. Throws on unknown tools or bad input. */
export function runTool(name: string, input: unknown, entries: Entry[]): unknown {
  const impl = TOOL_IMPLEMENTATIONS[name];
  if (!impl) throw new Error(`Unknown tool: ${name}`);
  const args = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return impl(entries, args);
}

/** Plain-language label for the "lookups" list in the UI. */
export function describeToolCall(name: string, input: unknown): string {
  const i = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const range =
    i.start_date || i.end_date ? ` from ${i.start_date ?? "the start"} to ${i.end_date ?? "today"}` : "";
  const metricNames: Record<string, string> = {
    valence: "pleasantness",
    arousal: "energy",
    sleepHours: "hours slept",
    sleepQuality: "sleep quality",
    phq4: "PHQ-4 total",
  };
  switch (name) {
    case "get_entries":
      return `Read entries${range}`;
    case "get_stats":
      return `Averaged ${metricNames[String(i.metric)] ?? i.metric} by ${i.group_by}${range}`;
    case "search_entries":
      return `Searched entries for "${String(i.query ?? "")}"`;
    default:
      return `Called ${name}`;
  }
}
