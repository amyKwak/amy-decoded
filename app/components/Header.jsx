"use client";

import { useContext } from "react";
import styled from "styled-components";
import ThemeContext from "../contexts/ThemeContext"; // make sure this is exported properly
import theme from "../utils/theme";
import { DarkModeToggle } from ".";

const Header = () => {
  const { $darkMode, setDarkMode } = useContext(ThemeContext);

  const handleToggle = () => {
    setDarkMode(!$darkMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("dark", JSON.stringify(!$darkMode));
    }
  };

  return (
    <StyledHeader>
      <Logo href="/" $darkMode={$darkMode}>
        A<span>/</span>K
      </Logo>
      <ToggleContainer>
        <DarkModeToggle $darkMode={$darkMode} onClick={handleToggle} />
      </ToggleContainer>
    </StyledHeader>
  );
};

export { Header };

// Component Styles
const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 3rem;
`;

const Logo = styled.a`
  font-family: "Catamaran", sans-serif;
  font-size: 2.7rem;
  color: ${(props) =>
    props.$darkMode ? theme.colors.white : theme.colors.black};
  transition: color 0.25s ease-in-out;
  will-change: opacity;

  span {
    color: ${theme.colors.blue};
    transition: color 0.25s ease-in-out;
    will-change: opacity;
  }

  &:hover {
    color: ${theme.colors.blue};

    span {
      color: ${(props) =>
        props.$$darkMode ? theme.colors.white : theme.colors.black};
    }
  }
`;

const ToggleContainer = styled.div`
  padding-top: 0.2rem;
`;
