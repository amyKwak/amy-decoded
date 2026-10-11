"use client";

import type Anthropic from "@anthropic-ai/sdk";
import { useRef, useState } from "react";
import { parseAnswer, verifyEvidence, type Answer } from "@/lib/moody/answer";
import { detectCrisis } from "@/lib/moody/crisis";
import type { StatsResult } from "@/lib/moody/stats";
import { describeToolCall, runTool } from "@/lib/moody/tools";
import { MAX_QUESTION_CHARS, type Entry } from "@/lib/moody/types";
import { AnswerCard } from "./AnswerCard";
import { focusRing, primaryBtn, secondaryBtn } from "./ui";

type MessageParam = Anthropic.Beta.BetaMessageParam;
type ContentBlock = Anthropic.Beta.BetaContentBlock;

/** Each API call is one step. The last step forces a final answer. */
const MAX_STEPS = 6;

const CRISIS_REPLY =
  "I'm not the right kind of help for this, but people are ready to talk right now. Call or text 988, or text HOME to 741741. If you're in immediate danger, call 911.";

interface Turn {
  question: string;
  lookups: string[];
  /** Structured answer, when the final reply parsed. */
  answer: Answer | null;
  /** get_stats results available when the answer was written. */
  stats: StatsResult[];
  /** Plain text fallback: errors, refusals, crisis replies, unparseable output. */
  text: string;
  status: "running" | "done" | "error";
}

const SUGGESTED = [
  "How does sleep affect my mood?",
  "What seems to lift my mood the most?",
  "How have deadlines been affecting me?",
  "What were my hardest days this month?",
];

