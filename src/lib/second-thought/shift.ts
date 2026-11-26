import type { ThoughtRecord } from "./types";

/**
 * How much a record moved belief and feelings. Change in belief in the
 * original thought is the standard outcome for a thought record; it is the
 * user's own rating, never a score from Claude.
 */
export interface Shift {
  belief: { before: number; after: number; change: number } | null;
  feelings: { name: string; before: number; after: number; change: number }[];
}

export function recordShift(r: Pick<ThoughtRecord, "beliefBefore" | "beliefAfter" | "feelings">): Shift {
  return {
    belief:
      r.beliefAfter === null
        ? null
        : { before: r.beliefBefore, after: r.beliefAfter, change: r.beliefAfter - r.beliefBefore },
    feelings: r.feelings.flatMap((f) =>
      f.after === null ? [] : [{ name: f.name, before: f.before, after: f.after, change: f.after - f.before }],
    ),
  };
}

/** Average change in belief across finished records, or null with none. */
export function averageBeliefChange(records: ThoughtRecord[]): { mean: number; n: number } | null {
  const changes = records.flatMap((r) => {
    const b = recordShift(r).belief;
    return b ? [b.change] : [];
  });
  if (changes.length === 0) return null;
  return { mean: Math.round(changes.reduce((a, c) => a + c, 0) / changes.length), n: changes.length };
}
