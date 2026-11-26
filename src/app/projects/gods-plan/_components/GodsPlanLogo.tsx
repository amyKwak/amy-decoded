import { serif } from "./ui";

/**
 * God's Plan brand mark: a four-point star (the "plan" coming into focus) cut
 * out of a royal rounded tile.
 */
export function GodsPlanMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect width="48" height="48" rx="14" fill="#2b1e66" />
      <path d="M24 10c1.4 8.2 4.9 11.6 14 14-9.1 2.4-12.6 5.8-14 14-1.4-8.2-4.9-11.6-14-14 9.1-2.4 12.6-5.8 14-14Z" fill="#fff" />
    </svg>
  );
}

/** The mark beside a one-line serif wordmark, "Plan" in italics. */
export function GodsPlanLogo() {
  return (
    <div className="flex items-center gap-3">
      <GodsPlanMark className="size-11 shrink-0 tablet:size-12" />
      <span className={`${serif} text-[26px] leading-none tracking-[-0.02em] whitespace-nowrap tablet:text-[28px]`}>
        God&apos;s <em>Plan</em>
      </span>
    </div>
  );
}
