/**
 * Matching what the phone hears against the word on its screen, so saying
 * your own word out loud wins the round.
 */

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/** 67 → "sixty seven". Covers the game's range, 1 to 100. */
export function numberWords(n: number): string {
  if (n === 100) return "one hundred";
  if (n < 20) return ONES[n];
  const ones = n % 10;
  return ones ? `${TENS[Math.floor(n / 10)]} ${ONES[ones]}` : TENS[n / 10];
}

/** Lowercase, no accents or punctuation, single spaces: "Beyoncé!" → "beyonce". */
export function normalizeSpeech(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whether `transcript` contains `word` as whole words, in any way speech-to-text tends to write it. */
export function heardWord(transcript: string, word: string): boolean {
  const heard = normalizeSpeech(transcript);
  const target = normalizeSpeech(word);
  if (!heard || !target) return false;

  const forms = [target];
  if (/^\d+$/.test(target)) {
    const n = Number(target);
    forms.push(numberWords(n));
    if (n === 100) forms.push("a hundred", "hundred");
  }

  const padded = ` ${heard} `;
  const squashed = heard.replace(/ /g, "");
  return forms.some(
    (form) =>
      padded.includes(` ${form} `) ||
      // "Jay Z" vs "JayZ", "Lil Nas X" vs "Lil NasX": spacing varies, so also
      // compare without spaces, but only for names long enough not to hide
      // inside other words.
      (form.length >= 6 && squashed.includes(form.replace(/ /g, ""))),
  );
}
