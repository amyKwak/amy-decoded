"use client";

import Header from "../../components/Header";
import { Sticky } from "./components/Sticky";
import { useTheme } from "../../contexts/ThemeContext";

export default function AboutPage() {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        <section
          className={`flex-1 w-full px-7.5 max-w-265 mx-auto flex flex-col justify-end items-center overflow-hidden pb-[15vh] ${isDark ? "dark" : "light"}`}
        >
          <div className="w-full">
            <h1 className="text-[4rem] tablet:text-[80px] leading-none text-primary font-bold mb-1.25 tablet:mb-0 w-full">
              Software Engineer
            </h1>
            <h2 className="text-[2rem] tablet:text-[2.8rem] font-bold mb-3.75">
              📍Seattle, WA
            </h2>
            <h3 className="text-[18px] tablet:text-[25px] font-normal leading-snug">
              I build high-quality, scalable digital experiences that help
              people get things done efficiently. My work focuses on clean,
              maintainable frontend architecture, performance optimization, and
              experimentation (A/B testing) to improve usability and conversion.
              I collaborate closely with designers and product teams to ship
              data-informed features, while delivering production-ready internal
              tools and API integrations for real-world applications.
            </h3>
          </div>
        </section>
        <Sticky />
      </div>
    </div>
  );
}
