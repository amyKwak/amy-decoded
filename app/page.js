"use client";

import React from "react";
import Header from "./components/Header";
import { Typist } from "./components/Typist";
import theme from "./utils/theme";

export default function HomePage() {
  return (
    <>
      <div className="page-wrapper">
        <Header />
        <section className="section">
          <a className="about" href="/about">
            <span>Who am I?</span>
          </a>
          <h1>Amy Kwak</h1>
          <h2>Software Engineer who likes building stuff with</h2>
          <h3>
            <Typist />
          </h3>
        </section>
      </div>

      <style jsx>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .section {
          flex: 1;
          width: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 15px 30px;
          overflow-y: auto;
        }
        h1 {
          font-size: 60px;
          color: var(--color-primary);
          margin-bottom: 5px;
        }
        h2 {
          font-weight: 400;
          font-size: 25px;
          text-align: center;
        }
        h3 {
          font-size: 40px;
          color: var(--color-primary);
        }
        .text {
          color: var(--color-text);
        }
        .about {
          position: relative;
          margin: 0 auto 40px;
          padding: 6px 8px 2px;
        }
        .about span {
          color: var(--color-text);
          z-index: 1;
          line-height: 1.5;
          border-bottom: 1px dotted var(--color-text);
          position: relative;
          transition: all 0.25s ease-in-out;
        }
        .about::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          height: 0;
          width: 100%;
          transition: height 0.25s ease-in-out;
          will-change: transform;
          background-color: var(--color-primary);
          z-index: 0;
        }
        .about:hover span {
          color: var(--color-white);
          border-color: var(--color-white);
        }
        .about:hover::after {
          height: 24px;
        }
        @media (${theme.devices.tablet});
      `}</style>
    </>
  );
}
