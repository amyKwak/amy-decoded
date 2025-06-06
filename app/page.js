"use client"; // if you’re using hooks or client-side logic

import styles from "./page.module.css";
import { useTheme } from "./components/ThemeContext";
import Nav from "./components/Header";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme(); // This comes from ThemeContext

  return (
    <section className={styles.section}>
      <Nav />
      {/* <button className={styles.buttonPrimary} onClick={toggleTheme}>
        {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
      </button> */}
    </section>
  );
}
