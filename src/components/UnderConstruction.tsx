import Link from "next/link";
import { IkigaiMark } from "./IkigaiMark";

export function UnderConstruction({ label }: { label: string }) {
  return (
    <div className="flex-1 max-w-[1120px] mx-auto w-full flex flex-col items-center justify-center text-center px-6 tablet:px-10 py-20">
      <IkigaiMark className="w-16 h-16 tablet:w-20 tablet:h-20 mb-6" />
      <div className="font-mono text-[11px] tablet:text-xs tracking-[0.18em] uppercase text-label mb-4">
        {label}
      </div>
      <h1 className="font-serif font-normal text-[32px] tablet:text-[44px] leading-[1.1] tracking-[-0.01em] text-ink mb-4">
        Under construction
      </h1>
      <p className="text-[15px] tablet:text-base leading-relaxed text-body max-w-[440px] mb-8">
        This page is getting rebuilt — check back soon, or head home in the meantime.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink border-b border-border-btn pb-[3px]"
      >
        Back home
      </Link>
    </div>
  );
}
