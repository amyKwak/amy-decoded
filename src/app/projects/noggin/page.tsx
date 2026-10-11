import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { NogginApp } from "./_components/NogginApp";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Noggin",
  description:
    "A 1v1 party game. Pick any kind of word, hold your phone to your forehead, and ask yes or no questions to guess yours before your friend does.",
};

export default function NogginPage() {
  return (
    <div className="bg-noggin-bg flex min-h-dvh shrink-0 flex-col">
      <SiteHeader active="projects" />

      <div
        className={`${bricolage.variable} text-noggin-ink flex flex-1 flex-col font-(family-name:--font-bricolage)`}
      >
        <NogginApp />
      </div>
    </div>
  );
}
