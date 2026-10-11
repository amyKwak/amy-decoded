import type { Extraction } from "./types";

/** Caps applied to model output, which we treat like untrusted user input. */
export const EXTRACT_LIMITS = {
  emotions: 5,
  people: 8,
  activities: 8,
  triggers: 8,
  tagChars: 40,
  summaryChars: 200,
} as const;

export function stripMarkup(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ") // tags like <entry> or <script>
    .replace(/[<>]/g, " ") // stray angle brackets
    .replace(/[`*_#]+/g, "") // markdown emphasis or headings
    .replace(/[\u0000-\u001f\u007f]/g, " ") // control characters
    .replace(/\s+/g, " ")
    .trim();
}

/** Lowercase, strip, length-cap, and dedupe a list of tags. */
export function cleanTags(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const tag = stripMarkup(item).toLowerCase().slice(0, EXTRACT_LIMITS.tagChars).trim();
    if (tag && !out.includes(tag)) out.push(tag);
    if (out.length >= max) break;
  }
  return out;
}

export const EMPTY_EXTRACTION: Extraction = {
  emotions: [],
  people: [],
  activities: [],
  triggers: [],
  summary: "",
  safety_concern: false,
};

/**
 * Pure parser for the record_entry tool input. Even with a forced tool and a
 * JSON schema, the model's output is data we did not write, so every field is
 * type-checked, cleaned, and capped. Unknown fields are dropped.
 */
export function parseExtraction(raw: unknown): Extraction {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...EMPTY_EXTRACTION };
  const r = raw as Record<string, unknown>;
  const summary =
    typeof r.summary === "string" ? stripMarkup(r.summary).slice(0, EXTRACT_LIMITS.summaryChars) : "";
  return {
    emotions: cleanTags(r.emotions, EXTRACT_LIMITS.emotions),
    people: cleanTags(r.people, EXTRACT_LIMITS.people),
    activities: cleanTags(r.activities, EXTRACT_LIMITS.activities),
    triggers: cleanTags(r.triggers, EXTRACT_LIMITS.triggers),
    summary,
    safety_concern: r.safety_concern === true,
  };
}
