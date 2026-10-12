import type { Quadrant } from "@/lib/moody/affect";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moody-accent";

export const primaryBtn = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-moody-accent px-6 text-[15px] font-bold text-white transition-colors hover:bg-moody-accent-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const secondaryBtn = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-moody-line-strong bg-white px-5 text-[15px] font-semibold text-moody-ink transition-colors hover:bg-moody-bg disabled:opacity-40 ${focusRing}`;

export const quietBtn = `inline-flex min-h-11 items-center justify-center rounded-full px-3.5 text-[15px] font-semibold text-moody-muted transition-colors hover:text-moody-ink disabled:opacity-40 ${focusRing}`;

/** Selectable pill (sleep quality, feeling words, PHQ-4 options). */
export const pill = `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-moody-line-strong bg-white px-4.5 text-[15px] text-moody-ink transition-colors hover:bg-moody-bg`;
export const pillOn =
  "border-moody-accent bg-moody-accent-soft font-bold hover:bg-moody-accent-soft";
/** Same as pillOn, for a label wrapping a checked radio. */
export const pillChecked =
  "has-checked:border-moody-accent has-checked:bg-moody-accent-soft has-checked:font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-moody-accent";

export const field = `rounded-2xl border border-moody-line-strong bg-moody-field px-4 text-base text-moody-ink placeholder:text-moody-muted ${focusRing}`;

export const card = "rounded-3xl border border-moody-line bg-white";

export const label =
  "text-[13px] font-bold uppercase tracking-[0.08em] text-moody-muted";

export const heading =
  "font-(family-name:--font-quicksand) text-[22px] font-bold leading-tight text-moody-ink tablet:text-[26px]";

/**
 * Quadrant colors: baby yellow, soft green, coral and sky blue. Gentle on a
 * cream ground; every use pairs them with a text label, and the four differ
 * in lightness as well as hue.
 */
export const QUADRANT_COLORS: Record<Quadrant, string> = {
  "high-pleasant": "#ffe58a",
  "high-unpleasant": "#f3a898",
  "low-pleasant": "#a8ddb5",
  "low-unpleasant": "#9ccbf0",
  neutral: "#f1ebdf",
};

/** Everyday names for the quadrants, shown in the UI. */
export const MOOD_NAMES: Record<Quadrant, string> = {
  "high-pleasant": "Excited, upbeat",
  "high-unpleasant": "Tense, stressed",
  "low-pleasant": "Calm, content",
  "low-unpleasant": "Low, drained",
  neutral: "Somewhere in the middle",
};

export type Tone = "positive" | "negative" | "mixed" | "neutral";

export const TONE_STYLES: Record<
  Tone,
  { soft: string; accent: string; ink: string }
> = {
  positive: { soft: "#e9f6f0", accent: "#7cc491", ink: "#2e7d6d" },
  negative: { soft: "#fce1da", accent: "#f3a898", ink: "#a44b37" },
  mixed: { soft: "#fff6d4", accent: "#f2cf5b", ink: "#7a5c12" },
  neutral: { soft: "#e5f1fc", accent: "#9ccbf0", ink: "#2f74b5" },
};

/** Local calendar date as YYYY-MM-DD. */
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function formatDate(
  date: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", opts);
}
