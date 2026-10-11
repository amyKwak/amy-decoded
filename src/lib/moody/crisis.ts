/**
 * Local crisis phrase check. Runs in the browser before any API call (and
 * again on the server as a backstop). It is deliberately simple and errs
 * toward showing support resources; the card is dismissible.
 *
 * Patterns target first-person intent ("kill myself", "want to die") rather
 * than words alone, so idioms like "this deadline is killing me" don't match.
 */
const PATTERNS: RegExp[] = [
  /\b(want|wanna|wanted|wanting|ready|wish i could)\s+(to\s+)?die\b/,
  /\bwish (i|i'd) (was|were|had been|could be) dead\b/,
  /\bwish i (was|were|had) never (been )?born\b/,
  /\bkill(ing|ed)?\s+my\s?self\b/,
  /\bkms\b/,
  /\b(end|ending|take|taking)\s+my\s+(own\s+)?life\b/,
  /\bend(ing)?\s+it\s+all\b/,
  /\bsuicid(e|al)\b/,
  /\bself[-\s]?harm/,
  /\b(hurt|hurting|cut|cutting|harm|harming)\s+my\s?self\b/,
  /\bbetter off (without me|dead|if i (was|were)n't (here|around|alive))\b/,
  /\bno (reason|point) (to|in) (live|living|go on|going on|being alive)\b/,
  /\bdon't want to (be alive|exist|wake up|live anymore|be here anymore)\b/,
  /\bcan't go on (living|anymore|like this)\b/,
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\bdont\b/g, "don't")
    .replace(/\bcant\b/g, "can't")
    .replace(/\s+/g, " ");
}

export function detectCrisis(text: string): boolean {
  if (!text) return false;
  const t = normalize(text);
  return PATTERNS.some((p) => p.test(t));
}
