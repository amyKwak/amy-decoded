"use client";

import { quadrantOf, QUADRANT_LABELS } from "@/lib/moody/affect";
import { addDays } from "@/lib/moody/demo-data";
import { computeStats } from "@/lib/moody/stats";
import type { Entry } from "@/lib/moody/types";
import { Phq4Result } from "./Phq4Card";
import { card, focusRing, formatDate, label, QUADRANT_COLORS } from "./ui";

export function HistoryView({
  entries,
  today,
  onDelete,
}: {
  entries: Entry[];
  today: string;
  onDelete: (id: string) => void;
}) {
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  // entries are newest first, so the first match is the latest check-in that day
  const byDate = new Map<string, Entry>();
  for (const e of entries) if (!byDate.has(e.date)) byDate.set(e.date, e);

  const range = { start_date: days[0], end_date: today };
  const valence = computeStats(entries, "valence", null, range).overall;
  const arousal = computeStats(entries, "arousal", null, range).overall;
  const sleep = computeStats(entries, "sleepHours", null, range).overall;
  const checkinDays = days.filter((d) => byDate.has(d)).length;

  if (entries.length === 0) {
    return (
      <div className={`${card} p-6 text-[15px] text-moody-muted`}>
        No check-ins yet. Do your first one, or load the sample data above to explore.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className={`${card} p-4 tablet:p-6`} aria-labelledby="moody-30-heading">
        <h2 id="moody-30-heading" className="mb-1 font-bold text-xl text-moody-ink">
          Last 30 days
        </h2>
        <p className="mb-4 text-sm text-moody-muted">
          {checkinDays} check-in {checkinDays === 1 ? "day" : "days"}. Average pleasantness {valence.mean ?? "n/a"}, energy {arousal.mean ?? "n/a"}
          {sleep.mean !== null && `, sleep ${sleep.mean} hours`}.
        </p>
        <ol className="grid grid-cols-6 gap-1.5 tablet:grid-cols-10">
          {days.map((d) => {
            const e = byDate.get(d);
            const q = e ? quadrantOf(e.valence, e.arousal) : null;
            return (
              <li
                key={d}
                aria-label={
                  e
                    ? `${formatDate(d)}: ${QUADRANT_LABELS[q!]}, pleasantness ${e.valence}, energy ${e.arousal}`
                    : `${formatDate(d)}: no check-in`
                }
                style={q ? { backgroundColor: QUADRANT_COLORS[q] } : undefined}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 text-center ${
                  e ? "border-moody-ink" : "border-dashed border-moody-line"
                }`}
              >
                <span aria-hidden="true" className="text-[10px] font-semibold text-moody-ink/70">
                  {formatDate(d, { day: "numeric" })}
                </span>
                {e && (
                  <span aria-hidden="true" className="text-sm font-semibold text-moody-ink">
                    {e.valence}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-moody-muted" aria-label="Color key">
          {(["high-pleasant", "low-pleasant", "high-unpleasant", "low-unpleasant", "neutral"] as const).map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-moody-ink" style={{ backgroundColor: QUADRANT_COLORS[k] }} />
              {QUADRANT_LABELS[k]}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-moody-muted">The number in each square is pleasantness, from 1 to 9.</p>
      </section>

      <section aria-labelledby="moody-entries-heading">
        <h2 id="moody-entries-heading" className="mb-3 font-bold text-xl text-moody-ink">
          Entries
        </h2>
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className={`${card} p-4 tablet:p-5`}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-moody-ink">
                    {formatDate(e.date, { weekday: "short", month: "short", day: "numeric" })}
                    {e.demo && <span className={`${label} ml-2`}>sample</span>}
                  </p>
                  <p className="text-sm text-moody-muted">
                    {QUADRANT_LABELS[quadrantOf(e.valence, e.arousal)]}. Pleasantness {e.valence}, energy {e.arousal}.
                    {e.sleepHours !== null && ` Slept ${e.sleepHours} hours`}
                    {e.sleepQuality && ` (${e.sleepQuality})`}
                    {e.sleepHours !== null || e.sleepQuality ? "." : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(e.id)}
                  aria-label={`Delete entry from ${formatDate(e.date)}`}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs text-moody-muted hover:bg-moody-cream hover:text-moody-ink ${focusRing}`}
                >
                  Delete
                </button>
              </div>
              {e.emotions.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-1.5" aria-label="Feelings">
                  {e.emotions.map((w) => (
                    <li key={w} className="rounded-full bg-moody-cream px-2.5 py-0.5 text-xs text-moody-ink">
                      {w}
                    </li>
                  ))}
                </ul>
              )}
              {e.journal && <p className="text-[15px] leading-relaxed text-moody-ink">{e.journal}</p>}
              {(e.people.length > 0 || e.activities.length > 0 || e.triggers.length > 0) && (
                <p className="mt-2 text-xs text-moody-muted">
                  {[
                    e.people.length && `People: ${e.people.join(", ")}`,
                    e.activities.length && `Activities: ${e.activities.join(", ")}`,
                    e.triggers.length && `Harder because of: ${e.triggers.join(", ")}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {e.phq4 && (
                <div className="mt-3 rounded-2xl bg-moody-bg p-3">
                  <p className={`${label} mb-1`}>Weekly PHQ-4</p>
                  <Phq4Result answers={e.phq4} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
