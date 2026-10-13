import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { MemeApp } from "./_components/MemeApp";

// The classic meme look: tall, bold, all caps.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Meme This!",
  description:
    "Snap or upload a photo and Claude looks at it and writes meme captions. Pick one, tweak it, and share your meme.",
};

export default function MemePage() {
  return (
    <div className="bg-meme-bg flex min-h-dvh shrink-0 flex-col">
      <SiteHeader active="projects" />

      <div className={`${anton.variable} text-meme-ink flex flex-1 flex-col`}>
        <MemeApp />
      </div>
    </div>
  );
}
