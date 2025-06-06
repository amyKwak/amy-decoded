// src/utils/theme.js

const theme = {
  colors: {
    blue: "var(--color-primary)", // references the same --color-primary from global.css
    white: "var(--color-white)",
    black: "var(--color-black)",
  },
  devices: {
    tablet: "(max-width: 991.98px)",
  },
  fonts: {
    primary: "var(--font-body)", // references “Manrope, sans-serif”
    heading: "var(--font-heading)",
  },
};

export default theme;
