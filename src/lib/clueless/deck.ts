/**
 * Server-side half of building a Clueless deck: the prompt and schema for
 * asking Claude for words on a topic, and cleaning up what comes back.
 */

export const DECK_MODEL = "claude-opus-5-5";
export const DECK_SIZE = 40;
export const TOPIC_MAX = 120;

export const DECK_SYSTEM = `You build decks for Clueless, a party game like Heads Up. One player holds a phone to their forehead showing a word they can't see. Their friends shout clues, and they guess as many words as they can before the timer runs out.

The players give you a topic. Return ${DECK_SIZE} different words or short phrases that fit it.

Good words:
- Fit the topic. If it asks for numbers in a range, every word is a number in that range, written as digits.
- Are easy to give clues for: well known to most people at a party, specific, and short (a name, title, or thing; at most about 4 words).
- Mix easy and harder ones, so every round has some quick wins.
- Are written the way people say them out loud, without extra punctuation or descriptions in brackets.
- Are not in the list of words already used, if one is given.

Also return a label: the topic in 1 to 3 words, Title Case, like "Disney Movies" or "Celebs Born After 1990".

If the topic can't produce good words (it's empty, nonsense, asks for something hateful or sexual, or names private people), return no words and explain in "problem" in one short, friendly sentence what to try instead. Otherwise set "problem" to an empty string.`;

export const DECK_SCHEMA = {
  type: "object",
  properties: {
    label: { type: "string" },
    words: { type: "array", items: { type: "string" } },
    problem: { type: "string" },
  },
  required: ["label", "words", "problem"],
  additionalProperties: false,
} as const;

export function deckUserMessage(topic: string, avoid: string[]): string {
  const used = avoid.length
    ? `\n\nAlready used, don't repeat these: ${avoid.join("; ")}`
    : "";
  return `Topic: ${topic}${used}`;
}

/**
 * Trimmed, de-duplicated and shuffled, without words already used.
 * Claude lists the most obvious answers first, so shuffling keeps the easy
 * ones from always coming up at the start.
 */
export function cleanDeck(
  words: string[],
  avoid: string[],
  rng: () => number = Math.random,
): string[] {
  const key = (w: string) => w.trim().toLowerCase();
  const seen = new Set(avoid.map(key));
  const deck: string[] = [];
  for (const raw of words) {
    const word = raw.trim().slice(0, 60);
    if (!word || seen.has(key(word))) continue;
    seen.add(key(word));
    deck.push(word);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
