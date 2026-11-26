import type { Metadata } from "next";
import { SiteHeader } from "../../../components/SiteHeader";
import { GameLobby } from "./_components/GameLobby";
import { card, eyebrow, primaryButton, secondaryButton, serif } from "./_components/ui";

export const metadata: Metadata = {
  title: "God's Plan",
  description:
    "Games of wit, played with grace. Logic and strategy games inspired by reality game shows, built to play with friends.",
};

const GAME = "/projects/gods-plan/equation-traffic-light";

// One example guess, so the featured game explains itself at a glance:
// hidden 36÷4+8=17, guessed 38÷2+7=26.
const EXAMPLE: { tile: string; light: "green" | "sun" | "red" }[] = [
  { tile: "3", light: "green" },
  { tile: "8", light: "sun" },
  { tile: "÷", light: "green" },
  { tile: "2", light: "red" },
  { tile: "+", light: "green" },
  { tile: "7", light: "sun" },
  { tile: "=", light: "green" },
  { tile: "2", light: "red" },
  { tile: "6", light: "sun" },
];

const LIGHT = {
  green: "bg-gp-green text-white",
  sun: "bg-gp-sun text-gp-ink",
  red: "bg-gp-red text-white",
};

const STEPS = [
  { title: "Tell us who's playing", body: "We only show games that fit the people in the room." },
  { title: "Learn it in thirty seconds", body: "One picture, three rules. The full rulebook stays one tap away." },
  { title: "Play together", body: "Solo against the computer, or with a friend on one phone." },
];

function Arrow() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GodsPlanPage() {
  return (
    <>
      <SiteHeader active="projects" />
      <main className="tablet:px-10 mx-auto w-full max-w-300 flex-1 px-5 pb-20">
        <section className="flex flex-wrap items-center gap-12 py-12 tablet:py-16">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
            <p className={`${eyebrow} text-gp-amethyst`}>Free · No sign-up</p>
            <h1 className={`${serif} text-[64px] leading-none tracking-[-0.02em] tablet:text-[96px]`}>
              God&apos;s <em>Plan</em>
            </h1>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-14 bg-[#7fcfc5]" />
              <p className={`${serif} text-[28px] leading-tight italic tablet:text-[34px]`}>
                Games of wit, played with grace.
              </p>
            </div>
            <p className="text-gp-dusk max-w-130 text-lg">
              Logic and strategy games inspired by reality game shows. Pick one, learn it in thirty
              seconds, and play with whoever is next to you.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={GAME} className={`${primaryButton} min-h-14 px-7 text-base`}>
                Start playing <Arrow />
              </a>
              <a href="#games" className={`${secondaryButton} min-h-14 text-base`}>
                Browse all games
              </a>
            </div>
          </div>

          <article
            aria-labelledby="featured-title"
            className={`${card} flex min-w-0 flex-[1_1_380px] flex-col gap-5 p-6 shadow-[0_30px_60px_-40px_rgba(43,30,102,0.45)] tablet:p-7`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="bg-gp-seafoam text-gp-seafoam-ink rounded-full px-3 py-1 text-sm font-bold">
                Ready to play
              </span>
              <span className="text-gp-dusk text-sm font-semibold">1–2 players · about 10 min</span>
            </div>
            <div>
              <h2 id="featured-title" className={`${serif} mb-1 text-[34px] leading-tight`}>
                Equation Traffic Light
              </h2>
              <p className="text-gp-dusk text-base">
                Hide a nine-cell equation. Crack your rival&apos;s from the lights on every guess.
              </p>
            </div>
            <div
              role="img"
              aria-label="Example guess 38÷2+7=26: 4 green, 3 sunlight, 2 red"
              className="grid grid-cols-9 gap-1.5"
            >
              {EXAMPLE.map((cell, i) => (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-[10px] text-lg font-bold ${LIGHT[cell.light]}`}
                >
                  {cell.tile}
                </div>
              ))}
            </div>
            <a href={GAME} className={`${primaryButton} min-h-14 text-base`}>
              Play now <Arrow />
            </a>
          </article>
        </section>

        <section aria-labelledby="how-title" className="pb-16">
          <h2 id="how-title" className={`${serif} mb-6 text-[34px] leading-tight`}>
            Three steps, then you&apos;re in
          </h2>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`${card} flex flex-col gap-2 p-6`}>
                <span className="bg-gp-lilac text-gp-royal flex size-9 items-center justify-center rounded-full font-bold">
                  {i + 1}
                </span>
                <p className="text-[17px] font-bold">{step.title}</p>
                <p className="text-gp-dusk text-base">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <GameLobby />
      </main>
      <footer className="border-gp-line text-gp-dusk tablet:px-10 mx-auto flex w-full max-w-300 flex-wrap justify-between gap-3 border-t px-5 py-7 text-sm">
        <span>A fan project inspired by Netflix&apos;s The Devil&apos;s Plan. Not affiliated with Netflix.</span>
        <span>Made with patience, not schemes.</span>
      </footer>
    </>
  );
}
