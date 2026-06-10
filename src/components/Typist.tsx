"use client";

import { TypeAnimation } from "react-type-animation";

const THINGS_I_LIKE = [
  "React",
  "Next.js",
  "MySQL",
  "Node.js",
  "Swift",
  "Javascript.",
];

const sequence = THINGS_I_LIKE.flatMap((thing) => [thing, 1000]);

export function Typist() {
  return (
    <TypeAnimation
      sequence={sequence}
      wrapper="strong"
      speed={30}
      deletionSpeed={30}
      className="inline-block"
    />
  );
}
