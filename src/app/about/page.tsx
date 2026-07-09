import { IkigaiMark } from "../../components/IkigaiMark";
import { SiteHeader } from "../../components/SiteHeader";

const EXPERIENCE = [
  {
    range: "Dec 2022 — Mar 2025",
    title: "Software Engineer",
    company: "KiwiCo",
    highlights: [
      "Owned end-to-end architecture for a new subscription acquisition flow and Next.js landing pages, increasing subscription revenue 20%.",
      "Revamped the baby subscription line with 18 new product pages, driving a 2x increase in deluxe plan adoption and a 25% lift in average order value.",
      "Led a frontend architecture redesign across six core surfaces for 100K+ monthly users.",
      "Reworked site-wide search for a 15% lift in search-to-click conversion.",
      "Ran rapid A/B testing with Optimizely for a 15% conversion uplift.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader active="about" />

      <section className="max-w-280 mx-auto w-full px-6 tablet:px-10 pt-12 tablet:pt-16 pb-2">
        <div className="font-mono text-[11px] tablet:text-xs tracking-[0.18em] uppercase text-label mb-4 tablet:mb-4.5">
          About
        </div>
        <h1 className="font-serif font-normal text-[34px] tablet:text-[52px] leading-[1.1] tracking-[-0.01em] text-ink max-w-190">
          I build product and user-facing interfaces that work.
        </h1>
      </section>

      <section className="max-w-280 mx-auto w-full px-6 tablet:px-10 pt-5 tablet:pt-6 pb-2">
        <div className="flex flex-col gap-4 tablet:gap-5 max-w-170 text-[15px] tablet:text-[17px] leading-relaxed tablet:leading-[1.7] text-body">
          <p>
            I&apos;m a software engineer based in Seattle who cares about the
            details: frontend architecture, clean code, and interfaces that work
            the way people expect.
          </p>
          <p>
            I studied at UC San Diego and trained at Hack Reactor, then spent
            the last few years at KiwiCo building subscription products end to
            end, from technical design through production, working closely with
            product and design teams.
          </p>
          <p>Outside of work: video games, golf, cooking, and dancing.</p>
        </div>
      </section>

      <section className="max-w-280 mx-auto w-full px-6 tablet:px-10 pt-10 tablet:pt-13 pb-2">
        <div className="font-mono text-xs tracking-[0.16em] uppercase text-label mb-5 tablet:mb-6">
          Experience
        </div>
        <div className="flex flex-col">
          {EXPERIENCE.map((role) => (
            <div
              key={role.title}
              className="flex flex-col tablet:flex-row gap-1.5 tablet:gap-6 py-5 border-t border-border-soft"
            >
              <div className="w-full tablet:w-37.5 shrink-0 font-mono text-[13px] text-faint">
                {role.range}
              </div>
              <div className="flex-1">
                <div className="font-serif text-lg tablet:text-xl text-ink">
                  {role.title} ·{" "}
                  <span className="text-faint">{role.company}</span>
                </div>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-subtle">
                  {role.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2.5">
                      <span className="text-faint mt-px">—</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 tablet:mt-13 py-12 tablet:py-16 bg-surface-alt border-t border-border">
        <div className="max-w-280 mx-auto w-full px-6 tablet:px-10 flex flex-col items-center gap-9 tablet:gap-11">
          <div className="relative mx-auto w-75 h-47.5 tablet:w-116.5 tablet:h-69">
            <div className="absolute inset-0 flex items-center justify-center">
              <IkigaiMark className="w-32.5 h-32.5 tablet:w-50 tablet:h-50" />
            </div>
            <span
              className="absolute top-0.5 left-1/2 -translate-x-1/2 font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase whitespace-nowrap"
              style={{ color: "#A98420" }}
            >
              What you love
            </span>
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 w-21.25 tablet:w-29.5 text-left font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase leading-[1.4]"
              style={{ color: "#BE5C8C" }}
            >
              What you&apos;re good at
            </span>
            <span
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase whitespace-nowrap"
              style={{ color: "#4B82AB" }}
            >
              What the world needs
            </span>
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-21.25 tablet:w-29.5 text-right font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase leading-[1.4]"
              style={{ color: "#4C9A6A" }}
            >
              What you&apos;re paid for
            </span>
          </div>
          <div className="max-w-155 text-center">
            <div className="font-mono text-xs tracking-[0.18em] uppercase text-label mb-4.5">
              Ikigai
            </div>
            <h2 className="font-serif font-normal text-[26px] tablet:text-[32px] leading-[1.15] tracking-[-0.01em] text-ink mb-5.5">
              Behind the logo.
            </h2>
            <div className="flex flex-col gap-4.5 text-[15px] tablet:text-[17px] leading-relaxed tablet:leading-[1.7] text-body text-left">
              <p>
                The logo comes from <em>ikigai</em>, a Japanese concept for a
                life worth living, the reason you get up in the morning.
                It&apos;s pictured as four overlapping circles: what you
                love, what you&apos;re good at, what the world needs, and
                what you can be paid for. Ikigai is the small space in the
                center where all four meet.
              </p>
              <p>
                I used that diagram as the blueprint for the mark, and the
                balance it describes is one I try to keep in my work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-280 mx-auto w-full flex items-center justify-between px-6 tablet:px-10 py-8 tablet:py-11">
          <span className="font-mono text-[11px] tablet:text-[12.5px] text-faint">
            © 2026 Amy Kwak
          </span>
          <div className="flex gap-4 tablet:gap-6 font-mono text-[11px] tablet:text-[12.5px] text-faint">
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
