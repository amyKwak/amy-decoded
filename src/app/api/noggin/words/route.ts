import Anthropic from "@anthropic-ai/sdk";
import { PROMPT_MAX } from "@/lib/noggin/game";
import {
  pickTwo,
  WORDS_MODEL,
  WORDS_SCHEMA,
  WORDS_SYSTEM,
  wordsUserMessage,
} from "@/lib/noggin/words";
import { clientIp, createRateLimiter } from "@/lib/moody/rate-limit";

const HOUR = 60 * 60 * 1000;
// One call per round, so this is plenty for a game night.
const limiter = createRateLimiter({ limit: 60, windowMs: HOUR });

const fail = (error: string, status: number) =>
  Response.json({ error }, { status });

/**
 * Picks two words for a Noggin round. The host's phone calls this with
 * the players' prompt and the words already used in the room, and gets back
 * one word per player plus a short label for the category.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail("Word picking isn't set up on this server yet.", 503);
  }

  const body = await request.json().catch(() => null);
  const prompt =
    typeof body?.prompt === "string"
      ? body.prompt.trim().slice(0, PROMPT_MAX)
      : "";
  if (!prompt) return fail("Type what kind of words you want first.", 400);
  const avoid: string[] = Array.isArray(body?.avoid)
    ? body.avoid
        .filter((w: unknown): w is string => typeof w === "string")
        .slice(-30)
        .map((w: string) => w.slice(0, 60))
    : [];

  const rl = limiter.check(clientIp(request.headers));
  if (!rl.ok) {
    const minutes = Math.max(1, Math.ceil(rl.retryAfterSec / 60));
    return Response.json(
      {
        error: `That's a lot of rounds! The word picker takes a break for about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: WORDS_MODEL,
      max_tokens: 4096,
      // A quick pick, not deep reasoning: players are waiting.
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: WORDS_SCHEMA },
      },
      // If a safety classifier declines, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        {
          type: "text",
          text: WORDS_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: wordsUserMessage(prompt, avoid) }],
    });

    if (response.stop_reason === "refusal") {
      return fail("That one's off limits. Try a different kind of word.", 422);
    }
    const text = response.content.find((b) => b.type === "text");
    const parsed = text ? JSON.parse(text.text) : null;
    if (parsed?.problem) return fail(parsed.problem, 422);

    const pair = pickTwo(parsed?.candidates ?? [], avoid);
    if (!pair) {
      return fail(
        "Couldn't find enough new words for that. Try something broader.",
        422,
      );
    }
    const label =
      typeof parsed.label === "string" && parsed.label.trim()
        ? parsed.label.trim().slice(0, 40)
        : "Guess it";
    return Response.json({ words: pair, label });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return fail("The word picker is busy. Try again in a moment.", 429);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("Word picking isn't set up on this server yet.", 503);
    }
    console.error("noggin words failed", error);
    return fail("Couldn't think of words just now. Try again.", 502);
  }
}
