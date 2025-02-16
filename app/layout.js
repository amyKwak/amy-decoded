import "./globals.css";

export const metadata = {
  title: "Amy Kwak – Software Engineer | Frontend & Full-Stack Developer",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
  },
  description:
    "Hi, I’m Amy, a software engineer specializing in front-end and full-stack development. I create beautiful applications. Explore my work, projects, and blog to learn more about me.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
