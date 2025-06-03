"use client";
import React from "react";
import styled from "styled-components";
import theme from "./utils/theme";
import { Layout, Nav, Typist, Header } from "./components";
import { ThemeProvider } from "./contexts/ThemeContext";

const IndexPage = () => {
  return (
    <ThemeProvider>
      <Layout>
        <Header />
        <Section>
          <Nav to="/about">
            <span>Who am I?</span>
          </Nav>
          <h1>Amy Kwak</h1>
          <h2>
            Frontend Engineer who likes building stuff with
            <br />
            <Typist />
          </h2>
        </Section>
      </Layout>
    </ThemeProvider>
  );
};
export default IndexPage;

// Component Styles
const Section = styled.section`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 3rem;
  h1 {
    color: ${theme.colors.blue};
    font-weight: bold;
  }
  h2 {
    span {
      color: white;
    }
    .Cursor {
      visibility: hidden;
    }
  }
`;

const Footer = styled.footer`
  padding-top: 2rem;
  a {
    color: ${theme.colors.blue};
    text-decoration-line: underline;
    text-decoration-style: dotted;
  }
`;
