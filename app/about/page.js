import React from "react";
import { Layout, Header } from "../components";
import { Sticky, Content } from "./components";
import { ThemeProvider } from "../contexts/ThemeContext";

const AboutPage = () => (
  <ThemeProvider>
    <Layout>
      <Header />
      <Content>
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
      </Content>
      <Sticky />
    </Layout>
  </ThemeProvider>
);

export default AboutPage;
