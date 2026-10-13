"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  applyTurn,
  bonusFor,
  CLASS_BONUS,
  CLASSES,
  describeRoll,
  MAX_HEROES,
  MAX_HP,
  NAME_MAX,
  nextHero,
  parseScript,
  QUEST_MAX,
  rollCheck,
  type Choice,
  type ClassId,
  type GmTurn,
  type Hero,
  type LogEntry,
  type Roll,
  type Stat,
} from "@/lib/nat20/game";

// ---- Shared styles ----

const display = "font-(family-name:--font-cinzel)";
const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-nat-gold";
const press =
  "transition-[translate,box-shadow] duration-75 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";
const goldBtn = `inline-flex h-15 w-full shrink-0 items-center justify-center rounded-[16px] bg-nat-gold px-6 text-lg font-extrabold text-nat-bg shadow-[0_5px_0_#a8761c] ${press} ${focusRing}`;
const ghostBtn = `inline-flex h-13 w-full shrink-0 items-center justify-center rounded-[16px] border-2 border-nat-line bg-nat-panel px-5 text-base font-bold ${press} ${focusRing}`;
const iconBtn = `flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-nat-line bg-nat-panel ${press} ${focusRing}`;
const input =
  "h-13 w-full rounded-[14px] border-2 border-nat-line bg-nat-panel px-4 text-lg font-semibold outline-none placeholder:text-nat-muted/70 focus:border-nat-gold";
const label =
  "block text-[13px] font-extrabold uppercase tracking-[0.12em] text-nat-muted";
const screen =
  "relative mx-auto flex w-full max-w-130 flex-1 flex-col px-5 pt-5 pb-5 tablet:pt-10";

const PARTY_KEY = "nat20:party";
const QUEST_KEY = "nat20:quest";

const CLASS_STYLE: Record<ClassId, { bg: string; text: string; ring: string }> =
  {
    warrior: {
      bg: "bg-nat-ember",
      text: "text-nat-ember",
      ring: "ring-nat-ember",
    },
    rogue: {
      bg: "bg-nat-emerald",
      text: "text-nat-emerald",
      ring: "ring-nat-emerald",
    },
    mage: { bg: "bg-nat-mage", text: "text-nat-mage", ring: "ring-nat-mage" },
    bard: { bg: "bg-nat-bard", text: "text-nat-bard", ring: "ring-nat-bard" },
  };

const QUEST_IDEAS = [
  "Steal the moon",
  "Rescue a dragon from a knight",
  "The haunted candy shop",
  "Win the wizard bake-off",
  "Find the king's lost sock",
];

/** What the story log shows: the words, plus the extras around them. */
type Entry =
  | { kind: "gm"; text: string; live: boolean; turn: GmTurn | null }
  | {
      kind: "player";
      hero: Hero;
      action: string;
      roll: (Roll & { stat: Stat }) | null;
    };

type Status = "gm" | "choose" | "rolling" | "over" | "error";

const noopSubscribe = () => () => {};

export function NatApp() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return null;
  return <Game />;
}

