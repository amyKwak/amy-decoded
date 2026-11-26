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
} from "@/lib/devils-plan/equation-traffic-light";

// Layout and colors are placeholders until the design is done.

type Row = { tiles: Tile[]; lights: Light[] | null }; // null: missed the clock

const ROUND_SECONDS = 5 * 60; // the show gives five minutes to build and to guess

const LIGHT_CLASS: Record<Light, string> = {
  green: "bg-emerald-500 text-white border-emerald-600",
  yellow: "bg-amber-400 text-ink border-amber-500",
  red: "bg-rose-500 text-white border-rose-600",
};

function Cell({ tile, light }: { tile?: string; light?: Light }) {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-md border text-xl font-bold ${
        light ? LIGHT_CLASS[light] : "border-border-btn bg-surface text-ink"
      }`}
    >
      {tile ?? ""}
    </div>
  );
}

function Cells({ tiles, lights }: { tiles: readonly string[]; lights?: readonly Light[] | null }) {
  return (
    <div className="grid grid-cols-9 gap-1">
      {Array.from({ length: CELLS }, (_, i) => (
        <Cell key={i} tile={tiles[i]} light={lights?.[i]} />
      ))}
    </div>
  );
}

function Board({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <ol className="mb-4 flex flex-col gap-1">
      {rows.map((row, i) => (
        <li key={i}>
          {row.lights ? (
            <Cells tiles={row.tiles} lights={row.lights} />
          ) : (
            <p className="text-muted py-2 text-center text-sm">Guess {i + 1}: out of time, no clues</p>
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
  };
  const erase = () => setTiles(latest.current.slice(0, -1));
  const submit = () => {
    const current = latest.current;
    if (current.length !== CELLS) return setError(`Fill all ${CELLS} cells.`);
    const problem = validate?.(current) ?? null;
    if (problem) return setError(problem);
    setError(null);
    setTiles([]);
    onSubmit(current);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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

  const key = (t: Tile) => {
    const light = keys.get(t);
    return (
      <button
        key={t}
        type="button"
        onClick={() => type(t)}
        className={`rounded-md border py-3 text-lg font-bold ${
          light ? LIGHT_CLASS[light] : "border-border-btn bg-surface-alt text-ink"
        }`}
      >
        {t}
      </button>
    );
  };

  return (
    <div>
      <Cells tiles={tiles} />
      <p className="mt-2 min-h-5 text-sm text-rose-600">{error}</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">{DIGITS.map(key)}</div>
      <div className="mt-1.5 grid grid-cols-6 gap-1.5">{SYMBOLS.map(key)}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={erase} className="border-border-btn rounded-md border py-3">
          Delete
        </button>
        <button type="button" onClick={submit} className="bg-ink rounded-md py-3 font-semibold text-white">
          {submitLabel}
        </button>
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
    <span className={`font-mono text-sm ${left <= 30 ? "text-rose-600" : "text-muted"}`}>
      {mm}:{ss}
    </span>
  );
}

function Rules() {
  return (
    <details className="border-border-soft bg-surface my-4 rounded-lg border p-3 text-sm">
      <summary className="text-ink cursor-pointer font-semibold">How to play</summary>
      <ul className="text-muted mt-2 list-disc space-y-1 pl-5">
        <li>Each player hides a {CELLS}-cell equation using 0–9 and + - × ÷ ^ =.</li>
        <li>It must be true, with one =. No two symbols side by side, and no number starts with 0.</li>
        <li>Exponents come first, then × and ÷, then + and -.</li>
        <li>Guess your rival&apos;s equation. Guesses don&apos;t have to be true.</li>
        <li>
          Green: right tile, right place. Yellow: in the equation, somewhere else. Red: not in it.
        </li>
        <li>First to crack the other&apos;s equation wins. If both crack it in the same round, play again.</li>
      </ul>
    </details>
  );
}

function Solo({ onExit }: { onExit: () => void }) {
  const [secret, setSecret] = useState(() => randomEquation());
  const [rows, setRows] = useState<Row[]>([]);
  const solved = rows.some((r) => r.lights && isSolved(r.lights));

  return (
    <div>
      <p className="text-muted mb-4 text-sm">The computer has hidden an equation. Crack it.</p>
      <Board rows={rows} />
      {solved ? (
        <div className="text-center">
          <p className="text-ink mb-4 font-serif text-2xl">
            Cracked in {rows.length} {rows.length === 1 ? "guess" : "guesses"}
          </p>
          <button
            type="button"
            className="bg-ink rounded-md px-5 py-3 font-semibold text-white"
            onClick={() => {
              setSecret(randomEquation());
              setRows([]);
            }}
          >
            New equation
          </button>
        </div>
      ) : (
        <Entry
          submitLabel="Guess"
          keys={keyLights(rows)}
          onSubmit={(tiles) => setRows((r) => [...r, { tiles, lights: score(secret, tiles) }])}
        />
      )}
      <button type="button" onClick={onExit} className="text-muted mt-6 text-sm underline">
        Back
      </button>
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
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="text-ink font-serif text-2xl">{text}</h2>
      {clock && expire && p !== undefined && <Clock seconds={ROUND_SECONDS} onExpire={expire} />}
    </div>
  );

  switch (step.kind) {
    case "handoff":
      return (
        <div className="py-16 text-center">
          <p className="text-muted mb-2 text-sm">Pass the phone to</p>
          <p className="text-ink mb-8 font-serif text-3xl">{names[step.to]}</p>
          <button
            type="button"
            className="bg-ink rounded-md px-6 py-3 font-semibold text-white"
            onClick={() => setStep({ kind: step.then, p: step.to })}
          >
            I&apos;m {names[step.to]}, ready
          </button>
        </div>
      );

    case "build":
      return (
        <div key={`build-${step.p}`}>
          {heading(`${names[step.p]}, hide your equation`)}
          <p className="text-muted mb-4 text-sm">Make sure {names[other(step.p)]} can&apos;t see.</p>
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
        <div key={`guess-${p}-${rows[p].length}`}>
          {heading(`${names[p]}, guess #${rows[p].length + 1}`, p, () => guessed(p, [], true))}
          <Board rows={rows[p]} />
          <Entry submitLabel="Guess" keys={keyLights(rows[p])} onSubmit={(tiles) => guessed(p, tiles)} />
        </div>
      );
    }

    case "round":
      return (
        <div className="py-16 text-center">
          <p className="text-ink mb-2 font-serif text-2xl">Round {rows[0].length} is over</p>
          <p className="text-muted mb-8 text-sm">Nobody has cracked it yet.</p>
          <button
            type="button"
            className="bg-ink rounded-md px-6 py-3 font-semibold text-white"
            onClick={() => setStep({ kind: "handoff", to: 0, then: "guess" })}
          >
            Next round
          </button>
        </div>
      );

    case "over":
      return (
        <div className="py-10 text-center">
          {step.winner === "both" ? (
            <>
              <p className="text-ink mb-2 font-serif text-3xl">You both cracked it</p>
              <p className="text-muted mb-6 text-sm">Same round, so it&apos;s a replay, like on the show.</p>
            </>
          ) : (
            <p className="text-ink mb-6 font-serif text-3xl">{names[step.winner]} wins</p>
          )}
          {([0, 1] as const).map((p) => (
            <div key={p} className="mb-4 text-left">
              <p className="text-muted mb-1 text-sm">{names[p]}&apos;s equation</p>
              <Cells tiles={secrets[p]} />
            </div>
          ))}
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              className="bg-ink rounded-md px-5 py-3 font-semibold text-white"
              onClick={restart}
            >
              {step.winner === "both" ? "Replay" : "Play again"}
            </button>
            <button type="button" className="border-border-btn rounded-md border px-5 py-3" onClick={onExit}>
              Back
            </button>
          </div>
        </div>
      );
  }
}

