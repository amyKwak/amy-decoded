import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { SecondThoughtApp } from "./_components/SecondThoughtApp";
import { focusRing } from "./_components/ui";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Second Thought",
  description:
    "A guided CBT thought record. Write down the thought that's bothering you, look at the evidence with Socratic questions from Claude, and find a more balanced view.",
};

const SCIENCE = [
  {
    name: "Thought records",
    color: "bg-st-accent",
    body: "The core worksheet of cognitive behavioral therapy (Beck, 1979; Greenberger & Padesky, Mind Over Mood). CBT is one of the most studied talk therapies for anxiety and depression (Hofmann et al., 2012).",
  },
  {
    name: "Socratic questions",
    color: "bg-st-peach",
    body: "Guided discovery: questions help you weigh the evidence yourself instead of being told what to think. Claude asks; you answer.",
  },
  {
    name: "Thinking traps",
    color: "bg-st-mint",
    body: "Common patterns like mind reading and catastrophizing (Beck, 1976; Burns, 1980). Claude suggests which might apply and you decide.",
  },
  {
    name: "Before and after",
    color: "bg-st-butter",
    body: "You rate how much you believe the thought, 0 to 100, at the start and end. That change is the usual way thought records are measured.",
  },
];

function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40">
      <path d="M6 4h20a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H15l-6 5v-5H6a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5z" fill="#ffd9c2" />
      <path d="M17 13h17a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-1v5l-6-5H17a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5z" fill="#5a49c4" />
      <path d="M19.5 22.5l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SecondThoughtPage() {
  return (
    <div className="bg-st-bg flex min-h-dvh shrink-0 flex-col">
      <SiteHeader active="projects" />

      <div
        className={`${fraunces.variable} ${nunitoSans.variable} text-st-ink flex-1 font-(family-name:--font-nunito-sans)`}
      >
        <main className="tablet:px-10 tablet:pt-14 mx-auto w-full max-w-180 px-6 pt-10">
          <section className="mb-8">
            <a
              href="/projects"
              className={`text-st-muted hover:text-st-ink mb-3 inline-flex items-center gap-1.5 rounded text-sm ${focusRing}`}
            >
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              All projects
            </a>
            <div className="mb-2.5 flex items-center gap-3.5">
              <Mark />
              <h1 className="tablet:text-[44px] font-(family-name:--font-fraunces) text-[36px] leading-[1.05] font-semibold tracking-[-0.01em]">
                Second Thought
              </h1>
            </div>
            <p className="tablet:text-[17px] text-st-muted max-w-135 text-base leading-relaxed">
              When a thought keeps stinging, write it down and give it a fair
              hearing. Claude asks the questions. You find the answers.
            </p>
          </section>

          <SecondThoughtApp />

          <section aria-labelledby="st-science-heading" className="mt-16">
            <h2
              id="st-science-heading"
              className="mb-2 font-(family-name:--font-fraunces) text-[24px] leading-tight font-semibold"
            >
              Why this works
            </h2>
            <p className="text-st-muted mb-5 max-w-140 text-[15px] leading-relaxed">
              Thoughts aren&apos;t facts, but they can feel like them. A thought
              record slows a thought down so you can check it, the same way a
              CBT therapist would help you.
            </p>
            <dl className="tablet:grid-cols-2 grid gap-3">
              {SCIENCE.map((m) => (
                <div key={m.name} className="border-st-line rounded-[18px] border bg-white px-5 py-4.5">
                  <dt className="flex items-center gap-2.5 font-bold">
                    <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                    {m.name}
                  </dt>
                  <dd className="text-st-muted mt-1.5 text-sm leading-relaxed">{m.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="bg-st-butter mt-6 space-y-1.5 rounded-[18px] px-5 py-4.5 text-sm leading-relaxed">
            <p>
              <strong>Private by design.</strong> Records live only in this
              browser. No accounts, no database. When you reach the second look,
              what you&apos;ve written so far is sent to Claude (Anthropic) to
              suggest questions.
            </p>
            <p className="text-st-muted">
              Second Thought is a self-help tool, not therapy or medical advice.
              If you&apos;re struggling, you can call or text 988 any time in the
              US, or call 911 in an emergency.
            </p>
          </aside>
        </main>
      </div>

      <footer className="tablet:mt-13 border-border mt-10 border-t">
        <div className="tablet:px-10 tablet:py-11 mx-auto flex w-full max-w-280 items-center justify-between px-6 py-8">
          <span className="tablet:text-[12.5px] text-faint font-mono text-[11px]">
            © 2026 Amy Kwak
          </span>
          <div className="tablet:gap-6 tablet:text-[12.5px] text-faint flex gap-4 font-mono text-[11px]">
            <a
              href="https://github.com/amyKwak"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/amykwak/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href="mailto:amykwak26@gmail.com">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
