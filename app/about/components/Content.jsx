"use client";

import React from "react";
import PropTypes from "prop-types";

import theme from "../../utils/theme";
import { useTheme } from "../../contexts/ThemeContext";

export function Content({ children }) {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <>
      <section className={`section ${isDark ? "dark" : "light"}`}>
        {children}
      </section>

      <style jsx>{`
        .section {
          flex: 1;
          padding: 0px 20px 160px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .section h1 {
          width: 100%;
          font-size: 8rem;
          color: ${theme.colors.blue};
        }
        .section.light h1 {
          color: ${theme.colors.black};
        }
        .section.dark h1 {
          color: ${theme.colors.white};
        }
        @media ${theme.devices.tablet} {
          .section h1 {
            font-size: 5rem;
          }
        }
        .section h1 span {
          color: ${theme.colors.blue};
        }

        .section h3 {
          color: ${theme.colors.black};
          font-size: 2.5rem;
        }
        .section.light h3 {
          color: ${theme.colors.black};
        }
        .section.dark h3 {
          color: ${theme.colors.white};
        }
        @media ${theme.devices.tablet} {
          .section h3 {
            font-size: 1.8rem;
          }
        }
        .section h3 span {
          color: ${theme.colors.blue};
        }
      `}</style>
    </>
  );
}

Content.propTypes = {
  children: PropTypes.node,
};
