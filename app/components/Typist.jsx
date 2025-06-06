"use client";

import React from "react";
import { TypeAnimation } from "react-type-animation";
import theme from "../utils/theme";

const things_I_like = [
  "React",
  "Next.js",
  "MySQL",
  "Node.js",
  "Swift",
  "Javascript.",
];

export function Typist() {
  const sequence = [];
  things_I_like.forEach((thing) => {
    sequence.push(thing);
    sequence.push(1000);
  });

  return (
    <>
      <TypeAnimation
        sequence={sequence}
        wrapper="strong"
        speed={30}
        deletionSpeed={30}
        className="animatedText"
      />
      <style jsx>{`
        .animatedText {
          display: inline-block;
          font-size: 20px;
        }
        @media ${theme.devices.tablet} {
          .animatedText {
            font-size: 400px;
          }
        }
      `}</style>
    </>
  );
}
