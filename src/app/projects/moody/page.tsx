import type { Metadata } from "next";
import { Nunito_Sans, Quicksand } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { MoodyApp } from "./_components/MoodyApp";
import { focusRing } from "./_components/ui";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moody",
  description:
    "A gentle, private daily mood check-in. Track mood and sleep, name your feelings, and ask questions about your own patterns.",
};

const MEASURES = [
  {
    name: "Mood grid",
    color: "bg-moody-sun",
    body: "One tap captures how pleasant you feel and how much energy you have. Based on the Affect Grid (Russell, Weiss & Mendelsohn, 1989).",
  },
  {
    name: "Sleep",
    color: "bg-moody-sky",
    body: "Hours and how rested you feel, from the Consensus Sleep Diary (Carney et al., 2012).",
  },
  {
    name: "Feeling words",
    color: "bg-moody-coral",
    body: "Naming feelings precisely helps people cope with them (Lisa Feldman Barrett). Claude suggests words and you choose which fit.",
  },
  {
    name: "Weekly check, optional",
    color: "bg-moody-green",
    body: "Four questions (PHQ-4, Kroenke et al., 2009), offered at most once a week. A signal to talk to someone, never a diagnosis.",
  },
];

function MoodyMark({ size = 40 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40">
      <rect x="1" y="1" width="18" height="18" rx="6" fill="#f3a898" />
      <rect x="21" y="1" width="18" height="18" rx="6" fill="#ffe58a" />
      <rect x="1" y="21" width="18" height="18" rx="6" fill="#9ccbf0" />
      <rect x="21" y="21" width="18" height="18" rx="6" fill="#a8ddb5" />
      <circle cx="30" cy="30" r="4" fill="#2f3b39" />
    </svg>
  );
}

export default function MoodyPage() {
  return (
    <div className="bg-moody-bg flex min-h-dvh shrink-0 flex-col">
      <SiteHeader active="projects" />

      <div
        className={`${quicksand.variable} ${nunitoSans.variable} text-moody-ink flex-1 font-(family-name:--font-nunito-sans)`}
      >
        <main className="tablet:px-10 tablet:pt-14 mx-auto w-full max-w-180 px-6 pt-10">
          <section className="mb-8">
            <a
              href="/projects"
              className={`text-moody-muted hover:text-moody-ink mb-3 inline-flex items-center gap-1.5 rounded text-sm ${focusRing}`}
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
              <MoodyMark />
              <h1 className="tablet:text-[44px] font-(family-name:--font-quicksand) text-[36px] leading-[1.05] font-bold tracking-[-0.01em]">
                Moody
              </h1>
            </div>
            <p className="tablet:text-[17px] text-moody-muted max-w-135 text-base leading-relaxed">
              A gentle daily check-in. You say how you feel, and over time Moody
              helps you notice what lifts you and what wears you down.
            </p>
          </section>

          <MoodyApp />

          <section aria-labelledby="moody-measures-heading" className="mt-16">
            <h2
              id="moody-measures-heading"
              className="mb-2 font-(family-name:--font-quicksand) text-[22px] leading-tight font-bold"
            >
              What Moody keeps track of
            </h2>
            <p className="text-moody-muted mb-5 max-w-140 text-[15px] leading-relaxed">
              You always rate your own mood. Claude never scores how you feel.
              It suggests words and finds patterns in what you&apos;ve recorded.
            </p>
            <dl className="tablet:grid-cols-2 grid gap-3">
              {MEASURES.map((m) => (
                <div
                  key={m.name}
                  className="border-moody-line rounded-[18px] border bg-white px-5 py-4.5"
                >
                  <dt className="flex items-center gap-2.5 font-bold">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${m.color}`}
                    />
                    {m.name}
                  </dt>
                  <dd className="text-moody-muted mt-1.5 text-sm leading-relaxed">
                    {m.body}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="bg-moody-butter mt-6 space-y-1.5 rounded-[18px] px-5 py-4.5 text-sm leading-relaxed">
            <p>
              <strong>Private by design.</strong> Entries live only in this
              browser. No accounts, no database. When you write a note or ask a
              question, that text is sent to Claude (Anthropic) to suggest words
              and answer.
            </p>
            <p className="text-moody-muted">
              Moody isn&apos;t medical advice. If you&apos;re struggling, you
              can call or text 988 any time in the US, or call 911 in an
              emergency.
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
