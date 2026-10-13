/**
 * Meme This!: what Claude is told about the photo, the shape of the captions
 * it sends back, and laying caption text out on the image.
 */

export const MEME_MODEL = "claude-opus-5-5";
/** Photos are shrunk on the phone to at most this many pixels on the long side. */
export const MAX_IMAGE_SIDE = 1024;
/** Base64 length limit for an incoming photo (about 2 MB of image). */
export const MAX_IMAGE_CHARS = 2_800_000;

export const VIBES = [
  "Any",
  "Wholesome",
  "Savage",
  "Relatable",
  "Dramatic",
] as const;
export type Vibe = (typeof VIBES)[number];

export type Caption = { top: string; bottom: string };

export const MEME_SYSTEM = `You write captions for Meme This!, an app that turns someone's photo into a classic meme with big text on the top and bottom.

Look closely at the photo: the subject, expressions, body language, setting, and any funny details. Then write 3 different meme captions for it.

Good captions:
- Are short and punchy: each line at most 8 words. The joke lands in the bottom line.
- Use real meme formats when they fit ("When you...", "Nobody: / Me:", "POV:", "Me explaining to my mom..."), but don't force one.
- Are about what's actually in the photo, so they feel made for it. Each of the 3 takes a different angle.
- Are playful, not mean: tease the situation, never anyone's body, looks, race, or other personal traits. Keep them safe to share with friends and family.
- Never say who a person is, even if they look famous.
- Can leave the top line empty when the joke works better with only a bottom line.

If the photo is explicit, violent, or can't be made into a kind joke, return no captions and explain in "problem" in one short, friendly sentence. Otherwise set "problem" to an empty string.`;

export const CAPTION_SCHEMA = {
  type: "object",
  properties: {
    captions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          top: { type: "string" },
          bottom: { type: "string" },
        },
        required: ["top", "bottom"],
        additionalProperties: false,
      },
    },
    problem: { type: "string" },
  },
  required: ["captions", "problem"],
  additionalProperties: false,
} as const;

export function captionRequest(vibe: Vibe, avoid: Caption[]): string {
  const tone =
    vibe === "Any" ? "Any vibe works." : `Make them ${vibe.toLowerCase()}.`;
  const used = avoid.length
    ? `\n\nAlready shown, so write new ones: ${avoid
        .map((c) => `"${c.top} / ${c.bottom}"`)
        .join("; ")}`
    : "";
  return `Write 3 meme captions for this photo. ${tone}${used}`;
}

/** Trimmed, length-capped captions with something to say, at most `limit`. */
export function cleanCaptions(input: unknown, limit = 3): Caption[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((c) => c as Record<string, unknown>)
    .map((c) => ({
      top: typeof c?.top === "string" ? c.top.trim().slice(0, 80) : "",
      bottom: typeof c?.bottom === "string" ? c.bottom.trim().slice(0, 80) : "",
    }))
    .filter((c) => c.top || c.bottom)
    .slice(0, limit);
}

/**
 * Splits a base64 data URL into its type and data, accepting only the image
 * types Claude reads. Returns null for anything else.
 */
export function parseImageDataUrl(url: unknown): {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  data: string;
} | null {
  if (typeof url !== "string") return null;
  const match =
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(url);
  if (!match) return null;
  return {
    mediaType: match[1] as "image/jpeg" | "image/png" | "image/webp",
    data: match[2],
  };
}

/**
 * Breaks caption text into lines that fit `maxWidth`, using `measure` for the
 * width of a string in the current font. A single word too long for a line
 * gets a line to itself (the font size shrinks to fit it afterwards).
 */
export function wrapLines(
  text: string,
  maxWidth: number,
  measure: (s: string) => number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
