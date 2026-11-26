"use client";

import { useState } from "react";
import {
  GAMES,
  MATCH_TYPES,
  SEASONS,
  filterGames,
  playerLabel,
  type GameFilter,
  type MatchType,
} from "@/lib/devils-plan/catalog";

const MAX_PLAYERS = Math.max(...GAMES.map((g) => g.players.max));

// The lobby's layout is a placeholder until the design is done.
export function GameLobby() {
  const [filter, setFilter] = useState<GameFilter>({ season: SEASONS[0] });
  const games = filterGames(GAMES, filter);
  const set = (change: Partial<GameFilter>) => setFilter((f) => ({ ...f, ...change }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="text-muted flex flex-col gap-1 text-sm">
          Season
          <select
            className="border-border-btn bg-surface text-ink rounded border px-2 py-1.5"
            value={filter.season ?? ""}
            onChange={(e) => set({ season: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">All seasons</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                Season {s}
              </option>
            ))}
          </select>
        </label>

        <label className="text-muted flex flex-col gap-1 text-sm">
          Players
          <select
            className="border-border-btn bg-surface text-ink rounded border px-2 py-1.5"
            value={filter.players ?? ""}
            onChange={(e) => set({ players: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Any number</option>
            {Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "Just me" : `${n} players`}
              </option>
            ))}
          </select>
        </label>

        <label className="text-muted flex flex-col gap-1 text-sm">
          Match
          <select
            className="border-border-btn bg-surface text-ink rounded border px-2 py-1.5"
            value={filter.type ?? ""}
            onChange={(e) => set({ type: (e.target.value || undefined) as MatchType | undefined })}
          >
            <option value="">All matches</option>
            {MATCH_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-muted flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filter.playableOnly ?? false}
            onChange={(e) => set({ playableOnly: e.target.checked })}
          />
          Playable now
        </label>
      </div>

      <p className="text-faint mb-3 font-mono text-xs">
        {games.length} {games.length === 1 ? "game" : "games"}
      </p>

      <ul className="tablet:grid-cols-2 grid grid-cols-1 gap-3">
        {games.map((game) => {
          const body = (
            <>
              <div className="text-faint mb-1 font-mono text-[11px] tracking-wider uppercase">
                Season {game.season} · {game.day} · {game.type} · {playerLabel(game.players)}{" "}
                {game.players.max === 1 ? "player" : "players"}
              </div>
              <div className="text-ink mb-1 font-serif text-xl">{game.name}</div>
              <p className="text-muted text-sm leading-relaxed">{game.summary}</p>
              <div className="text-ink mt-3 text-sm font-semibold">
                {game.href ? "Play →" : <span className="text-faint font-normal">Coming soon</span>}
              </div>
            </>
          );
          return (
            <li key={game.slug} className="bg-surface border-border-soft rounded-xl border">
              {game.href ? (
                <a href={game.href} className="block p-4">
                  {body}
                </a>
              ) : (
                <div className="p-4 opacity-70">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {games.length === 0 && (
        <p className="text-muted py-10 text-center text-sm">No games match those filters.</p>
      )}
    </div>
  );
}
