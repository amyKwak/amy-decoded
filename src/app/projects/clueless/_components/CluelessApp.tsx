"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { TOPIC_MAX } from "@/lib/clueless/deck";
import { readTilt, type Move, type TiltState } from "@/lib/clueless/tilt";

// ---- Shared styles ----

const display = "font-(family-name:--font-unbounded)";
const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-clue-grape";
const press =
  "transition-[translate,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_var(--color-clue-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";
const bigBtn = `inline-flex h-15 w-full shrink-0 items-center justify-center rounded-[18px] border-3 border-clue-ink px-6 text-lg font-extrabold shadow-[0_5px_0_var(--color-clue-ink)] ${press} ${focusRing}`;
const iconBtn = `flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-3 border-clue-ink bg-white shadow-[0_4px_0_var(--color-clue-ink)] ${press} ${focusRing}`;
const label =
  "block text-[13px] font-extrabold uppercase tracking-[0.12em] text-clue-muted";
const screen =
  "relative mx-auto flex w-full max-w-120 flex-1 flex-col px-6 pt-5 pb-5 tablet:pt-10 [@media(max-height:620px)]:pb-3";

const DURATIONS = [30, 60, 90] as const;
type Duration = (typeof DURATIONS)[number];
const COUNTDOWN_SECONDS = 5;
/** How long the "Got it" / "Pass" flash shows before the next word. */
const FLASH_MS = 700;
const TOPIC_KEY = "clueless:topic";
const DURATION_KEY = "clueless:duration";

const TOPIC_IDEAS = [
  "Disney movies",
  "Animals",
  "Celebs born after 1990",
  "Famous landmarks",
  "Foods",
];

/** null means the timer ran out while the word was showing. */
type Result = { word: string; got: boolean | null };
type Sensor = "unknown" | "on" | "off";
type Phase =
  | { name: "setup"; error: string | null }
  | { name: "loading" }
  | { name: "ready" }
  | { name: "countdown" }
  | { name: "playing" }
  | { name: "results"; results: Result[] };

const noopSubscribe = () => () => {};

export function CluelessApp() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return null;
  return <Game />;
}

function Game() {
  // Only rendered after hydration, so these can read the browser directly.
  const [topic, setTopic] = useState(() => readStored(TOPIC_KEY) ?? "");
  const [duration, setDuration] = useState<Duration>(() => {
    const saved = Number(readStored(DURATION_KEY));
    return (DURATIONS as readonly number[]).includes(saved)
      ? (saved as Duration)
      : 60;
  });
  const [phase, setPhase] = useState<Phase>({ name: "setup", error: null });
  const [deck, setDeck] = useState<{ label: string; words: string[] } | null>(
    null,
  );
  const [sensor, setSensor] = useState<Sensor>("unknown");
  // Every word shown this visit, so new decks don't repeat them.
  const used = useRef<string[]>([]);

  useWakeLock(phase.name === "countdown" || phase.name === "playing");

  const buildDeck = async () => {
    const clean = topic.trim();
    if (!clean) return;
    store(TOPIC_KEY, clean);
    store(DURATION_KEY, String(duration));
    unlockSound();
    // iOS only shows the motion permission prompt from a tap, so ask now.
    if (sensor === "unknown") void askForMotion().then(setSensor);

    setPhase({ name: "loading" });
    try {
      const res = await fetch("/api/clueless/deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: clean, avoid: used.current }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data?.words)) {
        throw new Error(data?.error ?? "Couldn't build a deck just now.");
      }
      setDeck({ label: data.label, words: data.words });
      setPhase({ name: "ready" });
    } catch (err) {
      const error =
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Couldn't reach the deck builder. Check your connection.";
      setPhase({ name: "setup", error });
    }
  };

  const finish = (results: Result[]) => {
    used.current = [...used.current, ...results.map((r) => r.word)].slice(-80);
    setPhase({ name: "results", results });
  };

  switch (phase.name) {
    case "setup":
      return (
        <Setup
          topic={topic}
          duration={duration}
          error={phase.error}
          onTopic={setTopic}
          onDuration={setDuration}
          onStart={buildDeck}
        />
      );
    case "loading":
      return <Loading topic={topic} />;
    case "ready":
      return (
        <Ready
          label={deck?.label ?? topic}
          duration={duration}
          sensor={sensor}
          onReady={() => setPhase({ name: "countdown" })}
          onBack={() => setPhase({ name: "setup", error: null })}
        />
      );
    case "countdown":
      return <Countdown onDone={() => setPhase({ name: "playing" })} />;
    case "playing":
      return (
        <Playing
          words={deck?.words ?? []}
          label={deck?.label ?? topic}
          duration={duration}
          onFinish={finish}
        />
      );
    case "results":
      return (
        <Results
          results={phase.results}
          label={deck?.label ?? topic}
          onAgain={buildDeck}
          onNewTopic={() => setPhase({ name: "setup", error: null })}
        />
      );
  }
}

