"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  deleteDemoEntries,
  deleteEntry,
  getAllEntries,
  putEntries,
} from "@/lib/moody/db";
import { generateDemoEntries } from "@/lib/moody/demo-data";
import { isPhq4Due } from "@/lib/moody/phq4";
import type { Entry } from "@/lib/moody/types";
import { AskMoody } from "./AskMoody";
import { CheckIn } from "./CheckIn";
import { CrisisCard } from "./CrisisCard";
import { HistoryView } from "./HistoryView";
import { addDays } from "@/lib/moody/demo-data";
import { focusRing, localToday } from "./ui";

const ICONS = {
  checkin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  patterns: <path d="M3 17l5-5 4 3 8-8M3 21h18" />,
  ask: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
};

const TABS = [
  { id: "checkin", label: "Check in" },
  { id: "patterns", label: "Patterns" },
  { id: "ask", label: "Ask" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const sampleLink =
  "rounded font-semibold text-moody-ink underline underline-offset-3";

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
      e.key === "ArrowRight"
        ? (i + 1) % TABS.length
        : e.key === "ArrowLeft"
          ? (i - 1 + TABS.length) % TABS.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? TABS.length - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current.get(TABS[next].id)?.focus();
  }

  // Consecutive days with a check-in, counting back from today.
  function streak(list: Entry[]) {
    const dates = new Set(list.map((e) => e.date));
    let n = 0;
    while (dates.has(addDays(today, -n))) n++;
    return n;
  }

  if (entries === null || !today) {
    return (
      <p className="text-moody-muted py-10 text-center text-sm">
        Opening your journal...
      </p>
    );
  }

  const hasDemo = entries.some((e) => e.demo);

  return (
    <div>
      {crisis && <CrisisCard onDismiss={() => setCrisis(false)} />}

      {loadError && (
        <p
          role="status"
          className="bg-moody-butter text-moody-ink mb-4 rounded-2xl px-4 py-3 text-sm"
        >
          This browser is blocking local storage, so entries can&apos;t be saved
          here. Private browsing is a common cause.
        </p>
      )}

      <div
        role="tablist"
        aria-label="Moody"
        onKeyDown={onTabKey}
        className="bg-moody-track mb-4 grid grid-cols-3 gap-1 rounded-full p-1"
      >
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
              className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-2 text-[15px] transition-colors ${focusRing} ${
                selected
                  ? "text-moody-ink bg-white font-bold shadow-[0_1px_2px_rgba(47,59,57,0.08)]"
                  : "text-moody-muted hover:text-moody-ink font-semibold"
              }`}
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[t.id]}
              </svg>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="text-moody-muted mb-5 flex min-h-11 flex-wrap items-center justify-between gap-x-3 rounded-2xl px-1 text-sm">
        {hasDemo ? (
          <>
            <span>You&apos;re viewing sample data.</span>
            <button
              type="button"
              onClick={removeSample}
              className={`${sampleLink} ${focusRing}`}
            >
              Clear sample data
            </button>
          </>
        ) : (
          <span>
            {entries.length === 0
              ? "Just looking around? "
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} saved in this browser. `}
            <button
              type="button"
              onClick={loadSample}
              className={`${sampleLink} ${focusRing}`}
            >
              Try it with 30 days of sample data
            </button>
          </span>
        )}
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
              streak={streak(entries)}
              onViewPatterns={() => setTab("patterns")}
            />
          )}
          {t.id === "patterns" && (
            <HistoryView entries={entries} today={today} onDelete={remove} />
          )}
          {t.id === "ask" && (
            <AskMoody entries={entries} today={today} onCrisis={showCrisis} />
          )}
        </div>
      ))}
    </div>
  );
}
