"use client";

import {
  PHQ4_ITEMS,
  PHQ4_OPTIONS,
  PHQ4_STEM,
  scorePhq4,
  type Phq4Score,
} from "@/lib/moody/phq4";
import { focusRing, label, pill, pillChecked } from "./ui";

const BAND_COPY: Record<Phq4Score["band"], string> = {
  normal: "Normal range (0 to 2)",
  mild: "Mild range (3 to 5)",
  moderate: "Moderate range (6 to 8)",
  severe: "Severe range (9 to 12)",
};

export function Phq4Result({ answers }: { answers: readonly number[] }) {
  const s = scorePhq4(answers);
  return (
    <div className="text-moody-ink text-sm leading-relaxed">
      <p>
        <strong>Total {s.total} of 12.</strong> {BAND_COPY[s.band]}.
      </p>
      <p>
        Anxiety {s.anxiety} of 6
        {s.anxietyFlag ? " (3 or more, worth following up)" : ""}. Depression{" "}
        {s.depression} of 6
        {s.depressionFlag ? " (3 or more, worth following up)" : ""}.
      </p>
      {s.elevated && (
        <p className="mt-2">
          This score is in a range worth paying attention to. It is a screening
          signal, not a diagnosis. Consider talking with a doctor or therapist
          about how you&apos;ve been feeling.
        </p>
      )}
    </div>
  );
}

/** Optional weekly PHQ-4 (Kroenke et al., 2009). */
export function Phq4Card({
  answers,
  onChange,
  onDismiss,
}: {
  answers: (number | null)[];
  onChange: (answers: (number | null)[]) => void;
  onDismiss: () => void;
}) {
  const complete = answers.every((a) => a !== null);

  return (
    <fieldset className="bg-moody-sky-pale/60 tablet:p-5 rounded-2xl p-4">
      <legend className="sr-only">Weekly PHQ-4 check</legend>
      <div className={`${label} mb-2`}>Weekly check, optional</div>
      <p className="mb-4 text-[15px]">{PHQ4_STEM}</p>

      <div className="space-y-5">
        {PHQ4_ITEMS.map((item, i) => (
          <div key={item} role="radiogroup" aria-labelledby={`phq4-q${i}`}>
            <p id={`phq4-q${i}`} className="mb-2 text-sm font-semibold">
              {item}
            </p>
            <div className="tablet:grid-cols-4 grid grid-cols-2 gap-2">
              {PHQ4_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`${pill} ${pillChecked} rounded-2xl px-3 py-2 text-center text-[13px]`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name={`phq4-${i}`}
                    value={opt.value}
                    checked={answers[i] === opt.value}
                    onChange={() =>
                      onChange(answers.map((a, j) => (j === i ? opt.value : a)))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {complete && (
        <div className="mt-5 rounded-2xl bg-white p-4" aria-live="polite">
          <Phq4Result answers={answers as number[]} />
        </div>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className={`text-moody-muted hover:text-moody-ink mt-4 min-h-11 rounded text-sm underline underline-offset-3 ${focusRing}`}
      >
        Not this week
      </button>
    </fieldset>
  );
}
