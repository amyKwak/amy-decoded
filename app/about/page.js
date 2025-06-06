"use client";

import Header from "../components/Header";
import { Sticky } from "./components/Sticky";
import { useTheme } from "../contexts/ThemeContext";
import theme from "../utils/theme";

const AboutPage = () => {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <section className={`section ${isDark ? "dark" : "light"}`}>
          <div className="container">
            <h1>
              <span>Software Engineer</span>
              <br />
              Based in Seattle,
              <br />
            </h1>
            <h3>
              I’m passionate about creating{" "}
              <span>user-centered interfaces</span> that blend thoughtful design
              with delightful interactions. With 2 years of experience
              developing <span>frontend solutions</span>, I thrive on crafting
              experiences that connect people to technology in meaningful ways.
            </h3>
          </div>
        </section>
        <Sticky />
        <style jsx>{`
          .page-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100vh;
            width: 100%;
          }
          .section {
            flex: 1;
            width: 100%;
            padding: 0px 30px 15vh;
            max-width: 1100px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
          }
          .container {
            max-width: 1000px;
          }
          .section h1 span {
            width: 100%;
            font-size: 3.5rem;
            line-height: 1;
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
          @media ${theme.devices.tablet} {
            .section h1 span {
              font-size: 80px;
            }
            .section h1 {
              font-size: 60px;
              line-height: 1;
              margin-bottom: 15px;
            }
            .section h3 {
              font-size: 25px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default AboutPage;
