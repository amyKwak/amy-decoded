"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  COUNTDOWN_SECONDS,
  normalizeRoomCode,
  PROMPT_MAX,
  type GameState,
  type Role,
} from "@/lib/noggin/game";
import { NogginRoom, type RoomSnapshot } from "@/lib/noggin/room";
import { heardWord } from "@/lib/noggin/voice";

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-noggin-cobalt";
// Chunky "sticker" buttons: a hard drop shadow that collapses when pressed.
const press =
  "transition-[translate,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_var(--color-noggin-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";
const btn =
  "inline-flex items-center justify-center rounded-[20px] border-3 px-6 font-extrabold transition-[translate,box-shadow] duration-75 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-3";
const inkBtn = `${btn} w-full border-noggin-ink active:shadow-[0_1px_0_var(--color-noggin-ink)] focus-visible:outline-noggin-cobalt`;
const bigBtn = `${inkBtn} h-16 text-[21px] shadow-[0_5px_0_var(--color-noggin-ink)]`;
const hugeBtn = `${inkBtn} h-17 text-[23px] shadow-[0_6px_0_var(--color-noggin-ink)]`;
const iconBtn = `flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-3 border-noggin-ink bg-white shadow-[0_4px_0_var(--color-noggin-ink)] ${press} ${focusRing}`;
const input = `h-15 w-full rounded-[18px] border-3 border-noggin-line bg-white px-4.5 text-xl font-semibold outline-none placeholder:text-noggin-muted/70 focus:border-noggin-ink`;
const label =
  "block text-[13px] font-extrabold uppercase tracking-[0.12em] text-noggin-muted";
const screen =
  "mx-auto flex w-full max-w-120 flex-1 flex-col px-6 pt-5 pb-8 tablet:pt-10";

const PLAYER_BG: Record<Role, string> = {
  host: "bg-noggin-tomato text-noggin-ink",
  guest: "bg-noggin-cobalt text-white",
};
const NAME_KEY = "noggin:name";
const VOICE_KEY = "noggin:voice";
const noopSubscribe = () => () => {};

export function NogginApp() {
  const [room, setRoom] = useState<NogginRoom | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => () => room?.destroy(), [room]);

  const leave = (error: string | null = null) => {
    setRoom(null);
    setJoinError(error);
  };

  if (!hydrated) return null;
  if (!room) {
    return (
      <Home
        error={joinError}
        onCreate={(name) => setRoom(NogginRoom.host(name))}
        onJoin={(code, name) => setRoom(NogginRoom.join(code, name))}
      />
    );
  }
  return <RoomView key={room.getSnapshot().code} room={room} onLeave={leave} />;
}

// ---- Home ----

