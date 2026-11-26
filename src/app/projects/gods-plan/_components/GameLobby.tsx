"use client";

import { useState } from "react";
import {
  GAMES,
  GROUP_SIZES,
  MATCH_TYPES,
  filterGames,
  playerLabel,
  type GameFilter,
  type MatchType,
} from "@/lib/gods-plan/catalog";
import { card, focusRing, serif } from "./ui";

// A soft tint per match type, so cards are easy to scan.
const TYPE_TINT: Record<MatchType, string> = {
  Main: "bg-gp-iris",
  "Mini-game": "bg-gp-key",
  Sanctuary: "bg-gp-seafoam",
  Pilgrimage: "bg-gp-lilac",
  Revelation: "bg-gp-rose",
  Ascension: "bg-[#ffe9a8]",
};

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-[15px] font-bold transition ${focusRing} ${
        pressed
          ? "border-gp-royal bg-gp-royal text-white"
          : "border-gp-line-strong text-gp-ink hover:border-gp-dusk bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export function GameLobby() {
  const [size, setSize] = useState<number | null>(null);
  const [type, setType] = useState<MatchType | null>(null);
  const [playableOnly, setPlayableOnly] = useState(false);

  const filter: GameFilter = {
    players: size === null ? undefined : GROUP_SIZES[size].players,
    type: type ?? undefined,
    playableOnly,
  };
  const games = filterGames(GAMES, filter);
  const ready = games.filter((g) => g.href).length;
  const filtered = size !== null || type !== null || playableOnly;
  const clear = () => {
    setSize(null);
    setType(null);
    setPlayableOnly(false);
  };

  return (
    <section id="games" aria-labelledby="games-title" className="flex scroll-mt-6 flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="games-title" className={`${serif} text-[34px] leading-tight`}>
          All games
        </h2>
        <p aria-live="polite" className="text-gp-dusk text-base">
          <strong className="text-gp-ink">
            {games.length} {games.length === 1 ? "game" : "games"}
          </strong>{" "}
          · {ready} ready to play
        </p>
      </div>

      <div className={`${card} flex flex-col gap-4 p-5`}>
        <div role="group" aria-labelledby="who-label" className="flex flex-wrap items-center gap-2">
          <span id="who-label" className="text-gp-dusk w-full text-[15px] font-bold tablet:w-36">
            Who&apos;s playing?
          </span>
          <Chip pressed={size === null} onClick={() => setSize(null)}>
            Any
          </Chip>
          {GROUP_SIZES.map((g, i) => (
            <Chip key={g.label} pressed={size === i} onClick={() => setSize(i)}>
              {g.label}
            </Chip>
          ))}
        </div>
        <div role="group" aria-labelledby="match-label" className="flex flex-wrap items-center gap-2">
          <span id="match-label" className="text-gp-dusk w-full text-[15px] font-bold tablet:w-36">
            Match
          </span>
          <Chip pressed={type === null} onClick={() => setType(null)}>
            All
          </Chip>
          {MATCH_TYPES.map((t) => (
            <Chip key={t} pressed={type === t} onClick={() => setType(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div className="border-gp-line flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-semibold">
            <input
              type="checkbox"
              checked={playableOnly}
              onChange={(e) => setPlayableOnly(e.target.checked)}
              className="accent-gp-green size-5"
            />
            Only games I can play right now
          </label>
          {filtered && (
            <button
              type="button"
              onClick={clear}
              className={`text-gp-amethyst min-h-11 px-2 text-[15px] font-bold underline ${focusRing}`}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {games.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
          {games.map((game) => {
            const players = `${playerLabel(game.players)} ${game.players.max === 1 ? "player" : "players"}`;
            const top = (
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${TYPE_TINT[game.type]}`}>
                  {game.type}
                </span>
                <span className={`text-sm font-bold ${game.href ? "text-gp-seafoam-ink" : "text-gp-dusk"}`}>
                  {game.href ? "Ready" : "Coming soon"}
                </span>
              </div>
            );
            return (
              <li key={game.slug} className="flex">
                {game.href ? (
                  <a
                    href={game.href}
                    className={`border-gp-royal flex flex-1 flex-col gap-2.5 rounded-3xl border-2 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(43,30,102,0.4)] ${focusRing}`}
                  >
                    {top}
                    <h3 className={`${serif} mt-1 text-[26px] leading-tight`}>{game.name}</h3>
                    <p className="text-gp-dusk flex-1 text-[15px]">{game.summary}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-gp-dusk text-sm font-semibold">{players}</span>
                      <span className="font-bold">Play →</span>
                    </div>
                  </a>
                ) : (
                  <div className="border-gp-line-strong flex flex-1 flex-col gap-2.5 rounded-3xl border border-dashed bg-white/60 p-5">
                    {top}
                    <h3 className={`${serif} mt-1 text-[26px] leading-tight`}>{game.name}</h3>
                    <p className="text-gp-dusk flex-1 text-[15px]">{game.summary}</p>
                    <span className="text-gp-dusk pt-2 text-sm font-semibold">{players}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={`${card} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
          <p className={`${serif} text-[28px]`}>Nothing fits that just yet</p>
          <p className="text-gp-dusk max-w-95 text-base">
            Try a different number of players, or see everything we have.
          </p>
          <button
            type="button"
            onClick={clear}
            className={`bg-gp-royal min-h-12 rounded-full px-6 font-bold text-white ${focusRing}`}
          >
            Show all games
          </button>
        </div>
      )}
    </section>
  );
}
