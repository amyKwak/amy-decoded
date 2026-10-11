"use client";

import { METRIC_SCALES, resolveStat, type Answer, type Finding, type ResolvedStat } from "@/lib/moody/answer";
import type { StatsResult } from "@/lib/moody/stats";
import type { Entry } from "@/lib/moody/types";
import { focusRing, formatDate, label, TONE_STYLES } from "./ui";

const CONFIDENCE = {
  solid: { text: "Clear pattern", dots: 3 },
  some: { text: "Some signal", dots: 2 },
  thin: { text: "Not much data yet", dots: 1 },
} as const;

const FINDING_COPY = { positive: "Lifts your mood", negative: "Weighs on you", neutral: "Worth noticing" } as const;

function ToneIcon({ tone }: { tone: Finding["tone"] }) {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-moody-ink"
      style={{ backgroundColor: TONE_STYLES[tone].accent }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {tone === "positive" && <path d="M12 19V5M5 12l7-7 7 7" />}
        {tone === "negative" && <path d="M12 5v14M5 12l7 7 7-7" />}
        {tone === "neutral" && <path d="M5 12h14" />}
      </svg>
    </span>
  );
}

/** Group average vs. the user's overall average, computed in code. */
function StatBar({ stat, tone }: { stat: ResolvedStat; tone: Finding["tone"] }) {
  const s = METRIC_SCALES[stat.metric];
  const pct = (x: number) => `${Math.min(100, Math.max(0, ((x - s.min) / (s.max - s.min)) * 100))}%`;
  const summary = `${s.label} ${stat.group.mean} with ${stat.group.key}, compared with your usual ${stat.overall}, over ${stat.group.n} days.`;

  return (
    <div className="mt-3" title={summary}>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[13px]">
        <span className="text-moody-ink">
          With {stat.group.key}: <strong className="text-base">{stat.group.mean}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-moody-muted">
          <span aria-hidden="true" className="h-3 w-[3px] rounded-full bg-moody-ink" />
          Your usual: {stat.overall}
        </span>
      </div>
      <div role="img" aria-label={summary} className="relative h-3.5 rounded-full border-2 border-moody-ink bg-white">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: pct(stat.group.mean), backgroundColor: TONE_STYLES[tone].accent }}
        />
        <div className="absolute -top-1.5 -bottom-1.5 w-[3px] -translate-x-1/2 rounded-full bg-moody-ink" style={{ left: pct(stat.overall) }} />
      </div>
      <p className="mt-1.5 text-xs text-moody-muted">
        {s.label}, {s.scale}. Based on {stat.group.n} {stat.group.n === 1 ? "day" : "days"}.
        {!stat.group.reliable && " Only a few days, so treat this as a hint."}
      </p>
    </div>
  );
}

export function AnswerCard({
  answer,
  lookups,
  stats,
  entries,
}: {
  answer: Answer;
  lookups: string[];
  stats: StatsResult[];
  entries: Entry[];
}) {
  const tone = TONE_STYLES[answer.tone];
  const conf = CONFIDENCE[answer.confidence];

  return (
    <article className="overflow-hidden rounded-[24px] border-2 border-moody-ink bg-white shadow-[0_10px_30px_rgba(91,91,208,0.12)]">
      <header className="border-b-2 border-moody-ink px-5 pt-4 pb-5 tablet:px-6" style={{ backgroundColor: tone.soft }}>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-moody-ink bg-white px-2.5 py-0.5 text-xs font-bold text-moody-ink">
            <span aria-hidden="true" className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= conf.dots ? "bg-moody-ink" : "bg-moody-line"}`} />
              ))}
            </span>
            {conf.text}
          </span>
          {answer.confidence_note && <span className="text-xs text-moody-muted">{answer.confidence_note}</span>}
        </div>
        <h3 className="text-[22px] leading-snug font-bold text-moody-ink tablet:text-2xl">{answer.headline}</h3>
      </header>

      <div className="space-y-6 px-5 py-5 tablet:px-6">
        {answer.findings.length > 0 && (
          <section>
            <h4 className={`${label} mb-3`}>What stands out</h4>
            <ul className="space-y-4">
              {answer.findings.map((f, i) => {
                const stat = f.stat ? resolveStat(f.stat, stats, entries) : null;
                return (
                  <li key={i} className="flex gap-3">
                    <ToneIcon tone={f.tone} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-moody-ink">
                        <span className="sr-only">{FINDING_COPY[f.tone]}: </span>
                        {f.title}
                      </p>
                      {f.detail && <p className="text-[15px] leading-relaxed text-moody-muted">{f.detail}</p>}
                      {stat && <StatBar stat={stat} tone={f.tone} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {answer.evidence.length > 0 && (
          <section>
            <h4 className={`${label} mb-3`}>In your words</h4>
            <ul className="grid gap-2.5 tablet:grid-cols-2">
              {answer.evidence.map((e) => (
                <li key={e.date + e.quote}>
                  <figure className="h-full rounded-[18px] bg-moody-pink-pale px-4 py-3">
                    <blockquote className="text-[15px] leading-relaxed font-semibold text-moody-ink">
                      &ldquo;{e.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-1.5 text-xs font-bold text-moody-muted">
                      {formatDate(e.date, { weekday: "short", month: "short", day: "numeric" })}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        )}

        {answer.suggestion && (
          <section className="flex gap-3 rounded-[18px] bg-moody-sky-pale px-4 py-3.5">
            <svg aria-hidden="true" className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="#ffef8c" stroke="#3b3654" strokeWidth="2" strokeLinejoin="round">
              <path d="M12 2l2.6 6.9L22 9.5l-5.6 4.8L18 22l-6-3.8L6 22l1.6-7.7L2 9.5l7.4-.6z" />
            </svg>
            <p className="text-[15px] leading-relaxed text-moody-ink">
              <span className="sr-only">Something to try: </span>
              {answer.suggestion}
            </p>
          </section>
        )}

        {lookups.length > 0 && (
          <details className="group text-sm">
            <summary className={`cursor-pointer list-none rounded-md font-bold text-moody-muted hover:text-moody-ink ${focusRing}`}>
              <span aria-hidden="true" className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
              How Moody found this · {lookups.length} {lookups.length === 1 ? "lookup" : "lookups"}
            </summary>
            <ol className="mt-2 space-y-1 pl-5 text-moody-muted">
              {lookups.map((l, j) => (
                <li key={j} className="list-decimal">
                  {l}
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </article>
  );
}
