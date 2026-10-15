"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applyTurn,
  bonusFor,
  CLASS_BONUS,
  CLASSES,
  describeRoll,
  loadSavedParty,
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
  type ScriptLine,
  type Stat,
} from "@/lib/nat20/game";
import {
  NatRoom,
  normalizeRoomCode,
  PACES,
  type Act,
  type Entry,
  type Pace,
  type PlayView,
  type RoomSnapshot,
  type Status,
  type Table,
} from "@/lib/nat20/room";
import { Button } from "./Button";
import { Monogram } from "./ClassBadge";
import { ClassPicker } from "./ClassPicker";
import { AddHeroSlot, HeroSlot } from "./HeroSlot";
import { TextField } from "./TextField";
import { CLASS_BLURB, CLASS_VARS, focusRing } from "./ui";

// ---- Shared styles ----

/** A round wooden button for back, close and help. */
const iconBtn = `flex h-(--tap-min) w-(--tap-min) shrink-0 cursor-pointer items-center justify-center rounded-(--radius-pill) border-0 bg-(--oak-700) text-(--cream) shadow-[inset_0_0_0_2px_var(--edge),var(--shadow-press)] transition-[translate,box-shadow] duration-80 ease-out active:translate-y-0.5 active:shadow-none motion-reduce:transition-none ${focusRing}`;
/** The one centred column every screen sits in. */
const column = "mx-auto flex w-full max-w-(--screen-max) flex-1 flex-col";
/** The bottom bar that keeps the main button in thumb reach. */
const bottomBar =
  "sticky bottom-0 z-20 bg-(--oak-900) px-(--space-4) pt-(--space-3) pb-[max(var(--space-4),env(safe-area-inset-bottom))]";
/** Parchment: anything players read aloud or pick from. */
const parchment =
  "rounded-(--radius-md) bg-(--parchment-100) text-(--ink) shadow-(--shadow-card)";

const PARTY_KEY = "nat20:party";
const PACE_KEY = "nat20:pace";
const QUEST_KEY = "nat20:quest";
/** The longest action a player can type. */
const CUSTOM_MAX = 120;

const QUEST_IDEAS = [
  { title: "Steal the moon", hint: "It's right there. How hard can it be?" },
  {
    title: "Rescue a dragon from a knight",
    hint: "The knight is very polite and very stubborn.",
  },
  {
    title: "The haunted candy shop",
    hint: "The fudge whispers. The lollipops watch.",
  },
  {
    title: "Win the wizard bake-off",
    hint: "Your cake must survive three judges and one curse.",
  },
  {
    title: "Find the king's lost sock",
    hint: "The whole kingdom is on cold-foot alert.",
  },
];

const noopSubscribe = () => () => {};
const noSnapshot = () => null;

/** A room's snapshot, or null when this phone plays alone. */
function useRoom(room: NatRoom | null): RoomSnapshot | null {
  return useSyncExternalStore(
    room?.subscribe ?? noopSubscribe,
    room?.getSnapshot ?? noSnapshot,
    noSnapshot,
  );
}

/** A beat to breathe before each line, and longer when the phone changes hands. */
const LINE_PAUSE_MS = 900;
const HANDOFF_MS = 1600;

/** How long the teleprompter holds a line: when its words light up, and the total. */
function lineTiming(text: string, pace: Pace, handoff: boolean) {
  const words = text.split(/\s+/).filter(Boolean);
  const perWord = 1000 / PACES[pace];
  const start = handoff ? HANDOFF_MS : 0;
  return {
    words,
    start,
    perWord,
    total: start + words.length * perWord + LINE_PAUSE_MS,
  };
}

export function NatApp() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return null;
  return <Game />;
}

/** Forgets ?join=CODE, so a reload doesn't rejoin a finished game. */
function clearJoinLink() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("join")) return;
  url.searchParams.delete("join");
  window.history.replaceState(null, "", url);
}