// ---- Setup ----

function Setup({
  topic,
  duration,
  error,
  onTopic,
  onDuration,
  onStart,
}: {
  topic: string;
  duration: Duration;
  error: string | null;
  onTopic: (topic: string) => void;
  onDuration: (duration: Duration) => void;
  onStart: () => void;
}) {
  return (
    <main className={screen}>
      <div className="tablet:top-10 absolute top-5 right-6">
        <HelpButton />
      </div>

      {/* Fills the space above the form, so the logo sits centered in it. */}
      <div className="flex flex-1 flex-col items-center justify-center pt-2 text-center">
        <Logo className="h-20 w-20 animate-[noggin-bob_2.6s_ease-in-out_infinite] [@media(max-height:620px)]:h-14 [@media(max-height:620px)]:w-14 [@media(min-height:760px)]:h-28 [@media(min-height:760px)]:w-28" />
        <h1
          className={`${display} mt-2 text-[40px] leading-none font-extrabold tracking-[-0.03em] [@media(max-height:620px)]:text-[34px] [@media(min-height:760px)]:text-5xl`}
        >
          Clueless
        </h1>
        <p className="text-clue-muted mt-2.5 max-w-72 text-[17px] leading-snug text-balance [@media(max-height:620px)]:hidden">
          Your friends give the clues. You guess the word on your forehead.
        </p>
      </div>

      <form
        className="flex flex-col pt-4 [@media(max-height:620px)]:pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          onStart();
        }}
      >
        <label htmlFor="clue-topic" className={`${label} mb-2`}>
          Pick a topic
        </label>
        <input
          id="clue-topic"
          className="border-clue-line placeholder:text-clue-muted/70 focus:border-clue-ink h-14 w-full rounded-[18px] border-3 bg-white px-4.5 text-xl font-semibold outline-none"
          value={topic}
          maxLength={TOPIC_MAX}
          autoComplete="off"
          enterKeyHint="go"
          placeholder="Any topic you like"
          aria-describedby="clue-topic-hint"
          onChange={(e) => onTopic(e.target.value)}
        />
        <p
          id="clue-topic-hint"
          className="text-clue-muted mt-1.5 flex items-center gap-1.5 pl-1 text-[13px] leading-snug [@media(max-height:620px)]:hidden"
        >
          <Sparkle className="h-3.5 w-3.5 shrink-0 fill-current" />
          Claude builds a deck from your topic.
        </p>
        {/* One swipeable row of ideas keeps the screen short. */}
        <div className="-mx-6 mt-2.5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-6 py-0.5">
          {TOPIC_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              className={`border-clue-line h-9 shrink-0 rounded-full border-2 bg-white px-3.5 text-sm font-bold whitespace-nowrap transition active:scale-95 ${focusRing}`}
              onClick={() => onTopic(idea)}
            >
              {idea}
            </button>
          ))}
        </div>

        <fieldset className="mt-4 [@media(max-height:620px)]:mt-3">
          <legend className={`${label} mb-2`}>Round length</legend>
          <div className="bg-clue-line/60 grid grid-cols-3 gap-1 rounded-2xl p-1">
            {DURATIONS.map((d) => (
              <label
                key={d}
                className={`has-focus-visible:outline-clue-grape flex h-11 cursor-pointer items-center justify-center rounded-xl text-base font-extrabold transition has-focus-visible:outline-3 [@media(max-height:620px)]:h-10 ${
                  d === duration
                    ? "text-clue-ink bg-white shadow-[0_2px_0_var(--color-clue-ink)]"
                    : "text-clue-muted"
                }`}
              >
                <input
                  type="radio"
                  name="clue-duration"
                  className="sr-only"
                  checked={d === duration}
                  onChange={() => onDuration(d)}
                />
                {d} sec
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="bg-clue-tangerine/15 mt-4 rounded-2xl border-2 border-[#b4520f]/30 px-4 py-3 text-[15px] font-semibold text-[#8f3f08]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`${bigBtn} bg-clue-grape mt-4 text-white [@media(max-height:620px)]:h-14`}
          disabled={!topic.trim()}
        >
          {topic.trim() ? "Let's play" : "Pick a topic to start"}
        </button>
      </form>
    </main>
  );
}

function Loading({ topic }: { topic: string }) {
  return (
    <Fullscreen className="bg-clue-grape text-center text-white">
      <div className="relative h-28 w-28" aria-hidden="true">
        {["-rotate-12", "rotate-6", "-rotate-3"].map((tilt, i) => (
          <span
            key={tilt}
            className={`absolute inset-x-4 inset-y-1 animate-[noggin-bob_1.4s_ease-in-out_infinite] rounded-2xl border-3 border-white ${tilt} ${
              ["bg-clue-mint", "bg-clue-tangerine", "bg-clue-lemon"][i]
            }`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p
        role="status"
        className={`${display} mt-6 text-[28px] leading-tight font-extrabold`}
      >
        Shuffling your deck…
      </p>
      <p className="mt-2 max-w-72 text-lg leading-snug font-semibold text-balance text-white/85">
        “{topic.trim()}”
      </p>
    </Fullscreen>
  );
}

// ---- Before the round ----

function Ready({
  label: deckLabel,
  duration,
  sensor,
  onReady,
  onBack,
}: {
  label: string;
  duration: Duration;
  sensor: Sensor;
  onReady: () => void;
  onBack: () => void;
}) {
  return (
    <main className={screen}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className={iconBtn}
          aria-label="Change topic"
          onClick={onBack}
        >
          <Icon d="M15 5l-7 7 7 7" />
        </button>
        <HelpButton />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-2 text-center">
        <p className="bg-clue-grape rounded-full px-3.5 py-1.5 text-sm font-extrabold text-white">
          {deckLabel} · {duration} sec
        </p>
        <h1
          className={`${display} mt-4 text-[34px] leading-tight font-extrabold tracking-[-0.02em]`}
        >
          Get ready!
        </h1>
        <p className="text-clue-muted mt-2 max-w-72 text-[17px] leading-snug text-balance">
          Turn your phone sideways and hold it to your forehead, screen facing
          your friends.
        </p>

        <ul className="mt-5 grid w-full grid-cols-2 gap-3">
          <TiltCard move="correct" title="Tilt up" detail="Got it! +1 point" />
          <TiltCard move="pass" title="Tilt down" detail="Pass, next word" />
        </ul>

        {sensor === "off" && (
          <p className="bg-clue-lemon/50 mt-3 rounded-2xl px-4 py-2.5 text-[15px] leading-snug font-semibold">
            Tilt isn&apos;t available here, so tap Got it and Pass on screen
            instead.
          </p>
        )}
      </div>

      <button
        type="button"
        className={`${bigBtn} bg-clue-grape text-white`}
        onClick={onReady}
      >
        I&apos;m ready
      </button>
    </main>
  );
}

function TiltCard({
  move,
  title,
  detail,
}: {
  move: Move;
  title: string;
  detail: string;
}) {
  const up = move === "correct";
  return (
    <li
      className={`border-clue-ink flex flex-col items-center gap-2 rounded-[20px] border-3 px-3 py-4 shadow-[0_4px_0_var(--color-clue-ink)] ${
        up ? "bg-clue-mint" : "bg-clue-tangerine"
      }`}
    >
      <TiltPhone up={up} />
      <span className="text-lg leading-tight font-extrabold">{title}</span>
      <span className="text-sm leading-tight font-bold">{detail}</span>
    </li>
  );
}

/** A sideways phone rocking up or down, to show which way each move goes. */
function TiltPhone({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 64 48" className="h-12 w-16" aria-hidden="true">
      <path
        d={up ? "M32 4l-6 7h12z" : "M32 44l-6-7h12z"}
        className="fill-clue-ink"
      />
      <g
        className={`origin-center ${up ? "animate-[clue-rock-up_1.6s_ease-in-out_infinite]" : "animate-[clue-rock-down_1.6s_ease-in-out_infinite]"}`}
      >
        <rect
          x="12"
          y="15"
          width="40"
          height="18"
          rx="4"
          strokeWidth="3"
          className="stroke-clue-ink fill-white"
        />
        <rect
          x="16"
          y="22"
          width="3"
          height="4"
          rx="1.5"
          className="fill-clue-ink"
        />
      </g>
    </svg>
  );
}

function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(COUNTDOWN_SECONDS);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const left = COUNTDOWN_SECONDS - Math.floor((Date.now() - start) / 1000);
      if (left <= 0) {
        clearInterval(id);
        onDoneRef.current();
      } else {
        setN(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    beep(n === 1 ? [660] : [440], 0.08);
  }, [n]);

  return (
    <Fullscreen className="bg-clue-lemon text-clue-ink">
      <Sideways className="items-center justify-center gap-2 text-center">
        <p
          className={`${display} text-[min(7vmax,32px)] leading-tight font-extrabold`}
        >
          Phone to your forehead!
        </p>
        <p className="text-lg font-bold opacity-80">Screen facing out</p>
        <p
          key={n}
          className={`${display} animate-[noggin-pop_0.5s_ease-out] text-[min(42vmin,30vmax)] leading-none font-extrabold tabular-nums`}
          aria-live="assertive"
        >
          {n}
        </p>
      </Sideways>
    </Fullscreen>
  );
}

// ---- The round ----

function Playing({
  words,
  label: deckLabel,
  duration,
  onFinish,
}: {
  words: string[];
  label: string;
  duration: Duration;
  onFinish: (results: Result[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [flash, setFlash] = useState<Move | null>(null);
  const [left, setLeft] = useState<number>(duration);
  const endsAt = useRef(0);
  const done = useRef(false);
  const latest = useRef({ index, results, flash });
  useEffect(() => {
    latest.current = { index, results, flash };
  });
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const end = (final: Result[]) => {
    if (done.current) return;
    done.current = true;
    onFinishRef.current(final);
  };

  const move = (m: Move) => {
    const { index, results, flash } = latest.current;
    if (done.current || flash || index >= words.length) return;
    const next = [...results, { word: words[index], got: m === "correct" }];
    setResults(next);
    setFlash(m);
    beep(m === "correct" ? [660, 990] : [300], 0.12);
    navigator.vibrate?.(m === "correct" ? 60 : [30, 40, 30]);
    setTimeout(() => {
      if (done.current) return;
      if (index + 1 >= words.length) {
        end(next);
        return;
      }
      setFlash(null);
      setIndex(index + 1);
    }, FLASH_MS);
  };

  useTilt(true, move);

  // The clock. When it runs out, the word on screen counts as unanswered.
  useEffect(() => {
    endsAt.current = Date.now() + duration * 1000;
    const id = setInterval(() => {
      const secs = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setLeft(secs);
      if (secs > 0) return;
      clearInterval(id);
      beep([220, 165], 0.35);
      navigator.vibrate?.(300);
      const { index, results, flash } = latest.current;
      end(
        flash || index >= words.length
          ? results
          : [...results, { word: words[index], got: null }],
      );
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = results.filter((r) => r.got).length;
  const word = words[index] ?? "";
  const fitRef = useFitText<HTMLParagraphElement>(
    word,
    /^\d{1,3}$/.test(word) ? "min(55vmin, 36vmax)" : "min(12vmax, 22vmin)",
  );
  const urgent = left <= 10;

  return (
    <Fullscreen className="bg-clue-grape text-white">
      <Sideways className="px-6 py-4">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
          aria-hidden="true"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-linear ${urgent ? "bg-clue-tangerine" : "bg-white"}`}
            style={{ width: `${(left / duration) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="bg-clue-mint text-clue-ink rounded-full px-3 py-1 text-sm font-extrabold tabular-nums">
            {score} {score === 1 ? "point" : "points"}
          </p>
          <p className="min-w-0 truncate text-sm font-extrabold tracking-[0.14em] uppercase opacity-85">
            {deckLabel}
          </p>
          <p
            className={`${display} rounded-full px-3 py-1 text-sm font-extrabold tabular-nums ${urgent ? "bg-clue-tangerine text-clue-ink" : "bg-white/15"}`}
            aria-label={`${left} seconds left`}
          >
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </p>
        </div>

        <div className="flex min-h-0 w-full flex-1 items-center">
          <p
            key={index}
            ref={fitRef}
            className={`${display} w-full animate-[noggin-pop_0.35s_ease-out] text-center leading-[0.95] font-extrabold tracking-[-0.02em] text-balance`}
          >
            {word}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => move("pass")}
            className={`bg-clue-tangerine border-clue-ink text-clue-ink h-12 rounded-2xl border-3 px-5 text-base font-extrabold ${press} shadow-[0_4px_0_var(--color-clue-ink)] focus-visible:outline-3 focus-visible:outline-white`}
          >
            Pass
          </button>
          <p className="hidden text-center text-sm font-semibold opacity-75 min-[560px]:block">
            Tilt up: got it · Tilt down: pass
          </p>
          <button
            type="button"
            onClick={() => move("correct")}
            className={`bg-clue-mint border-clue-ink text-clue-ink h-12 rounded-2xl border-3 px-5 text-base font-extrabold ${press} shadow-[0_4px_0_var(--color-clue-ink)] focus-visible:outline-3 focus-visible:outline-white`}
          >
            Got it
          </button>
        </div>
      </Sideways>

      {flash && (
        <div
          className={`absolute inset-0 z-10 flex animate-[noggin-fade_0.12s_ease-out] items-center justify-center ${
            flash === "correct" ? "bg-clue-mint" : "bg-clue-tangerine"
          } text-clue-ink`}
          role="status"
        >
          <Sideways className="items-center justify-center">
            <p
              className={`${display} animate-[noggin-pop_0.3s_ease-out] text-[min(16vmax,30vmin)] leading-none font-extrabold`}
            >
              {flash === "correct" ? "Got it!" : "Pass"}
            </p>
          </Sideways>
        </div>
      )}
    </Fullscreen>
  );
}

// ---- After the round ----

function Results({
  results,
  label: deckLabel,
  onAgain,
  onNewTopic,
}: {
  results: Result[];
  label: string;
  onAgain: () => void;
  onNewTopic: () => void;
}) {
  const score = results.filter((r) => r.got).length;
  const answered = results.filter((r) => r.got !== null).length;

  return (
    <main className={`${screen} pb-0!`}>
      <div className="tablet:top-10 absolute top-5 right-6">
        <HelpButton />
      </div>

      <div className="animate-[noggin-pop_0.4s_ease-out] pt-2 text-center">
        <p className={label}>Time&apos;s up!</p>
        <p
          className={`${display} text-clue-grape mt-2 text-[88px] leading-none font-extrabold tabular-nums`}
        >
          {score}
        </p>
        <p className="mt-1 text-xl font-extrabold">
          {score === 1 ? "point" : "points"}
        </p>
        <p className="text-clue-muted mt-1 text-[15px] font-semibold">
          {deckLabel} · {score} of {answered} guessed
        </p>
      </div>

      <h2 className={`${label} mt-6 mb-2`}>Words you saw</h2>
      {results.length === 0 ? (
        <p className="text-clue-muted text-[15px]">
          No words this round. Try tilting sooner!
        </p>
      ) : (
        <ol className="flex flex-col gap-2 pb-4">
          {results.map((r, i) => (
            <li
              key={`${r.word}-${i}`}
              className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3.5 py-2 ${
                r.got
                  ? "border-clue-ink bg-white"
                  : "border-clue-line bg-white/50"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  r.got
                    ? "bg-clue-mint text-clue-ink"
                    : "bg-clue-line text-clue-muted"
                }`}
                aria-hidden="true"
              >
                <Icon
                  d={
                    r.got
                      ? "M5 12.5l4.5 4.5L19 7.5"
                      : r.got === false
                        ? "M5 12h11M12 7l5 5-5 5"
                        : "M12 7v5l3 2"
                  }
                  size={16}
                />
              </span>
              <span
                className={`min-w-0 flex-1 text-[17px] leading-tight ${
                  r.got ? "font-extrabold" : "text-clue-muted font-semibold"
                }`}
              >
                {r.word}
              </span>
              <span
                className={`shrink-0 text-xs font-extrabold tracking-[0.08em] uppercase ${r.got ? "text-[#0b7a54]" : "text-clue-muted"}`}
              >
                {r.got ? "+1" : r.got === false ? "Passed" : "Time"}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* Stays in reach while the list scrolls. */}
      <div className="from-clue-bg via-clue-bg sticky bottom-0 -mx-6 mt-auto flex flex-col gap-2.5 bg-gradient-to-t via-80% px-6 pt-4 pb-6">
        <button
          type="button"
          className={`${bigBtn} bg-clue-grape text-white`}
          onClick={onAgain}
        >
          Play again
        </button>
        <button
          type="button"
          className={`${bigBtn} h-12! bg-white text-base shadow-[0_3px_0_var(--color-clue-ink)]`}
          onClick={onNewTopic}
        >
          New topic
        </button>
      </div>
    </main>
  );
}

// ---- How to play ----

const STEPS: { title: string; body: string; chip: string }[] = [
  {
    title: "Pick a topic",
    body: "Type anything, like “90s cartoons”. Claude builds a deck of words for it.",
    chip: "bg-clue-lemon",
  },
  {
    title: "Phone to forehead",
    body: "Turn the phone sideways and hold it to your forehead, screen facing your friends.",
    chip: "bg-clue-grape text-white",
  },
  {
    title: "Friends give clues",
    body: "They act, hum, or describe the word without saying it. You guess.",
    chip: "bg-white",
  },
  {
    title: "Tilt to answer",
    body: "Tilt up when you get it for a point. Tilt down to pass. Beat the clock!",
    chip: "bg-clue-mint",
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
        <div className="text-clue-ink fixed inset-0 z-60 flex flex-col justify-end">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close how to play"
            className="bg-clue-ink/55 absolute inset-0 animate-[noggin-fade_0.2s_ease-out]"
            onClick={close}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="clue-how"
            className="bg-clue-bg border-clue-ink relative mx-auto w-full max-w-120 animate-[noggin-sheet_0.28s_cubic-bezier(0.2,0.9,0.3,1.1)] rounded-t-[30px] border-3 border-b-0 px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
          >
            <span
              className="bg-clue-line mx-auto mb-3.5 block h-1.25 w-11 rounded"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <h2
                id="clue-how"
                className={`${display} text-[26px] font-extrabold tracking-[-0.02em]`}
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
                    className={`border-clue-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2.5px] text-[19px] font-extrabold ${step.chip}`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-extrabold">{step.title}</p>
                    <p className="text-clue-muted mt-0.5 text-base leading-snug">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              className={`${bigBtn} bg-clue-lemon mt-6`}
              onClick={close}
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}

// ---- Pieces ----

function Fullscreen({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Lays its content out sideways, the way the phone is held on your forehead.
 * With rotation lock on the page stays portrait, so turn the content a
 * quarter turn ourselves; it reads upright once the top of the phone is on the left.
 */
function Sideways({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const rotated = usePortrait();
  return (
    <div
      className={`absolute flex flex-col ${
        rotated
          ? "top-1/2 left-1/2 h-[100vw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 rotate-90"
          : "inset-0 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M8 8h32a5 5 0 015 5v17a5 5 0 01-5 5H22l-9 8v-8H8a5 5 0 01-5-5V13a5 5 0 015-5z"
        strokeWidth="2.2"
        strokeLinejoin="round"
        className="fill-clue-grape stroke-clue-ink"
      />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="20"
        fontWeight="800"
        className="fill-white"
      >
        ?
      </text>
      <circle
        cx="41"
        cy="7"
        r="5"
        strokeWidth="2"
        className="fill-clue-lemon stroke-clue-ink"
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

// ---- Browser helpers ----

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/** Asks for tilt access where the browser needs it (iOS), from a tap. */
async function askForMotion(): Promise<Sensor> {
  if (typeof DeviceOrientationEvent === "undefined") return "off";
  const ask = (
    DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    }
  ).requestPermission;
  if (ask) {
    try {
      if ((await ask()) !== "granted") return "off";
    } catch {
      return "off";
    }
  }
  // Desktops have the event but never fire it with real angles.
  return new Promise((resolve) => {
    const onEvent = (e: DeviceOrientationEvent) => {
      window.removeEventListener("deviceorientation", onEvent);
      clearTimeout(timer);
      resolve(e.beta === null ? "off" : "on");
    };
    const timer = setTimeout(() => {
      window.removeEventListener("deviceorientation", onEvent);
      resolve("off");
    }, 1500);
    window.addEventListener("deviceorientation", onEvent);
  });
}

/** Calls `onMove` when the phone tilts up (got it) or down (pass). */
function useTilt(active: boolean, onMove: (move: Move) => void) {
  const onMoveRef = useRef(onMove);
  useEffect(() => {
    onMoveRef.current = onMove;
  });

  useEffect(() => {
    if (!active) return;
    let state: TiltState = { armed: false };
    const onEvent = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      const step = readTilt(state, e.beta, e.gamma);
      state = step.state;
      if (step.move) onMoveRef.current(step.move);
    };
    window.addEventListener("deviceorientation", onEvent);
    return () => window.removeEventListener("deviceorientation", onEvent);
  }, [active]);
}

let audio: AudioContext | null = null;

/** Browsers only allow sound after a tap, so this runs from the Start button. */
function unlockSound() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {}
}

/** A short tone, or a quick run of tones. */
function beep(freqs: number[], seconds: number) {
  if (!audio) return;
  freqs.forEach((freq, i) => {
    const osc = audio!.createOscillator();
    const gain = audio!.createGain();
    const at = audio!.currentTime + i * seconds;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + seconds);
    osc.connect(gain).connect(audio!.destination);
    osc.start(at);
    osc.stop(at + seconds);
  });
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

/**
 * Shrinks the text until its widest line fits and it isn't taller than its box,
 * so long words stay as big as possible without clipping. Measures layout
 * sizes, which ignore the quarter turn the sideways view may add.
 */
function useFitText<T extends HTMLElement>(text: string, maxSize: string) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = maxSize;
      const box = el.parentElement;
      for (let i = 0; i < 40; i++) {
        const tooWide = el.scrollWidth > el.clientWidth;
        const tooTall = box !== null && el.offsetHeight > box.clientHeight;
        if (!tooWide && !tooTall) break;
        el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * 0.94}px`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [text, maxSize]);
  return ref;
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
