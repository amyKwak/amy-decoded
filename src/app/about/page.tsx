import { IkigaiMark } from "../../components/IkigaiMark";
import { SiteHeader } from "../../components/SiteHeader";

const EXPERIENCE = [
  {
    range: "2024 — 2025",
    title: "Software Engineer",
    company: "KiwiCo",
    description:
      "Owned end-to-end architecture for a new subscription acquisition flow and revenue-driving marketing pages, then led a six-surface frontend redesign consolidating subscription lines for 100K+ monthly users.",
  },
  {
    range: "2022 — 2024",
    title: "Associate Software Engineer",
    company: "KiwiCo",
    description:
      "Architected a reusable, age-specific component library for the site's highest-traffic pages, and drove rapid A/B testing that lifted conversion 15% across homepage and product pages.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader active="about" />

      <section className="px-6 tablet:px-16 pt-12 tablet:pt-16 pb-2">
        <div className="font-mono text-[11px] tablet:text-xs tracking-[0.18em] uppercase text-label mb-4 tablet:mb-4.5">
          About
        </div>
        <h1 className="font-serif font-normal text-[34px] tablet:text-[52px] leading-[1.1] tracking-[-0.01em] text-ink max-w-[760px]">
          I build software that stays out of people&apos;s way.
        </h1>
      </section>

      <section className="flex flex-col tablet:flex-row gap-8 tablet:gap-12 px-6 tablet:px-16 pt-8 tablet:pt-11 pb-2 items-start">
        <div className="flex-1 flex flex-col gap-4 tablet:gap-5 text-[15px] tablet:text-[17px] leading-relaxed tablet:leading-[1.7] text-body order-2 tablet:order-1">
          <p>
            I&apos;m a software engineer in Seattle. I work mostly on the web
            — frontend architecture, the interface layer, and the product
            thinking that ties them together. I care about the small stuff:
            readable code, honest loading states, and interfaces that behave
            the way you&apos;d expect.
          </p>
          <p>
            I studied at UC San Diego and later trained at Hack Reactor
            before spending the last few years at KiwiCo, shipping
            subscription products end to end. I like working close to
            design and product — fast feedback, real users, and space to
            sweat the details.
          </p>
          <p>
            Outside of work I&apos;m usually playing video games, on a golf
            course, cooking something new, or dancing.
          </p>
        </div>
        <div className="w-full tablet:w-[320px] shrink-0 order-1 tablet:order-2">
          <div
            className="w-full h-[280px] tablet:h-[400px] rounded-2xl border border-border flex items-end justify-center pb-4"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #EDE8DE 0 10px, #F3EFE7 10px 20px)",
            }}
          >
            <span className="font-mono text-[11px] tracking-[0.08em] text-faint">
              portrait / photo
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 tablet:px-16 pt-10 tablet:pt-13 pb-2">
        <div className="font-mono text-xs tracking-[0.16em] uppercase text-label mb-5 tablet:mb-6">
          Experience
        </div>
        <div className="flex flex-col">
          {EXPERIENCE.map((role) => (
            <div
              key={role.title}
              className="flex flex-col tablet:flex-row gap-1.5 tablet:gap-6 py-5 border-t border-border-soft"
            >
              <div className="w-full tablet:w-[120px] shrink-0 font-mono text-[13px] text-faint">
                {role.range}
              </div>
              <div className="flex-1">
                <div className="font-serif text-lg tablet:text-xl text-ink">
                  {role.title} · <span className="text-faint">{role.company}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 tablet:mt-13 px-6 tablet:px-16 py-12 tablet:py-16 bg-surface-alt border-t border-border">
        <div className="flex flex-col items-center gap-9 tablet:gap-11">
          <div className="relative mx-auto w-[300px] h-[190px] tablet:w-[466px] tablet:h-[276px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <IkigaiMark className="w-[130px] h-[130px] tablet:w-[200px] tablet:h-[200px]" />
            </div>
            <span
              className="absolute top-0.5 left-1/2 -translate-x-1/2 font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase whitespace-nowrap"
              style={{ color: "#A98420" }}
            >
              What you love
            </span>
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[85px] tablet:w-[118px] text-left font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase leading-[1.4]"
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
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[85px] tablet:w-[118px] text-right font-mono text-[9px] tablet:text-[11.5px] font-medium tracking-[0.08em] uppercase leading-[1.4]"
              style={{ color: "#4C9A6A" }}
            >
              What you&apos;re paid for
            </span>
          </div>
          <div className="max-w-[620px] text-center">
            <div className="font-mono text-xs tracking-[0.18em] uppercase text-label mb-4.5">
              Ikigai
            </div>
            <h2 className="font-serif font-normal text-[26px] tablet:text-[32px] leading-[1.15] tracking-[-0.01em] text-ink mb-5.5">
              The idea behind the mark.
            </h2>
            <div className="flex flex-col gap-4.5 text-[15px] tablet:text-[17px] leading-relaxed tablet:leading-[1.7] text-body text-left">
              <p>
                The logo is drawn from <em>ikigai</em> — a Japanese concept
                for a life worth living, the reason you get up in the
                morning. It&apos;s often pictured as four overlapping
                circles: what you love, what you&apos;re good at, what the
                world needs, and what you can be paid for.
              </p>
              <p>
                Ikigai is the small place at the center where all four
                meet. I used that diagram as the blueprint for the mark —
                four circles, four colors, one bright overlap in the
                middle — because the balance it describes is one I try to
                keep in the work.
              </p>
            </div>
          </div>
        </div>
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
