import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { CluelessApp } from "./_components/CluelessApp";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Clueless",
  description:
    "A party game for one phone. Pick any topic, hold the phone to your forehead, and guess as many words as you can from your friends' clues. Tilt down when you get it, tilt up to pass.",
};

export default function CluelessPage() {
  return (
    <div className="bg-clue-bg flex min-h-dvh shrink-0 flex-col">
      <SiteHeader active="projects" />

      <div
        className={`${unbounded.variable} text-clue-ink flex flex-1 flex-col`}
      >
        <CluelessApp />
      </div>
    </div>
  );
}
