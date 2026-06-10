"use client";

import Link from "next/link";
import Header from "../components/Header";
import { Typist } from "../components/Typist";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <section className="flex-1 min-h-0 flex flex-col justify-center items-center px-7.5 py-4 overflow-y-auto">
        <Link
          href="/about"
          className="relative group mx-auto mb-10 px-2 pb-0.5 pt-1.5"
        >
          <span className="relative z-10 text-text leading-relaxed border-b border-dotted border-text transition-all duration-250 ease-in-out tablet:group-hover:text-white tablet:group-hover:border-white">
            Who am I?
          </span>
          <span
            aria-hidden
            className="hidden tablet:block absolute bottom-0 left-0 w-full h-0 bg-primary z-0 transition-[height] duration-250 ease-in-out group-hover:h-6"
          />
        </Link>
        <h1
          style={{ color: "#3371ff" }}
          className="text-[17vw] tablet:text-[10vw] font-black mb-1.25"
        >
          Amy Kwak
        </h1>
        <h2 className="text-[7vw] tablet:text-[2.5vw] font-normal text-center">
          Software Engineer who likes building stuff with
        </h2>
        <h3 className="text-[10vw] tablet:text-[5vw]">
          <Typist />
        </h3>
      </section>
    </div>
  );
}
