import Anthropic from "@anthropic-ai/sdk";
import {
  cleanGmTurn,
  cleanHeroes,
  cleanLog,
  GM_MODEL,
  GM_SYSTEM,
  gmMessages,
  QUEST_MAX,
  SET_SCENE_TOOL,
} from "@/lib/lucky-goose/game";
import { clientIp, createRateLimiter } from "@/lib/moody/rate-limit";

const HOUR = 60 * 60 * 1000;
// About a dozen turns per quest.
const limiter = createRateLimiter({ limit: 150, windowMs: HOUR });

const fail = (error: string, status: number) =>
  Response.json({ error }, { status });

/**
 * One game master turn, streamed as newline-separated JSON events:
 *   {"type":"text","text":"..."}  a piece of the story, as Claude writes it
 *   {"type":"turn","turn":{...}}  the choices and party changes, once the story is told
 * Plain text can't carry the game data too, so each line says what it is.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail("The game master isn't set up on this server yet.", 503);
  }

  const body = await request.json().catch(() => null);
  const quest =
    typeof body?.quest === "string"
      ? body.quest.trim().slice(0, QUEST_MAX)
      : "";
  const heroes = cleanHeroes(body?.heroes);
  const log = cleanLog(body?.log);
  const next = typeof body?.next === "string" ? body.next.slice(0, 16) : "";
  const turn = Math.max(0, Math.min(99, Math.round(Number(body?.turn) || 0)));
  if (!quest || heroes.length === 0 || !next) {
    return fail("Start a quest first.", 400);
  }

  const rl = limiter.check(clientIp(request.headers));
  if (!rl.ok) {
    const minutes = Math.max(1, Math.ceil(rl.retryAfterSec / 60));
    return fail(
      `The game master needs a snack break. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      429,
    );
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: GM_MODEL,
      max_tokens: 4096,
      // Quick and lively: the party is waiting.
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        { type: "text", text: GM_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      // The game data comes back through a tool call, which is checked
      // against its schema (strict), after the narration.
      tools: [SET_SCENE_TOOL],
      tool_choice: { type: "auto" },
      // Cache the story so far: each turn resends it, plus one new message.
      cache_control: { type: "ephemeral" },
      messages: gmMessages(quest, heroes, log, next, turn),
    },
    // If the players leave, stop the game master mid-sentence.
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  const events = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "text", text: event.delta.text });
          }
        }
        const message = await stream.finalMessage();
        const call = message.content.find(
          (b) => b.type === "tool_use" && b.name === SET_SCENE_TOOL.name,
        );
        // A cut-off tool call isn't trustworthy, so fall back to defaults.
        const usable = call && message.stop_reason !== "max_tokens";
        send({
          type: "turn",
          turn: cleanGmTurn(
            usable && call.type === "tool_use" ? call.input : null,
          ),
        });
      } catch (error) {
        if (!request.signal.aborted)
          console.error("lucky goose turn failed", error);
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(events, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
