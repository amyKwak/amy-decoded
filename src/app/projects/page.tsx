import { SiteHeader } from "../../components/SiteHeader";

const PROJECTS = [
  {
    title: "Recipe Box",
    description:
      "A cozy little place to save the recipes I actually cook, with quick tags and a shuffle button for when I can't decide.",
  },
  {
    title: "Daily Habit",
    description:
      "A tiny habit tracker with a satisfying streak view. Built it because every other one felt like too much.",
  },
  {
    title: "Chord Finder",
    description:
      "A quick guitar-chord lookup I made while learning to play — pick a shape and hear how it sounds.",
  },
  {
    title: "Mini Arcade",
    description:
      "A handful of tiny browser games I built to unwind — one afternoon, one game, no rules.",
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader active="projects" />

      <section className="px-6 tablet:px-16 pt-12 tablet:pt-14 pb-8 tablet:pb-10">
        <div className="font-mono text-[11px] tablet:text-xs tracking-[0.18em] uppercase text-label mb-4 tablet:mb-4.5">
          Personal projects
        </div>
        <h1 className="font-serif font-normal text-[34px] tablet:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mb-3.5 max-w-[680px]">
          Built for fun
        </h1>
        <p className="text-[15px] tablet:text-base leading-relaxed text-muted max-w-[560px]">
          Little apps and experiments I&apos;ve made on my own time — for the
          joy of building and to try out ideas.
        </p>
      </section>

      <section className="flex-1 px-6 tablet:px-16 pb-16 tablet:pb-10 grid grid-cols-1 tablet:grid-cols-2 gap-4.5 tablet:gap-5.5">
        {PROJECTS.map((project) => (
          <div
            key={project.title}
            className="bg-surface border border-border-soft rounded-2xl overflow-hidden flex flex-col"
          >
            <div
              className="h-[150px] tablet:h-[190px] flex items-end px-4 py-3"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #EDE8DE 0 10px, #F3EFE7 10px 20px)",
              }}
            >
              <span className="font-mono text-[10.5px] tracking-[0.06em] text-faint">
                app screenshot
              </span>
            </div>
            <div className="p-4.5 tablet:p-6 flex flex-col items-start gap-2.5">
              <h3 className="font-serif font-medium text-xl tablet:text-[23px] text-ink">
                {project.title}
              </h3>
              <p className="text-[13.5px] tablet:text-sm leading-relaxed text-muted">
                {project.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.75 text-[13.5px] tablet:text-sm font-semibold text-ink mt-1"
              >
                Visit
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </section>

      <footer className="flex items-center justify-between px-6 tablet:px-16 py-8 tablet:py-11 border-t border-border">
        <span className="font-mono text-[11px] tablet:text-[12.5px] text-faint">
          © 2026 Amy Kwak
        </span>
        <div className="flex gap-4 tablet:gap-6 font-mono text-[11px] tablet:text-[12.5px] text-faint">
          <a href="https://github.com/amyKwak" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/amykwak/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:amykwak26@gmail.com">Email</a>
        </div>
      </footer>
    </div>
  );
}
