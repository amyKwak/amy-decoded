"use client";

import { useState } from "react";
import { quadrantOf, QUADRANT_WORDS } from "@/lib/moody/affect";
import { detectCrisis } from "@/lib/moody/crisis";
import { putEntry } from "@/lib/moody/db";
import { isValidPhq4 } from "@/lib/moody/phq4";
import { MAX_JOURNAL_CHARS, SLEEP_QUALITIES, type Entry, type Extraction, type SleepQuality } from "@/lib/moody/types";
import { AffectGrid, type GridValue } from "./AffectGrid";
import { FeelingPicker } from "./FeelingPicker";
import { Phq4Card } from "./Phq4Card";
import { card, field, heading, label, localToday, pill, pillChecked, primaryBtn, quietBtn, secondaryBtn } from "./ui";

/** One question at a time; "saved" is the closing screen. */
type Step = "mood" | "sleep" | "note" | "feelings" | "saved";

const STEPS: { id: Exclude<Step, "saved">; label: string }[] = [
  { id: "mood", label: "Mood" },
  { id: "sleep", label: "Sleep" },
  { id: "note", label: "Note" },
  { id: "feelings", label: "Words" },
];

const EMPTY_PHQ4 = [null, null, null, null];

export function CheckIn({
  phq4Due,
  onDismissPhq4,
  onSaved,
  onCrisis,
  streak,
  onViewPatterns,
}: {
  phq4Due: boolean;
  onDismissPhq4: () => void;
  onSaved: () => void;
  onCrisis: () => void;
  /** Consecutive check-in days up to today, including a just-saved entry. */
  streak: number;
  onViewPatterns: () => void;
}) {
  const [grid, setGrid] = useState<GridValue | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [journal, setJournal] = useState("");
  const [step, setStep] = useState<Step>("mood");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [phq4, setPhq4] = useState<(number | null)[]>(EMPTY_PHQ4);

  async function suggestFeelings(text = journal.trim()) {
    if (!grid) return;
    const fallback = QUADRANT_WORDS[quadrantOf(grid.valence, grid.arousal)];
    setNotice(null);
    setExtraction(null);

    // Safety check runs locally, before any network call.
    if (detectCrisis(text)) onCrisis();

    if (!text) {
      setSuggestions(fallback);
      setStep("feelings");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/moody/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal: text, ...grid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Moody's AI is unavailable. You can still save your check-in.");
      const result = data as Extraction;
      if (result.safety_concern) onCrisis();
      setExtraction(result);
      setSuggestions(result.emotions.length ? result.emotions : fallback);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
      setSuggestions(fallback);
    } finally {
      setBusy(false);
      setStep("feelings");
    }
  }

  async function save() {
    if (!grid) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      date: localToday(),
      createdAt: Date.now(),
      valence: grid.valence,
      arousal: grid.arousal,
      sleepHours,
      sleepQuality,
      journal: journal.trim(),
      emotions: feelings,
      people: extraction?.people ?? [],
      activities: extraction?.activities ?? [],
      triggers: extraction?.triggers ?? [],
      summary: extraction?.summary ?? "",
      phq4: isValidPhq4(phq4) ? phq4 : null,
    };
    setBusy(true);
    try {
      await putEntry(entry);
      setStep("saved");
      onSaved();
    } catch {
      setNotice("Couldn't save to this browser's storage. Private browsing can block it.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setGrid(null);
    setSleepHours(null);
    setSleepQuality(null);
    setJournal("");
    setExtraction(null);
    setSuggestions([]);
    setFeelings([]);
    setPhq4(EMPTY_PHQ4);
    setNotice(null);
    setStep("mood");
  }

  const adjustSleep = (delta: number) =>
    // The first tap starts from a typical 7 hours.
    setSleepHours((h) => (h === null ? 7 : Math.min(24, Math.max(0, h + delta))));

  if (step === "saved") {
    return (
      <div className={`${card} flex flex-col items-center gap-3.5 px-6 pt-10 pb-8 text-center`} role="status">
        <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-moody-accent-soft text-moody-accent">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className={heading}>Thanks for checking in</p>
        <p className="max-w-105 text-[15px] leading-relaxed text-moody-muted">
          {streak > 1 ? `That's ${streak} days in a row. ` : "Your check-in is saved in this browser. "}
          The more days you log, the more Moody can show you about what goes with your better days.
        </p>
        <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={onViewPatterns} className={primaryBtn}>
            See your patterns
          </button>
          <button type="button" onClick={reset} className={secondaryBtn}>
            Done
          </button>
        </div>
      </div>
    );
  }

  const index = STEPS.findIndex((s) => s.id === step);
  const help = "text-[15px] leading-relaxed text-moody-muted";

  function next() {
    if (step === "mood") setStep("sleep");
    else if (step === "sleep") setStep("note");
    else if (step === "note") suggestFeelings();
    else save();
  }

  return (
    <section className={`${card} flex flex-col gap-5 p-5 tablet:p-7`} aria-labelledby="moody-step-heading">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className={label}>
            Step {index + 1} of {STEPS.length} · {STEPS[index].label}
          </p>
          <p className="text-sm text-moody-muted">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div aria-hidden="true" className="grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`h-1 rounded-full ${i <= index ? "bg-moody-accent" : "bg-moody-track"}`} />
          ))}
        </div>
      </div>

      {step === "mood" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 id="moody-step-heading" className={heading}>
              How are you feeling right now?
            </h2>
            <p className={help}>Tap the spot that fits best. There&apos;s no wrong answer.</p>
          </div>
          <AffectGrid value={grid} onChange={setGrid} />
        </div>
      )}

      {step === "sleep" && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 id="moody-step-heading" className={heading}>
              How did you sleep?
            </h2>
            <p className={help}>Optional. A rough guess is perfect.</p>
          </div>
          <div role="group" aria-labelledby="moody-hours-label" className="flex flex-col gap-2">
            <span id="moody-hours-label" className="text-sm font-bold">
              Hours slept
            </span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => adjustSleep(-0.5)} aria-label="Half an hour less" className={`${secondaryBtn} w-11 px-0 text-xl`}>
                −
              </button>
              <output aria-live="polite" className="font-(family-name:--font-quicksand) min-w-20 text-center text-[32px] font-bold">
                {sleepHours ?? "–"}
              </output>
              <button type="button" onClick={() => adjustSleep(0.5)} aria-label="Half an hour more" className={`${secondaryBtn} w-11 px-0 text-xl`}>
                +
              </button>
              <span className="text-[15px] text-moody-muted">hours</span>
            </div>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-bold">How rested do you feel?</legend>
            <div className="flex flex-wrap gap-2">
              {SLEEP_QUALITIES.map((q) => (
                <label key={q} className={`${pill} ${pillChecked}`}>
                  <input
                    type="radio"
                    name="moody-sleep-quality"
                    className="sr-only"
                    checked={sleepQuality === q}
                    onChange={() => setSleepQuality(q)}
                  />
                  {q[0].toUpperCase() + q.slice(1)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === "note" && (
        <div className="flex flex-col gap-3.5">
          <div>
            <h2 id="moody-step-heading" className={heading}>
              Anything on your mind?
            </h2>
            <p className={help}>Optional. A sentence or two helps Moody suggest words that fit and spot patterns later.</p>
          </div>
          <label htmlFor="moody-journal" className="sr-only">
            Journal note
          </label>
          <textarea
            id="moody-journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            maxLength={MAX_JOURNAL_CHARS}
            rows={5}
            placeholder="A few sentences about your day"
            className={`${field} w-full resize-y py-3.5 leading-relaxed`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-moody-muted">
            <span className="flex items-center gap-2">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Saved only in this browser. Sent to Claude just to suggest feeling words.
            </span>
            <span className="font-mono text-[11px]">
              {journal.length} / {MAX_JOURNAL_CHARS}
            </span>
          </div>
        </div>
      )}

      {step === "feelings" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 id="moody-step-heading" className={heading}>
              Which words fit?
            </h2>
            <p className={help}>Pick any that feel right, or add your own. Naming a feeling clearly can make it easier to hold.</p>
          </div>
          {notice && (
            <p role="status" className="rounded-2xl bg-moody-butter px-4 py-3 text-sm">
              {notice}
            </p>
          )}
          <FeelingPicker suggestions={suggestions} selected={feelings} onChange={setFeelings} />
          {extraction && extraction.people.length + extraction.activities.length + extraction.triggers.length > 0 && (
            <dl className="grid gap-1.5 text-sm">
              {(["people", "activities", "triggers"] as const).map((k) =>
                extraction[k].length ? (
                  <div key={k} className="flex gap-2">
                    <dt className={`${label} w-24 shrink-0 pt-0.5 text-xs`}>{k}</dt>
                    <dd>{extraction[k].join(", ")}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          )}
          {phq4Due && (
            <Phq4Card
              answers={phq4}
              onChange={setPhq4}
              onDismiss={() => {
                setPhq4(EMPTY_PHQ4);
                onDismissPhq4();
              }}
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-moody-track pt-4.5">
        <button
          type="button"
          onClick={() => setStep(STEPS[Math.max(0, index - 1)].id)}
          className={`${quietBtn} ${index === 0 ? "invisible" : ""}`}
        >
          Back
        </button>
        <div className="flex items-center gap-2">
          {(step === "sleep" || step === "note") && (
            <button
              type="button"
              onClick={() => {
                if (step === "sleep") {
                  setSleepHours(null);
                  setSleepQuality(null);
                  setStep("note");
                } else {
                  setJournal("");
                  suggestFeelings("");
                }
              }}
              disabled={busy}
              className={quietBtn}
            >
              Skip
            </button>
          )}
          <button type="button" onClick={next} disabled={(step === "mood" && !grid) || busy} className={primaryBtn}>
            {busy ? (step === "note" ? "Reading your note…" : "Saving…") : step === "feelings" ? "Save check-in" : "Continue"}
          </button>
        </div>
      </div>
      {step === "mood" && !grid && <p className="-mt-3 text-right text-sm text-moody-muted">Pick a spot on the grid to continue.</p>}
    </section>
  );
}
