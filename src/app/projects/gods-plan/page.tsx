import type { Metadata } from "next";
import Link from "next/link";
import { IkigaiMark } from "../../../components/IkigaiMark";
import { GameLobby } from "./_components/GameLobby";
import { focusRing } from "./_components/ui";

export const metadata: Metadata = {
  title: "God's Plan",
  description:
    "Games of wit, played with grace. Logic and strategy games inspired by reality game shows, built to play with friends.",
};

export default function GodsPlanPage() {
  return (
    <main className="tablet:px-10 mx-auto w-full max-w-300 flex-1 px-4 pt-3 pb-16">
      {/* The one way back to the rest of the site: just the logo. */}
      <Link
        href="/"
        aria-label="Amy Kwak home"
        className={`inline-flex size-11 items-center justify-center rounded-full opacity-80 transition hover:opacity-100 ${focusRing}`}
      >
        <IkigaiMark className="size-7" />
      </Link>
      <h1 className="sr-only">God&apos;s Plan games</h1>
      <GameLobby />
    </main>
  );
}
