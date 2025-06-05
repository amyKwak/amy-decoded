"use client";
import React, { useState, createContext, useEffect } from "react";
import PropTypes from "prop-types";

const defaultState = {
  $darkMode: false,
  setDarkMode: () => {},
};

const ThemeContext = createContext(defaultState);

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(defaultState.$darkMode);

  useEffect(() => {
    const storedDark = localStorage.getItem("dark");
    if (storedDark !== null) {
      setIsDarkMode(JSON.parse(storedDark));
    }
  }, []); // ✅ only run on mount

  return (
    <ThemeContext.Provider
      value={{
        $darkMode: isDarkMode,
        setDarkMode: (value) => {
          setIsDarkMode(value);
          localStorage.setItem("dark", JSON.stringify(value));
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
export { ThemeProvider };
