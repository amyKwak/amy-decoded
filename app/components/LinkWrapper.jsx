"use client"; // Keep this at the top

import Link from "next/link";
import { useState } from "react";
import styles from "../styles/#link.module.css"; // Ensure your path is correct

const LinkWrapper = ({ children, href }) => {
  const [hoverClass, setHoverClass] = useState("");

  return (
    <Link href={href} passHref prefetch={false}>
      <div
        className={`${styles.link} ${
          hoverClass === "hovered" ? styles.hovered : ""
        } ${hoverClass === "hovered-out" ? styles.hoveredOut : ""}`}
        onMouseEnter={() => setHoverClass("hovered")}
        onMouseLeave={() => setHoverClass("hovered-out")}
      >
        <span className={styles.text}>{children}</span>
        <div className={styles.underline}></div>
      </div>
    </Link>
  );
};

export default LinkWrapper;
