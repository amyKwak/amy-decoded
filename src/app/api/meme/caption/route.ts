import Anthropic from "@anthropic-ai/sdk";
import {
  CAPTION_SCHEMA,
  captionRequest,
  cleanCaptions,
  MAX_IMAGE_CHARS,
  MEME_MODEL,
  MEME_SYSTEM,
  parseImageDataUrl,
  VIBES,
  type Vibe,
} from "@/lib/meme/captions";
import { clientIp, createRateLimiter } from "@/lib/moody/rate-limit";

const HOUR = 60 * 60 * 1000;
const limiter = createRateLimiter({ limit: 60, windowMs: HOUR });

const fail = (error: string, status: number) =>
  Response.json({ error }, { status });

/**
 * Looks at a photo and writes 3 meme captions for it. The photo is sent to
 * Claude as an image alongside the text, so Claude can see what's in it.
 * Nothing is stored: the photo only lives for this one request.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail("Meme This! isn't set up on this server yet.", 503);
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.image === "string" && body.image.length > MAX_IMAGE_CHARS) {
    return fail("That photo is too big. Try a smaller one.", 413);
  }
  const image = parseImageDataUrl(body?.image);
  if (!image) return fail("Pick a photo first.", 400);
  const vibe: Vibe = VIBES.includes(body?.vibe) ? body.vibe : "Any";
  // Captions already shown, so "More captions" gives fresh ones.
  const avoid = cleanCaptions(body?.avoid, 12);

  const rl = limiter.check(clientIp(request.headers));
  if (!rl.ok) {
    const minutes = Math.max(1, Math.ceil(rl.retryAfterSec / 60));
    return fail(
      `The meme machine needs a breather. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      429,
    );
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MEME_MODEL,
      max_tokens: 4096,
      // Jokes come fast; a little thought helps them land.
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: CAPTION_SCHEMA },
      },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        {
          type: "text",
          text: MEME_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            // The photo goes first, then the request about it.
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image.mediaType,
                data: image.data,
              },
            },
            { type: "text", text: captionRequest(vibe, avoid) },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return fail(
        "Couldn't make a meme from that one. Try another photo.",
        422,
      );
    }
    const text = response.content.find((b) => b.type === "text");
    const parsed = text ? JSON.parse(text.text) : null;
    if (parsed?.problem) return fail(parsed.problem, 422);
    const captions = cleanCaptions(parsed?.captions);
    if (captions.length === 0) {
      return fail("Couldn't think of a caption. Try again!", 502);
    }
    return Response.json({ captions });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return fail("The meme machine is busy. Try again in a moment.", 429);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("Meme This! isn't set up on this server yet.", 503);
    }
    if (error instanceof Anthropic.BadRequestError) {
      return fail("Couldn't read that photo. Try a different one.", 400);
    }
    console.error("meme caption failed", error);
    return fail("Couldn't write captions just now. Try again.", 502);
  }
}
