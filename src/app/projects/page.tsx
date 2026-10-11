import { SiteHeader } from "../../components/SiteHeader";

const PROJECTS = [
  {
    name: "Noggin",
    description:
      "A 1v1 party game for two phones. Hold yours to your forehead and ask yes or no questions to guess your number or celebrity first. Peer-to-peer over WebRTC, no game server.",
    url: "/projects/noggin",
    image: "/projects/noggin-card.svg",
    alt: "Noggin wordmark beside two tilted phone cards showing 42 and Dolly Parton",
  },
  {
    name: "Moody",
    description:
      "A mood journal with a research-backed check-in. Claude suggests feeling words and answers questions about your own entries with tool use.",
    url: "/projects/moody",
    image: "/projects/moody-card.svg",
    alt: "Moody wordmark next to a small four-color mood grid",
  },
  {
    name: "Thyme",
    description:
      "A recipe keeper for fuss-free cooking. Import recipes from a link, pasted text, or a photo, then cook them one step at a time.",
    url: "https://thyme-beta.vercel.app/thyme",
    image: "/projects/thyme-card.png",
    alt: "Thyme wordmark with a sprout mark on a pale green background",
  },
  {
    name: "Cheerful",
    description:
      "A small weekly ritual app. Jot down five good things from your week, then come back in the evenings to reflect on them.",
    url: "https://cheerful-beta.vercel.app",
    image: "/projects/cheerful-card.png",
    alt: "Cheerful wordmark with tilted letters and a coral sparkle",
  },
];

// Projects hosted on this site open in the same tab.
const linkProps = (url: string) =>
  url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

export default function ProjectsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader active="projects" />

      <section className="tablet:px-10 tablet:pt-14 mx-auto w-full max-w-280 px-6 pt-12 pb-2">
        <div className="tablet:text-xs text-label tablet:mb-4.5 mb-4 font-mono text-[11px] tracking-[0.18em] uppercase">
          Personal projects
        </div>
        <h1 className="tablet:text-[48px] text-ink mb-3.5 max-w-170 font-serif text-[34px] leading-[1.1] font-normal tracking-[-0.01em]">
          Built for fun
        </h1>
        <p className="tablet:text-base tablet:leading-[1.6] text-muted max-w-140 text-[15px] leading-relaxed">
          Little apps and experiments I&apos;ve made on my own time, for the joy
          of building and to try out ideas.
        </p>
      </section>

      <section className="tablet:px-10 tablet:pt-10 mx-auto w-full max-w-280 flex-1 px-6 pt-8 pb-2">
        <div className="tablet:grid-cols-2 tablet:gap-5.5 grid grid-cols-1 gap-4.5">
          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="bg-surface border-border-soft flex flex-col overflow-hidden rounded-[14px] border"
            >
              <a
                href={project.url}
                {...linkProps(project.url)}
                className="tablet:h-47.5 border-border-soft block h-37.5 border-b"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.alt}
                  className="h-full w-full object-cover"
                />
              </a>
              <div className="tablet:p-6 flex flex-col items-start p-4.5">
                <h3 className="tablet:text-[23px] text-ink tablet:mb-2.5 mb-2 font-serif text-xl font-medium">
                  {project.name}
                </h3>
                <p className="tablet:text-sm text-muted tablet:mb-4 mb-3.5 text-[13.5px] leading-relaxed">
                  {project.description}
                </p>
                <a
                  href={project.url}
                  {...linkProps(project.url)}
                  className="tablet:text-sm text-ink border-border-btn inline-flex items-center gap-1.75 border-b pb-[3px] text-[13.5px] font-semibold"
                >
                  Visit
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

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
