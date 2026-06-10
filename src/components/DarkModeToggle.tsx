"use client";

import styles from "./DarkModeToggle.module.css";

interface DarkModeToggleProps {
  darkMode: boolean;
  onClick: () => void;
}

export function DarkModeToggle({ darkMode, onClick }: DarkModeToggleProps) {
  return (
    <button
      className={styles.toggle}
      onClick={onClick}
      aria-label={`Activate ${!darkMode ? "dark" : "light"} mode`}
      title={`Activate ${!darkMode ? "dark" : "light"} mode`}
    >
      <div
        className={`${styles.icon} ${darkMode ? styles.iconDark : styles.iconLight}`}
      />
    </button>
  );
}
