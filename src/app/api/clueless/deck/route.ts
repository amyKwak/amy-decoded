import Anthropic from "@anthropic-ai/sdk";
import {
  cleanDeck,
  DECK_MODEL,
  DECK_SCHEMA,
  DECK_SYSTEM,
  deckUserMessage,
  TOPIC_MAX,
} from "@/lib/clueless/deck";
import { clientIp, createRateLimiter } from "@/lib/moody/rate-limit";

const HOUR = 60 * 60 * 1000;
// One call per round, so this is plenty for a game night.
const limiter = createRateLimiter({ limit: 40, windowMs: HOUR });

const fail = (error: string, status: number) =>
  Response.json({ error }, { status });

/**
 * Builds a Clueless deck: about 40 words on the players' topic, shuffled,
 * skipping words already played this session.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail("Deck building isn't set up on this server yet.", 503);
  }

  const body = await request.json().catch(() => null);
  const topic =
    typeof body?.topic === "string"
      ? body.topic.trim().slice(0, TOPIC_MAX)
      : "";
  if (!topic) return fail("Type a topic first.", 400);
  const avoid: string[] = Array.isArray(body?.avoid)
    ? body.avoid
        .filter((w: unknown): w is string => typeof w === "string")
        .slice(-80)
        .map((w: string) => w.slice(0, 60))
    : [];

  const rl = limiter.check(clientIp(request.headers));
  if (!rl.ok) {
    const minutes = Math.max(1, Math.ceil(rl.retryAfterSec / 60));
    return Response.json(
      {
        error: `That's a lot of rounds! The deck builder takes a break for about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: DECK_MODEL,
      max_tokens: 4096,
      // A quick list, not deep reasoning: players are waiting.
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: DECK_SCHEMA },
      },
      // If a safety classifier declines, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        {
          type: "text",
          text: DECK_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: deckUserMessage(topic, avoid) }],
    });

    if (response.stop_reason === "refusal") {
      return fail("That one's off limits. Try a different topic.", 422);
    }
    const text = response.content.find((b) => b.type === "text");
    const parsed = text ? JSON.parse(text.text) : null;
    if (parsed?.problem) return fail(parsed.problem, 422);

    const words = cleanDeck(parsed?.words ?? [], avoid);
    if (words.length < 5) {
      return fail(
        "Couldn't find enough new words for that. Try something broader.",
        422,
      );
    }
    const label =
      typeof parsed.label === "string" && parsed.label.trim()
        ? parsed.label.trim().slice(0, 40)
        : topic.slice(0, 40);
    return Response.json({ label, words });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return fail("The deck builder is busy. Try again in a moment.", 429);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("Deck building isn't set up on this server yet.", 503);
    }
    console.error("clueless deck failed", error);
    return fail("Couldn't build a deck just now. Try again.", 502);
  }
}
