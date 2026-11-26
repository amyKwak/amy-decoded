import { isTrapId } from "./traps";
import { LIMITS, type Examination } from "./types";

/** What the browser sends to be examined. A subset of a ThoughtRecord. */
export interface ExamineInput {
  situation: string;
  feelings: { name: string; before: number }[];
  thought: string;
  beliefBefore: number;
  evidenceFor: string;
}

const isPercent = (x: unknown): x is number =>
  Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 100;

const str = (x: unknown) => (typeof x === "string" ? x.trim() : "");

/** Validate a request body. Returns the cleaned input or an error message. */
export function validateExamineInput(
  body: unknown,
): { input: ExamineInput } | { error: string; status: number } {
  const b = (body ?? {}) as Record<string, unknown>;
  const situation = str(b.situation);
  const thought = str(b.thought);
  const evidenceFor = str(b.evidenceFor);

  if (!situation || !thought) {
    return { error: "Send at least a situation and a thought.", status: 400 };
  }
  if (!isPercent(b.beliefBefore)) {
    return { error: "beliefBefore must be a whole number from 0 to 100.", status: 400 };
  }
  if (
    situation.length > LIMITS.situation ||
    thought.length > LIMITS.thought ||
    evidenceFor.length > LIMITS.evidence
  ) {
    return { error: "That record is longer than this demo allows.", status: 413 };
  }

  const rawFeelings = Array.isArray(b.feelings) ? b.feelings : [];
  if (rawFeelings.length > LIMITS.feelings) {
    return { error: `Send at most ${LIMITS.feelings} feelings.`, status: 400 };
  }
  const feelings: ExamineInput["feelings"] = [];
  for (const f of rawFeelings) {
    const name = str(f?.name).slice(0, LIMITS.feelingName);
    if (!name || !isPercent(f?.before)) {
      return { error: "Each feeling needs a name and a 0 to 100 rating.", status: 400 };
    }
    feelings.push({ name, before: f.before });
  }

  return {
    input: { situation, feelings, thought, beliefBefore: b.beliefBefore, evidenceFor },
  };
}

/** Remove record tags so the user's text can't close the data block early. */
const unwrap = (s: string) => s.replace(/<\/?\s*record\s*>/gi, "");

/** The user turn: their record, fenced off as data. */
export function formatRecord(input: ExamineInput): string {
  const feelings = input.feelings.length
    ? input.feelings.map((f) => `${unwrap(f.name)} (${f.before}/100)`).join(", ")
    : "not given";
  return `<record>
Situation: ${unwrap(input.situation)}
Feelings: ${feelings}
Hot thought: ${unwrap(input.thought)}
Belief in the thought: ${input.beliefBefore}/100
Evidence that supports it: ${unwrap(input.evidenceFor) || "not given"}
</record>`;
}

function clean(s: string, max: number): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>`*_#]+/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Parse the model's JSON. Structured outputs make the shape very likely,
 * but model output is still untrusted: check types, drop unknown traps,
 * dedupe, and cap lengths. Returns null if there's nothing usable.
 */
export function parseExamination(raw: unknown): Examination | null {
  let data = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const traps: Examination["traps"] = [];
  for (const t of Array.isArray(d.traps) ? d.traps : []) {
    if (!isTrapId(t?.id) || traps.some((x) => x.id === t.id)) continue;
    const why = typeof t.why === "string" ? clean(t.why, 220) : "";
    traps.push({ id: t.id, why });
    if (traps.length >= 3) break;
  }

  const questions: string[] = [];
  for (const q of Array.isArray(d.questions) ? d.questions : []) {
    if (typeof q !== "string") continue;
    const text = clean(q, 240);
    // A Socratic question has to actually be a question.
    if (text.endsWith("?") && !questions.includes(text)) questions.push(text);
    if (questions.length >= 3) break;
  }

  if (questions.length === 0) return null;
  return { traps, questions, safety_concern: d.safety_concern === true };
}
