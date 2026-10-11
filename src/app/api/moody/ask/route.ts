import Anthropic from "@anthropic-ai/sdk";
import { ANSWER_SCHEMA } from "@/lib/moody/answer";
import { latestQuestion, validateAskMessages } from "@/lib/moody/ask-validate";
import { detectCrisis } from "@/lib/moody/crisis";
import { ASK_MODEL, ASK_SYSTEM } from "@/lib/moody/prompts";
import { clientIp, createRateLimiter, rateLimitMessage } from "@/lib/moody/rate-limit";
import { MOODY_TOOLS } from "@/lib/moody/tools";

const HOUR = 60 * 60 * 1000;
// One question can take up to 6 calls (the agent loop), so new questions and
// total calls are limited separately.
const questionLimiter = createRateLimiter({ limit: 20, windowMs: HOUR });
const callLimiter = createRateLimiter({ limit: 120, windowMs: HOUR });

/**
 * Thin proxy for one step of the Ask Moody agent loop. It adds the system
 * prompt and tool definitions (so the browser can't change them), calls
 * Claude, and returns content plus stop_reason. The browser runs the tools
 * against its own IndexedDB and calls back with tool_result blocks.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Ask Moody isn't set up on this server (missing ANTHROPIC_API_KEY).", code: "no_key" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const messages = body?.messages;
  const invalid = validateAskMessages(messages);
  if (invalid) return Response.json({ error: invalid }, { status: 400 });

  const question = latestQuestion(messages);
  const ip = clientIp(request.headers);
  const limits = question ? [questionLimiter, callLimiter] : [callLimiter];
  for (const limiter of limits) {
    const rl = limiter.check(ip);
    if (!rl.ok) {
      return Response.json(
        { error: rateLimitMessage(rl.retryAfterSec), code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }
  }

  // Backstop for the browser-side check: don't analyze a crisis message.
  if (question && detectCrisis(question)) {
    return Response.json({ crisis: true });
  }

  const today = typeof body.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : null;

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: ASK_MODEL,
      max_tokens: 4096,
      // The final reply must match ANSWER_SCHEMA; tool calls in between are unaffected.
      output_config: { effort: "medium", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
      // If a safety classifier declines, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        { type: "text", text: ASK_SYSTEM, cache_control: { type: "ephemeral" } },
        ...(today ? [{ type: "text" as const, text: `Today is ${today}.` }] : []),
      ],
      tools: MOODY_TOOLS,
      // On the last allowed step, make Claude answer with what it has.
      tool_choice: body.final === true ? { type: "none" } : { type: "auto" },
      messages: messages as Anthropic.Beta.BetaMessageParam[],
    });
    return Response.json({ content: response.content, stop_reason: response.stop_reason });
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      console.error("moody ask bad request", error.message);
      return Response.json({ error: "Ask Moody couldn't continue this conversation. Start a new one." }, { status: 400 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "Ask Moody's API key is invalid.", code: "bad_key" }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Ask Moody is busy right now. Try again in a minute." }, { status: 503 });
    }
    console.error("moody ask failed", error);
    return Response.json({ error: "Ask Moody had a hiccup. Try again." }, { status: 502 });
  }
}
