"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { deleteDemoEntries, deleteEntry, getAllEntries, putEntries } from "@/lib/moody/db";
import { generateDemoEntries } from "@/lib/moody/demo-data";
import { isPhq4Due } from "@/lib/moody/phq4";
import type { Entry } from "@/lib/moody/types";
import { AskMoody } from "./AskMoody";
import { CheckIn } from "./CheckIn";
import { CrisisCard } from "./CrisisCard";
import { HistoryView } from "./HistoryView";
import { focusRing, localToday, secondaryBtn } from "./ui";

const TABS = [
  { id: "checkin", label: "Check in" },
  { id: "history", label: "History" },
  { id: "ask", label: "Ask Moody" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const PHQ4_DISMISSED_KEY = "moody:phq4-dismissed";

function readDismissed(): string | null {
  try {
    return localStorage.getItem(PHQ4_DISMISSED_KEY);
  } catch {
    return null;
  }
}

export function MoodyApp() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TabId>("checkin");
  const [crisis, setCrisis] = useState(false);
  const [phq4Dismissed, setPhq4Dismissed] = useState<string | null>(null);
  const [today, setToday] = useState("");
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  const refresh = useCallback(() => {
    return getAllEntries()
      .then(setEntries)
      .catch(() => {
        setLoadError(true);
        setEntries([]);
      });
  }, []);

  // Everything date- and storage-dependent is read after mount, so server
  // and client render the same loading state.
  useEffect(() => {
    refresh().then(() => {
      setToday(localToday());
      setPhq4Dismissed(readDismissed());
    });
  }, [refresh]);

  const showCrisis = useCallback(() => setCrisis(true), []);

  async function loadSample() {
    await putEntries(generateDemoEntries(localToday()));
    await refresh();
  }

  async function removeSample() {
    await deleteDemoEntries();
    await refresh();
  }

  async function remove(id: string) {
    await deleteEntry(id);
    await refresh();
  }

  function dismissPhq4() {
    const d = localToday();
    setPhq4Dismissed(d);
    try {
      localStorage.setItem(PHQ4_DISMISSED_KEY, d);
    } catch {}
  }

  function onTabKey(e: KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    const next =
      e.key === "ArrowRight" ? (i + 1) % TABS.length
      : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? TABS.length - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current.get(TABS[next].id)?.focus();
  }

  if (entries === null || !today) {
    return <p className="py-10 text-center text-sm text-moody-muted">Opening your journal...</p>;
  }

  const hasDemo = entries.some((e) => e.demo);

  return (
    <div>
      {crisis && <CrisisCard onDismiss={() => setCrisis(false)} />}

      {loadError && (
        <p role="status" className="mb-4 rounded-2xl bg-moody-cream px-4 py-3 text-sm text-moody-ink">
          This browser is blocking local storage, so entries can&apos;t be saved here. Private browsing is a common cause.
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {hasDemo ? (
          <button type="button" onClick={removeSample} className={secondaryBtn}>
            Remove sample data
          </button>
        ) : (
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            Load 30 days of sample data
          </button>
        )}
        <span className="text-xs text-moody-muted">
          {entries.length} {entries.length === 1 ? "entry" : "entries"} in this browser
        </span>
      </div>

      <div role="tablist" aria-label="Moody" onKeyDown={onTabKey} className="mb-6 grid grid-cols-3 gap-1 rounded-full border-2 border-moody-ink bg-white p-1">
        {TABS.map((t) => {
          const selected = t.id === tab;
          return (
            <button
              key={t.id}
              ref={(el) => {
                if (el) tabRefs.current.set(t.id, el);
              }}
              type="button"
              role="tab"
              id={`moody-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`moody-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-2 py-2 text-[15px] font-bold transition-colors ${focusRing} ${
                selected ? "bg-moody-lavender text-moody-ink" : "text-moody-muted hover:bg-moody-pink-pale hover:text-moody-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`moody-panel-${t.id}`}
          aria-labelledby={`moody-tab-${t.id}`}
          hidden={t.id !== tab}
        >
          {/* Panels stay mounted so a half-finished check-in survives tab switches. */}
          {t.id === "checkin" && (
            <CheckIn
              phq4Due={isPhq4Due(entries, today, phq4Dismissed)}
              onDismissPhq4={dismissPhq4}
              onSaved={refresh}
              onCrisis={showCrisis}
            />
          )}
          {t.id === "history" && <HistoryView entries={entries} today={today} onDelete={remove} />}
          {t.id === "ask" && <AskMoody entries={entries} today={today} onCrisis={showCrisis} />}
        </div>
      ))}
    </div>
  );
}
