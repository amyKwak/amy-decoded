import { SiteHeader } from "../../components/SiteHeader";

const PROJECTS = [
  {
    name: "Cheerful",
    description:
      "A small weekly ritual app. Jot down five good things from your week, then come back in the evenings to reflect on them.",
    url: "https://cheerful-beta.vercel.app",
    image: "/projects/cheerful-card.png",
    alt: "Cheerful wordmark with tilted letters and a coral sparkle",
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader active="projects" />

      <section className="max-w-280 mx-auto w-full px-6 tablet:px-10 pt-12 tablet:pt-14 pb-2">
        <div className="font-mono text-[11px] tablet:text-xs tracking-[0.18em] uppercase text-label mb-4 tablet:mb-4.5">
          Personal projects
        </div>
        <h1 className="font-serif font-normal text-[34px] tablet:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mb-3.5 max-w-170">
          Built for fun
        </h1>
        <p className="text-[15px] tablet:text-base leading-relaxed tablet:leading-[1.6] text-muted max-w-140">
          Little apps and experiments I&apos;ve made on my own time, for the joy
          of building and to try out ideas.
        </p>
      </section>

      <section className="flex-1 max-w-280 mx-auto w-full px-6 tablet:px-10 pt-8 tablet:pt-10 pb-2">
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4.5 tablet:gap-5.5">
          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="bg-surface border border-border-soft rounded-[14px] overflow-hidden flex flex-col"
            >
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-37.5 tablet:h-47.5 border-b border-border-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.alt}
                  className="w-full h-full object-cover"
                />
              </a>
              <div className="p-4.5 tablet:p-6 flex flex-col items-start">
                <h3 className="font-serif font-medium text-xl tablet:text-[23px] text-ink mb-2 tablet:mb-2.5">
                  {project.name}
                </h3>
                <p className="text-[13.5px] tablet:text-sm leading-relaxed text-muted mb-3.5 tablet:mb-4">
                  {project.description}
                </p>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.75 text-[13.5px] tablet:text-sm font-semibold text-ink border-b border-border-btn pb-[3px]"
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

      <footer className="mt-10 tablet:mt-13 border-t border-border">
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
