import type { Metadata } from "next";
import { Catamaran } from "next/font/google";
import { ThemeProvider } from "../contexts/ThemeContext";
import "./globals.css";

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
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
    <html lang="en" className={`${catamaran.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-(family-name:--font-catamaran)">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
