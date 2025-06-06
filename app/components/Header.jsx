"use client";

import { useTheme } from "../contexts/ThemeContext";
import { DarkModeToggle } from "./DarkModeToggle"; // adjust path if needed

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="header">
        <a href="/" className="logo">
          A<span>/</span>K
        </a>
        <div className="toggleContainer">
          <DarkModeToggle darkMode={theme === "dark"} onClick={toggleTheme} />
        </div>
      </header>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Catamaran:wght@400;700;900&display=swap");

        .header {
          display: flex;
          justify-content: space-between;
          padding: 0.9375rem 1.875rem;
        }

        .logo {
          font-family: "Catamaran", sans-serif;
          font-size: 1.6875rem;
          font-weight: 900;
          color: var(--color-text);
          transition: color 0.25s ease-in-out;
          will-change: opacity;
          text-decoration: none;
        }

        .logo span {
          color: var(--color-primary);
          transition: color 0.25s ease-in-out;
          will-change: opacity;
        }

        .logo:hover {
          color: var(--color-primary);
        }

        .logo:hover span {
          color: var(--color-text);
        }

        .toggleContainer {
          padding-top: 0.2rem;
        }
      `}</style>
    </>
  );
}
