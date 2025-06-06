"use client";

import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import theme from "../../utils/theme";

export function Sticky() {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <>
      <section className={`sticky ${isDark ? "dark" : "light"}`}>
        <div className="inner">
          <h3>Where to find me</h3>
          <a
            href="https://www.linkedin.com/in/amykwak/"
            target="_blank"
            rel="noopener noreferrer"
            className="social"
            style={{ backgroundColor: "#0073b1" }}
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/amyKwak"
            target="_blank"
            rel="noopener noreferrer"
            className="social"
            style={{ backgroundColor: "#24292e" }}
          >
            GitHub
          </a>
          <a
            href="mailto:yoomikwak@gmail.com"
            className="social"
            style={{ backgroundColor: "#d93025" }}
          >
            Mail
          </a>
        </div>
      </section>

      <style jsx>{`
        .sticky {
          position: fixed;
          bottom: 0;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
          padding: 15px 30px;
          background-color: var(--color-white);
          z-index: 1000;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .sticky.dark {
          background-color: var(--color-black);
        }

        .inner {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 1000px;
          width: 100%;
        }

        .inner h3 {
          color: var(--color-text);
          line-height: 1;
          margin: 0;
          font-weight: 400;
        }

        .social {
          display: inline-block;
          line-height: 1;
          color: var(--color-white);
          font-size: 1rem;
          border-radius: 5px;
          text-decoration: none;
          padding: 0.5rem 0.5rem;
        }
        @media ${theme.devices.tablet} {
          .inner h3 {
            font-size: 25px;
          }
        }
      `}</style>
    </>
  );
}
