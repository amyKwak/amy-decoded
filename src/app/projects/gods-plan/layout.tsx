import { DM_Sans, Fraunces } from "next/font/google";

// God's Plan type: Fraunces for titles, names and wins, DM Sans for everything
// you read or tap.
const fraunces = Fraunces({
  variable: "--font-gp-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const dmSans = DM_Sans({
  variable: "--font-gp-sans",
  subsets: ["latin"],
});

export default function GodsPlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} gp-aurora text-gp-ink flex min-h-dvh shrink-0 flex-col font-(family-name:--font-gp-sans) text-[17px] leading-relaxed`}
    >
      {children}
    </div>
  );
}
