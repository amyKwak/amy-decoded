"use client";

import { useTheme } from "../contexts/ThemeContext";
import { DarkModeToggle } from "./DarkModeToggle"; // adjust path if needed

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="header-wrapper">
        <header className="header">
          <a href="/" className="logo">
            A<span>/</span>K
          </a>
          <div className="options">
            <a href="/projects" className="link">
              Projects
            </a>
            <div className="toggleContainer">
              <DarkModeToggle
                darkMode={theme === "dark"}
                onClick={toggleTheme}
              />
            </div>
          </div>
        </header>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Catamaran:wght@400;700;900&display=swap");
        .header-wrapper {
          width: 100%;
          position: absolute;
          display: flex;
          justify-content: center;
        }
        .header {
          display: flex;
          width: 100%;
          justify-content: space-between;
          padding: 0.9375rem 1.875rem;
          max-width: 1100px;
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
        .options {
          display: flex;
          align-items: center;
        }
        .link {
          font-weight: bold;
          color: var(--color-text);
        }
        .link:hover {
          color: var(--color-primary);
        }
        .toggleContainer {
          padding-top: 0.2rem;
          padding-left: 1rem;
        }
      `}</style>
    </>
  );
}
