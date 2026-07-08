import type { Metadata } from "next";
import { Newsreader, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${newsreader.variable} ${figtree.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-figtree)">
        {children}
      </body>
    </html>
  );
}
