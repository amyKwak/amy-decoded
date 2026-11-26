"use client";

import { useId } from "react";

/** A 0 to 100 rating, the standard scale for thought record intensity. */
export function Rating({
  label,
  value,
  onChange,
  low = "Not at all",
  high = "Completely",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  low?: string;
  high?: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-semibold">
          {label}
        </label>
        <output htmlFor={id} className="text-st-accent font-(family-name:--font-fraunces) text-xl font-semibold tabular-nums">
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value} out of 100`}
        className="accent-st-accent h-11 w-full cursor-pointer"
      />
      <div className="text-st-muted -mt-1 flex justify-between text-xs">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
