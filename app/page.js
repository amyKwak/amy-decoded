"use client";

import styles from "./page.module.css";
import Header from "./components/Header";
import { Typist } from "./components/Typist";

export default function HomePage() {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <section className={styles.section}>
        <a className={styles.about} href="/about">
          <span>Who am I?</span>
        </a>
        <h1>Amy Kwak</h1>
        <h2>
          <span className={styles.text}>
            Software Engineer who likes building stuff with
          </span>
          <br />
          <Typist />
        </h2>
      </section>
    </div>
  );
}
