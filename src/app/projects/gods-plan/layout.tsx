import { DM_Sans, Instrument_Serif } from "next/font/google";

// God's Plan type: Instrument Serif for titles, names and wins (28px and up),
// DM Sans for everything you read or tap.
const instrumentSerif = Instrument_Serif({
  variable: "--font-gp-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-gp-sans",
  subsets: ["latin"],
});

export default function GodsPlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${instrumentSerif.variable} ${dmSans.variable} gp-aurora text-gp-ink flex min-h-dvh shrink-0 flex-col font-(family-name:--font-gp-sans) text-[17px] leading-relaxed`}
    >
      {children}
    </div>
  );
}
