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
  metadataBase: new URL("https://www.amy-decoded.com"),
  title: {
    default: "Amy Kwak — Software Engineer",
    template: "%s | Amy Kwak",
  },
  description:
    "Software Engineer based in Seattle, WA. Specializing in React, Next.js, and TypeScript. Building fast, accessible, and scalable web experiences.",
  keywords: [
    "software engineer",
    "React developer",
    "Next.js developer",
    "TypeScript",
    "Seattle engineer",
    "software engineer portfolio",
    "web developer",
    "full stack engineer",
    "web developer Seattle",
  ],
  authors: [{ name: "Amy Kwak" }],
  creator: "Amy Kwak",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.amy-decoded.com",
    siteName: "Amy Kwak",
    title: "Amy Kwak — Software Engineer",
    description:
      "Software Engineer based in Seattle, WA. Specializing in React, Next.js, and TypeScript.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amy Kwak — Software Engineer",
    description:
      "Software Engineer based in Seattle, WA. Specializing in React, Next.js, and TypeScript.",
    creator: "@amykwak",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className="min-h-full flex flex-col font-(family-name:--font-manrope)">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
