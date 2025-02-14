import Image from "next/image";
import styles from "../styles/#navigation.module.css";
import Link from "next/link";

const Navigation = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/">
          <Image src="/brand.svg" width={50} height={50} alt="logo" />
        </Link>
        <ul>
          <li className={styles.link}>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
