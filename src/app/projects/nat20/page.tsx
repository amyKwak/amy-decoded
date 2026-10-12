import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { NatApp } from "./_components/NatApp";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Nat 20",
  description:
    "A fantasy adventure run by an AI game master. Build a party, pick any quest, and roll the dice as the story unfolds live.",
};

export default function Nat20Page() {
  return (
    <div className="bg-nat-bg flex min-h-dvh shrink-0 flex-col">
      {/* The site header is designed for a light page. */}
      <div className="bg-cream">
        <SiteHeader active="projects" />
      </div>

      <div className={`${cinzel.variable} text-nat-text flex flex-1 flex-col`}>
        <NatApp />
      </div>
    </div>
  );
}
