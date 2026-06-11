"use client";

import Link from "next/link";
import { useTheme } from "../contexts/ThemeContext";
import { DarkModeToggle } from "./DarkModeToggle";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-full absolute flex justify-center">
      <header className="flex w-full justify-between px-7.5 py-3.75 max-w-275">
        <Link
          href="/"
          className="font-black text-[1.6875rem] text-text no-underline transition-colors duration-250 ease-in-out hover:text-primary [&>span]:text-primary [&>span]:transition-colors [&>span]:duration-250 hover:[&>span]:text-text"
          style={{ fontFamily: "var(--font-catamaran), sans-serif" }}
        >
          A<span>/</span>K
        </Link>
        <div className="flex items-center">
          {/* <Link href="/projects" className="font-bold text-text hover:text-primary">
            Projects
          </Link> */}
          <div className="pt-[0.2rem] pl-4">
            <DarkModeToggle darkMode={theme === "dark"} onClick={toggleTheme} />
          </div>
        </div>
      </header>
    </div>
  );
}
