"use client";

import Header from "../components/Header";
import { Sticky } from "./components/Sticky";
import { useTheme } from "../contexts/ThemeContext";
import theme from "../utils/theme";

export default function AboutPage() {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <>
      <div className="page-container">
        <Header />
        <div className="page-wrapper">
          <section className={`section ${isDark ? "dark" : "light"}`}>
            <div className="container">
              <h1>Software Engineer</h1>
              <h2>Based in Seattle,</h2>
              <h3>
                I’m passionate about creating{" "}
                <span className="text--blue">user-centered interfaces</span>{" "}
                that blend thoughtful design with delightful interactions. With
                2 years of experience developing{" "}
                <span className="text--blue">frontend solutions</span>, I thrive
                on crafting experiences that connect people to technology in
                meaningful ways.
              </h3>
            </div>
          </section>
          <Sticky />
        </div>
      </div>

      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
        }

        .page-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .section {
          flex: 1;
          width: 100%;
          padding: 0 30px;
          max-width: 1060px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          overflow: hidden;
          padding-bottom: 15vh;
        }

        .section h1 {
          width: 100%;
          font-size: 4rem;
          line-height: 1;
          color: ${theme.colors.blue};
          margin-bottom: 5px;
        }

        .section h2 {
          font-size: 2rem;
          margin-bottom: 15px;
        }

        .section h3 {
          font-size: 18px;
          font-weight: 400;
          line-height: 1.2;
        }

        .text--blue {
          color: ${theme.colors.blue};
          white-space: nowrap;
        }

        @media ${theme.devices.tablet} {
          .section h1 {
            font-size: 80px;
            margin-bottom: 0;
          }
          .section h2 {
            font-size: 60px;
          }
          .section h3 {
            font-size: 25px;
          }
        }
      `}</style>
    </>
  );
}
