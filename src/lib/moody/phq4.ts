import type { Entry, Phq4Answers } from "./types";

/** Kroenke et al., 2009. Standard item order: two anxiety, then two depression. */
export const PHQ4_STEM =
  "Over the last 2 weeks, how often have you been bothered by the following problems?";

export const PHQ4_ITEMS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
] as const;

export const PHQ4_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
] as const;

export type Phq4Band = "normal" | "mild" | "moderate" | "severe";

export interface Phq4Score {
  total: number;
  anxiety: number;
  depression: number;
  band: Phq4Band;
  /** Subscale of 3 or more is worth following up. */
  anxietyFlag: boolean;
  depressionFlag: boolean;
  /** Moderate or severe total, or either subscale flagged. */
  elevated: boolean;
}

export function phq4Band(total: number): Phq4Band {
  if (total <= 2) return "normal";
  if (total <= 5) return "mild";
  if (total <= 8) return "moderate";
  return "severe";
}

export function scorePhq4(answers: readonly number[]): Phq4Score {
  if (answers.length !== 4) throw new Error("PHQ-4 needs exactly 4 answers");
  for (const a of answers) {
    if (!Number.isInteger(a) || a < 0 || a > 3) {
      throw new Error("Each PHQ-4 answer must be an integer from 0 to 3");
    }
  }
  const anxiety = answers[0] + answers[1];
  const depression = answers[2] + answers[3];
  const total = anxiety + depression;
  const band = phq4Band(total);
  const anxietyFlag = anxiety >= 3;
  const depressionFlag = depression >= 3;
  return {
    total,
    anxiety,
    depression,
    band,
    anxietyFlag,
    depressionFlag,
    elevated: band === "moderate" || band === "severe" || anxietyFlag || depressionFlag,
  };
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * True when the weekly PHQ-4 should be offered: no PHQ-4 in the last 7 days
 * and the prompt was not dismissed in the last 7 days.
 */
export function isPhq4Due(
  entries: Pick<Entry, "date" | "phq4">[],
  today: string,
  lastDismissed: string | null = null,
): boolean {
  const now = Date.parse(today);
  const recent = (date: string) => now - Date.parse(date) < WEEK_MS;
  if (lastDismissed && recent(lastDismissed)) return false;
  return !entries.some((e) => e.phq4 && recent(e.date));
}

export function isValidPhq4(value: unknown): value is Phq4Answers {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((a) => Number.isInteger(a) && a >= 0 && a <= 3)
  );
}
