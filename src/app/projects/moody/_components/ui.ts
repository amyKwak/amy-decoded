import type { Quadrant } from "@/lib/moody/affect";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moody-ink";

export const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-full bg-moody-accent px-5 py-2.5 text-[15px] font-bold text-white hover:bg-[#4a4ac2] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const secondaryBtn = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-moody-ink bg-white px-4 py-2 text-sm font-bold text-moody-ink hover:bg-moody-pink-pale disabled:opacity-40 ${focusRing}`;

export const card = "rounded-[24px] border-2 border-moody-ink bg-white shadow-[0_8px_24px_rgba(91,91,208,0.08)]";

export const label = "text-xs font-bold uppercase tracking-[0.12em] text-moody-muted";

export const heading = "text-xl font-bold text-moody-ink tablet:text-[22px]";

/**
 * Quadrant colors: soft sunshine, mint, a gentle rose-red for distress, and
 * periwinkle. Bright but calm. Checked for colorblind separation; pastels
 * are low contrast on white, so every use pairs them with an outline and a
 * text label.
 */
export const QUADRANT_COLORS: Record<Quadrant, string> = {
  "high-pleasant": "#ffe07a",
  "high-unpleasant": "#f48198",
  "low-pleasant": "#a6f0c8",
  "low-unpleasant": "#a9aef6",
  neutral: "#f1eef8",
};

export type Tone = "positive" | "negative" | "mixed" | "neutral";

export const TONE_STYLES: Record<Tone, { soft: string; accent: string }> = {
  positive: { soft: "#e6fbef", accent: "#8fe8b9" },
  negative: { soft: "#ffeaef", accent: "#f48198" },
  mixed: { soft: "#fff2df", accent: "#ffc98a" },
  neutral: { soft: "#eeeeff", accent: "#a9aef6" },
};

/** Local calendar date as YYYY-MM-DD. */
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", opts);
}