export function EquationTrafficLight() {
  const [mode, setMode] = useState<"menu" | "solo" | "duel">("menu");
  const [names, setNames] = useState<[string, string]>(["Player 1", "Player 2"]);
  const [clock, setClock] = useState(true);
  const exit = () => setMode("menu");

  return (
    <div>
      <h1 className="text-ink mt-4 mb-1 font-serif text-[32px] leading-tight">Equation Traffic Light</h1>
      <p className="text-faint mb-2 font-mono text-[11px] tracking-wider uppercase">
        The Devil&apos;s Plan S3 · Final
      </p>

      {mode === "menu" && (
        <>
          <Rules />
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="bg-ink rounded-md py-3 font-semibold text-white"
              onClick={() => setMode("solo")}
            >
              Play alone against the computer
            </button>

            <div className="border-border-soft bg-surface rounded-lg border p-4">
              <p className="text-ink mb-3 font-semibold">2 players, one phone</p>
              <div className="mb-3 grid grid-cols-2 gap-2">
                {([0, 1] as const).map((p) => (
                  <input
                    key={p}
                    aria-label={`Player ${p + 1} name`}
                    className="border-border-btn bg-cream rounded border px-2 py-1.5"
                    value={names[p]}
                    maxLength={20}
                    onChange={(e) => {
                      const next: [string, string] = [...names];
                      next[p] = e.target.value;
                      setNames(next);
                    }}
                  />
                ))}
              </div>
              <label className="text-muted mb-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={clock} onChange={(e) => setClock(e.target.checked)} />
                5-minute clock for each guess, like the show
              </label>
              <button
                type="button"
                className="bg-ink w-full rounded-md py-3 font-semibold text-white"
                onClick={() => {
                  setNames(([a, b]) => [a.trim() || "Player 1", b.trim() || "Player 2"]);
                  setMode("duel");
                }}
              >
                Start the final
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
