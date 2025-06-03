import { Manrope } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope", // optional, for CSS variable use
});

export const metadata = {
  title: "Amy Kwak - Software Engineer",
  description: "Frontend Software Engineer. Explore my work.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Analytics />
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
