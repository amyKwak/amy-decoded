"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteRecord, getAllRecords } from "@/lib/second-thought/db";
import type { ThoughtRecord } from "@/lib/second-thought/types";
import { CrisisCard } from "./CrisisCard";
import { PastRecords } from "./PastRecords";
import { RecordFlow } from "./RecordFlow";
import { focusRing } from "./ui";

const TABS = [
  { id: "new", label: "New record" },
  { id: "past", label: "Past records" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function SecondThoughtApp() {
  const [records, setRecords] = useState<ThoughtRecord[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TabId>("new");
  const [crisis, setCrisis] = useState(false);

  const refresh = useCallback(
    () =>
      getAllRecords()
        .then(setRecords)
        .catch(() => {
          setLoadError(true);
          setRecords([]);
        }),
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showCrisis = useCallback(() => setCrisis(true), []);

  async function remove(id: string) {
    await deleteRecord(id);
    await refresh();
  }

  if (records === null) {
    return <p className="text-st-muted py-10 text-center text-sm">Opening your records...</p>;
  }

  return (
    <div>
      {crisis && <CrisisCard onDismiss={() => setCrisis(false)} />}

      {loadError && (
        <p role="status" className="bg-st-butter mb-4 rounded-2xl px-4 py-3 text-sm">
          This browser is blocking local storage, so records can&apos;t be saved here. Private browsing is a common cause.
        </p>
      )}

      <div role="tablist" aria-label="Second Thought" className="bg-st-track mb-5 grid grid-cols-2 gap-1 rounded-full p-1">
        {TABS.map((t, i) => {
          const selected = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`st-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`st-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const next = TABS[(i + 1) % TABS.length];
                setTab(next.id);
                document.getElementById(`st-tab-${next.id}`)?.focus();
              }}
              className={`min-h-11 rounded-full px-2 text-[15px] transition-colors ${focusRing} ${
                selected ? "text-st-ink bg-white font-bold shadow-[0_1px_2px_rgba(36,33,58,0.08)]" : "text-st-muted hover:text-st-ink font-semibold"
              }`}
            >
              {t.label}
              {t.id === "past" && records.length > 0 && <span className="text-st-muted ml-1.5 font-semibold">{records.length}</span>}
            </button>
          );
        })}
      </div>

      {TABS.map((t) => (
        <div key={t.id} role="tabpanel" id={`st-panel-${t.id}`} aria-labelledby={`st-tab-${t.id}`} hidden={t.id !== tab}>
          {/* Panels stay mounted so a half-finished record survives tab switches. */}
          {t.id === "new" && <RecordFlow onSaved={refresh} onCrisis={showCrisis} />}
          {t.id === "past" && <PastRecords records={records} onDelete={remove} onStart={() => setTab("new")} />}
        </div>
      ))}
    </div>
  );
}
