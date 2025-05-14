import Image from "next/image";
import styles from "../styles/#navigation.module.css";
import Link from "next/link";
import LinkWrapper from "./LinkWrapper";

const Navigation = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/">
          <Image src="/brand.svg" width={60} height={60} alt="logo" />
        </Link>
        <ul className={styles.list}>
          <li className={styles.link}>
            <LinkWrapper href="/about">About</LinkWrapper>
          </li>
          <li className={styles.link}>
            <LinkWrapper href="/projects">Projects</LinkWrapper>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
