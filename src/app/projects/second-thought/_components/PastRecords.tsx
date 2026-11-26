"use client";

import { averageBeliefChange } from "@/lib/second-thought/shift";
import type { ThoughtRecord } from "@/lib/second-thought/types";
import { RecordSummary } from "./RecordSummary";
import { card, focusRing, formatDate, label, quietBtn } from "./ui";

export function PastRecords({
  records,
  onDelete,
  onStart,
}: {
  records: ThoughtRecord[];
  onDelete: (id: string) => void;
  onStart: () => void;
}) {
  if (records.length === 0) {
    return (
      <div className="border-st-line-strong text-st-muted rounded-3xl border border-dashed bg-white p-6 text-[15px] leading-relaxed">
        No records yet. They&apos;ll show up here once you save one.{" "}
        <button type="button" onClick={onStart} className={`text-st-ink rounded font-semibold underline underline-offset-3 ${focusRing}`}>
          Start a record
        </button>
      </div>
    );
  }

  const avg = averageBeliefChange(records);

  return (
    <div className="space-y-4">
      {avg && avg.n >= 2 && (
        <div className="bg-st-accent-soft rounded-3xl px-5 py-4.5">
          <p className={`${label} mb-1`}>Across {avg.n} records</p>
          <p className="text-[15px] leading-relaxed">
            {avg.mean < 0 ? (
              <>
                Your belief in the hot thought dropped by <strong>{Math.abs(avg.mean)} points</strong> on average after a
                second look.
              </>
            ) : (
              <>Your belief in the hot thought held about steady on average. Practice tends to make the questions easier.</>
            )}
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {records.map((r) => (
          <li key={r.id}>
            <details className={`${card} group`}>
              <summary className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-3xl px-5 py-4 ${focusRing}`}>
                <span className="min-w-0">
                  <span className="text-st-muted block text-[13px] font-semibold">{formatDate(r.date)}</span>
                  <span className="block truncate font-semibold">{r.thought}</span>
                </span>
                {r.beliefAfter !== null && (
                  <span className="text-st-muted shrink-0 text-sm tabular-nums">
                    {r.beliefBefore} → <strong className="text-st-ink">{r.beliefAfter}</strong>
                  </span>
                )}
              </summary>
              <div className="border-st-line border-t px-5 pt-4 pb-5">
                <div className="mb-5 space-y-3 text-[15px] leading-relaxed">
                  <p>
                    <span className={`${label} block`}>Situation</span>
                    {r.situation}
                  </p>
                  {r.evidenceFor && (
                    <p>
                      <span className={`${label} block`}>Evidence for</span>
                      {r.evidenceFor}
                    </p>
                  )}
                  {(r.answers.length > 0 || r.evidenceAgainst) && (
                    <div>
                      <span className={`${label} block`}>A second look</span>
                      {r.answers.map((a) => (
                        <p key={a.question} className="mt-1">
                          <em className="text-st-muted">{a.question}</em> {a.answer}
                        </p>
                      ))}
                      {r.evidenceAgainst && <p className="mt-1">{r.evidenceAgainst}</p>}
                    </div>
                  )}
                </div>
                <RecordSummary record={r} />
                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this record? This can't be undone.")) onDelete(r.id);
                    }}
                    className={quietBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
