export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-st-accent";

export const primaryBtn = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-st-accent px-6 text-[15px] font-bold text-white transition-colors hover:bg-st-accent-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const secondaryBtn = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-st-line-strong bg-white px-5 text-[15px] font-semibold text-st-ink transition-colors hover:bg-st-bg disabled:opacity-40 ${focusRing}`;

export const quietBtn = `inline-flex min-h-11 items-center justify-center rounded-full px-3.5 text-[15px] font-semibold text-st-muted transition-colors hover:text-st-ink disabled:opacity-40 ${focusRing}`;

export const field = `w-full rounded-2xl border border-st-line-strong bg-st-field px-4 py-3 text-base leading-relaxed text-st-ink placeholder:text-st-muted ${focusRing}`;

export const card = "rounded-3xl border border-st-line bg-white";

export const label = "text-[13px] font-bold uppercase tracking-[0.08em] text-st-muted";

export const heading =
  "font-(family-name:--font-fraunces) text-[24px] font-semibold leading-tight text-st-ink tablet:text-[28px]";

/** Local calendar date as YYYY-MM-DD. */
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
