import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { SiteHeader } from "../../../components/SiteHeader";
import { MoodyApp } from "./_components/MoodyApp";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Moody",
  description:
    "A local-first mood journal with a research-backed check-in and an AI assistant that answers questions about your own entries.",
};

const MEASURES = [
  {
    name: "Affect Grid",
    cite: "Russell, Weiss & Mendelsohn, 1989",
    color: "bg-moody-yellow",
    body: "A single tap on a 9 by 9 grid captures two things at once: how pleasant you feel and how much energy you have. It's quick enough to do every day and works well for tracking change over time.",
  },
  {
    name: "Sleep diary",
    cite: "Consensus Sleep Diary, Carney et al., 2012",
    color: "bg-moody-sky",
    body: "Hours slept and a five-point sleep quality rating, taken from the standard sleep diary that sleep researchers agreed on.",
  },
  {
    name: "Feeling words",
    cite: "Emotional granularity, Lisa Feldman Barrett",
    color: "bg-moody-hot-pink",
    body: "People who can name their feelings precisely tend to cope with them better. Claude suggests specific words that fit your grid tap and what you wrote, and you choose which ones are right.",
  },
  {
    name: "PHQ-4",
    cite: "Kroenke et al., 2009",
    color: "bg-moody-green",
    body: "An optional four-question check, offered at most once a week. It's a widely used screening tool for anxiety and depression. A higher score is a signal to check in with a clinician, not a diagnosis.",
  },
];

export default function MoodyPage() {
  return (
    <div className="flex min-h-dvh shrink-0 flex-col bg-moody-bg bg-[linear-gradient(180deg,#fff2f9_0px,#f2f5ff_520px,#fcfaff_1100px)]">
      <SiteHeader active="projects" />

      <div className={`${quicksand.variable} font-(family-name:--font-quicksand) flex-1 text-moody-ink`}>
        <section className="tablet:px-10 tablet:pt-14 mx-auto w-full max-w-200 px-6 pt-10 pb-2">
          <h1 className="tablet:text-[56px] mb-3 text-[40px] leading-[1.05] font-bold tracking-[-0.01em]">Moody</h1>
          <p className="tablet:text-[17px] max-w-140 text-base leading-relaxed text-moody-muted">
            A mood journal. You rate how you feel yourself, then Claude helps you name your feelings and spot patterns
            in your own entries.
          </p>
        </section>

        <main className="tablet:px-10 tablet:pt-10 mx-auto w-full max-w-200 px-6 pt-8">
          <MoodyApp />

          <section aria-labelledby="moody-measures-heading" className="mt-16">
            <h2 id="moody-measures-heading" className="mb-2 text-[26px] leading-tight font-bold">
              How Moody measures mood
            </h2>
            <p className="mb-6 max-w-140 text-[15px] leading-relaxed text-moody-muted">
              Your mood is always self-reported. Claude never scores how you feel. It only suggests words and finds
              patterns in what you&apos;ve recorded.
            </p>
            <dl className="tablet:grid-cols-2 grid gap-4">
              {MEASURES.map((m) => (
                <div key={m.name} className="rounded-[24px] border-2 border-moody-ink bg-white p-5">
                  <dt className="mb-1 flex items-center gap-2.5 text-lg font-bold">
                    <span aria-hidden="true" className={`h-4 w-4 rounded-full border-2 border-moody-ink ${m.color}`} />
                    {m.name}
                  </dt>
                  <dd>
                    <p className="mb-2 text-xs font-semibold text-moody-muted">{m.cite}</p>
                    <p className="text-sm leading-relaxed">{m.body}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="mt-10 rounded-[24px] bg-moody-cream p-5 text-sm leading-relaxed">
            <p className="mb-1.5">
              <strong>Your entries are saved only in this browser.</strong> There are no accounts and no database.
            </p>
            <p className="mb-1.5">
              When you journal or ask a question, that text is sent to Claude (Anthropic) to generate suggestions and
              answers.
            </p>
            <p>
              Moody is not medical advice or a diagnosis. If you&apos;re in crisis, call or text 988 in the US, or call
              911 if you&apos;re in immediate danger.
            </p>
          </aside>
        </main>
      </div>

      <footer className="tablet:mt-13 border-border mt-10 border-t">
        <div className="tablet:px-10 tablet:py-11 mx-auto flex w-full max-w-280 items-center justify-between px-6 py-8">
          <span className="tablet:text-[12.5px] text-faint font-mono text-[11px]">© 2026 Amy Kwak</span>
          <div className="tablet:gap-6 tablet:text-[12.5px] text-faint flex gap-4 font-mono text-[11px]">
            <a href="https://github.com/amyKwak" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/amykwak/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="mailto:amykwak26@gmail.com">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
