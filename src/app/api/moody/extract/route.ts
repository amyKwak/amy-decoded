import Anthropic from "@anthropic-ai/sdk";
import { QUADRANT_LABELS, quadrantOf } from "@/lib/moody/affect";
import { detectCrisis } from "@/lib/moody/crisis";
import { parseExtraction } from "@/lib/moody/extract-parse";
import { EXTRACT_MODEL, EXTRACT_SYSTEM, EXTRACT_TOOL } from "@/lib/moody/prompts";
import { clientIp, createRateLimiter, rateLimitMessage } from "@/lib/moody/rate-limit";
import { MAX_JOURNAL_CHARS } from "@/lib/moody/types";

const limiter = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });

const isScale = (x: unknown): x is number => Number.isInteger(x) && (x as number) >= 1 && (x as number) <= 9;

export async function POST(request: Request) {
  const rl = limiter.check(clientIp(request.headers));
  if (!rl.ok) {
    return Response.json(
      { error: rateLimitMessage(rl.retryAfterSec), code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Moody's AI isn't set up on this server (missing ANTHROPIC_API_KEY). You can still save your check-in.", code: "no_key" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const journal = typeof body?.journal === "string" ? body.journal.trim() : "";
  const { valence, arousal } = body ?? {};
  if (!journal || !isScale(valence) || !isScale(arousal)) {
    return Response.json({ error: "Send journal text plus valence and arousal from 1 to 9." }, { status: 400 });
  }
  if (journal.length > MAX_JOURNAL_CHARS) {
    return Response.json({ error: `Journal entries are limited to ${MAX_JOURNAL_CHARS} characters.` }, { status: 413 });
  }

  const quadrant = QUADRANT_LABELS[quadrantOf(valence, arousal)];
  // Remove any entry tags in the text so it can't close the data block early.
  const safeText = journal.replace(/<\/?\s*entry\s*>/gi, "");

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: EXTRACT_MODEL,
      max_tokens: 1024,
      system: EXTRACT_SYSTEM,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: EXTRACT_TOOL.name },
      messages: [
        {
          role: "user",
          content: `Grid rating: pleasantness ${valence} of 9, energy ${arousal} of 9 (${quadrant}).\n\n<entry>\n${safeText}\n</entry>`,
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse) {
      return Response.json({ error: "Moody couldn't read that entry. You can still save it." }, { status: 502 });
    }
    const extraction = parseExtraction(toolUse.input);
    // The local check is a backstop in case the model misses something.
    extraction.safety_concern ||= detectCrisis(journal);
    return Response.json(extraction);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "Moody's AI key is invalid. You can still save your check-in.", code: "bad_key" }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Moody's AI is busy right now. You can still save your check-in." }, { status: 503 });
    }
    console.error("moody extract failed", error instanceof Anthropic.APIError ? error.status : "", error);
    return Response.json({ error: "Moody's AI had a hiccup. You can still save your check-in." }, { status: 502 });
  }
}
