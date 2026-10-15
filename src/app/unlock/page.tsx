import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { gatedProjectFor } from "@/lib/gate";
import { UnlockForm } from "./_components/UnlockForm";

export const metadata: Metadata = {
  title: "Password required",
  robots: { index: false, follow: false },
};

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const raw = (await searchParams).next;
  const requested = typeof raw === "string" ? raw : "";
  // Only send people back to a gated project on this site.
  const project = requested.startsWith("/")
    ? gatedProjectFor(new URL(requested, "http://x").pathname)
    : undefined;
  const next = project ? requested : "/projects";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader active="projects" />

      <main className="tablet:py-20 flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-115 flex-col items-center text-center">
          <div className="bg-ink text-ivory tablet:mb-7 tablet:h-16 tablet:w-16 mb-6 flex h-14 w-14 items-center justify-center rounded-full">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
          </div>

          <div className="tablet:text-xs text-label tablet:mb-4 mb-3.5 font-mono text-[11px] tracking-[0.18em] uppercase">
            {project ? `${project.name} · ` : ""}Password protected
          </div>
          <h1 className="tablet:text-[44px] text-ink mb-3.5 font-serif text-[34px] leading-[1.1] font-normal tracking-[-0.01em]">
            Password required
          </h1>
          <p className="tablet:text-base text-muted tablet:mb-8 mb-7 max-w-105 text-[15px] leading-relaxed">
            This project uses the Claude API, so access is limited. Enter the
            password to continue, or request access.
          </p>

          <UnlockForm next={next} />

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="mailto:amykwak26@gmail.com?subject=Project%20access%20request"
              className="text-ink border-border-btn border-b pt-3 pb-[3px] font-semibold"
            >
              Request access
            </a>
            <Link href="/projects" className="text-muted border-border border-b pt-3 pb-[3px]">
              Back to projects
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-border border-t">
        <div className="tablet:px-10 tablet:py-11 mx-auto flex w-full max-w-280 items-center justify-between px-6 py-8">
          <span className="tablet:text-[12.5px] text-faint font-mono text-[11px]">
            © 2026 Amy Kwak
          </span>
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
