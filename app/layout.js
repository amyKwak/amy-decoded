// app/layout.js
import { Manrope } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "./contexts/ThemeContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Amy Kwak - Software Engineer",
  description: "Frontend Software Engineer. Explore my work.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className={manrope.className}>
        <ThemeProvider>
          <Analytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
