import type { Metadata } from "next";
import { SiteHeader } from "../../../components/SiteHeader";
import { GameLobby } from "./_components/GameLobby";

export const metadata: Metadata = {
  title: "The Devil's Plan games",
  description:
    "Fan-made versions of the games from Netflix's The Devil's Plan, built to play with friends.",
};

export default function DevilsPlanPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader active="projects" />
      <main className="tablet:px-10 mx-auto w-full max-w-280 flex-1 px-6 pt-10 pb-16">
        <h1 className="text-ink mb-2 font-serif text-[34px] leading-tight">
          The Devil&apos;s Plan games
        </h1>
        <p className="text-muted mb-8 max-w-140 text-[15px] leading-relaxed">
          Play the games from the show. A fan project, not affiliated with
          Netflix.
        </p>
        <GameLobby />
      </main>
    </div>
  );
}
