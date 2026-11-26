"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { detectCrisis } from "@/lib/moody/crisis";
import { putRecord } from "@/lib/second-thought/db";
import type { ExamineInput } from "@/lib/second-thought/examine";
import { FALLBACK_QUESTIONS, TRAPS, trapById, type TrapId } from "@/lib/second-thought/traps";
import { LIMITS, type Examination, type Feeling, type ThoughtRecord } from "@/lib/second-thought/types";
import { Rating } from "./Rating";
import { RecordSummary } from "./RecordSummary";
import { card, field, focusRing, heading, label, localToday, primaryBtn, quietBtn, secondaryBtn } from "./ui";

const COMMON_FEELINGS = [
  "anxious",
  "sad",
  "angry",
  "frustrated",
  "embarrassed",
  "ashamed",
  "guilty",
  "hurt",
  "lonely",
  "overwhelmed",
];

const STEPS = ["Situation", "Feelings", "Thought", "Evidence", "Second look", "Balance"] as const;

interface Draft {
  situation: string;
  feelings: Feeling[];
  thought: string;
  beliefBefore: number;
  evidenceFor: string;
  answers: string[];
  evidenceAgainst: string;
  traps: TrapId[];
  balanced: string;
  beliefAfter: number;
}

const EMPTY: Draft = {
  situation: "",
  feelings: [],
  thought: "",
  beliefBefore: 70,
  evidenceFor: "",
  answers: [],
  evidenceAgainst: "",
  traps: [],
  balanced: "",
  beliefAfter: 70,
};

type Coach =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; examination: Examination; fallback: boolean; note?: string };

const toInput = (d: Draft): ExamineInput => ({
  situation: d.situation.trim(),
  feelings: d.feelings.map((f) => ({ name: f.name, before: f.before })),
  thought: d.thought.trim(),
  beliefBefore: d.beliefBefore,
  evidenceFor: d.evidenceFor.trim(),
});

const fallbackExamination: Examination = { traps: [], questions: FALLBACK_QUESTIONS, safety_concern: false };

function TextArea({
  id,
  value,
  onChange,
  max,
  rows = 4,
  placeholder,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  rows?: number;
  placeholder?: string;
  describedBy?: string;
}) {
  return (
    <>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        rows={rows}
        maxLength={max}
        placeholder={placeholder}
        aria-describedby={describedBy}
        className={`${field} resize-y`}
      />
      {value.length > max * 0.8 && (
        <p className="text-st-muted mt-1 text-right text-xs">
          {value.length} / {max}
        </p>
      )}
    </>
  );
}

