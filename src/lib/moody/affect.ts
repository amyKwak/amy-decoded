export type Quadrant =
  | "high-pleasant"
  | "high-unpleasant"
  | "low-pleasant"
  | "low-unpleasant"
  | "neutral";

export const QUADRANT_LABELS: Record<Quadrant, string> = {
  "high-pleasant": "High energy and pleasant",
  "high-unpleasant": "High energy and unpleasant",
  "low-pleasant": "Low energy and pleasant",
  "low-unpleasant": "Low energy and unpleasant",
  neutral: "Right in the middle",
};

/** 5 is the midpoint of the 1 to 9 scale on both axes. */
export function quadrantOf(valence: number, arousal: number): Quadrant {
  if (valence === 5 && arousal === 5) return "neutral";
  const pleasant = valence >= 5;
  const high = arousal >= 5;
  if (valence === 5) return high ? "high-pleasant" : "low-pleasant";
  if (high) return pleasant ? "high-pleasant" : "high-unpleasant";
  return pleasant ? "low-pleasant" : "low-unpleasant";
}

/**
 * Starter words per quadrant. Used when there is no journal text or the AI
 * call fails, so the feeling step always has something to offer.
 */
export const QUADRANT_WORDS: Record<Quadrant, string[]> = {
  "high-pleasant": ["excited", "energized", "proud", "hopeful", "playful"],
  "high-unpleasant": ["anxious", "stressed", "frustrated", "overwhelmed", "irritated"],
  "low-pleasant": ["calm", "content", "relaxed", "grateful", "peaceful"],
  "low-unpleasant": ["tired", "sad", "drained", "lonely", "flat"],
  neutral: ["okay", "steady", "neutral", "fine", "settled"],
};

export function describeCell(valence: number, arousal: number): string {
  return `Pleasantness ${valence} of 9, energy ${arousal} of 9. ${QUADRANT_LABELS[quadrantOf(valence, arousal)]}.`;
}
