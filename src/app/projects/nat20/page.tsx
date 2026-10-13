import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Alegreya, Cinzel, Nunito, Pirata_One } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { NatApp } from "./_components/NatApp";

// The Lucky Goose's three faces (design-system/components/bundle.css).
const pirata = Pirata_One({ subsets: ["latin"], weight: "400" });
const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Still used by the screens not yet moved to the design system.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700", "900"],
});

/**
 * next/font self-hosts each face under its own family name, so point the
 * token stacks from tokens.css at those names, keeping their fallbacks.
 */
const fonts = {
  "--font-display": `${pirata.style.fontFamily}, "Iowan Old Style", Georgia, serif`,
  "--font-story": `${alegreya.style.fontFamily}, "Iowan Old Style", Georgia, serif`,
  "--font-ui": `${nunito.style.fontFamily}, "Avenir Next", system-ui, sans-serif`,
} as CSSProperties;

export const metadata: Metadata = {
  title: "Nat 20",
  description:
    "A fantasy adventure run by an AI game master. Build a party, pick any quest, and roll the dice as the story unfolds live.",
};

export default function Nat20Page() {
  return (
    <div className="flex min-h-dvh shrink-0 flex-col bg-(--oak-900)">
      {/* The site header is designed for a light page. */}
      <div className="bg-cream">
        <SiteHeader active="projects" />
      </div>

      <div
        style={fonts}
        className={`${cinzel.variable} flex flex-1 flex-col font-(family-name:--font-ui) text-(--cream)`}
      >
        <NatApp />
      </div>
    </div>
  );
}
