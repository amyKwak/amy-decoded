import Image from "next/image";
import styles from "./page.module.css";
import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div className={styles.page}>
      <Navigation />
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.info}>
            <h2 className={styles.title}>Software Engineer</h2>
          </div>
        </div>
      </section>
    </div>
  );
}