function Game() {
  const [step, setStep] = useState<"party" | "quest" | "play">("party");
  const [party, setParty] = useState<Hero[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PARTY_KEY) ?? "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [
      { name: "", cls: "warrior", hp: MAX_HP, items: [] },
      { name: "", cls: "mage", hp: MAX_HP, items: [] },
    ];
  });
  const [quest, setQuest] = useState(() => {
    try {
      return localStorage.getItem(QUEST_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const named = party.map((h, i) => ({
    ...h,
    name: h.name.trim() || `Hero ${i + 1}`,
  }));

  if (step === "party") {
    return (
      <PartySetup
        party={party}
        onChange={setParty}
        onNext={() => {
          try {
            localStorage.setItem(PARTY_KEY, JSON.stringify(party));
          } catch {}
          setStep("quest");
        }}
      />
    );
  }
  if (step === "quest") {
    return (
      <QuestSetup
        quest={quest}
        party={named}
        onQuest={setQuest}
        onBack={() => setStep("party")}
        onBegin={() => {
          try {
            localStorage.setItem(QUEST_KEY, quest.trim());
          } catch {}
          setStep("play");
        }}
      />
    );
  }
  return (
    <Adventure
      quest={quest.trim()}
      startingParty={named.map((h) => ({ ...h, hp: MAX_HP, items: [] }))}
      onNewQuest={() => setStep("quest")}
      onChangeParty={() => setStep("party")}
    />
  );
}

// ---- Setup ----

function Header({ compact }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <D20 className={compact ? "h-10 w-10" : "h-14 w-14"} />
      <h1
        className={`${display} text-nat-gold mt-1 leading-none font-black tracking-[0.02em] ${compact ? "text-[32px]" : "text-[40px]"}`}
      >
        Nat 20
      </h1>
      <p className="text-nat-muted mt-1.5 text-[15px] leading-snug">
        An AI game master runs your adventure.
      </p>
    </div>
  );
}

function PartySetup({
  party,
  onChange,
  onNext,
}: {
  party: Hero[];
  onChange: (party: Hero[]) => void;
  onNext: () => void;
}) {
  const update = (i: number, patch: Partial<Hero>) =>
    onChange(party.map((h, j) => (j === i ? { ...h, ...patch } : h)));

  return (
    <main className={`${screen} pb-4!`}>
      <div className="tablet:top-10 absolute top-5 right-5">
        <HelpButton />
      </div>
      <Header compact />

      <h2 className={`${label} mt-4 mb-2`}>Who&apos;s playing?</h2>
      <ol className="flex flex-col gap-3">
        {party.map((hero, i) => (
          <li
            key={i}
            className="group border-nat-line bg-nat-panel/60 focus-within:border-nat-gold/60 rounded-[18px] border-2 p-2.5"
          >
            <div className="flex items-center gap-2">
              <label htmlFor={`nat-hero-${i}`} className="sr-only">
                Hero {i + 1} name
              </label>
              <input
                id={`nat-hero-${i}`}
                className={`${input} h-11 text-base`}
                value={hero.name}
                maxLength={NAME_MAX}
                autoComplete="off"
                placeholder={`Hero ${i + 1} name`}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              {party.length > 1 && (
                <button
                  type="button"
                  className={iconBtn}
                  aria-label={`Remove ${hero.name || `hero ${i + 1}`}`}
                  onClick={() => onChange(party.filter((_, j) => j !== i))}
                >
                  <Icon d="M6 6l12 12M18 6L6 18" size={16} />
                </button>
              )}
            </div>
            <fieldset className="mt-2">
              <legend className="sr-only">
                {hero.name || `Hero ${i + 1}`}&apos;s class
              </legend>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(CLASSES) as ClassId[]).map((cls) => {
                  const picked = hero.cls === cls;
                  return (
                    <label
                      key={cls}
                      className={`has-focus-visible:outline-nat-gold flex h-12 cursor-pointer flex-col items-center justify-center rounded-xl border-2 text-center transition has-focus-visible:outline-3 ${
                        picked
                          ? `${CLASS_STYLE[cls].bg} text-nat-bg border-transparent`
                          : "border-nat-line text-nat-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`nat-class-${i}`}
                        className="sr-only"
                        checked={picked}
                        onChange={() => update(i, { cls })}
                      />
                      <ClassIcon cls={cls} className="h-4 w-4" />
                      <span className="mt-0.5 text-[12px] font-extrabold">
                        {CLASSES[cls].name}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-nat-muted mt-1.5 hidden pl-1 text-[13px] group-focus-within:block">
                {CLASSES[hero.cls].blurb} +{CLASS_BONUS} to{" "}
                {CLASSES[hero.cls].stat} rolls.
              </p>
            </fieldset>
          </li>
        ))}
      </ol>

      {party.length < MAX_HEROES && (
        <button
          type="button"
          className={`${ghostBtn} mt-2.5 h-11 border-dashed!`}
          onClick={() =>
            onChange([
              ...party,
              {
                name: "",
                cls: (["rogue", "bard", "warrior", "mage"] as ClassId[])[
                  party.length % 4
                ],
                hp: MAX_HP,
                items: [],
              },
            ])
          }
        >
          + Add a hero
        </button>
      )}

      <div className="mt-auto pt-2">
        <button type="button" className={goldBtn} onClick={onNext}>
          Choose a quest
        </button>
      </div>
    </main>
  );
}

function QuestSetup({
  quest,
  party,
  onQuest,
  onBack,
  onBegin,
}: {
  quest: string;
  party: Hero[];
  onQuest: (q: string) => void;
  onBack: () => void;
  onBegin: () => void;
}) {
  return (
    <main className={screen}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className={iconBtn}
          aria-label="Back to the party"
          onClick={onBack}
        >
          <Icon d="M15 5l-7 7 7 7" size={18} />
        </button>
        <HelpButton />
      </div>

      <div className="flex flex-1 flex-col justify-center py-6">
        <Header />
        <ul
          className="mt-5 flex flex-wrap justify-center gap-2"
          aria-label="Your party"
        >
          {party.map((h) => (
            <li
              key={h.name}
              className="bg-nat-panel border-nat-line flex items-center gap-1.5 rounded-full border-2 py-1 pr-3 pl-1"
            >
              <HeroBadge cls={h.cls} />
              <span className="text-sm font-bold">{h.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (quest.trim()) onBegin();
        }}
      >
        <label htmlFor="nat-quest" className={`${label} mb-2`}>
          What&apos;s the quest?
        </label>
        <input
          id="nat-quest"
          className={input}
          value={quest}
          maxLength={QUEST_MAX}
          autoComplete="off"
          enterKeyHint="go"
          placeholder="Any adventure you like"
          aria-describedby="nat-quest-hint"
          onChange={(e) => onQuest(e.target.value)}
        />
        <p
          id="nat-quest-hint"
          className="text-nat-muted mt-1.5 flex items-center gap-1.5 pl-1 text-[13px] leading-snug"
        >
          <Sparkle className="h-3.5 w-3.5 shrink-0 fill-current" />
          Claude is your game master.
        </p>
        <div className="-mx-5 mt-2.5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 py-0.5">
          {QUEST_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              className={`border-nat-line bg-nat-panel h-9 shrink-0 rounded-full border-2 px-3.5 text-sm font-bold whitespace-nowrap transition active:scale-95 ${focusRing}`}
              onClick={() => onQuest(idea)}
            >
              {idea}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className={`${goldBtn} mt-5`}
          disabled={!quest.trim()}
        >
          {quest.trim() ? "Begin the adventure" : "Pick a quest to begin"}
        </button>
      </form>
    </main>
  );
}

// ---- The adventure ----

function Adventure({
  quest,
  startingParty,
  onNewQuest,
  onChangeParty,
}: {
  quest: string;
  startingParty: Hero[];
  onNewQuest: () => void;
  onChangeParty: () => void;
}) {
  const [heroes, setHeroes] = useState(startingParty);
  // Starts with the game master's first card already "plotting", so the
  // opening request only has to fill it in.
  const [entries, setEntries] = useState<Entry[]>(() => [
    { kind: "gm", text: "", live: true, turn: null },
  ]);
  const [status, setStatus] = useState<Status>("gm");
  const [choices, setChoices] = useState<Choice[]>([]);
  const [turn, setTurn] = useState(0);
  const [ending, setEnding] = useState<"victory" | "defeat" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    hero: Hero;
    choice: Choice;
    roll: Roll;
  } | null>(null);
  // Which script line is being read aloud in the newest game master turn.
  const [cursor, setCursor] = useState(0);
  const abort = useRef<AbortController | null>(null);

  const active = nextHero(heroes, turn);
  const names = heroes.map((h) => h.name);
  const latest = entries.at(-1);
  const latestGm = latest?.kind === "gm" ? latest : null;
  const lines = latestGm
    ? parseScript(latestGm.text, names, !latestGm.live)
    : [];
  // The choices (or the ending) wait until the whole script has been read.
  const doneReading = !latestGm || (!latestGm.live && cursor >= lines.length);
  const nextLine = lines[cursor + 1];
  const reading = doneReading
    ? null
    : cursor >= lines.length
      ? { waiting: true, label: "", onNext: () => {} }
      : {
          waiting: false,
          label: nextLine
            ? `Next line · ${nextLine.reader} reads`
            : latestGm?.live
              ? "Next line"
              : "Done reading",
          onNext: () => setCursor((c) => c + 1),
        };

  // The choice panel is taller than the "telling the story" bar, so when it
  // appears, scroll again to keep the end of the story above it.
  useEffect(() => {
    if (doneReading && (status === "choose" || status === "over"))
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
  }, [status, doneReading]);

  /** Asks the game master for the next bit of story and streams it in. */
  const callGm = async (
    party: Hero[],
    story: Entry[],
    nextName: string,
    turnNo: number,
  ) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;

    let log: Entry[] = [
      ...story,
      { kind: "gm", text: "", live: true, turn: null },
    ];
    setStatus("gm");
    setError(null);
    setEntries(log);
    setCursor(0);
    const setLast = (patch: Partial<Extract<Entry, { kind: "gm" }>>) => {
      log = [
        ...log.slice(0, -1),
        { ...(log.at(-1) as Extract<Entry, { kind: "gm" }>), ...patch },
      ];
      setEntries(log);
    };

    try {
      const res = await fetch("/api/nat20/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest,
          heroes: party,
          log: toLog(story),
          next: nextName,
          turn: turnNo,
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "The game master lost their notes.");
      }

      // Each line is one event: a piece of story, or the turn's game data.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let gmTurn: GmTurn | null = null;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newline;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline);
          buffer = buffer.slice(newline + 1);
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "text") {
            text += event.text;
            setLast({ text });
          } else if (event.type === "turn") {
            gmTurn = event.turn;
          }
        }
      }
      if (!text.trim() || !gmTurn) {
        throw new Error("The game master lost their place. Try again.");
      }

      const updated = applyTurn(party, gmTurn);
      setLast({ text: text.trim(), live: false, turn: gmTurn });
      setHeroes(updated);
      const everyoneDown = updated.every((h) => h.hp === 0);
      if (gmTurn.ending !== "none" || everyoneDown) {
        setEnding(gmTurn.ending === "victory" ? "victory" : "defeat");
        setStatus("over");
        return;
      }
      setChoices(
        gmTurn.choices.length
          ? gmTurn.choices
          : [{ label: "Press onward", stat: "none", dc: 0 }],
      );
      setStatus("choose");
    } catch (err) {
      if (controller.signal.aborted) return;
      setEntries(story);
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Couldn't reach the game master. Check your connection.",
      );
      setStatus("error");
    }
  };

  // The game master opens the story. It starts on the next tick, so React's
  // double run in development cancels the first one before it begins.
  useEffect(() => {
    const id = setTimeout(
      () => void callGm(startingParty, [], startingParty[0].name, 0),
      0,
    );
    return () => {
      clearTimeout(id);
      abort.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** A hero acts. The next game master turn picks up from here. */
  const commit = (
    hero: Hero,
    action: string,
    roll: (Roll & { stat: Stat }) | null,
  ) => {
    const story: Entry[] = [...entries, { kind: "player", hero, action, roll }];
    const nextTurn = turn + 1;
    setTurn(nextTurn);
    const next = nextHero(heroes, nextTurn) ?? hero;
    void callGm(heroes, story, next.name, nextTurn);
  };

  const pick = (choice: Choice) => {
    if (!active || status !== "choose") return;
    if (choice.stat === "none") {
      commit(active, choice.label, null);
      return;
    }
    const roll = rollCheck(bonusFor(active.cls, choice.stat), choice.dc);
    setPending({ hero: active, choice, roll });
    setStatus("rolling");
  };

  const retry = () => {
    const nextName = active?.name ?? heroes[0].name;
    void callGm(heroes, entries, nextName, turn);
  };

  return (
    <main className={`${screen} px-0! pt-0! pb-0!`}>
      <PartyBar
        heroes={heroes}
        active={status === "over" ? null : active}
        onLeave={onNewQuest}
      />

      <Story entries={entries} heroes={heroes} cursor={cursor} />

      {status === "error" && error && (
        <div className="px-5 pb-4">
          <p
            role="alert"
            className="bg-nat-ember/15 border-nat-ember/40 rounded-2xl border-2 px-4 py-3 text-[15px] font-semibold"
          >
            {error}
          </p>
          <button
            type="button"
            className={`${goldBtn} mt-3 h-13`}
            onClick={retry}
          >
            Try again
          </button>
        </div>
      )}

      {status === "over" && ending && doneReading && (
        <Ending
          ending={ending}
          heroes={heroes}
          onNewQuest={onNewQuest}
          onChangeParty={onChangeParty}
        />
      )}

      {(reading ||
        status === "gm" ||
        status === "choose" ||
        status === "rolling") && (
        <ActionPanel
          hero={active}
          heroes={heroes}
          reading={reading}
          choices={choices}
          waiting={status !== "choose"}
          onPick={pick}
          onCustom={(text) =>
            active && status === "choose" && commit(active, text, null)
          }
        />
      )}

      {pending && (
        <DiceRoll
          hero={pending.hero}
          choice={pending.choice}
          roll={pending.roll}
          onDone={() => {
            const { hero, choice, roll } = pending;
            setPending(null);
            commit(hero, choice.label, { ...roll, stat: choice.stat as Stat });
          }}
        />
      )}
    </main>
  );
}

/** The story so far, in the shape the game master's memory expects. */
function toLog(entries: Entry[]): LogEntry[] {
  return entries.map((e) =>
    e.kind === "gm"
      ? { role: "gm", text: e.text }
      : {
          role: "player",
          text: `${e.hero.name} (${CLASSES[e.hero.cls].name}): ${e.action}${e.roll ? `\n${describeRoll(e.roll, e.roll.stat)}` : ""}`,
        },
  );
}

function PartyBar({
  heroes,
  active,
  onLeave,
}: {
  heroes: Hero[];
  active: Hero | null;
  onLeave: () => void;
}) {
  return (
    <div className="bg-nat-bg/95 border-nat-line sticky top-0 z-20 flex items-center gap-2 border-b-2 px-3 py-2.5 backdrop-blur">
      <button
        type="button"
        className={`${iconBtn} h-10! w-10!`}
        aria-label="End the adventure"
        onClick={onLeave}
      >
        <Icon d="M6 6l12 12M18 6L6 18" size={16} />
      </button>
      <ul
        className="flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto"
        aria-label="Party"
      >
        {heroes.map((h) => {
          const up = active?.name === h.name;
          return (
            <li
              key={h.name}
              className={`flex shrink-0 items-center gap-2 rounded-xl border-2 py-1 pr-2.5 pl-1 transition ${
                h.hp === 0
                  ? "border-nat-line opacity-45"
                  : up
                    ? "border-nat-gold bg-nat-panel"
                    : "border-nat-line"
              }`}
            >
              <HeroBadge cls={h.cls} />
              <span className="leading-tight">
                <span className="block max-w-20 truncate text-[13px] font-extrabold">
                  {h.name}
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="bg-nat-line h-1.5 w-12 overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    <span
                      className={`block h-full rounded-full transition-[width] duration-500 ${h.hp <= 3 ? "bg-nat-ember" : "bg-nat-emerald"}`}
                      style={{ width: `${(h.hp / MAX_HP) * 100}%` }}
                    />
                  </span>
                  <span className="text-nat-muted text-[11px] font-bold tabular-nums">
                    {h.hp === 0 ? "KO" : `${h.hp} HP`}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Story({
  entries,
  heroes,
  cursor,
}: {
  entries: Entry[];
  heroes: Hero[];
  /** The line being read in the newest game master turn. */
  cursor: number;
}) {
  const following = useRef(true);
  const last = entries.at(-1);
  const liveText = last?.kind === "gm" ? last.text : null;

  // Follow the newest words, unless the reader scrolled up to reread.
  useEffect(() => {
    const onScroll = () => {
      following.current =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 160;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (following.current)
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
  }, [entries.length, liveText, cursor]);

  return (
    <div
      className="flex flex-1 flex-col gap-3 px-5 pt-4 pb-4"
      aria-live="polite"
    >
      {entries.map((e, i) =>
        e.kind === "gm" ? (
          <GmCard
            key={i}
            entry={e}
            heroes={heroes}
            cursor={i === entries.length - 1 ? cursor : null}
          />
        ) : (
          <PlayerCard key={i} entry={e} />
        ),
      )}
    </div>
  );
}

function GmCard({
  entry,
  heroes,
  cursor,
}: {
  entry: Extract<Entry, { kind: "gm" }>;
  heroes: Hero[];
  /** The line being read aloud, or null for earlier turns (shown in full). */
  cursor: number | null;
}) {
  const lines = parseScript(
    entry.text,
    heroes.map((h) => h.name),
    !entry.live,
  );
  // Only the lines read so far, so nobody reads ahead.
  const shown = cursor === null ? lines : lines.slice(0, cursor + 1);
  const finished = cursor === null || (!entry.live && cursor >= lines.length);
  const clsOf = (name: string) =>
    heroes.find((h) => h.name === name)?.cls ?? "warrior";
  const dots = (
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((d) => (
        <span
          key={d}
          className="bg-nat-gold h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: `${d * 0.15}s` }}
        />
      ))}
    </span>
  );

  return (
    <article className="bg-nat-panel border-nat-line animate-[noggin-pop_0.3s_ease-out] rounded-[18px] border-2 px-4 pt-3 pb-3.5">
      <header className="text-nat-gold flex items-center gap-1.5">
        <D20 className="h-4.5 w-4.5" />
        <h3 className="text-xs font-extrabold tracking-[0.12em] uppercase">
          Scene
        </h3>
      </header>

      {lines.length === 0 && entry.live ? (
        <p className="text-nat-muted mt-2 flex items-center gap-2 text-[15px] italic">
          {dots}
          The game master is writing the script…
        </p>
      ) : (
        <ol className="mt-2 flex flex-col gap-2">
          {shown.map((line, i) => {
            const current = cursor !== null && i === cursor;
            const style = CLASS_STYLE[clsOf(line.reader)];
            if (current) {
              // The teleprompter: one big line for one reader.
              return (
                <li
                  key={i}
                  aria-current="true"
                  className="border-nat-gold animate-[noggin-pop_0.25s_ease-out] rounded-2xl border-2 bg-[#2c2340] px-4 pt-3 pb-4"
                >
                  <p className="flex items-center gap-2">
                    <HeroBadge cls={clsOf(line.reader)} small />
                    <span
                      className={`text-[13px] font-extrabold tracking-[0.1em] uppercase ${style.text}`}
                    >
                      {line.reader}, read this aloud
                    </span>
                  </p>
                  <p className="text-nat-muted mt-1.5 text-sm">
                    as{" "}
                    <span className="text-nat-text font-bold">
                      {line.speaker}
                    </span>
                    {line.direction && (
                      <span className="italic"> · {line.direction}</span>
                    )}
                  </p>
                  <p className="mt-1 text-[21px] leading-snug font-semibold">
                    {line.text}
                  </p>
                </li>
              );
            }
            return (
              <li key={i} className="text-nat-text/75 text-[15px] leading-snug">
                <span className={`font-bold ${style.text}`}>
                  {line.speaker}
                </span>
                {line.speaker !== line.reader && (
                  <span className="text-nat-muted"> ({line.reader})</span>
                )}
                : {line.text}
              </li>
            );
          })}
          {cursor !== null && cursor >= lines.length && entry.live && (
            <li className="text-nat-muted flex items-center gap-2 text-[15px] italic">
              {dots}
              Writing the next line…
            </li>
          )}
        </ol>
      )}
      {finished &&
        entry.turn &&
        (entry.turn.hpChanges.length > 0 ||
          entry.turn.itemsGained.length > 0) && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {entry.turn.hpChanges
              .filter((c) => c.amount !== 0)
              .map((c, i) => (
                <li
                  key={`hp-${i}`}
                  className={`rounded-full px-2.5 py-0.5 text-[13px] font-extrabold ${
                    c.amount < 0
                      ? "bg-nat-ember/20 text-nat-ember"
                      : "bg-nat-emerald/20 text-nat-emerald"
                  }`}
                >
                  {c.hero} {c.amount > 0 ? "+" : "−"}
                  {Math.abs(c.amount)} HP
                </li>
              ))}
            {entry.turn.itemsGained.map((g, i) => (
              <li
                key={`item-${i}`}
                className="bg-nat-gold/15 text-nat-gold rounded-full px-2.5 py-0.5 text-[13px] font-extrabold"
              >
                {g.hero} found: {g.item}
              </li>
            ))}
          </ul>
        )}
    </article>
  );
}

function PlayerCard({ entry }: { entry: Extract<Entry, { kind: "player" }> }) {
  const style = CLASS_STYLE[entry.hero.cls];
  const roll = entry.roll;
  return (
    <article
      className={`border-nat-line max-w-[88%] animate-[noggin-pop_0.25s_ease-out] self-end rounded-[18px] border-2 bg-[#2c2340] px-3.5 py-2.5`}
    >
      <p className="flex items-center gap-1.5">
        <HeroBadge cls={entry.hero.cls} small />
        <span className={`text-sm font-extrabold ${style.text}`}>
          {entry.hero.name}
        </span>
      </p>
      <p className="mt-1 text-[16px] leading-snug font-semibold">
        {entry.action}
      </p>
      {roll && (
        <p
          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-extrabold ${
            roll.success
              ? "bg-nat-emerald/20 text-nat-emerald"
              : "bg-nat-ember/20 text-nat-ember"
          }`}
        >
          <D20 className="h-3.5 w-3.5" />
          {roll.stat} {roll.die}
          {roll.bonus ? ` + ${roll.bonus}` : ""} = {roll.total} vs {roll.dc} ·{" "}
          {roll.die === 20
            ? "Nat 20!"
            : roll.die === 1
              ? "Nat 1!"
              : roll.success
                ? "Success"
                : "Fail"}
        </p>
      )}
    </article>
  );
}

function ActionPanel({
  hero,
  heroes,
  reading,
  choices,
  waiting,
  onPick,
  onCustom,
}: {
  hero: Hero | null;
  heroes: Hero[];
  /** Set while the party is reading the script aloud. */
  reading: { waiting: boolean; label: string; onNext: () => void } | null;
  choices: Choice[];
  waiting: boolean;
  onPick: (choice: Choice) => void;
  onCustom: (text: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const [writing, setWriting] = useState(false);
  if (!hero) return null;

  return (
    <div className="bg-nat-bg/95 border-nat-line sticky bottom-0 z-20 border-t-2 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
      {reading && !reading.waiting ? (
        <button
          type="button"
          className={`${goldBtn} h-14 gap-1.5`}
          onClick={reading.onNext}
        >
          {reading.label}
          <Icon d="M9 5l7 7-7 7" size={18} />
        </button>
      ) : waiting || reading ? (
        <p
          className="text-nat-muted flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
          role="status"
        >
          <D20 className="text-nat-gold h-5 w-5 animate-spin [animation-duration:2.5s]" />
          {heroes.length > 1
            ? "The game master is writing your script…"
            : "The game master is writing…"}
        </p>
      ) : (
        <>
          <p className="flex items-center gap-2">
            <HeroBadge cls={hero.cls} />
            <span className={`${display} text-lg font-black`}>
              {hero.name}&apos;s turn
            </span>
          </p>
          <div className="mt-2.5 flex flex-col gap-2">
            {choices.map((c) => {
              const bonus = bonusFor(hero.cls, c.stat);
              return (
                <button
                  key={c.label}
                  type="button"
                  className={`bg-nat-panel border-nat-line hover:border-nat-gold flex min-h-11 items-center justify-between gap-3 rounded-[14px] border-2 px-3.5 py-1.5 text-left text-[15px] font-bold transition active:scale-[0.99] ${focusRing}`}
                  onClick={() => onPick(c)}
                >
                  <span>{c.label}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${
                      c.stat === "none"
                        ? "bg-nat-line text-nat-muted"
                        : "bg-nat-gold/15 text-nat-gold"
                    }`}
                  >
                    {c.stat === "none"
                      ? "Safe"
                      : `${c.stat} ${c.dc}${bonus ? ` · +${bonus}` : ""}`}
                  </span>
                </button>
              );
            })}
          </div>
          {!writing ? (
            <button
              type="button"
              className={`text-nat-muted hover:text-nat-text mt-1 flex h-10 w-full items-center justify-center gap-1.5 text-[15px] font-bold ${focusRing}`}
              onClick={() => setWriting(true)}
            >
              <Icon
                d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"
                size={16}
              />
              Do something else
            </button>
          ) : (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = custom.trim();
                if (!text) return;
                setCustom("");
                setWriting(false);
                onCustom(text);
              }}
            >
              <label htmlFor="nat-custom" className="sr-only">
                Or do something else
              </label>
              <input
                id="nat-custom"
                className={`${input} h-12 text-base`}
                value={custom}
                maxLength={120}
                autoComplete="off"
                enterKeyHint="send"
                placeholder="What does your hero do?"
                autoFocus
                onKeyDown={(e) => e.key === "Escape" && setWriting(false)}
                onChange={(e) => setCustom(e.target.value)}
              />
              <button
                type="submit"
                className={`${iconBtn} bg-nat-gold! text-nat-bg h-12! w-12! border-0`}
                aria-label="Do it"
                disabled={!custom.trim()}
              >
                <Icon d="M5 12h13M13 6l6 6-6 6" size={20} />
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function DiceRoll({
  hero,
  choice,
  roll,
  onDone,
}: {
  hero: Hero;
  choice: Choice;
  roll: Roll;
  onDone: () => void;
}) {
  const [face, setFace] = useState(1);
  const [landed, setLanded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  // The die tumbles through random faces, then lands on the real roll.
  useEffect(() => {
    const id = setInterval(
      () => setFace(1 + Math.floor(Math.random() * 20)),
      70,
    );
    const stop = setTimeout(() => {
      clearInterval(id);
      setFace(roll.die);
      setLanded(true);
      navigator.vibrate?.(roll.die === 20 ? [60, 40, 60, 40, 120] : 50);
    }, 1100);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [roll.die]);

  useEffect(() => {
    if (landed) button.current?.focus();
  }, [landed]);

  const big =
    roll.die === 20 ? "NAT 20!" : roll.die === 1 ? "Critical fail!" : null;

  return (
    <div
      className="fixed inset-0 z-60 flex animate-[noggin-fade_0.15s_ease-out] flex-col items-center justify-center bg-[#0d0a12]/90 px-6 text-center backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nat-roll-title"
    >
      <p className="text-nat-muted text-sm font-extrabold tracking-[0.12em] uppercase">
        {hero.name} · {choice.stat} check
      </p>
      <h2
        id="nat-roll-title"
        className="mt-1 max-w-80 text-xl leading-snug font-bold"
      >
        {choice.label}
      </h2>

      <div
        className={`relative mt-6 flex h-44 w-44 items-center justify-center ${landed ? "" : "animate-[nat-tumble_1.1s_ease-out]"}`}
      >
        <D20
          className={`absolute inset-0 h-full w-full ${landed ? (roll.success ? "text-nat-emerald" : "text-nat-ember") : "text-nat-gold"}`}
        />
        <span
          className={`${display} relative text-[56px] leading-none font-black tabular-nums`}
          aria-live="assertive"
        >
          {face}
        </span>
      </div>

      <div
        className={`mt-6 min-h-28 transition-opacity ${landed ? "opacity-100" : "opacity-0"}`}
      >
        {big && (
          <p
            className={`${display} text-[34px] leading-none font-black ${roll.die === 20 ? "text-nat-gold animate-[noggin-pop_0.4s_ease-out]" : "text-nat-ember"}`}
          >
            {big}
          </p>
        )}
        <p className="text-nat-muted mt-2 text-base font-semibold">
          {roll.die}
          {roll.bonus
            ? ` + ${roll.bonus} ${CLASSES[hero.cls].name} bonus`
            : ""}{" "}
          = <span className="text-nat-text font-extrabold">{roll.total}</span>{" "}
          vs DC {roll.dc}
        </p>
        <p
          className={`${display} mt-1 text-3xl font-black ${roll.success ? "text-nat-emerald" : "text-nat-ember"}`}
        >
          {roll.success ? "Success!" : "Failure!"}
        </p>
      </div>

      <button
        ref={button}
        type="button"
        className={`${goldBtn} mt-4 max-w-80`}
        disabled={!landed}
        onClick={onDone}
      >
        Continue the story
      </button>
    </div>
  );
}

function Ending({
  ending,
  heroes,
  onNewQuest,
  onChangeParty,
}: {
  ending: "victory" | "defeat";
  heroes: Hero[];
  onNewQuest: () => void;
  onChangeParty: () => void;
}) {
  const loot = heroes.flatMap((h) =>
    h.items.map((item) => ({ hero: h, item })),
  );
  return (
    <section
      aria-labelledby="nat-ending"
      className="border-nat-gold bg-nat-panel mx-5 mb-5 animate-[noggin-pop_0.45s_ease-out] rounded-[22px] border-2 px-5 pt-5 pb-5 text-center"
    >
      <D20 className="text-nat-gold mx-auto h-12 w-12" />
      <h2
        id="nat-ending"
        className={`${display} text-nat-gold mt-2 text-[30px] leading-none font-black`}
      >
        {ending === "victory" ? "Quest complete!" : "The party has fallen"}
      </h2>
      <p className="text-nat-muted mt-2 text-[15px]">
        {ending === "victory"
          ? "Songs will be sung about this one."
          : "A legendary failure. Roll up and try again!"}
      </p>
      {loot.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
          {loot.map(({ hero, item }, i) => (
            <li
              key={i}
              className="bg-nat-gold/15 text-nat-gold rounded-full px-2.5 py-0.5 text-[13px] font-extrabold"
            >
              {hero.name}: {item}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-col gap-2.5">
        <button type="button" className={goldBtn} onClick={onNewQuest}>
          New quest, same party
        </button>
        <button type="button" className={ghostBtn} onClick={onChangeParty}>
          Change the party
        </button>
      </div>
    </section>
  );
}

// ---- How to play ----

const STEPS: { title: string; body: string }[] = [
  {
    title: "Build your party",
    body: "Up to 4 heroes on one phone. Each picks a class: Warriors are strong, Rogues are quick, Mages are clever, Bards are charming.",
  },
  {
    title: "Pick a quest",
    body: "Anything you like, from “steal the moon” to “find the king's lost sock”. Claude writes the story.",
  },
  {
    title: "Read the script aloud",
    body: "Each scene is a script. The phone shows one line at a time and who reads it, with a hint like “whispering”. Ham it up, then tap Next line.",
  },
  {
    title: "Take your turn",
    body: "When the scene ends, pick a choice or type anything you want to do. Risky moves need a d20 roll: beat the number to succeed. Your class adds +3 to its stat.",
  },
];

function HelpButton() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    openerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className={`${iconBtn} text-xl font-extrabold`}
        aria-label="How to play"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        ?
      </button>

      {open && (
        <div className="text-nat-text fixed inset-0 z-60 flex flex-col justify-end">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close how to play"
            className="absolute inset-0 animate-[noggin-fade_0.2s_ease-out] bg-black/60"
            onClick={close}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="nat-how"
            className="bg-nat-bg border-nat-line relative mx-auto w-full max-w-130 animate-[noggin-sheet_0.28s_cubic-bezier(0.2,0.9,0.3,1.1)] rounded-t-[28px] border-2 border-b-0 px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
          >
            <span
              className="bg-nat-line mx-auto mb-3.5 block h-1.25 w-11 rounded"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <h2
                id="nat-how"
                className={`${display} text-nat-gold text-2xl font-black`}
              >
                How to play
              </h2>
              <button
                ref={closeRef}
                type="button"
                className={iconBtn}
                aria-label="Close"
                onClick={close}
              >
                <Icon d="M6 6l12 12M18 6L6 18" size={16} />
              </button>
            </div>
            <ol className="mt-5 space-y-4">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3.5">
                  <span
                    className={`${display} bg-nat-gold text-nat-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-black`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-extrabold">{step.title}</p>
                    <p className="text-nat-muted mt-0.5 text-[15px] leading-snug">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" className={`${goldBtn} mt-6`} onClick={close}>
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}

// ---- Pieces ----

function HeroBadge({ cls, small }: { cls: ClassId; small?: boolean }) {
  return (
    <span
      className={`${CLASS_STYLE[cls].bg} text-nat-bg flex shrink-0 items-center justify-center rounded-full ${small ? "h-5 w-5" : "h-7 w-7"}`}
      aria-hidden="true"
    >
      <ClassIcon cls={cls} className={small ? "h-3 w-3" : "h-4 w-4"} />
    </span>
  );
}

/** Simple class symbols: sword, dagger, star, music note. */
function ClassIcon({ cls, className }: { cls: ClassId; className?: string }) {
  const d = {
    warrior: "M14.5 3.5l6 0 0 6-9 9-3-3 9-9zM7 14l3 3-3.5 3.5-3-3z",
    rogue: "M19 3l2 2-10.5 10.5-2-2zM8.5 13.5l2 2-2.5 4.5-4-4z",
    mage: "M12 2l2.6 6.4L21 9.3l-5 4.4 1.5 6.8L12 17l-5.5 3.5L8 13.7 3 9.3l6.4-.9z",
    bard: "M9 18a3 3 0 11-2-2.8V4l12-2v13a3 3 0 11-2-2.8V5.3L9 6.6z",
  }[cls];
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} fill-current`}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** A twenty-sided die, as a flat gem shape. */
function D20({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    >
      <path d="M24 3l19 11v20L24 45 5 34V14z" />
      <path
        d="M24 3l-10 18h20zM14 21L5 34M34 21l9 13M14 21l10 24 10-24M5 14l9 7M43 14l-9 7"
        opacity="0.55"
      />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M10 2l1.8 6.2L18 10l-6.2 1.8L10 18l-1.8-6.2L2 10l6.2-1.8zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" />
    </svg>
  );
}

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-current"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
