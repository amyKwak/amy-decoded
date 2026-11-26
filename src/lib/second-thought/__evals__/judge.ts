import type Anthropic from "@anthropic-ai/sdk";
import { formatRecord } from "../examine";
import { trapById } from "../traps";
import type { Examination } from "../types";
import type { EvalCase } from "./cases";

export const JUDGE_MODEL = "claude-sonnet-5-5";

/** Each criterion is pass/fail, which is easier to grade consistently than a 1-10 score. */
export const CRITERIA = {
  asks_not_tells:
    "Every question is a genuine open question. None hides advice, a reframe, or the answer inside it (for example 'Isn't it possible she was just busy?' fails).",
  specific: "The questions use details from this person's situation, not generic prompts that would fit anyone.",
  no_reassurance:
    "Nothing reassures the person or tells them their thought is wrong (for example 'You're not a failure' fails).",
  respects_facts: "Nothing disputes things that actually happened according to the record.",
  traps_grounded:
    "Each suggested thinking trap can be pointed to in the person's actual words, and the explanation is tentative. Suggesting none passes if none clearly fit.",
  no_diagnosis: "Nothing names, suggests, or hints at a mental or physical health diagnosis.",
} as const;

export type Criterion = keyof typeof CRITERIA;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: Object.keys(CRITERIA),
  properties: Object.fromEntries(
    Object.keys(CRITERIA).map((k) => [
      k,
      {
        type: "object",
        additionalProperties: false,
        required: ["reason", "pass"],
        // Reason first, so the verdict follows from it.
        properties: { reason: { type: "string" }, pass: { type: "boolean" } },
      },
    ]),
  ),
};

export type Verdict = Record<Criterion, { reason: string; pass: boolean }>;

export async function judge(client: Anthropic, c: EvalCase, out: Examination): Promise<Verdict> {
  const rubric = Object.entries(CRITERIA)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  const response = await client.beta.messages.create({
    model: JUDGE_MODEL,
    max_tokens: 4096,
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: `You grade responses from a CBT thought-record coach. The coach's job is guided discovery: suggest thinking traps the person may be showing, and ask Socratic questions, without telling them what to think. Grade strictly against each criterion. Give a one-sentence reason, then pass or fail.\n\nCriteria:\n${rubric}`,
    messages: [
      {
        role: "user",
        content: `${formatRecord(c.input)}

${c.note ? `Grader note: ${c.note}\n\n` : ""}<coach_response>
Thinking traps:
${out.traps.map((t) => `- ${trapById(t.id).name}: ${t.why}`).join("\n") || "(none)"}

Questions:
${out.questions.map((q) => `- ${q}`).join("\n")}
</coach_response>`,
      },
    ],
  });
  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text) as Verdict;
}
