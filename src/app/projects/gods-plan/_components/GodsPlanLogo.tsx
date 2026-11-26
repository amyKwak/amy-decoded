import { serif } from "./ui";

/**
 * God's Plan brand mark: an iridescent halo over a four-point star (the "plan"
 * coming into focus), beside the serif wordmark with "Plan" in italics.
 */
export function GodsPlanMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="gp-mark-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfd6ff" />
          <stop offset="0.34" stopColor="#d6c3ff" />
          <stop offset="0.66" stopColor="#ffc6e4" />
          <stop offset="1" stopColor="#c6f0ec" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="26" r="20" fill="url(#gp-mark-sheen)" />
      <ellipse cx="24" cy="8" rx="11" ry="3.2" fill="none" stroke="#5b3fd1" strokeWidth="2.2" />
      <path d="M24 13c1.2 7 4.2 10.4 11 12-6.8 1.6-9.8 5-11 12-1.2-7-4.2-10.4-11-12 6.8-1.6 9.8-5 11-12Z" fill="#2b1e66" />
    </svg>
  );
}

export function GodsPlanLogo() {
  return (
    <div className="flex items-center gap-3">
      <GodsPlanMark className="size-11 shrink-0 tablet:size-12" />
      <span className={`${serif} text-[34px] leading-none tracking-[-0.02em] tablet:text-[40px]`}>
        God&apos;s <em>Plan</em>
      </span>
    </div>
  );
}
