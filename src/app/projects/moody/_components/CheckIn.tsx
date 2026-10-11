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
import { card, focusRing, label, localToday, primaryBtn, secondaryBtn } from "./ui";

type Step = "form" | "feelings" | "saved";

const EMPTY_PHQ4 = [null, null, null, null];

export function CheckIn({
  phq4Due,
  onDismissPhq4,
  onSaved,
  onCrisis,
}: {
  phq4Due: boolean;
  onDismissPhq4: () => void;
  onSaved: () => void;
  onCrisis: () => void;
}) {
  const [grid, setGrid] = useState<GridValue | null>(null);
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [journal, setJournal] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [phq4, setPhq4] = useState<(number | null)[]>(EMPTY_PHQ4);

  async function suggestFeelings() {
    if (!grid) return;
    const fallback = QUADRANT_WORDS[quadrantOf(grid.valence, grid.arousal)];
    const text = journal.trim();
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
    const hours = parseFloat(sleepHours);
    const entry: Entry = {
      id: crypto.randomUUID(),
      date: localToday(),
      createdAt: Date.now(),
      valence: grid.valence,
      arousal: grid.arousal,
      sleepHours: Number.isFinite(hours) ? Math.min(24, Math.max(0, hours)) : null,
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
    setSleepHours("");
    setSleepQuality(null);
    setJournal("");
    setExtraction(null);
    setSuggestions([]);
    setFeelings([]);
    setPhq4(EMPTY_PHQ4);
    setNotice(null);
    setStep("form");
  }

  if (step === "saved") {
    return (
      <div className={`${card} p-6 text-center`} role="status">
        <p className="mb-1 font-bold text-2xl text-moody-ink">Saved</p>
        <p className="mb-5 text-[15px] text-moody-muted">Your check-in is stored in this browser. You can find it in History.</p>
        <button type="button" onClick={reset} className={secondaryBtn}>
          Start another check-in
        </button>
      </div>
    );
  }

  const section = `${card} p-4 tablet:p-6`;
  const heading = "mb-1 font-bold text-xl text-moody-ink tablet:text-[22px]";
  const help = "mb-4 text-sm text-moody-muted";

  return (
    <div className="space-y-4">
      <section className={`${card} px-3 py-4 tablet:p-6`} aria-labelledby="moody-grid-heading">
        <h2 id="moody-grid-heading" className={`${heading} px-1 tablet:px-0`}>
          How are you feeling right now?
        </h2>
        <p className={`${help} px-1 tablet:px-0`}>Left to right goes from unpleasant to pleasant. Bottom to top goes from low to high energy.</p>
        <AffectGrid value={grid} onChange={setGrid} />
      </section>

      <section className={section} aria-labelledby="moody-sleep-heading">
        <h2 id="moody-sleep-heading" className={heading}>
          Last night&apos;s sleep
        </h2>
        <p className={help}>Optional. Your best guess is fine.</p>
        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:gap-6">
          <div>
            <label htmlFor="moody-sleep-hours" className="mb-1.5 block text-sm font-semibold text-moody-ink">
              Hours slept
            </label>
            <input
              id="moody-sleep-hours"
              type="number"
              inputMode="decimal"
              min={0}
              max={24}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className={`w-28 rounded-2xl border-2 border-moody-ink bg-moody-bg px-3 py-2 text-moody-ink ${focusRing}`}
            />
          </div>
          <fieldset className="flex-1">
            <legend className="mb-1.5 text-sm font-semibold text-moody-ink">Sleep quality</legend>
            <div className="flex flex-wrap gap-2">
              {SLEEP_QUALITIES.map((q) => (
                <label
                  key={q}
                  className="cursor-pointer rounded-full border-2 border-moody-ink bg-moody-bg px-3.5 py-1.5 text-sm text-moody-ink has-checked:bg-moody-pink has-checked:font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-moody-ink"
                >
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
      </section>

      <section className={section} aria-labelledby="moody-journal-heading">
        <h2 id="moody-journal-heading" className={heading}>
          What&apos;s going on today?
        </h2>
        <p className={help}>Optional. If you write something, Claude suggests feeling words that fit.</p>
        <label htmlFor="moody-journal" className="sr-only">
          Journal entry
        </label>
        <textarea
          id="moody-journal"
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          maxLength={MAX_JOURNAL_CHARS}
          rows={5}
          placeholder="A few sentences about your day"
          className={`w-full resize-y rounded-2xl border-2 border-moody-ink bg-moody-bg px-3.5 py-3 text-[15px] leading-relaxed text-moody-ink placeholder:text-moody-muted ${focusRing}`}
        />
        <p className="mt-1 text-right font-mono text-[11px] text-moody-muted">
          {journal.length} / {MAX_JOURNAL_CHARS}
        </p>
      </section>

      {step === "form" && (
        <div className="flex flex-col items-start gap-2">
          <button type="button" onClick={suggestFeelings} disabled={!grid || busy} className={primaryBtn}>
            {busy ? "Reading your entry..." : "Next: name your feelings"}
          </button>
          {!grid && <p className="text-sm text-moody-muted">Pick a square on the grid to continue.</p>}
        </div>
      )}

      {step === "feelings" && (
        <>
          <section className={section} aria-labelledby="moody-feelings-heading">
            <h2 id="moody-feelings-heading" className={heading}>
              Which words fit?
            </h2>
            <p className={help}>
              Pick any that feel right, or add your own. Naming feelings precisely can make them easier to work with.
            </p>
            {notice && (
              <p role="status" className="mb-4 rounded-2xl bg-moody-cream px-3.5 py-2.5 text-sm text-moody-ink">
                {notice}
              </p>
            )}
            <FeelingPicker suggestions={suggestions} selected={feelings} onChange={setFeelings} />
            {extraction && (extraction.people.length + extraction.activities.length + extraction.triggers.length > 0) && (
              <dl className="mt-5 grid gap-1.5 text-sm text-moody-muted">
                {(["people", "activities", "triggers"] as const).map((k) =>
                  extraction[k].length ? (
                    <div key={k} className="flex gap-2">
                      <dt className={`${label} w-22 shrink-0 pt-0.5`}>{k}</dt>
                      <dd className="text-moody-ink">{extraction[k].join(", ")}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            )}
          </section>

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

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} disabled={busy} className={primaryBtn}>
              Save check-in
            </button>
            <button type="button" onClick={() => setStep("form")} className={secondaryBtn}>
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
