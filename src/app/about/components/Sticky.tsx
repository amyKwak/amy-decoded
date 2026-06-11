import { useTheme } from "../../../contexts/ThemeContext";
import styles from "./Sticky.module.css";

export function Sticky() {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <section className={`${styles.sticky} ${isDark ? styles.dark : ""}`}>
      <div className={styles.inner}>
        <h3 className={styles.heading}>
          Where to <br className={styles.lineBreak} />
          find me
        </h3>
        <a
          href="https://www.linkedin.com/in/amykwak/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.social}
          style={{ backgroundColor: "#0073b1" }}
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/amyKwak"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.social}
          style={{ backgroundColor: "#24292e" }}
        >
          GitHub
        </a>
        <a
          href="mailto:amykwak26@gmail.com"
          className={styles.social}
          style={{ backgroundColor: "#d93025" }}
        >
          Mail
        </a>
      </div>
    </section>
  );
}
