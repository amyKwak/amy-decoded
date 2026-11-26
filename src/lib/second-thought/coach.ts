import type Anthropic from "@anthropic-ai/sdk";
import { formatRecord, parseExamination, type ExamineInput } from "./examine";
import { COACH_MODEL, EXAMINE_SCHEMA, EXAMINE_SYSTEM } from "./prompts";
import type { Examination } from "./types";

export type ExamineResult =
  | { ok: true; examination: Examination }
  | { ok: false; reason: "refusal" | "unparseable" };

export type Effort = "low" | "medium" | "high";

/**
 * One call to the coach. Shared by the API route and the evals, so the
 * evals test exactly what visitors get.
 */
export async function examineThought(
  client: Anthropic,
  input: ExamineInput,
  effort: Effort = "low",
): Promise<ExamineResult> {
  const response = await client.beta.messages.create({
    model: COACH_MODEL,
    max_tokens: 4096,
    output_config: { effort, format: { type: "json_schema", schema: EXAMINE_SCHEMA } },
    // If a safety classifier declines, the API retries on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: EXAMINE_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: formatRecord(input) }],
  });

  if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };
  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const examination = response.stop_reason === "max_tokens" ? null : parseExamination(text);
  return examination ? { ok: true, examination } : { ok: false, reason: "unparseable" };
}
