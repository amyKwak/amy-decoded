import React from "react";
import { TypeAnimation } from "react-type-animation";

const things_I_like = [
  "React",
  "Next.js",
  "MySQL",
  "Node.js",
  "Swift",
  "Javascript.",
];

const TypistComponent = () => {
  const sequence = [];
  things_I_like.forEach((thing) => {
    sequence.push(thing);
    sequence.push(1000); // wait 1s before next word
  });

  return (
    <TypeAnimation
      sequence={sequence}
      wrapper="strong"
      speed={30}
      deletionSpeed={30}
      style={{ fontSize: "2em", display: "inline-block" }}
    />
  );
};

export { TypistComponent as Typist };