function Home({
  error,
  onCreate,
  onJoin,
}: {
  error: string | null;
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
}) {
  // Only rendered after hydration, so these can read the browser directly.
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [code, setCode] = useState(() =>
    normalizeRoomCode(
      new URLSearchParams(window.location.search).get("room") ?? "",
    ),
  );
  // An invite link lands straight on the join screen.
  const [joining, setJoining] = useState(code.length > 0);

  const playerName = (fallback: string) => {
    const trimmed = name.trim().slice(0, 16);
    try {
      localStorage.setItem(NAME_KEY, trimmed);
    } catch {}
    return trimmed || fallback;
  };

  const errorBox = error && (
    <p
      role="alert"
      className="bg-noggin-tomato/15 mt-4 rounded-2xl border-2 border-[#b3311a]/30 px-4 py-3 text-[15px] font-semibold text-[#9c2a14]"
    >
      {error}
    </p>
  );

  if (joining) {
    return (
      <main className={screen}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className={iconBtn}
            aria-label="Back"
            onClick={() => setJoining(false)}
          >
            <Icon d="M15 5l-7 7 7 7" />
          </button>
          <HelpButton />
        </div>

        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 4) onJoin(code, playerName("Player 2"));
          }}
        >
          <h1 className="mt-10 text-5xl leading-[0.95] font-extrabold tracking-[-0.03em]">
            Got a code?
          </h1>
          <p className="text-noggin-muted mt-3 text-lg leading-snug">
            Ask your friend for the 4 letters on their screen.
          </p>
          {errorBox}

          <label htmlFor="noggin-code" className={`${label} mt-8 mb-2`}>
            Room code
          </label>
          <input
            id="noggin-code"
            className="border-noggin-line placeholder:text-noggin-muted/50 focus:border-noggin-ink h-24 w-full rounded-[22px] border-3 bg-white pl-[0.32em] text-center text-[52px] font-extrabold tracking-[0.32em] uppercase outline-none"
            value={code}
            placeholder="ABCD"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setCode(normalizeRoomCode(e.target.value))}
          />

          {!name.trim() && (
            <>
              <label htmlFor="noggin-name" className={`${label} mt-6 mb-2`}>
                Your name
              </label>
              <input
                id="noggin-name"
                className={input}
                value={name}
                maxLength={16}
                autoComplete="nickname"
                placeholder="Type your name"
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <button
            type="submit"
            className={`${bigBtn} bg-noggin-cobalt mt-auto text-white`}
            disabled={code.length !== 4}
          >
            Join game
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className={screen}>
      <div className="flex justify-end">
        <HelpButton />
      </div>

      <div className="flex flex-col items-center text-center">
        <Mascot className="h-40 w-40 animate-[noggin-bob_2.6s_ease-in-out_infinite]" />
        <h1 className="mt-3 text-[68px] leading-[0.9] font-extrabold tracking-[-0.04em]">
          Noggin
        </h1>
        <p className="text-noggin-muted mt-3 max-w-70 text-[19px] leading-snug text-balance">
          What&apos;s on your forehead? Guess it before your friend does.
        </p>
      </div>
      {errorBox}

      <div className="mt-auto flex flex-col pt-8">
        <label htmlFor="noggin-name" className={`${label} mb-2`}>
          Your name
        </label>
        <input
          id="noggin-name"
          className={input}
          value={name}
          maxLength={16}
          autoComplete="nickname"
          placeholder="Type your name"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className={`${bigBtn} bg-noggin-tomato mt-5`}
          onClick={() => onCreate(playerName("Player 1"))}
        >
          Start a game
        </button>
        <button
          type="button"
          className={`${bigBtn} mt-4 bg-white`}
          onClick={() => setJoining(true)}
        >
          Join a friend
        </button>
      </div>
    </main>
  );
}

function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle
        cx="20"
        cy="23"
        r="15.5"
        strokeWidth="1.4"
        className="fill-noggin-sun stroke-noggin-ink"
      />
      <g transform="rotate(-7 20 10)">
        <rect
          x="9.5"
          y="3.5"
          width="21"
          height="12.5"
          rx="2.5"
          strokeWidth="1.4"
          className="fill-noggin-tomato stroke-noggin-ink"
        />
        <text
          x="20"
          y="13.6"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="800"
          className="fill-noggin-ink"
        >
          ?
        </text>
      </g>
      <circle cx="14.5" cy="25.5" r="1.9" className="fill-noggin-ink" />
      <circle cx="25.5" cy="25.5" r="1.9" className="fill-noggin-ink" />
      <path
        d="M15.5 31 q4.5 3.4 9 0"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="stroke-noggin-ink"
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
      className="stroke-noggin-ink"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

// ---- How to play (hidden behind a button) ----

