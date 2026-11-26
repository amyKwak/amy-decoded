import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/SiteHeader";
import { EquationTrafficLight } from "./_components/EquationTrafficLight";

export const metadata: Metadata = {
  title: "Equation Traffic Light",
  description:
    "The final game of The Devil's Plan S3. Hide a nine-cell equation, then crack your rival's from green, yellow and red lights.",
};

export default function EquationTrafficLightPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader active="projects" />
      <main className="mx-auto w-full max-w-140 flex-1 px-4 pt-6 pb-16">
        <a href="/projects/devils-plan" className="text-muted text-sm">
          ← All games
        </a>
        <EquationTrafficLight />
      </main>
    </div>
  );
}