export function RecordFlow({ onSaved, onCrisis }: { onSaved: () => void; onCrisis: () => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [coach, setCoach] = useState<Coach>({ status: "idle" });
  const [customFeeling, setCustomFeeling] = useState("");
  const [saved, setSaved] = useState<ThoughtRecord | null>(null);
  const [saveError, setSaveError] = useState(false);
  const examinedFor = useRef("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // Move focus to the new step's heading, but not on first load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, saved]);

  async function examine() {
    const input = toInput(draft);
    const key = JSON.stringify(input);
    if (examinedFor.current === key && coach.status === "ready") return;
    examinedFor.current = key;

    if (detectCrisis([input.situation, input.thought, input.evidenceFor].join("\n"))) {
      onCrisis();
      setCoach({ status: "ready", examination: fallbackExamination, fallback: true });
      return;
    }

    setCoach({ status: "loading" });
    try {
      const res = await fetch("/api/second-thought/examine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (data.crisis) onCrisis();
      if (!res.ok || !Array.isArray(data.questions)) {
        setCoach({
          status: "ready",
          examination: fallbackExamination,
          fallback: true,
          note: data.error ?? (data.crisis ? undefined : "The coach is unavailable right now. Here are the standard questions."),
        });
        return;
      }
      setCoach({ status: "ready", examination: data as Examination, fallback: false });
    } catch {
      setCoach({
        status: "ready",
        examination: fallbackExamination,
        fallback: true,
        note: "Couldn't reach the coach. Here are the standard questions.",
      });
    }
  }

  function next() {
    // A quick local check on each text step, so support shows up right away.
    const text = [draft.situation, draft.thought, draft.evidenceFor, draft.evidenceAgainst, ...draft.answers, draft.balanced].join("\n");
    if (detectCrisis(text)) onCrisis();
    if (step === 3) void examine();
    if (step === 4) {
      // Start the re-ratings where the first ratings were.
      setDraft((d) => ({
        ...d,
        beliefAfter: d.beliefAfter === EMPTY.beliefAfter ? d.beliefBefore : d.beliefAfter,
        feelings: d.feelings.map((f) => ({ ...f, after: f.after ?? f.before })),
      }));
    }
    setStep((s) => s + 1);
  }

  async function save() {
    const questions = coach.status === "ready" ? coach.examination.questions : [];
    const record: ThoughtRecord = {
      id: crypto.randomUUID(),
      date: localToday(),
      createdAt: Date.now(),
      situation: draft.situation.trim(),
      feelings: draft.feelings,
      thought: draft.thought.trim(),
      beliefBefore: draft.beliefBefore,
      beliefAfter: draft.beliefAfter,
      evidenceFor: draft.evidenceFor.trim(),
      answers: questions
        .map((question, i) => ({ question, answer: (draft.answers[i] ?? "").trim() }))
        .filter((a) => a.answer),
      evidenceAgainst: draft.evidenceAgainst.trim(),
      traps: draft.traps,
      balanced: draft.balanced.trim(),
    };
    try {
      await putRecord(record);
      setSaveError(false);
      setSaved(record);
      onSaved();
    } catch {
      setSaveError(true);
    }
  }

  function restart() {
    setDraft(EMPTY);
    setCoach({ status: "idle" });
    examinedFor.current = "";
    setSaved(null);
    setStep(0);
  }

  function toggleFeeling(name: string) {
    const n = name.trim().toLowerCase().slice(0, LIMITS.feelingName);
    if (!n) return;
    setDraft((d) => {
      if (d.feelings.some((f) => f.name === n)) return { ...d, feelings: d.feelings.filter((f) => f.name !== n) };
      if (d.feelings.length >= LIMITS.feelings) return d;
      return { ...d, feelings: [...d.feelings, { name: n, before: 60, after: null }] };
    });
  }

  function toggleTrap(id: TrapId) {
    setDraft((d) => ({ ...d, traps: d.traps.includes(id) ? d.traps.filter((t) => t !== id) : [...d.traps, id] }));
  }

  if (saved) {
    const b = saved.beliefAfter! - saved.beliefBefore;
    return (
      <section className={`${card} tablet:p-8 p-5`} aria-labelledby="st-done-heading">
        <h2 id="st-done-heading" ref={headingRef} tabIndex={-1} className={`${heading} mb-1.5 outline-none`}>
          {b < 0 ? "You loosened that thought's grip" : "You took a second look"}
        </h2>
        <p className="text-st-muted mb-6 text-[15px] leading-relaxed">
          {b < 0
            ? `Your belief in it went from ${saved.beliefBefore} to ${saved.beliefAfter}. Saved in this browser.`
            : "Some thoughts don't budge in one go, and that's normal. Looking at them still counts. Saved in this browser."}
        </p>
        <RecordSummary record={saved} />
        <div className="mt-7">
          <button type="button" onClick={restart} className={primaryBtn}>
            Start another
          </button>
        </div>
      </section>
    );
  }

  const canNext = [
    draft.situation.trim().length > 0,
    true,
    draft.thought.trim().length > 0,
    true,
    coach.status === "ready",
    true,
  ][step];

  let body: ReactNode;
  if (step === 0) {
    body = (
      <>
        <StepHeading refEl={headingRef} title="What happened?" hint="Just the facts: where you were, who was there, what happened. A camera's view, not your take on it." />
        <label htmlFor="st-situation" className="sr-only">Situation</label>
        <TextArea id="st-situation" value={draft.situation} onChange={(v) => set("situation", v)} max={LIMITS.situation} placeholder="Thursday at lunch, my friend canceled our plans by text..." />
      </>
    );
  } else if (step === 1) {
    const chosen = new Set(draft.feelings.map((f) => f.name));
    const full = draft.feelings.length >= LIMITS.feelings;
    body = (
      <>
        <StepHeading refEl={headingRef} title="How did you feel?" hint="Pick up to 3, then rate how strong each one was. Feelings are usually one word." />
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Feelings">
          {[...COMMON_FEELINGS, ...draft.feelings.map((f) => f.name).filter((n) => !COMMON_FEELINGS.includes(n))].map((name) => {
            const on = chosen.has(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                disabled={!on && full}
                onClick={() => toggleFeeling(name)}
                className={`min-h-11 rounded-full border px-4.5 text-[15px] transition-colors disabled:opacity-40 ${focusRing} ${
                  on ? "border-st-accent bg-st-accent-soft font-bold" : "border-st-line-strong hover:bg-st-bg bg-white"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            toggleFeeling(customFeeling);
            setCustomFeeling("");
          }}
        >
          <label htmlFor="st-custom-feeling" className="sr-only">Add your own feeling</label>
          <input
            id="st-custom-feeling"
            value={customFeeling}
            onChange={(e) => setCustomFeeling(e.target.value)}
            maxLength={LIMITS.feelingName}
            placeholder="Add your own"
            disabled={full}
            className={`${field} min-h-11 flex-1 rounded-full py-2`}
          />
          <button type="submit" disabled={full || !customFeeling.trim()} className={secondaryBtn}>
            Add
          </button>
        </form>
        <div className="space-y-5">
          {draft.feelings.map((f, i) => (
            <Rating
              key={f.name}
              label={`How ${f.name}?`}
              value={f.before}
              low="Barely"
              high="As strong as it gets"
              onChange={(v) => set("feelings", draft.feelings.map((g, j) => (j === i ? { ...g, before: v } : g)))}
            />
          ))}
        </div>
      </>
    );
  } else if (step === 2) {
    body = (
      <>
        <StepHeading refEl={headingRef} title="What went through your mind?" hint="The thought that stung the most. Try finishing “I'm afraid that...” or “This means...”" />
        <label htmlFor="st-thought" className="sr-only">Hot thought</label>
        <TextArea id="st-thought" value={draft.thought} onChange={(v) => set("thought", v)} max={LIMITS.thought} rows={2} placeholder="She doesn't actually want to be friends." />
        <div className="mt-6">
          <Rating label="How much do you believe it right now?" value={draft.beliefBefore} onChange={(v) => set("beliefBefore", v)} />
        </div>
      </>
    );
  } else if (step === 3) {
    body = (
      <>
        <StepHeading refEl={headingRef} title="What makes it feel true?" hint="Write down the evidence for the thought. Stick to facts someone else could see, not guesses about what people meant." />
        <label htmlFor="st-for" className="sr-only">Evidence for the thought</label>
        <TextArea id="st-for" value={draft.evidenceFor} onChange={(v) => set("evidenceFor", v)} max={LIMITS.evidence} placeholder="She's canceled twice this month." />
      </>
    );
  } else if (step === 4) {
    body = (
      <>
        <StepHeading refEl={headingRef} title="Take a second look" hint="These questions help you check the thought against everything you know. Answer the ones that help; skip the rest." />
        {coach.status !== "ready" ? (
          <p role="status" className="text-st-muted py-8 text-center text-[15px]">
            Reading your record and thinking of questions...
          </p>
        ) : (
          <SecondLook
            coach={coach}
            draft={draft}
            onToggleTrap={toggleTrap}
            onAnswer={(i, v) => {
              const answers = [...draft.answers];
              answers[i] = v;
              set("answers", answers);
            }}
            onAgainst={(v) => set("evidenceAgainst", v)}
          />
        )}
      </>
    );
  } else {
    body = (
      <>
        <StepHeading refEl={headingRef} title="A more balanced thought" hint="Put the evidence for and against together, in your own words. It doesn't have to be positive, just fair. “Even though..., ...” is a good start." />
        <div className="bg-st-bg mb-4 rounded-2xl px-4 py-3 text-[15px] leading-relaxed">
          <span className="text-st-muted">Your thought was:</span> <em>&ldquo;{draft.thought.trim()}&rdquo;</em>
        </div>
        <label htmlFor="st-balanced" className="sr-only">Balanced thought</label>
        <TextArea id="st-balanced" value={draft.balanced} onChange={(v) => set("balanced", v)} max={LIMITS.balanced} rows={3} placeholder="Even though she canceled, she suggested another day, and..." />
        <div className="mt-7 space-y-5">
          <p className={label}>Now, rate again</p>
          <Rating label="How much do you believe the original thought now?" value={draft.beliefAfter} onChange={(v) => set("beliefAfter", v)} />
          {draft.feelings.map((f, i) => (
            <Rating
              key={f.name}
              label={`How ${f.name} now?`}
              value={f.after ?? f.before}
              low="Barely"
              high="As strong as it gets"
              onChange={(v) => set("feelings", draft.feelings.map((g, j) => (j === i ? { ...g, after: v } : g)))}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <section className={`${card} tablet:p-8 p-5`} aria-label="New thought record">
      <div className="mb-5">
        <div className="text-st-muted mb-2 flex justify-between text-[13px] font-semibold">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="bg-st-track h-1.5 overflow-hidden rounded-full" aria-hidden="true">
          <div className="bg-st-accent h-full rounded-full transition-[width]" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {body}

      {saveError && (
        <p role="alert" className="bg-st-butter mt-5 rounded-2xl px-4 py-3 text-sm">
          This browser blocked saving. Private browsing is a common cause.
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className={quietBtn}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} disabled={!canNext} className={primaryBtn}>
            Next
          </button>
        ) : (
          <button type="button" onClick={save} className={primaryBtn}>
            Save record
          </button>
        )}
      </div>
    </section>
  );
}

function StepHeading({ title, hint, refEl }: { title: string; hint: ReactNode; refEl: RefObject<HTMLHeadingElement | null> }) {
  return (
    <>
      <h2 ref={refEl} tabIndex={-1} className={`${heading} mb-1.5 outline-none`}>
        {title}
      </h2>
      <p className="text-st-muted mb-5 text-[15px] leading-relaxed">{hint}</p>
    </>
  );
}

function SecondLook({
  coach,
  draft,
  onToggleTrap,
  onAnswer,
  onAgainst,
}: {
  coach: Extract<Coach, { status: "ready" }>;
  draft: Draft;
  onToggleTrap: (id: TrapId) => void;
  onAnswer: (i: number, v: string) => void;
  onAgainst: (v: string) => void;
}) {
  const { examination, fallback, note } = coach;
  // Without the coach, offer the full list to pick from.
  const trapOptions = fallback
    ? TRAPS.map((t) => ({ id: t.id as TrapId, why: t.description }))
    : examination.traps;

  return (
    <div className="space-y-7">
      {note && (
        <p role="status" className="bg-st-butter rounded-2xl px-4 py-3 text-sm">
          {note}
        </p>
      )}

      <div>
        <p className={`${label} mb-1`}>{fallback ? "Any thinking traps?" : "Possible thinking traps"}</p>
        <p className="text-st-muted mb-3 text-sm">
          {fallback ? "Tap any that show up in your thought." : "Suggestions from Claude. Tap the ones that fit; ignore the rest."}
        </p>
        {trapOptions.length === 0 ? (
          <p className="text-[15px]">No clear thinking traps stood out. That happens, especially when a thought is partly accurate.</p>
        ) : (
          <ul className="space-y-2">
            {trapOptions.map((t) => {
              const on = draft.traps.includes(t.id);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggleTrap(t.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${focusRing} ${
                      on ? "border-st-accent bg-st-accent-soft" : "border-st-line-strong hover:bg-st-bg bg-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${on ? "border-st-accent bg-st-accent text-white" : "border-st-line-strong"}`}
                    >
                      {on && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="block font-bold">{trapById(t.id).name}</span>
                      <span className="text-st-muted block text-sm leading-relaxed">{t.why}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-5">
        <p className={label}>Questions to sit with</p>
        {examination.questions.map((q, i) => (
          <div key={q}>
            <label htmlFor={`st-q-${i}`} className="mb-2 block font-(family-name:--font-fraunces) text-[18px] leading-snug font-medium">
              {q}
            </label>
            <TextArea id={`st-q-${i}`} value={draft.answers[i] ?? ""} onChange={(v) => onAnswer(i, v)} max={LIMITS.answer} rows={2} />
          </div>
        ))}
        <div>
          <label htmlFor="st-against" className="mb-2 block font-(family-name:--font-fraunces) text-[18px] leading-snug font-medium">
            Anything else that doesn&apos;t fit the thought?
          </label>
          <TextArea id="st-against" value={draft.evidenceAgainst} onChange={onAgainst} max={LIMITS.evidence} rows={2} />
        </div>
      </div>
    </div>
  );
}
