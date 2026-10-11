/**
 * Server-side half of picking words: the prompt and schema for asking Claude
 * for words, and turning its candidates into one word per player.
 */

export const WORDS_MODEL = "claude-opus-5-5";
export const CANDIDATE_COUNT = 12;

export const WORDS_SYSTEM = `You pick words for Noggin, a party game like Heads Up. Each player holds a phone to their forehead showing a word they can't see, and asks yes or no questions until they guess it.

The players describe what kind of words they want. Return ${CANDIDATE_COUNT} different candidates that fit the description.

Good candidates:
- Fit the description exactly. If it asks for a number in a range, every candidate is a number in that range, written as digits.
- Are guessable with yes or no questions by people at a party: well known, specific, and short (a name, title, or thing; at most about 4 words). Prefer a mix of easier and harder ones.
- Are written the way people would say them out loud, without extra punctuation or descriptions in brackets.
- Are not in the list of words already used, if one is given.

Also return a label: the category in 1 to 3 words, Title Case, like "Celebs Born After 1995" or "Disney Movies".

If the description can't produce guessable words (it's empty, nonsense, asks for something hateful or sexual, or names private people), return no candidates and explain in "problem" in one short, friendly sentence what to try instead. Otherwise set "problem" to an empty string.`;

export const WORDS_SCHEMA = {
  type: "object",
  properties: {
    label: { type: "string" },
    candidates: { type: "array", items: { type: "string" } },
    problem: { type: "string" },
  },
  required: ["label", "candidates", "problem"],
  additionalProperties: false,
} as const;

export function wordsUserMessage(prompt: string, avoid: string[]): string {
  const used = avoid.length
    ? `\n\nAlready used, don't repeat these: ${avoid.join("; ")}`
    : "";
  return `Description: ${prompt}${used}`;
}

/**
 * Two different words from the candidates, skipping ones already used.
 * Claude tends to list the most obvious answers first, so picking at random
 * keeps rounds from feeling the same. Returns null if there aren't two to pick.
 */
export function pickTwo(
  candidates: string[],
  avoid: string[],
  rng: () => number = Math.random,
): [string, string] | null {
  const key = (w: string) => w.trim().toLowerCase();
  const used = new Set(avoid.map(key));
  const seen = new Set<string>();
  const pool: string[] = [];
  for (const raw of candidates) {
    const word = raw.trim().slice(0, 60);
    if (!word || used.has(key(word)) || seen.has(key(word))) continue;
    seen.add(key(word));
    pool.push(word);
  }
  if (pool.length < 2) return null;
  const a = Math.floor(rng() * pool.length);
  let b = Math.floor(rng() * (pool.length - 1));
  if (b >= a) b += 1;
  return [pool[a], pool[b]];
}
