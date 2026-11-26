"use client";

import { useEffect, useRef, useState } from "react";
import {
  CELLS,
  DIGITS,
  SYMBOLS,
  checkEquation,
  isSolved,
  randomEquation,
  score,
  toTiles,
  type Light,
  type Tile,
} from "@/lib/gods-plan/equation-traffic-light";
import { card, eyebrow, focusRing, primaryButton, secondaryButton, serif } from "../../_components/ui";

type Row = { tiles: Tile[]; lights: Light[] | null }; // null: missed the clock

const ROUND_SECONDS = 5 * 60; // the show gives five minutes to build and to guess

// Solid color only: green, sunlight and red are the only saturated colors in
// the game, so they read at a glance without extra marks.
const LIGHT_CLASS: Record<Light, string> = {
  green: "bg-gp-green text-white border-gp-green",
  yellow: "bg-gp-sun text-gp-ink border-gp-sun",
  red: "bg-gp-red text-white border-gp-red",
};

const LIGHT_NAME: Record<Light, string> = { green: "green", yellow: "sunlight", red: "red" };

function Cell({ tile, light, next }: { tile?: string; light?: Light; next?: boolean }) {
  const look = light
    ? LIGHT_CLASS[light]
    : next
      ? "border-gp-amethyst bg-white text-gp-ink"
      : tile
        ? "border-gp-ink bg-white text-gp-ink"
        : "border-gp-line bg-white text-gp-ink";
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-[10px] border-2 text-xl font-bold tablet:text-2xl ${look}`}
    >
      {tile ?? ""}
    </div>
  );
}

function Cells({
  tiles,
  lights,
  cursor,
}: {
  tiles: readonly string[];
  lights?: readonly Light[] | null;
  cursor?: number;
}) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {Array.from({ length: CELLS }, (_, i) => (
        <Cell key={i} tile={tiles[i]} light={lights?.[i]} next={cursor === i} />
      ))}
    </div>
  );
}

function rowLabel(n: number, row: Row) {
  if (!row.lights) return `Guess ${n}: out of time`;
  const count = (l: Light) => row.lights!.filter((x) => x === l).length;
  return `Guess ${n}: ${row.tiles.join(" ")}. ${count("green")} green, ${count("yellow")} sunlight, ${count("red")} red.`;
}

function Board({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <ol aria-label="Your guesses" className="mb-3 flex flex-col gap-1.5">
      {rows.map((row, i) => (
        <li key={i} aria-label={rowLabel(i + 1, row)}>
          {row.lights ? (
            <Cells tiles={row.tiles} lights={row.lights} />
          ) : (
            <p className="text-gp-dusk border-gp-line rounded-[10px] border-2 border-dashed py-2 text-center text-[15px]">
              Guess {i + 1}: out of time, no clues
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

/** The best light each tile has earned so far, for coloring the keypad. */
function keyLights(rows: Row[]) {
  const rank: Record<Light, number> = { red: 0, yellow: 1, green: 2 };
  const best = new Map<string, Light>();
  for (const row of rows) {
    row.lights?.forEach((light, i) => {
      const prev = best.get(row.tiles[i]);
      if (!prev || rank[light] > rank[prev]) best.set(row.tiles[i], light);
    });
  }
  return best;
}

const KEY_NAME: Record<string, string> = {
  "+": "plus",
  "-": "minus",
  "×": "times",
  "÷": "divided by",
  "^": "to the power of",
  "=": "equals",
};

/** Nine cells plus a keypad. Also takes typing, with * and / for × and ÷. */
function Entry({
  submitLabel,
  validate,
  onSubmit,
  keys = new Map(),
}: {
  submitLabel: string;
  validate?: (tiles: Tile[]) => string | null;
  onSubmit: (tiles: Tile[]) => void;
  keys?: Map<string, Light>;
}) {
  const [tiles, setTilesState] = useState<Tile[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Keys can arrive faster than React re-renders, so Enter reads the ref,
  // not a possibly stale render's tiles.
  const latest = useRef<Tile[]>([]);
  const setTiles = (next: Tile[]) => {
    latest.current = next;
    setTilesState(next);
  };

  const type = (t: Tile) => {
    if (latest.current.length < CELLS) setTiles([...latest.current, t]);
    setError(null);
  };
  const erase = () => {
    setTiles(latest.current.slice(0, -1));
    setError(null);
  };
  const submit = () => {
    const current = latest.current;
    if (current.length !== CELLS) return setError(`Fill all ${CELLS} cells first.`);
    const problem = validate?.(current) ?? null;
    if (problem) return setError(problem);
    setError(null);
    setTiles([]);
    onSubmit(current);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Backspace") erase();
      else if (e.key === "Enter") submit();
      else {
        const [t] = toTiles(e.key);
        if (t) type(t);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const full = tiles.length === CELLS;
  const key = (t: Tile) => {
    const light = keys.get(t);
    return (
      <button
        key={t}
        type="button"
        onClick={() => type(t)}
        aria-label={`${KEY_NAME[t] ?? t}${light ? `, ${LIGHT_NAME[light]}` : ""}`}
        className={`h-13 rounded-xl border text-xl font-bold transition active:scale-95 ${focusRing} ${
          light ? LIGHT_CLASS[light] : "border-gp-line bg-gp-key text-gp-ink hover:border-gp-line-strong"
        }`}
      >
        {t}
      </button>
    );
  };

  return (
    <div>
      <Cells tiles={tiles} cursor={full ? undefined : tiles.length} />
      <p aria-live="polite" className={`mt-2 min-h-6 text-center text-[15px] font-semibold ${error ? "text-gp-red" : "text-gp-dusk"}`}>
        {error ?? (full ? "Ready when you are." : `${CELLS - tiles.length} ${CELLS - tiles.length === 1 ? "cell" : "cells"} to go`)}
      </p>
      <div className={`${card} mt-2 flex flex-col gap-1.5 p-3`}>
        <div className="grid grid-cols-5 gap-1.5">{DIGITS.map(key)}</div>
        <div className="grid grid-cols-6 gap-1.5">{SYMBOLS.map(key)}</div>
        <div className="mt-1 grid grid-cols-[1fr_2fr] gap-1.5">
          <button type="button" onClick={erase} className={`${secondaryButton} rounded-xl px-3`}>
            Delete
          </button>
          <button
            type="button"
            onClick={submit}
            className={
              full
                ? `${primaryButton} rounded-xl`
                : `bg-gp-line text-gp-dusk inline-flex min-h-12 items-center justify-center rounded-xl font-bold ${focusRing}`
            }
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Clock({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) {
      onExpire();
      return;
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onExpire]);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span
      className={`rounded-full px-3 py-1 text-[15px] font-bold tabular-nums ${
        left <= 30 ? "bg-gp-red text-white" : "bg-gp-key text-gp-dusk"
      }`}
    >
      {mm}:{ss}
    </span>
  );
}

function Rules() {
  return (
    <section aria-labelledby="rules-title" className={`${card} my-5 flex flex-col gap-3 p-5`}>
      <h2 id="rules-title" className="text-[17px] font-bold">
        The whole game in one guess
      </h2>
      <p className="text-gp-dusk text-base">
        Someone hides a true nine-cell equation. You guess it, and every cell lights up:
      </p>
      <ul className="flex flex-col gap-2 text-base">
        <li className="flex items-center gap-3">
          <span className="bg-gp-green flex size-9 items-center justify-center rounded-lg font-bold text-white">3</span>
          <span><strong>Green</strong> right tile, right spot</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="bg-gp-sun text-gp-ink flex size-9 items-center justify-center rounded-lg font-bold">8</span>
          <span><strong>Sunlight</strong> in there, somewhere else</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="bg-gp-red flex size-9 items-center justify-center rounded-lg font-bold text-white">2</span>
          <span><strong>Red</strong> not in the equation</span>
        </li>
      </ul>
      <details className="border-gp-line border-t pt-3">
        <summary className={`text-gp-amethyst cursor-pointer rounded font-bold ${focusRing}`}>Full rules</summary>
        <ul className="text-gp-dusk mt-2 list-disc space-y-1 pl-5 text-base">
          <li>Use 0–9 and + - × ÷ ^ = with exactly one =.</li>
          <li>It must be true. No two symbols side by side, and no number starts with 0.</li>
          <li>Exponents come first, then × and ÷, then + and -.</li>
          <li>Guesses don&apos;t have to be true.</li>
          <li>First to crack the other&apos;s equation wins. Both in the same round? Play again.</li>
        </ul>
      </details>
    </section>
  );
}

function Solo({ onExit }: { onExit: () => void }) {
  const [secret, setSecret] = useState(() => randomEquation());
  const [rows, setRows] = useState<Row[]>([]);
  const solved = rows.some((r) => r.lights && isSolved(r.lights));

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className={`${serif} text-[30px] leading-tight`}>{solved ? "Cracked" : `Guess ${rows.length + 1}`}</h2>
        <span className="text-gp-dusk text-[15px] font-semibold">Solo · vs the computer</span>
      </div>
      <Board rows={rows} />
      {solved ? (
        <div className={`${card} flex flex-col items-center gap-3 p-6 text-center`}>
          <p className={`${serif} text-[34px] leading-tight`}>
            Cracked in {rows.length} {rows.length === 1 ? "guess" : "guesses"}
          </p>
          <p className="text-gp-dusk text-base">Nicely reasoned. That&apos;s a halo earned.</p>
          <div className="grid w-full grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={onExit} className={secondaryButton}>
              Back
            </button>
            <button
              type="button"
              className={primaryButton}
              onClick={() => {
                setSecret(randomEquation());
                setRows([]);
              }}
            >
              New equation
            </button>
          </div>
        </div>
      ) : (
        <Entry
          submitLabel="Light it up"
          keys={keyLights(rows)}
          onSubmit={(tiles) => setRows((r) => [...r, { tiles, lights: score(secret, tiles) }])}
        />
      )}
    </div>
  );
}

type Step =
  | { kind: "handoff"; to: 0 | 1; then: "build" | "guess" }
  | { kind: "build"; p: 0 | 1 }
  | { kind: "guess"; p: 0 | 1 }
  | { kind: "round" }
  | { kind: "over"; winner: 0 | 1 | "both" };

const other = (p: 0 | 1) => (p === 0 ? 1 : 0);

function Duel({ names, clock, onExit }: { names: [string, string]; clock: boolean; onExit: () => void }) {
  const [secrets, setSecrets] = useState<[Tile[], Tile[]]>([[], []]);
  const [rows, setRows] = useState<[Row[], Row[]]>([[], []]);
  const [step, setStep] = useState<Step>({ kind: "build", p: 0 });

  const restart = () => {
    setSecrets([[], []]);
    setRows([[], []]);
    setStep({ kind: "build", p: 0 });
  };

  const guessed = (p: 0 | 1, tiles: Tile[], missed = false) => {
    const row: Row = { tiles, lights: missed ? null : score(secrets[other(p)], tiles) };
    const next: [Row[], Row[]] = [[...rows[0]], [...rows[1]]];
    next[p].push(row);
    setRows(next);
    if (p === 0) return setStep({ kind: "handoff", to: 1, then: "guess" });

    // Both have guessed this round. Check who cracked it.
    const cracked = ([0, 1] as const).filter((q) => {
      const last = next[q].at(-1)?.lights;
      return last && isSolved(last);
    });
    if (cracked.length === 2) setStep({ kind: "over", winner: "both" });
    else if (cracked.length === 1) setStep({ kind: "over", winner: cracked[0] });
    else setStep({ kind: "round" });
  };

  const heading = (text: string, p?: 0 | 1, expire?: () => void) => (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className={`${serif} text-[30px] leading-tight`}>{text}</h2>
      {clock && expire && p !== undefined && <Clock seconds={ROUND_SECONDS} onExpire={expire} />}
    </div>
  );

  switch (step.kind) {
    case "handoff":
      return (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-gp-dusk text-base font-semibold">Pass the phone to</p>
          <p className={`${serif} text-[56px] leading-none`}>{names[step.to]}</p>
          <p className="text-gp-dusk max-w-72 text-base">
            The board stays covered until you tap. {names[other(step.to)]}, no peeking.
          </p>
          <button
            type="button"
            className={`${primaryButton} mt-4 min-h-14 w-full text-base`}
            onClick={() => setStep({ kind: step.then, p: step.to })}
          >
            I&apos;m {names[step.to]}, show my board
          </button>
        </div>
      );

    case "build":
      return (
        <div key={`build-${step.p}`} className="pt-4">
          {heading(`${names[step.p]}, hide your equation`)}
          <p className="text-gp-dusk mb-4 text-base">Make sure {names[other(step.p)]} can&apos;t see.</p>
          <Entry
            submitLabel="Hide it"
            validate={(tiles) => {
              const check = checkEquation(tiles);
              return check.ok ? null : check.reason;
            }}
            onSubmit={(tiles) => {
              const next: [Tile[], Tile[]] = [...secrets];
              next[step.p] = tiles;
              setSecrets(next);
              setStep(
                step.p === 0
                  ? { kind: "handoff", to: 1, then: "build" }
                  : { kind: "handoff", to: 0, then: "guess" },
              );
            }}
          />
        </div>
      );

    case "guess": {
      const p = step.p;
      return (
        <div key={`guess-${p}-${rows[p].length}`} className="pt-4">
          {heading(`${names[p]}, guess ${rows[p].length + 1}`, p, () => guessed(p, [], true))}
          <Board rows={rows[p]} />
          <Entry submitLabel="Light it up" keys={keyLights(rows[p])} onSubmit={(tiles) => guessed(p, tiles)} />
        </div>
      );
    }

    case "round":
      return (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <p className={`${serif} text-[34px] leading-tight`}>Round {rows[0].length} is over</p>
          <p className="text-gp-dusk mb-4 text-base">Nobody has cracked it yet. Keep going.</p>
          <button
            type="button"
            className={`${primaryButton} min-h-14 w-full text-base`}
            onClick={() => setStep({ kind: "handoff", to: 0, then: "guess" })}
          >
            Next round
          </button>
        </div>
      );

    case "over":
      return (
        <div className="flex flex-col gap-5 pt-8">
          <div className="text-center">
            <p className={`${eyebrow} text-gp-amethyst mb-2`}>Ascension · Round {rows[0].length}</p>
            {step.winner === "both" ? (
              <>
                <p className={`${serif} text-[44px] leading-none`}>
                  You <em>both</em> cracked it
                </p>
                <p className="text-gp-dusk mt-2 text-base">Same round, so it&apos;s a replay, like on the show.</p>
              </>
            ) : (
              <>
                <p className={`${serif} text-[44px] leading-none`}>
                  {names[step.winner]} <em>cracked it</em>
                </p>
                <p className="text-gp-dusk mt-2 text-base">A beautiful final. Well played, both of you.</p>
              </>
            )}
          </div>
          <section aria-label="The equations, revealed" className={`${card} flex flex-col gap-4 p-5`}>
            {([0, 1] as const).map((p) => (
              <div key={p} className="flex flex-col gap-1.5">
                <p className="text-gp-dusk text-[15px] font-semibold">{names[p]}&apos;s equation</p>
                <Cells tiles={secrets[p]} />
              </div>
            ))}
          </section>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={secondaryButton} onClick={onExit}>
              Back
            </button>
            <button type="button" className={primaryButton} onClick={restart}>
              {step.winner === "both" ? "Replay" : "Rematch"}
            </button>
          </div>
        </div>
      );
  }
}

export function EquationTrafficLight() {
  const [mode, setMode] = useState<"menu" | "solo" | "duel">("menu");
  const [names, setNames] = useState<[string, string]>(["Player 1", "Player 2"]);
  const [clock, setClock] = useState(false);
  const exit = () => setMode("menu");

  return (
    <div>
      {mode === "menu" && (
        <>
          <p className={`${eyebrow} text-gp-amethyst mt-4`}>Ascension · 1–2 players</p>
          <h1 className={`${serif} mt-1 text-[44px] leading-none tracking-[-0.01em]`}>Equation Traffic Light</h1>
          <Rules />
          <h2 className="mb-3 text-[17px] font-bold">How do you want to play?</h2>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setMode("solo")}
              className={`${card} hover:border-gp-royal flex min-h-18 items-center justify-between gap-3 border-2 p-4 text-left transition ${focusRing}`}
            >
              <span className="flex flex-col">
                <span className="text-[17px] font-bold">Just me</span>
                <span className="text-gp-dusk text-[15px]">The computer hides an equation</span>
              </span>
              <span aria-hidden="true" className="text-xl font-bold">→</span>
            </button>

            <div className={`${card} flex flex-col gap-4 border-2 p-4`}>
              <div>
                <p className="text-[17px] font-bold">With a friend</p>
                <p className="text-gp-dusk text-[15px]">Each hides one, then pass the phone</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([0, 1] as const).map((p) => (
                  <label key={p} className="text-gp-dusk flex flex-col gap-1 text-sm font-bold">
                    {p === 0 ? "First player" : "Second player"}
                    <input
                      className={`border-gp-line-strong text-gp-ink min-h-11 rounded-xl border bg-white px-3 text-base font-normal ${focusRing}`}
                      value={names[p]}
                      maxLength={20}
                      onChange={(e) => {
                        const next: [string, string] = [...names];
                        next[p] = e.target.value;
                        setNames(next);
                      }}
                    />
                  </label>
                ))}
              </div>
              <label className="flex min-h-11 items-center justify-between gap-3 text-base font-semibold">
                <span>
                  Five-minute clock per guess
                  <span className="text-gp-dusk block text-sm font-normal">Off by default. Turn on for a show-style final.</span>
                </span>
                <input
                  type="checkbox"
                  checked={clock}
                  onChange={(e) => setClock(e.target.checked)}
                  className="accent-gp-royal size-5 shrink-0"
                />
              </label>
              <button
                type="button"
                className={`${primaryButton} min-h-14 text-base`}
                onClick={() => {
                  setNames(([a, b]) => [a.trim() || "Player 1", b.trim() || "Player 2"]);
                  setMode("duel");
                }}
              >
                Start · {names[0].trim() || "Player 1"} hides first
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "solo" && <Solo onExit={exit} />}
      {mode === "duel" && <Duel names={names} clock={clock} onExit={exit} />}
    </div>
  );
}
