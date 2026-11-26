import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/SiteHeader";
import { focusRing } from "../_components/ui";
import { EquationTrafficLight } from "./_components/EquationTrafficLight";

export const metadata: Metadata = {
  title: "Equation Traffic Light · God's Plan",
  description:
    "Hide a nine-cell equation, then crack your rival's from the green, sunlight and red lights on every guess.",
};

export default function EquationTrafficLightPage() {
  return (
    <>
      <SiteHeader active="projects" />
      <main className="mx-auto w-full max-w-140 flex-1 px-4 pt-5 pb-16">
        <a
          href="/projects/gods-plan"
          className={`text-gp-dusk hover:text-gp-ink inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-semibold ${focusRing}`}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
            <path d="M13 8H3M7 4 3 8l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All games
        </a>
        <EquationTrafficLight />
      </main>
    </>
  );
}
