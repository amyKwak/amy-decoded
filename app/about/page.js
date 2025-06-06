"use client";

import Header from "../components/Header";
import { Sticky } from "./components/Sticky";
import { useTheme } from "../contexts/ThemeContext";
import theme from "../utils/theme";

const AboutPage = () => {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <div className="page-wrapper">
      <Header />
      <section className={`section ${isDark ? "dark" : "light"}`}>
        <h1>
          <span>Software Engineer</span>
          <br />
          Based in Seattle,
          <br />
        </h1>
        <h3>
          I’m passionate about creating <span>user-centered interfaces</span>{" "}
          that blend thoughtful design with delightful interactions. With 2
          years of experience developing <span>frontend solutions</span>, I
          thrive on crafting experiences that connect people to technology in
          meaningful ways.
        </h3>
      </section>
      <Sticky />
      <style jsx>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .section {
          flex: 1;
          padding: 0px 30px 15vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .section h1 span {
          width: 100%;
          font-size: 3.5rem;
          line-height: 1.2;
          color: ${theme.colors.blue};
        }
        .section h1 {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .section h3 {
          font-size: 18px;
          font-weight: 400;
          line-height: 1.2;
        }
        .section span {
          color: ${theme.colors.blue};
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