function Game() {
  const [step, setStep] = useState<"party" | "quest" | "play">("party");
  const [party, setParty] = useState<Hero[]>(() => {
    try {
      return loadSavedParty(
        JSON.parse(localStorage.getItem(PARTY_KEY) ?? "null"),
      );
    } catch {}
    return [];
  });
  const [quest, setQuest] = useState(() => {
    try {
      return localStorage.getItem(QUEST_KEY) ?? "";
    } catch {
      return "";
    }
  });
  // An invite link (?join=CODE) lands straight on the join screen.
  const [joinCode] = useState(() =>
    normalizeRoomCode(
      new URLSearchParams(window.location.search).get("join") ?? "",
    ),
  );
  const [joining, setJoining] = useState(joinCode.length === 4);
  /** Another phone's game that this phone joined. */
  const [guestRoom, setGuestRoom] = useState<NatRoom | null>(null);
  /** This phone's table, once the host invites other phones. */
  const [room, setRoom] = useState<NatRoom | null>(null);

  useEffect(() => () => room?.destroy(), [room]);
  useEffect(() => () => guestRoom?.destroy(), [guestRoom]);
  // Friends can make their own heroes from their phones.
  useEffect(() => room?.listenForHeroes(setParty), [room]);

  // Other phones see the party as it changes, and the setup screens while
  // the host is on them.
  useEffect(() => {
    room?.update({
      heroes: party.map((h, i) => ({
        ...h,
        name: h.name.trim() || `Hero ${i + 1}`,
      })),
    });
  }, [room, party]);
  useEffect(() => {
    if (step !== "play") room?.update({ play: null });
  }, [room, step]);

  const named = party.map((h, i) => ({
    ...h,
    name: h.name.trim() || `Hero ${i + 1}`,
  }));

  if (guestRoom) {
    return (
      <GuestGame
        room={guestRoom}
        onLeave={() => {
          clearJoinLink();
          setGuestRoom(null);
          setJoining(false);
        }}
      />
    );
  }
  if (joining) {
    return (
      <JoinScreen
        initialCode={joinCode}
        onJoin={(code) => setGuestRoom(NatRoom.join(code))}
        onBack={() => {
          clearJoinLink();
          setJoining(false);
        }}
      />
    );
  }

  if (step === "party") {
    return (
      <PartySetup
        party={party}
        onChange={setParty}
        onJoin={room ? undefined : () => setJoining(true)}
        room={room}
        onInvite={() => setRoom(NatRoom.host(named))}
        onCloseTable={() => setRoom(null)}
        onNext={(seated) => {
          try {
            localStorage.setItem(PARTY_KEY, JSON.stringify(seated));
          } catch {}
          setParty(seated);
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
        room={room}
        onInvite={() => setRoom(NatRoom.host(named))}
        onCloseTable={() => setRoom(null)}
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
      room={room}
      onNewQuest={() => setStep("quest")}
      onChangeParty={() => setStep("party")}
    />
  );
}

// ---- Setup ----

function PartySetup({
  party,
  onChange,
  onJoin,
  room,
  onInvite,
  onCloseTable,
  onNext,
}: {
  party: Hero[];
  onChange: (party: Hero[]) => void;
  room: NatRoom | null;
  onInvite: () => void;
  onCloseTable: () => void;
  /** Joins another phone's game instead (hidden while hosting one). */
  onJoin?: () => void;
  onNext: (party: Hero[]) => void;
}) {
  // The name field and class picker show only while a hero is being added,
  // so the whole screen fits on a phone.
  const [adding, setAdding] = useState(party.length === 0);
  const [name, setName] = useState("");
  const [cls, setCls] = useState<ClassId>(() => suggestClass(party));
  const full = party.length >= MAX_HEROES;
  const composing = adding && !full;
  const taken = party.some(
    (h) => h.name.toLowerCase() === name.trim().toLowerCase(),
  );

  const add = () => {
    if (full || taken) return;
    const next = [
      ...party,
      { name: name.trim() || freeName(party), cls, hp: MAX_HP, items: [] },
    ];
    onChange(next);
    setName("");
    setCls(suggestClass(next));
    setAdding(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-(--screen-max) flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-(--space-3) px-(--space-4) pt-(--space-3) pb-(--space-4)">
        <div className="flex items-center justify-between gap-(--space-3)">
          <h1 className="title-lg text-(--cream)">Gather the party</h1>
          <HelpButton />
        </div>
        {onJoin && (
          <Button
            variant="ghost"
            className="-mt-(--space-3) self-start px-0"
            onClick={onJoin}
          >
            Joining a friend&apos;s game?
          </Button>
        )}
        <Invite
          room={room}
          party={party}
          onInvite={onInvite}
          onClose={onCloseTable}
        />

        {composing ? (
          <form
            id="nat-new-hero"
            className="flex flex-col gap-(--space-3)"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            {party.length > 0 && (
              <p className="caption text-(--cream-muted)">
                {listNames(party.map((h) => h.name))}{" "}
                {party.length === 1 ? "is" : "are"} in.
              </p>
            )}
            <TextField
              id="nat-hero-name"
              label={
                party.length
                  ? "Who else is joining?"
                  : "What's your hero called?"
              }
              placeholder={PLACEHOLDER_NAMES[party.length % 4]}
              value={name}
              maxLength={NAME_MAX}
              enterKeyHint="done"
              hint={
                taken
                  ? "Someone already has that name. Try another."
                  : undefined
              }
              onChange={setName}
            />
            <div className="flex flex-col gap-(--space-2)">
              <ClassPicker
                value={cls}
                onChange={setCls}
                label={`${name.trim() || "Your hero"}'s class`}
              />
              <p className="caption text-(--cream-muted)" aria-live="polite">
                {CLASSES[cls].name}: {CLASS_BLURB[cls].toLowerCase()}.
              </p>
            </div>
          </form>
        ) : (
          <>
            <ul
              className="flex flex-col gap-(--space-3)"
              aria-label="Your party"
            >
              {party.map((hero, i) => (
                <li key={i}>
                  <HeroSlot
                    name={hero.name}
                    cls={hero.cls}
                    onRemove={() => {
                      const next = party.filter((_, j) => j !== i);
                      onChange(next);
                      setCls(suggestClass(next));
                      if (!next.length) setAdding(true);
                    }}
                  />
                </li>
              ))}
            </ul>
            {!full && (
              <AddHeroSlot
                count={party.length}
                max={MAX_HEROES}
                onAdd={() => setAdding(true)}
              />
            )}
          </>
        )}
      </div>

      {/* Pinned to the bottom, in thumb reach, whatever the screen height. */}
      <div className="sticky bottom-0 z-10 flex gap-(--space-3) bg-(--oak-900) px-(--space-4) pt-(--space-3) pb-[max(var(--space-4),env(safe-area-inset-bottom))]">
        {composing ? (
          <>
            {party.length > 0 && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setAdding(false);
                  setName("");
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              form="nat-new-hero"
              size="lg"
              className="flex-1"
              disabled={taken}
            >
              Add to the party
            </Button>
          </>
        ) : (
          <Button size="lg" block onClick={() => onNext(party)}>
            Pick a quest
          </Button>
        )}
      </div>
    </main>
  );
}

/** "Mira", "Mira and Grub", "Mira, Grub and Pip". */
function listNames(names: string[]): string {
  return names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

const PLACEHOLDER_NAMES = [
  "Mira the Loud",
  "Grub",
  "Pip Quickfingers",
  "Old Bramble",
];

/** The class nobody has picked yet, so a new party spreads out. */
function suggestClass(party: Hero[]): ClassId {
  const order: ClassId[] = ["knight", "wizard", "thief", "jester"];
  return (
    order.find((c) => !party.some((h) => h.cls === c)) ??
    order[party.length % 4]
  );
}

/** "Hero 2" for a nameless hero, skipping names already at the table. */
function freeName(party: Hero[]): string {
  for (let n = party.length + 1; ; n++) {
    if (!party.some((h) => h.name === `Hero ${n}`)) return `Hero ${n}`;
  }
}

function QuestSetup({
  quest,
  party,
  room,
  onInvite,
  onCloseTable,
  onQuest,
  onBack,
  onBegin,
}: {
  quest: string;
  party: Hero[];
  room: NatRoom | null;
  onInvite: () => void;
  onCloseTable: () => void;
  onQuest: (q: string) => void;
  onBack: () => void;
  onBegin: () => void;
}) {
  const picked = QUEST_IDEAS.some((q) => q.title === quest);

  return (
    <main className={column}>
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (quest.trim()) onBegin();
        }}
      >
        <div className="flex flex-1 flex-col gap-(--space-3) px-(--space-4) pt-(--space-3) pb-(--space-4)">
          <div className="flex items-center gap-(--space-3)">
            <button
              type="button"
              className={iconBtn}
              aria-label="Back to the party"
              onClick={onBack}
            >
              <Icon d="M15 5l-7 7 7 7" size={18} />
            </button>
            <h1 className="title-lg flex-1 text-(--cream)">Pick a quest</h1>
            <HelpButton />
          </div>

          <p className="caption flex flex-wrap items-center gap-(--space-2) text-(--cream-muted)">
            <span className="flex gap-(--space-1)" aria-hidden="true">
              {party.map((h) => (
                <Monogram key={h.name} cls={h.cls} name={h.name} />
              ))}
            </span>
            {listNames(party.map((h) => h.name))}{" "}
            {party.length === 1 ? "is" : "are"} ready. Claude is your game
            master.
          </p>

          <Invite
            room={room}
            party={party}
            onInvite={onInvite}
            onClose={onCloseTable}
          />

          <ul className="flex flex-col gap-(--space-3)" aria-label="Quests">
            {QUEST_IDEAS.map((idea) => {
              const on = quest === idea.title;
              return (
                <li key={idea.title}>
                  <button
                    type="button"
                    aria-pressed={on}
                    className={`${parchment} block min-h-(--tap-min) w-full cursor-pointer border-2 p-(--space-4) text-left active:bg-(--parchment-200) ${
                      on
                        ? "border-(--ink-muted) shadow-(--shadow-glow)"
                        : "border-(--parchment-300)"
                    } ${focusRing}`}
                    onClick={() => onQuest(idea.title)}
                  >
                    <span className="title-md block">{idea.title}</span>
                    <span className="story-small mt-(--space-1) block text-(--ink-muted)">
                      {idea.hint}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-(--space-2)">
            <TextField
              id="nat-quest"
              label="Or dream up your own quest"
              placeholder="Any adventure you like"
              value={picked ? "" : quest}
              maxLength={QUEST_MAX}
              enterKeyHint="go"
              onChange={onQuest}
            />
          </div>
        </div>

        <div className={bottomBar}>
          <Button type="submit" size="lg" block disabled={!quest.trim()}>
            Start the quest
          </Button>
        </div>
      </form>
    </main>
  );
}

/** Opens the table to other phones: the game code, and who's on which phone. */
function Invite({
  room,
  party,
  onInvite,
  onClose,
}: {
  room: NatRoom | null;
  party: Hero[];
  onInvite: () => void;
  onClose: () => void;
}) {
  const snap = useRoom(room);
  const [copied, setCopied] = useState(false);

  if (!snap) {
    return (
      <Button variant="secondary" block onClick={onInvite}>
        <Icon d="M7 3h10v18H7zM11 18h2" size={18} />
        Play on more phones
      </Button>
    );
  }

  const share = async () => {
    const url = `${window.location.origin}/projects/nat20?join=${snap.code}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Join my Lucky Goose quest", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };
  const claims = snap.table?.claims ?? {};

  return (
    <section
      aria-labelledby="nat-invite"
      className="flex flex-col gap-(--space-3) rounded-(--radius-md) bg-(--oak-800) p-(--space-4)"
    >
      {snap.status === "failed" ? (
        <>
          <p role="alert" className="body text-(--wax-400)">
            {snap.error}
          </p>
          <Button variant="secondary" block onClick={onInvite}>
            Try again
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-(--space-3)">
            <div>
              <h2
                id="nat-invite"
                className="tag text-(--cream-muted) uppercase"
              >
                Game code
              </h2>
              {snap.status === "connecting" ? (
                <p className="caption mt-(--space-2) flex items-center gap-(--space-2) text-(--cream-muted)">
                  <Dots />
                  Opening the table…
                </p>
              ) : (
                <>
                  <p className="sr-only">{snap.code.split("").join(" ")}</p>
                  <p
                    className="font-(family-name:--font-ui) text-[40px] leading-[48px] font-extrabold tracking-[0.2em] text-(--candle-500)"
                    aria-hidden="true"
                  >
                    {snap.code}
                  </p>
                </>
              )}
            </div>
            <Button variant="ghost" className="px-0" onClick={onClose}>
              Stop
            </Button>
          </div>
          <p className="caption text-(--cream-muted)">
            Friends open this page on their phone, tap Joining a friend&apos;s
            game? and enter the code. They can make their own hero. Heroes
            nobody picks stay on this phone.
          </p>
          <Button
            variant="secondary"
            block
            disabled={snap.status !== "open"}
            onClick={share}
          >
            <Icon
              d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"
              size={18}
            />
            {copied ? "Link copied!" : "Share invite"}
          </Button>
          <ul className="flex flex-col gap-(--space-2)" aria-label="Phones">
            {party.map((h) => (
              <li key={h.name} className="flex items-center gap-(--space-2)">
                <Monogram cls={h.cls} name={h.name} />
                <span className="label flex-1 truncate text-(--cream)">
                  {h.name}
                </span>
                <span
                  className={`caption ${claims[h.name] ? "text-(--candle-500)" : "text-(--cream-muted)"}`}
                >
                  {claims[h.name] ? "On their phone" : "On this phone"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---- Joining another phone's game ----

function JoinScreen({
  initialCode,
  onJoin,
  onBack,
}: {
  initialCode: string;
  onJoin: (code: string) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState(initialCode);
  const ready = code.length === 4;

  return (
    <main className={column}>
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onJoin(code);
        }}
      >
        <div className="flex flex-1 flex-col gap-(--space-3) px-(--space-4) pt-(--space-3) pb-(--space-4)">
          <div className="flex items-center gap-(--space-3)">
            <button
              type="button"
              className={iconBtn}
              aria-label="Back"
              onClick={onBack}
            >
              <Icon d="M15 5l-7 7 7 7" size={18} />
            </button>
            <h1 className="title-lg flex-1 text-(--cream)">
              Join a friend&apos;s game
            </h1>
          </div>
          <TextField
            id="nat-join-code"
            label="Game code"
            hint="The 4 letters on the host's phone."
            placeholder="ABCD"
            value={code}
            maxLength={4}
            autoComplete="off"
            enterKeyHint="go"
            onChange={(v) => setCode(normalizeRoomCode(v))}
          />
        </div>
        <div className={bottomBar}>
          <Button type="submit" size="lg" block disabled={!ready}>
            Join the table
          </Button>
        </div>
      </form>
    </main>
  );
}

/** A phone that joined someone else's game: pick a hero, then play along. */
function GuestGame({ room, onLeave }: { room: NatRoom; onLeave: () => void }) {
  const snap = useRoom(room)!;
  const table = snap.table;

  if (snap.status === "failed" || !table) {
    return (
      <main className={column}>
        <div className="flex flex-1 flex-col items-center justify-center gap-(--space-4) px-(--space-4) text-center">
          {snap.status === "failed" ? (
            <>
              <h1 className="title-lg text-(--cream)">Lost the table</h1>
              <p role="alert" className="body text-(--cream-muted)">
                {snap.error}
              </p>
            </>
          ) : (
            <p
              role="status"
              className="caption flex items-center gap-(--space-2) text-(--cream-muted)"
            >
              <D20 className="h-5 w-5 animate-spin text-(--candle-500) [animation-duration:2.5s] motion-reduce:animate-none" />
              Joining table {snap.code}…
            </p>
          )}
        </div>
        <div className={bottomBar}>
          <Button
            variant={snap.status === "failed" ? "primary" : "secondary"}
            size="lg"
            block
            onClick={onLeave}
          >
            {snap.status === "failed" ? "Back" : "Cancel"}
          </Button>
        </div>
      </main>
    );
  }

  const me = table.heroes.find((h) => table.claims[h.name] === snap.me);
  const mine = (name: string) => table.claims[name] === snap.me;

  if (me && table.play) {
    return (
      <AdventureView
        view={table.play}
        mine={mine}
        shared
        onAct={(act) => room.act(act)}
        onLineDone={() => {}}
        onLeave={onLeave}
        ending={
          <p className="caption text-center text-(--cream-muted)">
            The host can start a new quest from their phone.
          </p>
        }
      />
    );
  }

  return (
    <main className={column}>
      <div className="flex flex-1 flex-col gap-(--space-3) px-(--space-4) pt-(--space-3) pb-(--space-4)">
        <div className="flex items-center gap-(--space-3)">
          <button
            type="button"
            className={iconBtn}
            aria-label="Leave the game"
            onClick={onLeave}
          >
            <Icon d="M6 6l12 12M18 6L6 18" size={16} />
          </button>
          <h1 className="title-lg flex-1 text-(--cream)">
            {me ? `You're ${me.name}` : "Who are you?"}
          </h1>
        </div>

        {me ? (
          <>
            <HeroSlot name={me.name} cls={me.cls} />
            <p
              role="status"
              className="caption flex items-center gap-(--space-2) text-(--cream-muted)"
            >
              <Dots />
              Waiting for the host to start the quest.
            </p>
          </>
        ) : (
          <GuestPick room={room} table={table} />
        )}
      </div>
      {me && (
        <div className={bottomBar}>
          <Button
            variant="secondary"
            size="lg"
            block
            onClick={() => room.claimHero(null)}
          >
            Switch hero
          </Button>
        </div>
      )}
    </main>
  );
}

/**
 * A guest makes their own hero (while the host is still setting up), or
 * picks one the host already made.
 */
function GuestPick({ room, table }: { room: NatRoom; table: Table }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState<ClassId>(() => suggestClass(table.heroes));
  const canMake = !table.play && table.heroes.length < MAX_HEROES;
  const free = table.heroes.filter((h) => !table.claims[h.name]);
  const taken = table.heroes.some(
    (h) => h.name.toLowerCase() === name.trim().toLowerCase(),
  );

  return (
    <>
      {canMake && (
        <form
          className="flex flex-col gap-(--space-3)"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && !taken) room.addHero(name.trim(), cls);
          }}
        >
          <TextField
            id="nat-guest-name"
            label="What's your hero called?"
            placeholder={PLACEHOLDER_NAMES[table.heroes.length % 4]}
            value={name}
            maxLength={NAME_MAX}
            enterKeyHint="done"
            hint={
              taken ? "Someone already has that name. Try another." : undefined
            }
            onChange={setName}
          />
          <ClassPicker
            value={cls}
            onChange={setCls}
            label={`${name.trim() || "Your hero"}'s class`}
          />
          <p className="caption text-(--cream-muted)" aria-live="polite">
            {CLASSES[cls].name}: {CLASS_BLURB[cls].toLowerCase()}.
          </p>
          <Button
            type="submit"
            size="lg"
            block
            disabled={!name.trim() || taken}
          >
            Join the party
          </Button>
        </form>
      )}

      {free.length > 0 && (
        <>
          <p className="caption text-(--cream-muted)">
            {canMake
              ? "Or play a hero the host already made:"
              : "Pick the hero you're playing."}
          </p>
          <ul className="flex flex-col gap-(--space-3)" aria-label="Heroes">
            {free.map((h) => (
              <li key={h.name}>
                <button
                  type="button"
                  className={`${CLASS_VARS[h.cls]} flex min-h-(--tap-min) w-full cursor-pointer items-center gap-(--space-3) rounded-(--radius-md) border-2 border-(--edge) bg-(--oak-800) py-(--space-2) pr-(--space-4) pl-(--space-3) text-left ${focusRing}`}
                  onClick={() => room.claimHero(h.name)}
                >
                  <Monogram cls={h.cls} name={h.name} large />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[18px] leading-6 font-extrabold text-(--cream)">
                      {h.name}
                    </span>
                    <span className="tag text-(--cls-bright) uppercase">
                      {CLASSES[h.cls].name} · {CLASSES[h.cls].stat}
                    </span>
                  </span>
                  <span className="caption text-(--cream-muted)">
                    That&apos;s me
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {!canMake && free.length === 0 && (
        <p className="body text-(--cream-muted)">
          {table.play
            ? "The quest has started and every hero is taken."
            : "The party is full."}
        </p>
      )}
    </>
  );
}

// ---- The adventure ----

/** The host's adventure: runs the game master and shares the table. */
function Adventure({
  quest,
  startingParty,
  room,
  onNewQuest,
  onChangeParty,
}: {
  quest: string;
  startingParty: Hero[];
  room: NatRoom | null;
  onNewQuest: () => void;
  onChangeParty: () => void;
}) {
  const snap = useRoom(room);
  const claims = snap?.table?.claims ?? {};
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
  const [pending, setPending] = useState<PlayView["pending"]>(null);
  // Which script line is being read aloud in the newest game master turn.
  const [cursor, setCursor] = useState(0);
  // The teleprompter moves on by itself; the table can pause or change pace.
  const [paused, setPaused] = useState(false);
  const [pace, setPace] = useState<Pace>(() => {
    try {
      const saved = localStorage.getItem(PACE_KEY);
      if (saved && saved in PACES) return saved as Pace;
    } catch {}
    return "normal";
  });
  const abort = useRef<AbortController | null>(null);

  const active = nextHero(heroes, turn);

  const view: PlayView = useMemo(
    () => ({
      heroes,
      entries,
      status,
      choices,
      ending,
      error,
      pending,
      cursor,
      paused,
      pace,
      active: active?.name ?? null,
    }),
    [
      heroes,
      entries,
      status,
      choices,
      ending,
      error,
      pending,
      cursor,
      paused,
      pace,
      active,
    ],
  );

  // Every other phone draws from this.
  useEffect(() => {
    room?.update({ play: view });
  }, [room, view]);

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
    setPaused(false);
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

  /** Which phone plays a hero: a guest's peer id, or "" for this one. */
  const phoneOf = (name: string) => claims[name] ?? "";

  /** What any phone tapped; from is "" for this phone. */
  const handle = (act: Act, from: string) => {
    switch (act.kind) {
      case "pick": {
        const choice = choices.find((c) => c.label === act.label);
        if (!active || status !== "choose" || !choice) return;
        if (phoneOf(active.name) !== from) return;
        if (choice.stat === "none") return commit(active, choice.label, null);
        const roll = rollCheck(bonusFor(active.cls, choice.stat), choice.dc);
        setPending({ hero: active, choice, roll });
        setStatus("rolling");
        return;
      }
      case "custom": {
        const text = act.text.trim().slice(0, CUSTOM_MAX);
        if (!active || status !== "choose" || !text) return;
        if (phoneOf(active.name) !== from) return;
        return commit(active, text, null);
      }
      case "rolled": {
        if (!pending || phoneOf(pending.hero.name) !== from) return;
        const { hero, choice, roll } = pending;
        setPending(null);
        return commit(hero, choice.label, {
          ...roll,
          stat: choice.stat as Stat,
        });
      }
      case "pause":
        return setPaused((p) => !p);
      case "skip":
        return setCursor((c) => (c === act.cursor ? c + 1 : c));
      case "pace":
        if (!(act.pace in PACES)) return;
        setPace(act.pace);
        try {
          localStorage.setItem(PACE_KEY, act.pace);
        } catch {}
        return;
      case "retry": {
        if (status !== "error") return;
        const nextName = active?.name ?? heroes[0].name;
        void callGm(heroes, entries, nextName, turn);
        return;
      }
    }
  };

  // Guests' taps arrive here; a ref keeps the handler current.
  const handleRef = useRef(handle);
  useEffect(() => {
    handleRef.current = handle;
  });
  useEffect(() => {
    if (!room) return;
    room.onAct = (act, from) => handleRef.current(act, from);
    return () => {
      room.onAct = null;
    };
  }, [room]);

  return (
    <AdventureView
      view={view}
      mine={(name) => !claims[name]}
      shared={Boolean(snap && snap.guests > 0)}
      notice={snap?.notice ?? null}
      onDismissNotice={() => room?.clearNotice()}
      onAct={(act) => handle(act, "")}
      onLineDone={(i) => setCursor((c) => (c === i ? c + 1 : c))}
      onLeave={onNewQuest}
      ending={
        <>
          <Button size="lg" block onClick={onNewQuest}>
            {ending === "defeat" ? "Try again" : "New quest"}
          </Button>
          <Button variant="secondary" block onClick={onChangeParty}>
            New party
          </Button>
        </>
      }
    />
  );
}

/**
 * The adventure as one phone sees it, drawn from the table. On a phone that
 * doesn't play a hero, that hero's lines and choices stay on their phone.
 */
function AdventureView({
  view,
  mine,
  shared,
  notice,
  onDismissNotice,
  onAct,
  onLineDone,
  onLeave,
  ending,
}: {
  view: PlayView;
  /** Whether a hero is played on this phone. */
  mine: (name: string) => boolean;
  /** Whether other phones are at the table. */
  shared: boolean;
  notice?: string | null;
  onDismissNotice?: () => void;
  onAct: (act: Act) => void;
  /** The teleprompter finished line i (only the host moves the story on). */
  onLineDone: (i: number) => void;
  onLeave: () => void;
  /** What to do next, under the ending. */
  ending: ReactNode;
}) {
  const { heroes, entries, status, cursor, paused, pace, pending } = view;
  const active = heroes.find((h) => h.name === view.active) ?? null;
  const names = heroes.map((h) => h.name);
  const latest = entries.at(-1);
  const latestGm = latest?.kind === "gm" ? latest : null;
  const lines = latestGm
    ? parseScript(latestGm.text, names, !latestGm.live)
    : [];
  // The choices (or the ending) wait until the whole script has been read.
  const doneReading = !latestGm || (!latestGm.live && cursor >= lines.length);
  const reading: Reading | null = doneReading
    ? null
    : {
        // Caught up with the game master, who is still writing.
        waiting: cursor >= lines.length,
        paused,
        pace,
        onPause: () => onAct({ kind: "pause" }),
        onSkip: () => onAct({ kind: "skip", cursor }),
        onPace: (next) => onAct({ kind: "pace", pace: next }),
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

  return (
    <main className={column}>
      <PartyBar
        heroes={heroes}
        active={status === "over" ? null : active}
        onLeave={onLeave}
      />

      {notice && (
        <p
          role="status"
          className="caption mx-(--space-4) mt-(--space-2) flex items-center gap-(--space-2) rounded-(--radius-md) bg-(--oak-800) py-(--space-1) pr-(--space-1) pl-(--space-3) text-(--cream)"
        >
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            aria-label="Dismiss"
            className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-(--radius-pill) text-(--cream-muted) ${focusRing}`}
            onClick={onDismissNotice}
          >
            <Icon d="M6 6l12 12M18 6L6 18" size={14} />
          </button>
        </p>
      )}

      <Story
        entries={entries}
        heroes={heroes}
        cursor={cursor}
        pace={pace}
        paused={paused}
        mine={mine}
        shared={shared}
        onLineDone={onLineDone}
      />

      {status === "error" && view.error && (
        <div className="flex flex-col gap-(--space-3) px-(--space-4) pb-(--space-4)">
          <p
            role="alert"
            className="body rounded-(--radius-md) border-2 border-(--wax-600) bg-(--oak-800) px-(--space-4) py-(--space-3) text-(--cream)"
          >
            {view.error}
          </p>
          <Button size="lg" block onClick={() => onAct({ kind: "retry" })}>
            Try again
          </Button>
        </div>
      )}

      {status === "over" && view.ending && doneReading && (
        <Ending ending={view.ending} heroes={heroes}>
          {ending}
        </Ending>
      )}

      {(reading ||
        status === "gm" ||
        status === "choose" ||
        status === "rolling") && (
        <ActionPanel
          hero={active}
          heroes={heroes}
          reading={reading}
          choices={view.choices}
          waiting={status !== "choose"}
          mine={active ? mine(active.name) : false}
          onPick={(choice) => onAct({ kind: "pick", label: choice.label })}
          onCustom={(text) => onAct({ kind: "custom", text })}
        />
      )}

      {pending && (
        <DiceRoll
          key={`${entries.length}-${pending.hero.name}`}
          hero={pending.hero}
          choice={pending.choice}
          roll={pending.roll}
          mine={mine(pending.hero.name)}
          onDone={() => onAct({ kind: "rolled" })}
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
    <div className="sticky top-0 z-20 flex items-center gap-(--space-2) bg-(--oak-900) px-(--space-4) py-(--space-2)">
      <button
        type="button"
        className={iconBtn}
        aria-label="Leave the quest"
        onClick={onLeave}
      >
        <Icon d="M6 6l12 12M18 6L6 18" size={16} />
      </button>
      <ul
        className="grid min-w-0 flex-1 auto-cols-fr grid-flow-col gap-(--space-1) rounded-(--radius-lg) bg-(--oak-800) p-(--space-1)"
        aria-label="Party"
      >
        {heroes.map((h) => {
          const up = active?.name === h.name;
          const out = h.hp === 0;
          const low = h.hp <= 3;
          return (
            <li
              key={h.name}
              aria-current={up ? "true" : undefined}
              className={`flex min-w-0 flex-col gap-(--space-1) rounded-(--radius-md) border-2 p-(--space-1) ${
                up
                  ? "border-(--candle-500) bg-(--oak-700)"
                  : "border-transparent"
              }`}
            >
              <span className="flex min-w-0 items-center gap-(--space-1)">
                <Monogram cls={h.cls} name={h.name} />
                <span
                  className={`truncate text-[14px] leading-5 font-extrabold ${out ? "text-(--cream-muted)" : "text-(--cream)"}`}
                >
                  {h.name}
                </span>
              </span>
              <span
                className="block h-(--hp-bar) overflow-hidden rounded-(--radius-pill) bg-(--oak-900)"
                aria-hidden="true"
              >
                <span
                  className={`block h-full rounded-(--radius-pill) transition-[width] duration-500 motion-reduce:transition-none ${low ? "bg-(--wax-600)" : "bg-(--candle-500)"}`}
                  style={{ width: `${(h.hp / MAX_HP) * 100}%` }}
                />
              </span>
              <span
                className={`truncate text-[13px] leading-4 font-extrabold tabular-nums ${low ? "text-(--wax-400)" : "text-(--cream-muted)"}`}
              >
                {out ? "Knocked out" : `${h.hp}/${MAX_HP} HP`}
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
  pace,
  paused,
  mine,
  shared,
  onLineDone,
}: {
  entries: Entry[];
  heroes: Hero[];
  /** The line being read in the newest game master turn. */
  cursor: number;
  pace: Pace;
  paused: boolean;
  mine: (name: string) => boolean;
  shared: boolean;
  onLineDone: (i: number) => void;
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
      className="flex flex-1 flex-col gap-(--space-3) px-(--space-4) pt-(--space-3) pb-(--space-4)"
      aria-live="polite"
    >
      {entries.map((e, i) =>
        e.kind === "gm" ? (
          <Scene
            key={i}
            entry={e}
            heroes={heroes}
            cursor={i === entries.length - 1 ? cursor : null}
            pace={pace}
            paused={paused}
            mine={mine}
            shared={shared}
            onLineDone={onLineDone}
          />
        ) : (
          <PlayerCard key={i} entry={e} />
        ),
      )}
    </div>
  );
}

/** Three candle dots, bouncing while the game master writes. */
function Dots() {
  return (
    <span className="flex gap-(--space-1)" aria-hidden="true">
      {[0, 1, 2].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-(--radius-pill) bg-(--candle-500) motion-reduce:animate-none"
          style={{ animationDelay: `${d * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** One game master turn: its script lines on parchment, then what changed. */
function Scene({
  entry,
  heroes,
  cursor,
  pace,
  paused,
  mine,
  shared,
  onLineDone,
}: {
  entry: Extract<Entry, { kind: "gm" }>;
  heroes: Hero[];
  /** The line being read aloud, or null for earlier turns (shown in full). */
  cursor: number | null;
  pace: Pace;
  paused: boolean;
  mine: (name: string) => boolean;
  shared: boolean;
  onLineDone: (i: number) => void;
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
    heroes.find((h) => h.name === name)?.cls ?? "knight";

  if (lines.length === 0 && entry.live) {
    return (
      <p className="caption flex items-center gap-(--space-2) text-(--cream-muted)">
        <Dots />
        The game master is writing the script…
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-(--space-3)">
      <ol className="flex flex-col gap-(--space-3)">
        {shown.map((line, i) => {
          if (cursor !== null && i === cursor) {
            // A new reader gets a beat to take the phone (not in a party of one).
            const handoff =
              heroes.length > 1 &&
              (i === 0 || shown[i - 1].reader !== line.reader);
            // With more phones, the phone only changes hands between two
            // heroes who share it.
            const passOn = !shared || (i > 0 && mine(shown[i - 1].reader));
            return (
              <Teleprompter
                key={i}
                line={line}
                cls={clsOf(line.reader)}
                handoff={handoff}
                handoffLabel={passOn ? "Pass the phone" : "Your line"}
                hidden={!mine(line.reader)}
                pace={pace}
                paused={paused}
                onDone={() => onLineDone(i)}
              />
            );
          }
          return (
            <li
              key={i}
              className="story-small animate-[noggin-pop_0.25s_ease-out] rounded-(--radius-md) bg-(--parchment-200) px-(--space-4) py-(--space-3) text-(--ink)"
            >
              <Reader line={line} cls={clsOf(line.reader)} />
              {line.text}
            </li>
          );
        })}
        {cursor !== null && cursor >= lines.length && entry.live && (
          <li className="caption flex items-center gap-(--space-2) text-(--cream-muted)">
            <Dots />
            Writing the next line…
          </li>
        )}
      </ol>
      {finished &&
        entry.turn &&
        (entry.turn.hpChanges.length > 0 ||
          entry.turn.itemsGained.length > 0) && (
          <ul className="flex flex-wrap gap-(--space-2)">
            {entry.turn.hpChanges
              .filter((c) => c.amount !== 0)
              .map((c, i) => (
                <li
                  key={`hp-${i}`}
                  className={`tag rounded-(--radius-sm) px-(--space-2) py-(--space-1) ${
                    c.amount < 0
                      ? "bg-(--wax-600) text-(--on-wax)"
                      : "bg-(--candle-500) text-(--on-candle)"
                  }`}
                >
                  {c.hero} {c.amount > 0 ? "+" : "−"}
                  {Math.abs(c.amount)} HP
                </li>
              ))}
            {entry.turn.itemsGained.map((g, i) => (
              <li
                key={`item-${i}`}
                className="caption rounded-(--radius-sm) bg-(--oak-700) px-(--space-2) py-(--space-1) text-(--cream) shadow-[inset_0_0_0_2px_var(--edge)]"
              >
                {g.hero} found {g.item}
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}

/** "Mira reads, as the Goblin · whispering", with Mira's class dot. */
function Reader({ line, cls }: { line: ScriptLine; cls: ClassId }) {
  return (
    <span className="mb-(--space-1) flex flex-wrap items-center gap-x-(--space-2) font-(family-name:--font-ui) text-[14px] leading-5 font-bold text-(--ink-muted)">
      <span
        className={`${CLASS_VARS[cls]} inline-block h-2.5 w-2.5 rounded-(--radius-pill) bg-(--cls)`}
        aria-hidden="true"
      />
      {line.reader} reads
      {line.speaker !== line.reader && (
        <span className="font-semibold">as {line.speaker}</span>
      )}
      {line.direction && (
        <span className="font-semibold italic">· {line.direction}</span>
      )}
    </span>
  );
}

function PlayerCard({ entry }: { entry: Extract<Entry, { kind: "player" }> }) {
  const { hero, roll } = entry;
  return (
    <article
      className={`${CLASS_VARS[hero.cls]} flex max-w-[88%] animate-[noggin-pop_0.25s_ease-out] flex-col gap-(--space-2) self-end rounded-(--radius-md) border-2 border-(--cls) bg-(--oak-800) px-(--space-4) py-(--space-3)`}
    >
      <p className="flex items-center gap-(--space-2)">
        <Monogram cls={hero.cls} name={hero.name} />
        <span className="label text-(--cls-bright)">{hero.name}</span>
      </p>
      <p className="body text-(--cream)">{entry.action}</p>
      {roll && (
        <p className="flex flex-wrap items-center gap-(--space-2)">
          <span className="tag rounded-(--radius-sm) bg-(--oak-700) px-(--space-2) py-(--space-1) text-(--cream) tabular-nums">
            {roll.stat} {roll.die}
            {roll.bonus ? ` + ${roll.bonus}` : ""} = {roll.total} vs DC{" "}
            {roll.dc}
          </span>
          <Verdict roll={roll} small />
        </p>
      )}
    </article>
  );
}

/** Success! in candle gold or Miss in red wax: never colour alone. */
function Verdict({ roll, small }: { roll: Roll; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-(--radius-pill) font-(family-name:--font-ui) font-extrabold ${
        small
          ? "min-h-6 px-(--space-2) text-[13px]"
          : "min-h-9 px-(--space-4) text-[18px]"
      } ${roll.success ? "bg-(--candle-500) text-(--on-candle)" : "bg-(--wax-600) text-(--on-wax)"}`}
    >
      {roll.die === 20
        ? "Natural 20!"
        : roll.die === 1
          ? "Natural 1"
          : roll.success
            ? "Success!"
            : "Miss"}
    </span>
  );
}

function ActionPanel({
  hero,
  heroes,
  reading,
  choices,
  waiting,
  mine,
  onPick,
  onCustom,
}: {
  hero: Hero | null;
  heroes: Hero[];
  /** Set while the party is reading the script aloud. */
  reading: Reading | null;
  choices: Choice[];
  waiting: boolean;
  /** Whether the hero whose turn it is plays on this phone. */
  mine: boolean;
  onPick: (choice: Choice) => void;
  onCustom: (text: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const [writing, setWriting] = useState(false);
  if (!hero) return null;

  if (reading && !reading.waiting) {
    return (
      <div className={bottomBar}>
        <ReadingControls reading={reading} />
      </div>
    );
  }

  if (waiting || reading) {
    return (
      <div className={bottomBar}>
        <p
          className="caption flex min-h-(--tap-min) items-center justify-center gap-(--space-2) text-(--cream-muted)"
          role="status"
        >
          <D20 className="h-5 w-5 animate-spin text-(--candle-500) [animation-duration:2.5s] motion-reduce:animate-none" />
          {heroes.length > 1
            ? "The game master is writing your script…"
            : "The game master is writing…"}
        </p>
      </div>
    );
  }

  if (!mine) {
    return (
      <div className={bottomBar}>
        <p
          className="caption flex min-h-(--tap-min) items-center justify-center gap-(--space-2) text-(--cream-muted)"
          role="status"
        >
          <Monogram cls={hero.cls} name={hero.name} />
          {hero.name}&apos;s turn. They&apos;re choosing on their phone.
        </p>
      </div>
    );
  }

  // The choices sit at the end of the story rather than over it: three
  // parchment cards are too tall to pin.
  return (
    <section
      aria-labelledby="nat-turn"
      className="flex flex-col gap-(--space-3) px-(--space-4) pt-(--space-2) pb-[max(var(--space-4),env(safe-area-inset-bottom))]"
    >
      <h2 id="nat-turn" className="flex items-center gap-(--space-2)">
        <Monogram cls={hero.cls} name={hero.name} large />
        <span className="flex flex-col">
          <span className="title-md text-(--cream)">
            {hero.name}&apos;s turn
          </span>
          <span className="caption text-(--cream-muted)">What do you do?</span>
        </span>
      </h2>
      {choices.map((c) => (
        <ChoiceCard
          key={c.label}
          choice={c}
          cls={hero.cls}
          onPick={() => onPick(c)}
        />
      ))}
      {!writing ? (
        <Button variant="secondary" block onClick={() => setWriting(true)}>
          Type my own
        </Button>
      ) : (
        <form
          className="flex items-end gap-(--space-2)"
          onSubmit={(e) => {
            e.preventDefault();
            const text = custom.trim();
            if (!text) return;
            setCustom("");
            setWriting(false);
            onCustom(text);
          }}
        >
          <div className="flex-1">
            <TextField
              id="nat-custom"
              label="What does your hero do?"
              placeholder="Juggle the goblin's keys"
              value={custom}
              maxLength={CUSTOM_MAX}
              enterKeyHint="send"
              onChange={setCustom}
            />
          </div>
          <Button type="submit" disabled={!custom.trim()}>
            Do it
          </Button>
        </form>
      )}
    </section>
  );
}

/** A suggested action on parchment, tagged with its stat and DC. */
function ChoiceCard({
  choice,
  cls,
  onPick,
}: {
  choice: Choice;
  cls: ClassId;
  onPick: () => void;
}) {
  const bonus = bonusFor(cls, choice.stat);
  return (
    <button
      type="button"
      className={`${CLASS_VARS[cls]} ${parchment} story flex min-h-(--tap-lg) w-full cursor-pointer flex-col gap-(--space-2) border-2 border-(--parchment-300) p-(--space-4) text-left active:bg-(--parchment-200) ${focusRing}`}
      onClick={onPick}
    >
      <span>{choice.label}</span>
      <span className="flex flex-wrap items-center gap-(--space-2)">
        <span
          className={`tag inline-flex min-h-6 items-center rounded-(--radius-sm) px-(--space-2) ${
            bonus
              ? "bg-(--cls) text-(--on-class)"
              : "bg-(--ink) text-(--parchment-100)"
          }`}
        >
          {choice.stat === "none"
            ? "No roll"
            : `${choice.stat} · DC ${choice.dc}`}
        </span>
        {bonus > 0 && (
          <span className="tag text-(--ink-muted)">
            +{CLASS_BONUS} {CLASSES[cls].name} bonus
          </span>
        )}
      </span>
    </button>
  );
}

type Reading = {
  waiting: boolean;
  paused: boolean;
  pace: Pace;
  onPause: () => void;
  onSkip: () => void;
  onPace: (pace: Pace) => void;
};

/**
 * The line being read aloud. Its words light up at reading pace and a bar
 * fills underneath; when the bar ends, the story moves to the next line.
 * One CSS clock drives all three, so pausing holds them together.
 */
function Teleprompter({
  line,
  cls,
  handoff,
  handoffLabel,
  hidden,
  pace,
  paused,
  onDone,
}: {
  line: ScriptLine;
  cls: ClassId;
  handoff: boolean;
  handoffLabel: string;
  /** The reader is on another phone: say who's reading, not what. */
  hidden: boolean;
  pace: Pace;
  paused: boolean;
  onDone: () => void;
}) {
  const { words, start, perWord, total } = lineTiming(line.text, pace, handoff);
  const playState = paused ? "paused" : "running";
  // The bar still runs, so every phone keeps the same clock.
  const bar = (
    <span
      aria-hidden="true"
      className="block h-1 origin-left animate-[tele-line_1s_linear_both] bg-(--candle-500)"
      style={{
        animationDuration: `${total}ms`,
        animationPlayState: playState,
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === "tele-line") onDone();
      }}
    />
  );

  if (hidden) {
    return (
      <li
        aria-current="true"
        className={`${parchment} animate-[noggin-pop_0.25s_ease-out] overflow-hidden`}
      >
        <p className="story-lead flex items-center gap-(--space-2) px-(--space-4) py-(--space-4) text-(--ink-muted) italic">
          <span
            className={`${CLASS_VARS[cls]} inline-block h-2.5 w-2.5 shrink-0 rounded-(--radius-pill) bg-(--cls)`}
            aria-hidden="true"
          />
          {line.reader} is reading
        </p>
        {bar}
      </li>
    );
  }

  return (
    <li
      aria-current="true"
      className={`${parchment} animate-[noggin-pop_0.25s_ease-out] overflow-hidden shadow-[0_0_0_3px_var(--candle-500),var(--shadow-card)]`}
    >
      <div className="px-(--space-4) pt-(--space-3) pb-(--space-4)">
        <div className="flex items-start gap-(--space-2)">
          <Reader line={line} cls={cls} />
          {handoff && (
            <span
              className="tag ml-auto shrink-0 animate-[tele-handoff_1s_steps(1,end)_both] rounded-(--radius-sm) bg-(--ink) px-(--space-2) py-(--space-1) text-(--parchment-100)"
              style={{
                animationDuration: `${start}ms`,
                animationPlayState: playState,
              }}
            >
              {handoffLabel}
            </span>
          )}
        </div>
        <p className="story-lead">
          <span className="sr-only">{line.text}</span>
          <span aria-hidden="true">
            {words.map((word, w) => (
              <span
                key={w}
                className="animate-[tele-word_160ms_ease-out_both]"
                style={{
                  animationDelay: `${start + w * perWord}ms`,
                  animationPlayState: playState,
                }}
              >
                {word}{" "}
              </span>
            ))}
          </span>
        </p>
      </div>
      {bar}
    </li>
  );
}

/** Pause, skip and pace for the teleprompter, in thumb reach. */
function ReadingControls({ reading }: { reading: Reading }) {
  return (
    <div className="flex flex-col gap-(--space-2)">
      <div className="flex gap-(--space-2)">
        <Button
          variant={reading.paused ? "primary" : "secondary"}
          className="flex-1"
          aria-pressed={reading.paused}
          onClick={reading.onPause}
        >
          <Icon
            d={reading.paused ? "M7 5l12 7-12 7z" : "M8 5v14M16 5v14"}
            size={18}
          />
          {reading.paused ? "Keep reading" : "Pause"}
        </Button>
        <Button variant="secondary" onClick={reading.onSkip}>
          Skip line
          <Icon d="M6 5l8 7-8 7M18 5v14" size={18} />
        </Button>
      </div>
      <fieldset className="flex items-center gap-(--space-2)">
        <legend className="sr-only">Reading pace</legend>
        <span className="tag text-(--cream-muted) uppercase" aria-hidden="true">
          Pace
        </span>
        <div className="grid flex-1 grid-cols-3 gap-(--space-2)">
          {(Object.keys(PACES) as Pace[]).map((p) => (
            <label
              key={p}
              className={`caption flex h-11 cursor-pointer items-center justify-center rounded-(--radius-md) border-2 capitalize has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-(--focus) ${
                reading.pace === p
                  ? "border-(--candle-500) bg-(--oak-700) text-(--cream)"
                  : "border-(--edge) text-(--cream-muted)"
              }`}
            >
              <input
                type="radio"
                name="nat-pace"
                className="sr-only"
                checked={reading.pace === p}
                onChange={() => reading.onPace(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** How long the die tumbles before it lands. */
const TUMBLE_MS = 700;

function DiceRoll({
  hero,
  choice,
  roll,
  mine,
  onDone,
}: {
  hero: Hero;
  choice: Choice;
  roll: Roll;
  /** Only the roller's phone moves the story on. */
  mine: boolean;
  onDone: () => void;
}) {
  const [face, setFace] = useState(1);
  const [landed, setLanded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  // The die tumbles through random faces, then lands on the real roll.
  useEffect(() => {
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(
      () => setFace(1 + Math.floor(Math.random() * 20)),
      70,
    );
    const stop = setTimeout(
      () => {
        clearInterval(id);
        setFace(roll.die);
        setLanded(true);
        navigator.vibrate?.(roll.die === 20 ? [60, 40, 60, 40, 120] : 50);
      },
      quick ? 0 : TUMBLE_MS,
    );
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [roll.die]);

  useEffect(() => {
    if (landed) button.current?.focus();
  }, [landed]);

  const nat20 = landed && roll.die === 20;
  const nat1 = landed && roll.die === 1;

  return (
    <div
      className="fixed inset-0 z-60 flex animate-[noggin-fade_0.15s_ease-out] flex-col items-center justify-center bg-black/70 px-(--space-4) backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nat-roll-title"
    >
      <div
        className={`relative flex w-full max-w-(--screen-max) flex-col items-center gap-(--space-4) overflow-hidden rounded-(--radius-lg) bg-(--oak-800) px-(--space-4) pt-(--space-6) pb-(--space-4) text-center ${nat20 ? "shadow-(--shadow-glow)" : ""}`}
      >
        {nat20 && <Rays />}
        <div className="relative flex flex-col items-center gap-(--space-1)">
          <p className="tag text-(--cream-muted) uppercase">
            {hero.name} · {choice.stat} · DC {choice.dc}
          </p>
          <h2 id="nat-roll-title" className="body text-(--cream)">
            {choice.label}
          </h2>
        </div>

        <Die
          value={face}
          tone={nat20 ? "gold" : nat1 ? "wax" : "parchment"}
          tumbling={!landed}
        />

        <div
          className={`relative flex min-h-36 flex-col items-center gap-(--space-3) ${landed ? "" : "invisible"}`}
          aria-live="assertive"
        >
          {(nat20 || nat1) && (
            <p
              className={`title-xl ${nat20 ? "animate-[noggin-pop_0.4s_ease-out] text-(--candle-500)" : "text-(--wax-400)"}`}
            >
              {nat20 ? "Natural 20!" : "Natural 1"}
            </p>
          )}
          <p className="text-[18px] leading-6 font-extrabold text-(--cream) tabular-nums">
            {roll.die}
            {roll.bonus ? ` + ${roll.bonus}` : ""} = {roll.total}
            <span className="font-bold text-(--cream-muted)">
              {" "}
              vs DC {roll.dc}
            </span>
          </p>
          <Verdict roll={roll} />
          {(nat20 || nat1) && (
            <p className="body text-(--cream-muted)">
              {nat20
                ? "Always a success. Everybody cheer!"
                : "Always a miss. It happens to the best of us."}
            </p>
          )}
        </div>

        {mine ? (
          <Button
            ref={button}
            size="lg"
            block
            className="relative"
            disabled={!landed}
            onClick={onDone}
          >
            Keep going
          </Button>
        ) : (
          <p className="caption relative flex min-h-(--tap-lg) items-center text-(--cream-muted)">
            {hero.name} taps Keep going on their phone.
          </p>
        )}
      </div>
    </div>
  );
}

/** The d20 on the roll sheet: parchment, candle gold on a 20, red wax on a 1. */
function Die({
  value,
  tone,
  tumbling,
}: {
  value: number;
  tone: "parchment" | "gold" | "wax";
  tumbling: boolean;
}) {
  const fill = {
    parchment: "fill-(--parchment-100) stroke-(--ink)",
    gold: "fill-(--candle-500) stroke-(--ink)",
    wax: "fill-(--wax-600) stroke-(--oak-900)",
  }[tone];
  const edge = {
    parchment: "stroke-(--parchment-300)",
    gold: "stroke-(--candle-300)",
    wax: "stroke-(--wax-400)",
  }[tone];
  return (
    <svg
      viewBox="0 0 100 100"
      className={`relative h-33 w-33 ${tumbling ? "animate-[nat-tumble_0.7s_cubic-bezier(.3,.7,.4,1)_infinite]" : ""}`}
      role="img"
      aria-label={`d20 showing ${value}`}
    >
      <polygon
        className={`${fill} [stroke-width:2.5] [stroke-linejoin:round]`}
        points="50,4 90,27 90,73 50,96 10,73 10,27"
      />
      <g
        className={`${edge} fill-none [stroke-width:2] [stroke-linejoin:round]`}
      >
        <polygon points="50,24 76,68 24,68" />
        <path d="M50,4 L50,24 M90,27 L76,68 M90,73 L76,68 M50,96 L76,68 M50,96 L24,68 M10,73 L24,68 M10,27 L24,68 M10,27 L50,24 M90,27 L50,24" />
      </g>
      <text
        x="50"
        y="61"
        textAnchor="middle"
        className={`font-(family-name:--font-display) text-[34px] tabular-nums ${tone === "wax" ? "fill-(--on-wax)" : "fill-(--ink)"}`}
      >
        {value}
      </text>
    </svg>
  );
}

/** Candle rays turning behind a Natural 20 (they hold still under reduced motion). */
function Rays() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="pointer-events-none absolute top-(--space-7) left-1/2 h-80 w-80 -translate-x-1/2 animate-[nat-spin_6s_linear_infinite] stroke-(--candle-300) [stroke-width:6] [stroke-linecap:round]"
    >
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <line
            key={i}
            x1={160 + Math.cos(a) * 80}
            y1={160 + Math.sin(a) * 80}
            x2={160 + Math.cos(a) * 120}
            y2={160 + Math.sin(a) * 120}
          />
        );
      })}
    </svg>
  );
}

function Ending({
  ending,
  heroes,
  children,
}: {
  ending: "victory" | "defeat";
  heroes: Hero[];
  /** What to do next. */
  children: ReactNode;
}) {
  const victory = ending === "victory";
  return (
    <section
      aria-labelledby="nat-ending"
      className="flex animate-[noggin-pop_0.45s_ease-out] flex-col items-center gap-(--space-5) px-(--space-4) pt-(--space-5) pb-[max(var(--space-4),env(safe-area-inset-bottom))] text-center"
    >
      <div
        className={`rounded-(--radius-lg) px-(--space-6) py-(--space-3) ${
          victory
            ? "bg-(--candle-500) text-(--on-candle) shadow-(--shadow-glow)"
            : "bg-(--wax-600) text-(--on-wax)"
        }`}
      >
        <h2 id="nat-ending" className="title-xl">
          {victory ? "Victory!" : "Defeat"}
        </h2>
      </div>
      <p className="body text-(--cream-muted)">
        {victory
          ? "The tavern roars. Drinks are on the house."
          : "The party is out cold. The tavern saves your seats."}
      </p>
      <ul
        className={`${parchment} story-small flex w-full flex-col gap-(--space-2) p-(--space-4) text-left`}
        aria-label="How the party fared"
      >
        {heroes.map((h) => (
          <li key={h.name} className="flex items-start gap-(--space-2)">
            <span
              className={`${CLASS_VARS[h.cls]} mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-(--radius-pill) bg-(--cls)`}
              aria-hidden="true"
            />
            <span>
              <strong className="font-bold">{h.name}</strong> the{" "}
              {CLASSES[h.cls].name}
              {h.hp === 0 ? ", knocked out" : `, ${h.hp}/${MAX_HP} HP`}
              {h.items.length > 0 && `, carrying ${listNames(h.items)}`}.
            </span>
          </li>
        ))}
      </ul>
      <div className="flex w-full flex-col gap-(--space-3)">{children}</div>
    </section>
  );
}

// ---- How to play ----

const STEPS: { title: string; body: string }[] = [
  {
    title: "Gather the party",
    body: "Up to 4 heroes share one phone, or join from their own phones with the game code. Knights are strong, Thieves are quick, Wizards are clever and Jesters are charming.",
  },
  {
    title: "Pick a quest",
    body: "Anything you like, from “steal the moon” to “find the king's lost sock”. Claude is your game master.",
  },
  {
    title: "Read the script aloud",
    body: "Each scene is a script. The phone shows one line at a time, who reads it, and a hint like “whispering”. Ham it up, and pause or change the pace anytime.",
  },
  {
    title: "Take your turn",
    body: "Pick a choice or type your own. Risky moves mean a roll for it: beat the DC to succeed. Your class adds +3 to its stat.",
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
        className={`${iconBtn} button`}
        aria-label="How to play"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end text-(--cream)">
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
            className="relative mx-auto w-full max-w-(--screen-max) animate-[noggin-sheet_0.28s_cubic-bezier(0.2,0.9,0.3,1.1)] rounded-t-(--radius-lg) bg-(--oak-800) px-(--space-4) pt-(--space-3) pb-[max(var(--space-4),env(safe-area-inset-bottom))]"
          >
            <span
              className="mx-auto mb-(--space-3) block h-1.25 w-11 rounded-(--radius-pill) bg-(--oak-600)"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <h2 id="nat-how" className="title-lg">
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
            <ol className="mt-(--space-4) flex flex-col gap-(--space-4)">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex items-start gap-(--space-3)"
                >
                  <span
                    className="title-md flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-pill) bg-(--candle-500) text-(--on-candle)"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="label">{step.title}</p>
                    <p className="body mt-(--space-1) text-(--cream-muted)">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Button size="lg" block className="mt-(--space-5)" onClick={close}>
              Got it
            </Button>
          </section>
        </div>
      )}
    </>
  );
}

// ---- Pieces ----

/** The d20 as a simple line shape, for the "writing" spinner. */
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
