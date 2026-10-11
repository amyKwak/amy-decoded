import { stripMarkup } from "./extract-parse";
import { computeStats, GROUP_BYS, METRICS, type GroupBy, type GroupStat, type Metric, type StatsResult } from "./stats";
import type { Entry } from "./types";

/**
 * JSON schema for Ask Moody's final answer (output_config.format). Claude
 * picks what matters and writes the words; it never supplies the numbers we
 * display. A finding points at a stat by metric, group_by, and key, and the
 * browser fills in the real values from its own get_stats results.
 */
export const ANSWER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "tone", "findings", "evidence", "confidence", "confidence_note", "suggestion"],
  properties: {
    headline: { type: "string", description: "The single most important takeaway, under 15 words" },
    tone: { type: "string", enum: ["positive", "negative", "mixed", "neutral"] },
    findings: {
      type: "array",
      description: "Up to 3 most important findings, most important first",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail", "tone", "stat"],
        properties: {
          title: { type: "string", description: "Under 8 words" },
          detail: { type: "string", description: "One sentence, under 25 words, with dates when relevant" },
          tone: { type: "string", enum: ["positive", "negative", "neutral"] },
          stat: {
            description: "The get_stats group this finding is based on, or null",
            anyOf: [
              { type: "null" },
              {
                type: "object",
                additionalProperties: false,
                required: ["metric", "group_by", "key"],
                properties: {
                  metric: { type: "string", enum: [...METRICS] },
                  group_by: { type: "string", enum: [...GROUP_BYS] },
                  key: { type: "string", description: "The group key exactly as get_stats returned it" },
                },
              },
            ],
          },
        },
      },
    },
    evidence: {
      type: "array",
      description: "Up to 3 short quotes copied word for word from the journal field of entries you looked up",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "quote"],
        properties: {
          date: { type: "string", description: "YYYY-MM-DD of the entry" },
          quote: { type: "string", description: "Exact words from that entry's journal, under 15 words" },
        },
      },
    },
    confidence: { type: "string", enum: ["solid", "some", "thin"] },
    confidence_note: { type: "string", description: "One short phrase about how much data this is based on" },
    suggestion: {
      description: "One gentle, practical next step, or a nudge to see a clinician when warranted. null if none.",
      anyOf: [{ type: "string" }, { type: "null" }],
    },
  },
} as const;

export type FindingTone = "positive" | "negative" | "neutral";

export interface StatRef {
  metric: Metric;
  group_by: GroupBy;
  key: string;
}

export interface Finding {
  title: string;
  detail: string;
  tone: FindingTone;
  stat: StatRef | null;
}

export interface Answer {
  headline: string;
  tone: "positive" | "negative" | "mixed" | "neutral";
  findings: Finding[];
  evidence: { date: string; quote: string }[];
  confidence: "solid" | "some" | "thin";
  confidence_note: string;
  suggestion: string | null;
}

const text = (v: unknown, max: number) => (typeof v === "string" ? stripMarkup(v).slice(0, max) : "");
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback;

/**
 * Parses the model's final JSON like untrusted input: every field is
 * type-checked, enums fall back to safe defaults, strings are stripped and
 * capped, lists are capped. Returns null if it isn't usable JSON.
 */
export function parseAnswer(raw: string): Answer | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  const headline = text(d.headline, 140);
  if (!headline) return null;

  const findings: Finding[] = (Array.isArray(d.findings) ? d.findings : [])
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map((f) => {
      const s = f.stat as Record<string, unknown> | null;
      const stat =
        s && typeof s === "object" && METRICS.includes(s.metric as Metric) && GROUP_BYS.includes(s.group_by as GroupBy) && typeof s.key === "string"
          ? { metric: s.metric as Metric, group_by: s.group_by as GroupBy, key: s.key.slice(0, 60) }
          : null;
      return {
        title: text(f.title, 60),
        detail: text(f.detail, 220),
        tone: oneOf(f.tone, ["positive", "negative", "neutral"] as const, "neutral"),
        stat,
      };
    })
    .filter((f) => f.title)
    .slice(0, 3);

  const evidence = (Array.isArray(d.evidence) ? d.evidence : [])
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((e) => ({ date: typeof e.date === "string" ? e.date : "", quote: text(e.quote, 200) }))
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.quote)
    .slice(0, 3);

  const suggestion = text(d.suggestion, 240);

  return {
    headline,
    tone: oneOf(d.tone, ["positive", "negative", "mixed", "neutral"] as const, "neutral"),
    findings,
    evidence,
    confidence: oneOf(d.confidence, ["solid", "some", "thin"] as const, "some"),
    confidence_note: text(d.confidence_note, 160),
    suggestion: suggestion || null,
  };
}

function normalizeQuote(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”"]/g, "")
    .replace(/\.{3}|…/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s.,;:!?'-]+|[\s.,;:!?'-]+$/g, "");
}

/** Keeps only quotes that really appear in that day's journal. */
export function verifyEvidence(evidence: Answer["evidence"], entries: Entry[]): Answer["evidence"] {
  return evidence.filter(({ date, quote }) => {
    const q = normalizeQuote(quote);
    if (q.length < 3) return false;
    return entries.some((e) => e.date === date && normalizeQuote(e.journal).includes(q));
  });
}

export interface ResolvedStat {
  metric: Metric;
  group: GroupStat;
  overall: number;
}

/**
 * Finds the numbers behind a finding: first in the get_stats results from
 * this conversation (newest first), then by computing over all entries.
 */
export function resolveStat(ref: StatRef, seen: StatsResult[], entries: Entry[]): ResolvedStat | null {
  const lookIn = (r: StatsResult) => {
    if (r.metric !== ref.metric || r.group_by !== ref.group_by || r.overall.mean === null) return null;
    const group = r.groups.find((g) => g.key.toLowerCase() === ref.key.toLowerCase());
    return group ? { metric: ref.metric, group, overall: r.overall.mean } : null;
  };
  for (let i = seen.length - 1; i >= 0; i--) {
    const hit = lookIn(seen[i]);
    if (hit) return hit;
  }
  return lookIn(computeStats(entries, ref.metric, ref.group_by));
}

export const METRIC_SCALES: Record<Metric, { min: number; max: number; label: string; scale: string }> = {
  valence: { min: 1, max: 9, label: "Pleasantness", scale: "1 to 9" },
  arousal: { min: 1, max: 9, label: "Energy", scale: "1 to 9" },
  sleepHours: { min: 0, max: 12, label: "Hours slept", scale: "hours" },
  sleepQuality: { min: 1, max: 5, label: "Sleep quality", scale: "1 to 5" },
  phq4: { min: 0, max: 12, label: "PHQ-4 total", scale: "0 to 12" },
};