const STEPS: { title: string; body: string; chip: string; tilt: string }[] = [
  {
    title: "Pair up",
    body: "One of you starts a game. The other joins with the 4-letter code.",
    chip: "bg-noggin-sun",
    tilt: "-rotate-4",
  },
  {
    title: "Pick the words",
    body: "Whoever made the room types what the words should be, like “Disney movies” or “a number from 1 to 100”. Claude picks one for each of you. Then hit Start.",
    chip: "bg-noggin-tomato",
    tilt: "rotate-3",
  },
  {
    title: "Forehead time",
    body: "Turn your phone sideways, top on the left, and hold it to your forehead with the screen facing out.",
    chip: "bg-noggin-cobalt text-white",
    tilt: "-rotate-3",
  },
  {
    title: "Ask yes or no",
    body: "Take turns asking questions. Guess yours first, then tap “I got it!” With “Listen for my word” on, you can just say your word out loud instead. Careful: if your friend blurts it out, that counts too!",
    chip: "bg-white",
    tilt: "rotate-4",
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
        className={`${iconBtn} text-[22px] font-extrabold`}
        aria-label="How to play"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        ?
      </button>

      {open && (
        <div className="text-noggin-ink fixed inset-0 z-60 flex flex-col justify-end">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close how to play"
            className="bg-noggin-ink/55 absolute inset-0 animate-[noggin-fade_0.2s_ease-out]"
            onClick={close}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="noggin-how"
            className="bg-noggin-bg border-noggin-ink relative mx-auto w-full max-w-120 animate-[noggin-sheet_0.28s_cubic-bezier(0.2,0.9,0.3,1.1)] rounded-t-[30px] border-3 border-b-0 px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
          >
            <span
              className="mx-auto mb-3.5 block h-1.25 w-11 rounded bg-[#d6c9ae]"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <h2
                id="noggin-how"
                className="text-[32px] font-extrabold tracking-[-0.03em]"
              >
                How to play
              </h2>
              <button
                ref={closeRef}
                type="button"
                className={`${iconBtn} h-11! w-11!`}
                aria-label="Close"
                onClick={close}
              >
                <Icon d="M6 6l12 12M18 6L6 18" size={18} />
              </button>
            </div>

            <ol className="mt-5 space-y-4">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3.5">
                  <span
                    className={`border-noggin-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2.5px] text-[19px] font-extrabold ${step.chip} ${step.tilt}`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-extrabold">{step.title}</p>
                    <p className="text-noggin-muted mt-0.5 text-base leading-snug">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              className={`${inkBtn} bg-noggin-sun mt-6 h-15 text-xl shadow-[0_5px_0_var(--color-noggin-ink)]`}
              onClick={close}
            >
              Let&apos;s play
            </button>
          </section>
        </div>
      )}
    </>
  );
}

// ---- In a room ----

function RoomView({
  room,
  onLeave,
}: {
  room: NogginRoom;
  onLeave: (error?: string | null) => void;
}) {
  const snap = useSyncExternalStore(
    room.subscribe,
    room.getSnapshot,
    room.getSnapshot,
  );

  useEffect(() => {
    if (snap.status === "failed") onLeave(snap.error);
  }, [snap.status, snap.error, onLeave]);

  const phase = snap.state?.phase;
  useWakeLock(phase === "countdown" || phase === "playing");
  const voice = useVoiceSetting();

  if (!snap.state) {
    return (
      <main className="text-noggin-muted flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
        <Mascot className="h-20 w-20 animate-[noggin-bob_1.2s_ease-in-out_infinite]" />
        <p className="text-noggin-ink text-xl font-bold">
          {snap.role === "host" ? "Making a room…" : `Joining ${snap.code}…`}
        </p>
        <button
          type="button"
          className={`mt-2 text-base font-semibold underline underline-offset-4 ${focusRing}`}
          onClick={() => onLeave()}
        >
          Cancel
        </button>
      </main>
    );
  }

  const { state } = snap;
  if (state.phase === "picking") return <Picking prompt={state.prompt} />;
  if (state.phase === "countdown") return <Countdown key={state.round} />;
  if (state.phase === "playing")
    return (
      <Playing
        state={state}
        role={snap.role}
        listen={voice.on}
        onGotIt={() => room.dispatch({ type: "gotIt" })}
      />
    );
  if (state.phase === "done")
    return (
      <Result
        state={state}
        role={snap.role}
        onAgain={() => room.dispatch({ type: "lobby" })}
        onLeave={() => onLeave()}
      />
    );
  return (
    <Lobby
      snap={snap}
      state={state}
      room={room}
      voice={voice}
      onLeave={() => onLeave()}
    />
  );
}

const TILE_STYLE = [
  "bg-noggin-sun -rotate-5",
  "bg-white rotate-3",
  "bg-noggin-sun -rotate-2",
  "bg-white rotate-5",
];

function Lobby({
  snap,
  state,
  room,
  voice,
  onLeave,
}: {
  voice: VoiceSetting;
  snap: RoomSnapshot;
  state: GameState;
  room: NogginRoom;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const me = snap.role;
  const them: Role = me === "host" ? "guest" : "host";
  const ready = state.players.guest !== null;
  const needsPrompt = !state.prompt.trim();
  const hostName = state.players.host;

  const share = async () => {
    const url = `${window.location.origin}/projects/noggin?room=${snap.code}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Play Noggin with me", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <main className={screen}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className={iconBtn}
          aria-label="Leave room"
          onClick={onLeave}
        >
          <Icon d="M6 6l12 12M18 6L6 18" size={20} />
        </button>
        <HelpButton />
      </div>

      <div className="mt-1 text-center">
        <p className={label}>Room code</p>
        <p className="sr-only">{snap.code.split("").join(" ")}</p>
        <div className="mt-3 flex justify-center gap-2.5" aria-hidden="true">
          {snap.code.split("").map((ch, i) => (
            <span
              key={i}
              className={`border-noggin-ink flex h-19 w-16 items-center justify-center rounded-2xl border-3 text-[46px] leading-none font-extrabold shadow-[0_5px_0_var(--color-noggin-ink)] ${TILE_STYLE[i]}`}
            >
              {ch}
            </span>
          ))}
        </div>
        <button
          type="button"
          className={`border-noggin-ink mt-5 inline-flex h-11 items-center gap-2 rounded-full border-[2.5px] bg-white px-4.5 text-base font-bold shadow-[0_3px_0_var(--color-noggin-ink)] ${press} ${focusRing}`}
          onClick={share}
        >
          <Icon
            d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"
            size={18}
          />
          {copied ? "Link copied!" : "Share invite"}
        </button>
      </div>

      {snap.notice && (
        <p
          role="status"
          className="bg-noggin-sun/45 mt-6 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold"
        >
          {snap.notice}
          <button
            type="button"
            aria-label="Dismiss"
            className={`text-xl leading-none ${focusRing}`}
            onClick={() => room.clearNotice()}
          >
            ×
          </button>
        </p>
      )}

      <div className="relative mt-7">
        <ul className="grid grid-cols-2 gap-3" aria-label="Players">
          <PlayerCard
            role={me}
            name={state.players[me]}
            wins={state.round > 0 ? state.score[me] : null}
            you
          />
          <PlayerCard
            role={them}
            name={state.players[them]}
            wins={state.round > 0 ? state.score[them] : null}
          />
        </ul>
        <span
          className="bg-noggin-sun border-noggin-ink absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-[60%] -rotate-8 items-center justify-center rounded-full border-3 text-[15px] font-extrabold"
          aria-hidden="true"
        >
          VS
        </span>
      </div>

      {me === "host" ? (
        <PromptField
          value={state.prompt}
          onChange={(prompt) => room.dispatch({ type: "prompt", prompt })}
        />
      ) : (
        <PromptPreview prompt={state.prompt} hostName={hostName} />
      )}
      {state.pickError && (
        <p
          role="alert"
          className="bg-noggin-tomato/15 mt-3 rounded-2xl border-2 border-[#b3311a]/30 px-4 py-3 text-[15px] font-semibold text-[#9c2a14]"
        >
          {state.pickError}
        </p>
      )}

      <VoiceToggle voice={voice} />

      <button
        type="button"
        className={`${hugeBtn} bg-noggin-tomato mt-auto`}
        disabled={!ready || needsPrompt}
        onClick={() => room.dispatch({ type: "start" })}
      >
        {!ready
          ? "Waiting for a friend…"
          : needsPrompt
            ? me === "host"
              ? "Type what to guess"
              : `Waiting for ${hostName}…`
            : "Start!"}
      </button>
    </main>
  );
}

function VoiceToggle({ voice }: { voice: VoiceSetting }) {
  const note = !voice.supported
    ? "Not available in this browser. Try Chrome or Safari."
    : voice.blocked
      ? "Mic is blocked. Allow it in your browser settings."
      : "Say your word out loud and your phone hears it. No tapping needed.";
  return (
    <label
      className={`has-focus-visible:outline-noggin-cobalt mt-6 mb-8 flex items-center gap-3.5 rounded-[22px] border-3 p-3.5 has-focus-visible:outline-3 has-focus-visible:outline-offset-3 ${
        voice.supported
          ? "border-noggin-ink cursor-pointer bg-white"
          : "border-noggin-line bg-white/60"
      }`}
    >
      <span
        className={`border-noggin-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[2.5px] ${voice.on ? "bg-noggin-sun" : "bg-noggin-bg"}`}
        aria-hidden="true"
      >
        <MicIcon className="stroke-noggin-ink h-5.5 w-5.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg leading-tight font-extrabold">
          Listen for my word
        </span>
        <span className="text-noggin-muted mt-0.5 block text-sm leading-snug font-semibold">
          {note}
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        className="sr-only"
        checked={voice.on}
        disabled={!voice.supported}
        onChange={(e) => void voice.toggle(e.target.checked)}
      />
      <span
        className={`border-noggin-ink relative h-8 w-14 shrink-0 rounded-full border-[2.5px] transition-colors ${voice.on ? "bg-noggin-cobalt" : "bg-noggin-line"}`}
        aria-hidden="true"
      >
        <span
          className={`border-noggin-ink absolute top-0.5 left-0.5 h-5.5 w-5.5 rounded-full border-[2.5px] bg-white transition-transform ${voice.on ? "translate-x-6" : ""}`}
        />
      </span>
    </label>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
    </svg>
  );
}

function PlayerCard({
  role,
  name,
  wins,
  you,
}: {
  role: Role;
  name: string | null;
  /** Null before the first round, when there's no score to show yet. */
  wins: number | null;
  you?: boolean;
}) {
  if (!name) {
    return (
      <li className="flex flex-col items-center gap-2 rounded-[22px] border-3 border-dashed border-[#c9b994] px-3 py-4">
        <span
          className="bg-noggin-line h-14 w-14 animate-pulse rounded-full"
          aria-hidden="true"
        />
        <span className="text-noggin-muted text-[17px] font-bold">
          Waiting…
        </span>
        <span className="text-noggin-muted text-[13px] font-bold">
          share the code
        </span>
      </li>
    );
  }
  return (
    <li className="border-noggin-ink flex animate-[noggin-pop_0.4s_ease-out] flex-col items-center gap-2 rounded-[22px] border-3 bg-white px-3 py-4 shadow-[0_5px_0_var(--color-noggin-ink)]">
      <span
        className={`border-noggin-ink flex h-14 w-14 items-center justify-center rounded-full border-3 text-[26px] font-extrabold ${PLAYER_BG[role]}`}
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="max-w-full truncate text-[19px] font-extrabold">
        {name}
      </span>
      <span className="text-noggin-muted text-[13px] font-bold">
        {you ? "you" : "ready"}
        {wins !== null && ` · ${wins} ${wins === 1 ? "win" : "wins"}`}
      </span>
    </li>
  );
}

const PROMPT_IDEAS = [
  "A number from 1 to 100",
  "Celebs born after 1990",
  "Disney movies",
  "Animals",
  "Foods",
];

/** The room creator's prompt box: what kind of words Claude should pick. */
function PromptField({
  value,
  onChange,
}: {
  value: string;
  onChange: (prompt: string) => void;
}) {
  return (
    <div className="mt-7">
      <label htmlFor="noggin-prompt" className={`${label} mb-2`}>
        Pick a topic
      </label>
      <input
        id="noggin-prompt"
        className={input}
        value={value}
        maxLength={PROMPT_MAX}
        autoComplete="off"
        enterKeyHint="done"
        placeholder="Any topic you like"
        aria-describedby="noggin-prompt-hint"
        onChange={(e) => onChange(e.target.value)}
      />
      <p
        id="noggin-prompt-hint"
        className="text-noggin-muted mt-1.5 flex items-center gap-1.5 pl-1 text-[13px] leading-snug"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0 fill-current"
          aria-hidden="true"
        >
          <path d="M10 2l1.8 6.2L18 10l-6.2 1.8L10 18l-1.8-6.2L2 10l6.2-1.8zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" />
        </svg>
        Claude picks the word from your topic.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PROMPT_IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            className={`border-noggin-line h-9 rounded-full border-2 bg-white px-3.5 text-sm font-bold transition active:scale-95 ${focusRing}`}
            onClick={() => onChange(idea)}
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}

/** What the guest sees while the room's creator writes the prompt. */
function PromptPreview({
  prompt,
  hostName,
}: {
  prompt: string;
  hostName: string;
}) {
  return (
    <div className="mt-7">
      <p className={`${label} mb-2`}>Topic</p>
      <p
        aria-live="polite"
        className={`flex min-h-15 items-center rounded-[18px] border-3 px-4.5 py-3 text-xl leading-snug font-bold ${
          prompt.trim()
            ? "border-noggin-ink bg-white"
            : "border-noggin-line text-noggin-muted border-dashed"
        }`}
      >
        {prompt.trim() || `${hostName} is choosing…`}
      </p>
    </div>
  );
}

// ---- Full-screen game views ----

function Fullscreen({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Picking({ prompt }: { prompt: string }) {
  return (
    <Fullscreen className="bg-noggin-sun text-noggin-ink text-center">
      <Mascot className="h-28 w-28 animate-[noggin-bob_1.2s_ease-in-out_infinite]" />
      <p
        className="mt-5 text-[32px] leading-[1.05] font-extrabold tracking-[-0.02em]"
        role="status"
      >
        Thinking up words…
      </p>
      <p className="text-noggin-ink/80 mt-3 max-w-72 text-lg leading-snug font-semibold text-balance">
        “{prompt}”
      </p>
    </Fullscreen>
  );
}

function Countdown() {
  const [n, setN] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      // Hold at 1 until the host's "go" arrives so both phones flip together.
      setN(
        Math.max(
          1,
          COUNTDOWN_SECONDS - Math.floor((Date.now() - start) / 1000),
        ),
      );
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <Fullscreen className="bg-noggin-sun text-noggin-ink text-center landscape:flex-row landscape:gap-10">
      <div className="flex flex-col items-center landscape:max-w-80 landscape:items-start landscape:text-left">
        <p className="text-[32px] leading-[1.05] font-extrabold tracking-[-0.02em]">
          <span className="landscape:hidden">Turn it sideways!</span>
          <span className="portrait:hidden">Up on your forehead!</span>
        </p>
        <SidewaysPhone className="my-5 h-32 w-32 landscape:hidden" />
        <p className="text-noggin-ink/80 mt-2 max-w-72 text-lg leading-snug font-semibold text-balance landscape:mt-3">
          <span className="landscape:hidden">
            Top of your phone on the{" "}
            <strong className="text-noggin-ink">left</strong>, then hold it to
            your forehead.
          </span>
          <span className="portrait:hidden">
            Screen facing out. No peeking.
          </span>
        </p>
      </div>
      <p
        key={n}
        className="animate-[noggin-pop_0.5s_ease-out] text-[min(40vw,24dvh)] leading-none font-extrabold tracking-[-0.05em] tabular-nums landscape:text-[min(60dvh,40vw)]"
        aria-live="assertive"
      >
        {n}
      </p>
    </Fullscreen>
  );
}

/** A phone turning a quarter turn to the left, with its top marked, so it's clear which way to hold it. */
function SidewaysPhone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path
        d="M98 34 A46 46 0 0 0 34 18"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 9"
        className="stroke-noggin-ink"
      />
      <path
        d="M40 9 L31 18 L42 25"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-noggin-ink"
      />
      <g className="origin-center animate-[noggin-turn_2.4s_ease-in-out_infinite]">
        <rect
          x="38"
          y="24"
          width="44"
          height="76"
          rx="9"
          strokeWidth="4"
          className="stroke-noggin-ink fill-white"
        />
        <rect
          x="52"
          y="30"
          width="16"
          height="4"
          rx="2"
          className="fill-noggin-ink"
        />
        <text
          x="60"
          y="49"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          className="fill-noggin-tomato"
        >
          TOP
        </text>
        <rect
          x="47"
          y="58"
          width="26"
          height="26"
          rx="5"
          className="fill-noggin-tomato"
        />
      </g>
    </svg>
  );
}

function usePortrait() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(orientation: portrait)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(orientation: portrait)").matches,
    () => true,
  );
}

function Playing({
  state,
  role,
  listen,
  onGotIt,
}: {
  state: GameState;
  role: Role;
  listen: boolean;
  onGotIt: () => void;
}) {
  const word = state.words?.[role] ?? "";
  const hearing = useListenFor(word, listen, onGotIt);
  // The word is always laid out sideways, like holding the phone up on your
  // forehead. With rotation lock on the page stays portrait, so turn it ourselves
  // (a quarter turn right, which reads upright once the top of the phone is on the left).
  const rotated = usePortrait();
  // Numbers are short, so they can go even bigger.
  const fitRef = useFitText<HTMLParagraphElement>(
    word,
    /^\d{1,3}$/.test(word) ? "min(60vmin, 40vmax)" : "min(13vmax, 24vmin)",
    rotated,
  );

  useEffect(() => {
    navigator.vibrate?.(150);
  }, []);

  return (
    <Fullscreen className={PLAYER_BG[role]}>
      <div
        className={`absolute flex flex-col items-center px-6 py-5 ${
          rotated
            ? "top-1/2 left-1/2 h-[100vw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 rotate-90"
            : "inset-0 pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))]"
        }`}
      >
        <div className="flex items-center gap-3">
          <p className="text-sm font-extrabold tracking-[0.18em] uppercase">
            Noggin · {state.label ?? "Guess it"}
          </p>
          {hearing !== "off" && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-1 text-xs font-extrabold tracking-[0.1em] uppercase"
            >
              <MicIcon className="h-3.5 w-3.5 stroke-current" />
              {hearing === "listening" ? "Listening" : "Mic blocked"}
              {hearing === "listening" && (
                <span
                  className="h-2 w-2 animate-pulse rounded-full bg-current"
                  aria-hidden="true"
                />
              )}
            </span>
          )}
        </div>

        <div className="flex min-h-0 w-full flex-1 items-center">
          <p
            ref={fitRef}
            className="w-full animate-[noggin-pop_0.5s_ease-out] text-center leading-[0.92] font-extrabold tracking-[-0.03em] text-balance"
          >
            {word}
          </p>
        </div>

        <button
          type="button"
          onClick={onGotIt}
          className={`${btn} border-noggin-ink text-noggin-ink focus-visible:outline-noggin-ink h-16 w-full max-w-sm shrink-0 rounded-3xl bg-white text-2xl shadow-[0_6px_0_var(--color-noggin-ink)] active:shadow-[0_1px_0_var(--color-noggin-ink)]`}
        >
          I got it!
        </button>
      </div>
    </Fullscreen>
  );
}

const CONFETTI = [
  "top-[9%] left-[9%] h-5.5 w-5.5 rotate-20 rounded bg-noggin-sun",
  "top-[15%] right-[10%] h-4.5 w-4.5 rounded-full bg-noggin-tomato",
  "top-[7%] right-[25%] h-2.5 w-7 -rotate-24 rounded-md bg-[#6d8bff]",
  "top-[25%] left-[14%] h-3 w-3 rounded-full bg-[#6d8bff]",
  "top-[28%] right-[15%] h-2.5 w-6 rotate-34 rounded-md bg-noggin-sun",
];

function Result({
  state,
  role,
  onAgain,
  onLeave,
}: {
  state: GameState;
  role: Role;
  onAgain: () => void;
  onLeave: () => void;
}) {
  const them: Role = role === "host" ? "guest" : "host";
  const won = state.winner === role;
  const winnerName = state.winner ? state.players[state.winner] : null;

  return (
    <Fullscreen className="bg-noggin-ink text-white">
      {won &&
        CONFETTI.map((c) => (
          <span key={c} className={`absolute ${c}`} aria-hidden="true" />
        ))}
      <div className="flex w-full max-w-100 flex-1 flex-col pt-[max(4rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="my-auto animate-[noggin-pop_0.45s_ease-out] text-center">
          {won ? (
            <svg
              viewBox="0 0 52 44"
              className="mx-auto h-22 w-26"
              aria-hidden="true"
            >
              <path
                d="M4 14l11 9 11-19 11 19 11-9-5 26H9z"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="fill-noggin-sun stroke-white"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 40 40"
              className="mx-auto h-24 w-24"
              aria-hidden="true"
            >
              <circle
                cx="20"
                cy="20"
                r="17"
                strokeWidth="2"
                className="fill-noggin-sun stroke-white"
              />
              <circle cx="14" cy="17" r="2" className="fill-noggin-ink" />
              <circle cx="26" cy="17" r="2" className="fill-noggin-ink" />
              <path
                d="M14 28 q6 -4 12 0"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="stroke-noggin-ink"
              />
            </svg>
          )}
          <h2 className="mt-4 text-[56px] leading-[0.95] font-extrabold tracking-[-0.04em] break-words">
            {won ? "You win!" : `${winnerName} wins!`}
          </h2>
          <p className="mt-3 text-lg text-[#d9d2c4]">
            {won ? "Big brain. Huge noggin." : "So close. Run it back?"}
          </p>

          <div
            className="mt-8 flex items-center justify-center gap-4"
            aria-label={`Score: you ${state.score[role]}, ${state.players[them]} ${state.score[them]}`}
          >
            <ScoreChip role={role} name="You" wins={state.score[role]} />
            <span
              className="text-2xl font-extrabold text-[#d9d2c4]"
              aria-hidden="true"
            >
              –
            </span>
            <ScoreChip
              role={them}
              name={state.players[them] ?? ""}
              wins={state.score[them]}
            />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-left">
            {[role, them].map((r) => (
              <div
                key={r}
                className={`rounded-[20px] border-3 border-white p-4 ${PLAYER_BG[r]}`}
              >
                <dt className="text-sm font-bold">
                  {r === role ? "You were" : `${state.players[r]} was`}
                </dt>
                <dd className="mt-1.5 text-[26px] leading-none font-extrabold break-words">
                  {state.words?.[r]}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          type="button"
          onClick={onAgain}
          className={`${btn} bg-noggin-sun text-noggin-ink h-17 w-full border-white text-[23px] shadow-[0_6px_0_white] focus-visible:outline-white active:shadow-[0_1px_0_white]`}
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="mt-2 h-12 w-full text-[17px] font-bold text-[#d9d2c4] focus-visible:outline-3 focus-visible:outline-white"
        >
          Leave room
        </button>
      </div>
    </Fullscreen>
  );
}

function ScoreChip({
  role,
  name,
  wins,
}: {
  role: Role;
  name: string;
  wins: number;
}) {
  return (
    <div
      className="flex min-w-0 flex-col items-center gap-1.5"
      aria-hidden="true"
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-white text-[34px] leading-none font-extrabold tabular-nums ${PLAYER_BG[role]}`}
      >
        {wins}
      </span>
      <span className="max-w-24 truncate text-sm font-bold text-[#d9d2c4]">
        {name}
      </span>
    </div>
  );
}

/**
 * Shrinks the text until its widest line fits and it isn't taller than its box,
 * so long names stay as big as possible without clipping.
 * `rotated` means the text is turned a quarter turn, so its on-screen line width is a rect's height.
 */
function useFitText<T extends HTMLElement>(
  text: string,
  maxSize: string,
  rotated = false,
) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = maxSize;
      const range = document.createRange();
      range.selectNodeContents(el);
      const box = el.parentElement;
      for (let i = 0; i < 40; i++) {
        const widest = Math.max(
          ...Array.from(range.getClientRects(), (r) =>
            rotated ? r.height : r.width,
          ),
        );
        const tooTall = box !== null && el.offsetHeight > box.clientHeight;
        if (widest <= el.clientWidth && !tooTall) break;
        el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * 0.94}px`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [text, maxSize, rotated]);
  return ref;
}

// ---- Listen for my word ----

/** Just the parts of the Web Speech API's SpeechRecognition this uses (TypeScript doesn't ship its types). */
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

type VoiceSetting = {
  supported: boolean;
  on: boolean;
  blocked: boolean;
  toggle: (on: boolean) => Promise<void>;
};

/**
 * This phone's "Listen for my word" switch, remembered between games. Turning it on
 * asks for the mic right away, in the lobby, so the permission prompt doesn't
 * pop up once the phone is on someone's forehead.
 */
function useVoiceSetting(): VoiceSetting {
  const [supported] = useState(() => recognitionCtor() !== undefined);
  const [on, setOn] = useState(() => {
    try {
      return supported && localStorage.getItem(VOICE_KEY) === "on";
    } catch {
      return false;
    }
  });
  const [blocked, setBlocked] = useState(false);

  const toggle = async (next: boolean) => {
    if (next) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        setBlocked(false);
      } catch {
        setBlocked(true);
        next = false;
      }
    }
    setOn(next);
    try {
      localStorage.setItem(VOICE_KEY, next ? "on" : "off");
    } catch {}
  };

  return { supported, on, blocked, toggle };
}

/** Listens while `active` and calls `onHeard` once when `word` is said. */
function useListenFor(
  word: string,
  active: boolean,
  onHeard: () => void,
): "off" | "listening" | "blocked" {
  const [status, setStatus] = useState<"off" | "listening" | "blocked">("off");
  const onHeardRef = useRef(onHeard);
  useEffect(() => {
    onHeardRef.current = onHeard;
  });

  useEffect(() => {
    const Ctor = recognitionCtor();
    if (!active || !Ctor || !word) return;

    let done = false;
    let restart: ReturnType<typeof setTimeout> | undefined;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 3;

    rec.onstart = () => setStatus("listening");
    rec.onresult = (e) => {
      if (done) return;
      const results = Array.from(e.results);
      // Check every alternative of every phrase, plus the whole thing joined
      // up, in case a name got split across two phrases.
      const heard =
        results.some((alts) =>
          Array.from(alts).some((a) => heardWord(a.transcript, word)),
        ) ||
        heardWord(results.map((alts) => alts[0]?.transcript).join(" "), word);
      if (!heard) return;
      done = true;
      rec.abort();
      onHeardRef.current();
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        done = true;
        setStatus("blocked");
      }
    };
    // Browsers stop listening after a pause, so keep starting it again.
    rec.onend = () => {
      if (done) return;
      restart = setTimeout(() => {
        try {
          rec.start();
        } catch {}
      }, 250);
    };

    try {
      rec.start();
    } catch {}
    return () => {
      done = true;
      clearTimeout(restart);
      rec.abort();
    };
  }, [word, active]);

  return active ? status : "off";
}

/** Keep the screen awake while the phone is on someone's forehead. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    navigator.wakeLock
      .request("screen")
      .then((l) => {
        if (cancelled) void l.release();
        else lock = l;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      void lock?.release();
    };
  }, [active]);
}
