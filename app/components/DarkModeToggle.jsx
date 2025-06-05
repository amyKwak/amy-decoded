"use client";

import React from "react";
import PropTypes from "prop-types";

function DarkModeToggle({ darkMode, onClick }) {
  return (
    <>
      <button
        className="toggle"
        onClick={onClick}
        aria-label={`Activate ${!darkMode ? "dark" : "light"} mode`}
        title={`Activate ${!darkMode ? "dark" : "light"} mode`}
      >
        <div className={`icon ${darkMode ? "dark" : "light"}`} />
      </button>

      <style jsx>{`
        .toggle {
          position: relative;
          align-items: center;
          background-color: transparent;
          border: 0;
          border-radius: 5px;
          display: inline-flex;
          cursor: pointer;
          justify-content: center;
          opacity: 0.6;
          transition: opacity 0.3s ease;
          width: 40px;
          height: 40px;
          transform: scale(0.8);
          outline: 0;
          padding: 0;
          margin: 0;
        }

        .icon {
          position: relative;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          transition: all 0.45s ease 0s;
        }

        /* Common pseudo-elements for both modes */
        .icon:before {
          content: "";
          border: 2px solid var(--color-white);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          position: absolute;
          right: -12px;
          top: -12px;
        }

        .icon:after {
          content: "";
          width: 8px;
          height: 8px;
          left: 50%;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          margin: -4px 0 0 -4px;
        }

        /* DARK mode styles */
        .icon.dark {
          background-color: var(--color-white);
          transform: scale(0.55);
          overflow: visible;
        }

        .icon.dark:before {
          background-color: var(--color-black);
          opacity: 0;
          transform: translate(14px, -14px);
          transition: transform 0.45s ease 0s;
        }

        .icon.dark:after {
          box-shadow: var(--color-white) 0px -23px 0px,
            var(--color-white) 0px 23px 0px, var(--color-white) 23px 0px 0px,
            var(--color-white) -23px 0px 0px, var(--color-white) 15px 15px 0px,
            var(--color-white) -15px 15px 0px, var(--color-white) 15px -15px 0px,
            var(--color-white) -15px -15px 0px;
          transform: scale(1);
          transition: all 0.35s ease 0s;
        }

        /* LIGHT mode styles */
        .icon.light {
          background-color: var(--color-black);
          overflow: hidden;
          transform: scale(1);
        }

        .icon.light:before {
          background-color: var(--color-white);
          border-color: var(--color-white);
          opacity: 1;
          transform: translate(0, 0);
          transition: transform 0.45s ease;
        }

        .icon.light:after {
          box-shadow: 0px -23px 0px var(--color-black),
            0px 23px 0px var(--color-black), 23px 0px 0px var(--color-black),
            -23px 0px 0px var(--color-black), 15px 15px 0px var(--color-black),
            -15px 15px 0px var(--color-black), 15px -15px 0px var(--color-black),
            -15px -15px 0px var(--color-black);
          transform: scale(0);
          transition: all 0.35s ease;
        }
      `}</style>
    </>
  );
}

DarkModeToggle.propTypes = {
  darkMode: PropTypes.bool,
  onClick: PropTypes.func,
};

export default DarkModeToggle;
