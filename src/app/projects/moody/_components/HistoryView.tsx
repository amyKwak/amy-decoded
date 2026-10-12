"use client";

import { useState } from "react";
import { quadrantOf, type Quadrant } from "@/lib/moody/affect";
import { addDays } from "@/lib/moody/demo-data";
import { computeStats, MIN_RELIABLE_N } from "@/lib/moody/stats";
import type { Entry } from "@/lib/moody/types";
import { Phq4Result } from "./Phq4Card";
import {
  card,
  focusRing,
  formatDate,
  heading,
  label,
  MOOD_NAMES,
  QUADRANT_COLORS,
  quietBtn,
  secondaryBtn,
} from "./ui";

const KEY_ORDER: Quadrant[] = [
  "high-pleasant",
  "low-pleasant",
  "high-unpleasant",
  "low-unpleasant",
  "neutral",
];

const SLEEP_BUCKETS = [
  { label: "Under 6 hours", test: (h: number) => h < 6 },
  { label: "6 to 7 hours", test: (h: number) => h >= 6 && h < 7 },
  { label: "7 or more", test: (h: number) => h >= 7 },
];

const mean = (xs: number[]) =>
  xs.length
    ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10
    : null;

/** Patterns tab: a 30-day overview, sleep vs. mood, and the entry list. */
export function HistoryView({
  entries,
  today,
  onDelete,
}: {
  entries: Entry[];
  today: string;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);

  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  // entries are newest first, so the first match is the latest check-in that day
  const byDate = new Map<string, Entry>();
  for (const e of entries) if (!byDate.has(e.date)) byDate.set(e.date, e);

  const range = { start_date: days[0], end_date: today };
  const valence = computeStats(entries, "valence", null, range).overall;
  const arousal = computeStats(entries, "arousal", null, range).overall;
  const sleep = computeStats(entries, "sleepHours", null, range).overall;
  const checkinDays = days.filter((d) => byDate.has(d)).length;

  const recent = entries.filter((e) => e.date >= days[0] && e.date <= today);
  const sleepRows = SLEEP_BUCKETS.map((b) => {
    const group = recent.filter(
      (e) => e.sleepHours !== null && b.test(e.sleepHours),
    );
    return {
      label: b.label,
      mean: mean(group.map((e) => e.valence)),
      n: group.length,
    };
  });
  const [short, , long] = sleepRows;
  const sleepInsight =
    short.mean !== null &&
    long.mean !== null &&
    short.n >= MIN_RELIABLE_N &&
    long.n >= MIN_RELIABLE_N
      ? long.mean - short.mean >= 1
        ? "After 7 or more hours of sleep, your days tend to feel noticeably more pleasant."
        : short.mean - long.mean >= 1
          ? "Interesting: your shorter nights have tended to come before more pleasant days."
          : "So far, how long you sleep doesn't seem to change your mood much."
      : null;

  if (entries.length === 0) {
    return (
      <div
        className={`${card} text-moody-muted p-6 text-[15px] leading-relaxed`}
      >
        Your patterns will show up here after a few check-ins. Do your first
        one, or try the sample data above to see what this looks like.
      </div>
    );
  }

  const tiles = [
    {
      label: "Check-ins",
      value: `${checkinDays} ${checkinDays === 1 ? "day" : "days"}`,
      note: "out of the last 30",
    },
    {
      label: "Pleasantness",
      value: valence.mean ?? "–",
      note: "average, out of 9",
    },
    { label: "Energy", value: arousal.mean ?? "–", note: "average, out of 9" },
    {
      label: "Sleep",
      value: sleep.mean !== null ? `${sleep.mean} h` : "–",
      note: "average a night",
    },
  ];

  return (
    <div className="space-y-5">
      <section aria-labelledby="moody-30-heading" className="space-y-3.5">
        <div>
          <h2 id="moody-30-heading" className={heading}>
            Your last 30 days
          </h2>
          <p className="text-moody-muted text-[15px]">
            A quick look at how things have been going.
          </p>
        </div>
        <dl className="tablet:grid-cols-4 grid grid-cols-2 gap-2.5">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="border-moody-line flex flex-col rounded-[18px] border bg-white px-4 py-3.5"
            >
              <dt className="text-moody-muted text-[13px] font-semibold">
                {t.label}
              </dt>
              <dd className="font-(family-name:--font-quicksand) text-[26px] leading-tight font-bold">
                {t.value}
              </dd>
              <dd className="text-moody-muted text-[13px]">{t.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className={`${card} tablet:p-6 space-y-4 p-5`}
        aria-labelledby="moody-cal-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h3 id="moody-cal-heading" className="text-[17px] font-bold">
            Mood calendar
          </h3>
          <span className="text-moody-muted text-[13px]">
            {formatDate(days[0])} – {formatDate(today)}
          </span>
        </div>
        <ol className="tablet:grid-cols-10 grid grid-cols-6 gap-1.5">
          {days.map((d) => {
            const e = byDate.get(d);
            const q = e ? quadrantOf(e.valence, e.arousal) : null;
            return (
              <li
                key={d}
                aria-label={
                  e
                    ? `${formatDate(d)}: ${MOOD_NAMES[q!]}, pleasantness ${e.valence}, energy ${e.arousal}`
                    : `${formatDate(d)}: no check-in`
                }
                style={q ? { backgroundColor: QUADRANT_COLORS[q] } : undefined}
                className={`text-moody-ink/75 flex aspect-square items-center justify-center rounded-[10px] text-xs font-semibold ${
                  e ? "" : "border-moody-line-strong border border-dashed"
                }`}
              >
                <span aria-hidden="true">
                  {formatDate(d, { day: "numeric" })}
                </span>
              </li>
            );
          })}
        </ol>
        <ul
          className="text-moody-muted flex flex-wrap gap-x-4.5 gap-y-2 text-[13px]"
          aria-label="Color key"
        >
          {KEY_ORDER.map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded"
                style={{ backgroundColor: QUADRANT_COLORS[k] }}
              />
              {k === "neutral" ? "In the middle" : MOOD_NAMES[k]}
            </li>
          ))}
        </ul>
      </section>

      {sleepRows.some((r) => r.n > 0) && (
        <section
          className={`${card} tablet:p-6 space-y-4 p-5`}
          aria-labelledby="moody-sleep-heading"
        >
          <div>
            <h3 id="moody-sleep-heading" className="text-[17px] font-bold">
              Sleep and mood
            </h3>
            <p className="text-moody-muted text-sm">
              Average pleasantness (1 to 9) after nights of different lengths.
            </p>
          </div>
          <dl className="space-y-3">
            {sleepRows.map((r) => (
              <div
                key={r.label}
                className="tablet:grid-cols-[130px_minmax(0,1fr)_auto] grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-3 text-sm"
              >
                <dt className="text-moody-muted">{r.label}</dt>
                <dd
                  aria-hidden="true"
                  className="bg-moody-track h-3 overflow-hidden rounded-full"
                >
                  {r.mean !== null && (
                    <div
                      className="h-full rounded-full bg-[#7cc491]"
                      style={{ width: `${(r.mean / 9) * 100}%` }}
                    />
                  )}
                </dd>
                <dd className="min-w-16 text-right">
                  <strong>{r.mean ?? "–"}</strong>{" "}
                  <span className="text-moody-muted text-xs">
                    {r.n} {r.n === 1 ? "day" : "days"}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          {sleepInsight && (
            <p className="bg-moody-mint-pale rounded-xl px-3.5 py-3 text-sm">
              {sleepInsight}
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="moody-entries-heading" className="space-y-3">
        <h2
          id="moody-entries-heading"
          className="font-(family-name:--font-quicksand) text-[22px] font-bold"
        >
          Entries
        </h2>
        <ul className="space-y-2.5">
          {entries.map((e) => {
            const q = quadrantOf(e.valence, e.arousal);
            const sleepText = [
              e.sleepHours !== null && `slept ${e.sleepHours} h`,
              e.sleepQuality,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={e.id}
                className="border-moody-line tablet:px-5 flex gap-3.5 rounded-[18px] border bg-white p-4"
              >
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-xl"
                  style={{ backgroundColor: QUADRANT_COLORS[q] }}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">
                      {formatDate(e.date, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="text-moody-muted font-normal">
                        {" "}
                        · {MOOD_NAMES[q]}
                      </span>
                      {e.demo && (
                        <span className={`${label} ml-2 text-[11px]`}>
                          sample
                        </span>
                      )}
                    </p>
                    {confirming !== e.id && (
                      <button
                        type="button"
                        onClick={() => setConfirming(e.id)}
                        aria-label={`Delete entry from ${formatDate(e.date)}`}
                        className={`text-moody-muted hover:bg-moody-bg hover:text-moody-ink -mt-1.5 -mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${focusRing}`}
                      >
                        <svg
                          aria-hidden="true"
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {e.journal && (
                    <p className="text-[15px] leading-relaxed">{e.journal}</p>
                  )}
                  {(e.emotions.length > 0 || sleepText) && (
                    <p className="text-moody-muted text-[13px]">
                      {[e.emotions.join(" · "), sleepText]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {(e.people.length > 0 ||
                    e.activities.length > 0 ||
                    e.triggers.length > 0) && (
                    <p className="text-moody-muted text-[13px]">
                      {[
                        e.people.length && `People: ${e.people.join(", ")}`,
                        e.activities.length &&
                          `Activities: ${e.activities.join(", ")}`,
                        e.triggers.length &&
                          `Harder because of: ${e.triggers.join(", ")}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {e.phq4 && (
                    <div className="bg-moody-bg mt-2 rounded-2xl p-3.5">
                      <p className={`${label} mb-1 text-xs`}>Weekly check</p>
                      <Phq4Result answers={e.phq4} />
                    </div>
                  )}
                  {confirming === e.id && (
                    <div
                      role="group"
                      aria-label="Confirm delete"
                      className="bg-moody-coral-pale mt-2 flex flex-wrap items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm"
                    >
                      <span className="mr-auto">
                        Delete this entry? This can&apos;t be undone.
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className={quietBtn}
                      >
                        Keep it
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirming(null);
                          onDelete(e.id);
                        }}
                        className={secondaryBtn}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
