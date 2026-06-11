import type { Metadata } from "next";
import { Manrope, Catamaran } from "next/font/google";
import { ThemeProvider } from "../contexts/ThemeContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin"],
  weight: ["900"],
});

export const metadata: Metadata = {
  title: "Amy Kwak",
  description: "Software Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${catamaran.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-manrope)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
