import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Alegreya, Nunito, Pirata_One } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { GooseApp } from "./_components/GooseApp";

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
  title: "The Lucky Goose",
  description:
    "A pass-the-phone fantasy adventure run by an AI game master. Gather a party, pick any quest, and roll the dice as the story unfolds live.",
};

export default function LuckyGoosePage() {
  return (
    <div className="flex min-h-dvh shrink-0 flex-col bg-(--oak-900)">
      {/* The site header is designed for a light page. */}
      <div className="bg-cream">
        <SiteHeader active="projects" />
      </div>

      <div
        style={fonts}
        className="flex flex-1 flex-col font-(family-name:--font-ui) text-(--cream)"
      >
        <GooseApp />
      </div>
    </div>
  );
}
