import Link from "next/link";
import { IkigaiMark } from "../components/IkigaiMark";

export default function HomePage() {
  return (
    <div className="h-dvh flex flex-col">
      <div className="max-w-[1120px] mx-auto w-full h-full flex flex-col relative px-6 tablet:px-10">
        <nav className="hidden tablet:flex absolute top-7.5 right-6 tablet:right-10 gap-7 text-[15px] text-ink z-10">
          <Link href="/about">About</Link>
          <Link href="/projects">Projects</Link>
        </nav>

        <section className="flex-1 min-h-0 flex flex-col items-center justify-end tablet:justify-center text-center pb-32 tablet:pb-0">
          <IkigaiMark className="w-18 h-18 tablet:w-24 tablet:h-24 mb-6 tablet:mb-7.5" />
          <div className="font-mono text-[11px] tablet:text-[13px] tracking-[0.18em] uppercase text-label mb-3 tablet:mb-4.5">
            Software Engineer · Seattle
          </div>
          <h1 className="font-serif font-normal text-[42px] tablet:text-[60px] leading-[1.05] tracking-[-0.01em] text-ink mb-4 tablet:mb-5.5">
            Amy Kwak
          </h1>
          <p className="text-[15px] tablet:text-[18px] leading-relaxed tablet:leading-[1.6] text-body max-w-[520px] mb-8 tablet:mb-10">
            Full stack engineer with a designer's eye. I build web experiences
            that look good, load fast, and move metrics.
          </p>

          <nav className="tablet:hidden flex flex-col items-center gap-5.5 mb-7">
            <Link href="/about" className="font-serif text-2xl text-ink">
              About
            </Link>
            <Link href="/projects" className="font-serif text-2xl text-ink">
              Projects
            </Link>
          </nav>

          <a
            href="/Amy-Kwak-Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink border-b border-border-btn pb-[3px]"
          >
            Resume
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="M7 10l5 5 5-5" />
              <path d="M4 19h16" />
            </svg>
          </a>
        </section>

        <div className="absolute bottom-7.5 left-0 right-0 flex justify-center gap-6.5 font-mono text-[12.5px] tablet:text-[12.5px] text-faint px-6">
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
    </div>
  );
}