export function AskMoody({
  entries,
  today,
  onCrisis,
}: {
  entries: Entry[];
  today: string;
  onCrisis: () => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  // Committed conversation, used for follow-up questions.
  const history = useRef<MessageParam[]>([]);
  // get_stats results from this conversation, so answer cards show code-computed numbers.
  const seenStats = useRef<StatsResult[]>([]);

  const update = (patch: Partial<Turn>) =>
    setTurns((ts) => ts.map((t, i) => (i === ts.length - 1 ? { ...t, ...patch } : t)));

  /**
   * The agent loop. The server is a thin proxy; this function decides when
   * to continue. On stop_reason "tool_use" it runs each requested tool
   * locally against IndexedDB entries, sends the results back as tool_result
   * blocks in the next user message, and repeats until Claude ends its turn.
   */
  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    setQuestion("");

    if (detectCrisis(text)) {
      onCrisis();
      setTurns((ts) => [...ts, { question: text, lookups: [], answer: null, stats: [], text: CRISIS_REPLY, status: "done" }]);
      return;
    }

    setBusy(true);
    setTurns((ts) => [...ts, { question: text, lookups: [], answer: null, stats: [], text: "", status: "running" }]);
    const messages: MessageParam[] = [...history.current, { role: "user", content: text }];
    const lookups: string[] = [];

    try {
      for (let step = 1; step <= MAX_STEPS; step++) {
        const res = await fetch("/api/moody/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, today, final: step === MAX_STEPS }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Ask Moody is unavailable right now.");
        if (data.crisis) {
          onCrisis();
          update({ text: CRISIS_REPLY, status: "done" });
          return;
        }

        const content = data.content as ContentBlock[];
        messages.push({ role: "assistant", content: content as Anthropic.Beta.BetaContentBlockParam[] });

        if (data.stop_reason !== "tool_use") {
          const raw = content
            .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
            .map((b) => b.text)
            .join("")
            .trim();
          if (data.stop_reason === "refusal") {
            update({ text: "Moody can't help with that one. Try asking about your entries.", status: "done" });
          } else {
            const answer = data.stop_reason === "max_tokens" ? null : parseAnswer(raw);
            if (answer) {
              answer.evidence = verifyEvidence(answer.evidence, entries);
              update({ answer, stats: [...seenStats.current], status: "done" });
            } else {
              update({ text: "Moody got tangled up writing that answer. Try asking a narrower question.", status: "done" });
            }
          }
          history.current = messages; // commit only complete exchanges
          return;
        }

        // Run every tool_use block locally and return all results in ONE user message.
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
        for (const block of content) {
          if (block.type !== "tool_use") continue;
          lookups.push(describeToolCall(block.name, block.input));
          try {
            const output = runTool(block.name, block.input, entries);
            if (block.name === "get_stats") seenStats.current.push(output as StatsResult);
            results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(output) });
          } catch (err) {
            results.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: err instanceof Error ? err.message : String(err),
              is_error: true,
            });
          }
        }
        update({ lookups: [...lookups] });
        messages.push({ role: "user", content: results });
      }
      update({ text: "I ran out of lookups for that one. Try a more specific question.", status: "done" });
    } catch (err) {
      update({ text: err instanceof Error ? err.message : String(err), status: "error" });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    history.current = [];
    seenStats.current = [];
    setTurns([]);
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-[24px] border-2 border-dashed border-moody-ink bg-white p-6 text-[15px] text-moody-muted">
        Ask Moody answers questions about your entries. Add a few check-ins, or load the sample data above to try it
        right away.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {turns.length === 0 && (
        <div className="rounded-[24px] bg-moody-lavender/50 p-5">
          <p className="mb-1 text-lg font-bold text-moody-ink">Ask about your patterns</p>
          <p className="mb-4 text-sm text-moody-muted">
            Moody looks things up in your entries instead of guessing, then sums up what matters most.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Suggested questions">
            {SUGGESTED.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => ask(s)} disabled={busy} className={secondaryBtn}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="space-y-5" aria-live="polite">
        {turns.map((t, i) => (
          <li key={i} className="space-y-3">
            <p className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md border-2 border-moody-ink bg-moody-lavender px-4 py-2.5 font-semibold text-moody-ink">
              {t.question}
            </p>

            {t.status === "running" && (
              <div className="rounded-[24px] border-2 border-dashed border-moody-ink bg-white p-5">
                <p className="mb-3 flex items-center gap-2 font-bold text-moody-ink">
                  <span aria-hidden="true" className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-moody-hot-pink" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                  Looking through your entries
                </p>
                {t.lookups.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {t.lookups.map((l, j) => (
                      <li key={j} className="rounded-full bg-moody-sky-pale px-3 py-1 text-xs font-semibold text-moody-ink">
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {t.status !== "running" && t.answer && (
              <AnswerCard answer={t.answer} lookups={t.lookups} stats={t.stats} entries={entries} />
            )}

            {t.status !== "running" && !t.answer && (
              <p
                className={`rounded-[20px] px-4 py-3 text-[15px] leading-relaxed text-moody-ink ${
                  t.status === "error" ? "bg-moody-red-soft" : "bg-moody-cream"
                }`}
              >
                {t.text}
              </p>
            )}
          </li>
        ))}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex flex-col gap-2 tablet:flex-row"
      >
        <label htmlFor="moody-question" className="sr-only">
          Ask Moody a question
        </label>
        <input
          id="moody-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={MAX_QUESTION_CHARS}
          placeholder={turns.length ? "Ask a follow-up" : "Ask about your mood patterns"}
          className={`min-w-0 flex-1 rounded-full border-2 border-moody-ink bg-white px-4 py-2.5 text-[15px] text-moody-ink placeholder:text-moody-muted ${focusRing}`}
        />
        <div className="flex gap-2">
          <button type="submit" disabled={busy || !question.trim()} className={primaryBtn}>
            {busy ? "Thinking..." : "Ask"}
          </button>
          {turns.length > 0 && (
            <button type="button" onClick={reset} disabled={busy} className={secondaryBtn}>
              New chat
            </button>
          )}
        </div>
      </form>
      <p className="text-xs text-moody-muted">
        Your question and the entries Moody looks up are sent to Claude. Moody describes patterns in your own data and
        does not diagnose.
      </p>
    </div>
  );
}
