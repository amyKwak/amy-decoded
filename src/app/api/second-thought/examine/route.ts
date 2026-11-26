import Anthropic from "@anthropic-ai/sdk";
import { detectCrisis } from "@/lib/moody/crisis";
import { clientIp, createRateLimiter } from "@/lib/moody/rate-limit";
import { examineThought } from "@/lib/second-thought/coach";
import { validateExamineInput } from "@/lib/second-thought/examine";

const limiter = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });

const FALLBACK_NOTE = "You can keep going with the standard questions.";

/**
 * One call: the user's record in, suggested thinking traps and Socratic
 * questions out. The record is never stored on the server.
 */
export async function POST(request: Request) {
  const rl = limiter.check(clientIp(request.headers));
  if (!rl.ok) {
    const minutes = Math.max(1, Math.ceil(rl.retryAfterSec / 60));
    return Response.json(
      { error: `This demo limits how often each visitor can use the coach. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}. ${FALLBACK_NOTE}`, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: `The coach isn't set up on this server (missing ANTHROPIC_API_KEY). ${FALLBACK_NOTE}`, code: "no_key" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const result = validateExamineInput(body);
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  const { input } = result;

  // Backstop for the browser-side check: don't coach a crisis message.
  const allText = [input.situation, input.thought, input.evidenceFor].join("\n");
  if (detectCrisis(allText)) return Response.json({ crisis: true });

  try {
    const out = await examineThought(new Anthropic(), input);
    if (!out.ok) {
      return Response.json(
        { error: `The coach couldn't respond to that one. ${FALLBACK_NOTE}` },
        { status: 502 },
      );
    }
    if (out.examination.safety_concern) return Response.json({ crisis: true, ...out.examination });
    return Response.json(out.examination);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: `The coach's API key is invalid. ${FALLBACK_NOTE}`, code: "bad_key" }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: `The coach is busy right now. ${FALLBACK_NOTE}` }, { status: 503 });
    }
    console.error("second-thought examine failed", error instanceof Anthropic.APIError ? error.status : "", error);
    return Response.json({ error: `The coach had a hiccup. ${FALLBACK_NOTE}` }, { status: 502 });
  }
}
