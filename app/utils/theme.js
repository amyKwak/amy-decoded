const theme = {
  colors: {
    blue: "var(--color-primary)", // references the same --color-primary from global.css
    white: "var(--color-white)",
    black: "var(--color-black)",
  },
  devices: {
    tablet: "(min-width: 768px)",
  },
  fonts: {
    primary: "var(--font-body)", // references “Manrope, sans-serif”
    heading: "var(--font-heading)",
  },
};

export default theme;
