"use client";

import { useState } from "react";
import { GAMES, GROUP_SIZES, SEASONS, filterGames, playerLabel } from "@/lib/gods-plan/catalog";
import { focusRing, serif } from "./ui";

// The lobby only lists games you can play right now.
const READY = GAMES.filter((g) => g.href);

const field = `min-h-12 rounded-2xl border border-gp-line-strong bg-white/80 text-base text-gp-ink transition hover:border-gp-dusk ${focusRing}`;

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative flex min-w-0 flex-1 tablet:flex-none">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${field} w-full appearance-none pr-10 pl-4 font-semibold tablet:w-52`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="text-gp-dusk pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
      >
        <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

export function GameLobby() {
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("");
  const [size, setSize] = useState("");

  const games = filterGames(READY, {
    query,
    season: season === "" ? undefined : Number(season),
    players: size === "" ? undefined : GROUP_SIZES[Number(size)].players,
  });

  return (
    <section className="flex flex-col gap-3 pt-2">
      <label className="relative block">
        <span className="sr-only">Search games</span>
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="text-gp-dusk pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        >
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m13.5 13.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games"
          className={`${field} placeholder:text-gp-dusk w-full pr-4 pl-12`}
        />
      </label>

      <div className="flex gap-2">
        <Select
          label="Season"
          value={season}
          onChange={setSeason}
          options={[
            { value: "", label: "All seasons" },
            ...SEASONS.map((s) => ({ value: String(s), label: `Season ${s}` })),
          ]}
        />
        <Select
          label="Players"
          value={size}
          onChange={setSize}
          options={[
            { value: "", label: "Any players" },
            ...GROUP_SIZES.map((g, i) => ({ value: String(i), label: g.label })),
          ]}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {games.length} {games.length === 1 ? "game" : "games"}
      </p>

      {games.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 pt-3 min-[560px]:grid-cols-2 tablet:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <li key={game.slug} className="flex">
              <a
                href={game.href}
                className={`border-gp-line group flex flex-1 flex-col overflow-hidden rounded-3xl border bg-white/80 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(43,30,102,0.4)] ${focusRing}`}
              >
                {game.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static SVG art
                  <img src={game.image} alt="" className="aspect-4/3 w-full object-cover" />
                ) : (
                  <div aria-hidden="true" className="gp-sheen aspect-4/3 w-full" />
                )}
                <div className="flex flex-col gap-0.5 px-5 pt-4 pb-5">
                  <h2 className={`${serif} text-[26px] leading-tight`}>{game.name}</h2>
                  <p className="text-gp-dusk text-[15px] font-semibold">
                    {playerLabel(game.players)} {game.players.max === 1 ? "player" : "players"}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gp-dusk py-16 text-center text-base">No games match that yet.</p>
      )}
    </section>
  );
}
