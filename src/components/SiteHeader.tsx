"use client";

import { useState } from "react";
import Link from "next/link";
import { IkigaiMark } from "./IkigaiMark";

export function SiteHeader({ active }: { active: "about" | "projects" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 tablet:px-11 py-5 tablet:py-6.5 border-b border-border-soft">
        <Link href="/" className="flex items-center gap-2.75">
          <IkigaiMark className="w-7 h-7" />
          <span className="font-serif text-base tablet:text-lg text-ink">Amy Kwak</span>
        </Link>

        <nav className="hidden tablet:flex items-center gap-6.5 text-[15px] text-ink">
          <Link href="/about" className={active === "about" ? "font-semibold" : "text-faint"}>
            About
          </Link>
          <Link href="/projects" className={active === "projects" ? "font-semibold" : "text-faint"}>
            Projects
          </Link>
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="tablet:hidden flex items-center gap-1.75 font-mono text-xs text-ink bg-surface border border-border-btn rounded-full px-3.5 py-2"
        >
          Menu
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {open && (
        <div className="tablet:hidden fixed inset-0 z-50 bg-ink flex flex-col">
          <div className="flex items-center justify-between px-6 pt-5">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
              <IkigaiMark className="w-6.5 h-6.5" />
              <span className="font-serif text-base text-ivory">Amy Kwak</span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.75 font-mono text-xs text-ivory bg-white/8 border border-white/20 rounded-full px-3.5 py-2"
            >
              Close
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center px-10">
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="font-serif text-[38px] text-ivory py-2.5 border-b border-white/12"
            >
              About
            </Link>
            <Link
              href="/projects"
              onClick={() => setOpen(false)}
              className="font-serif text-[38px] text-ivory py-2.5 border-b border-white/12"
            >
              Projects
            </Link>
          </nav>
          <div className="flex gap-6 px-10 pb-10 font-mono text-xs text-faint">
            <a href="https://github.com/amyKwak" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/amykwak/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:amykwak26@gmail.com">Email</a>
          </div>
        </div>
      )}
    </>
  );
}
