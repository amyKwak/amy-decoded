"use client";

import { useRef, type KeyboardEvent } from "react";
import { quadrantOf } from "@/lib/moody/affect";
import { MOOD_NAMES, QUADRANT_COLORS } from "./ui";

export interface GridValue {
  valence: number;
  arousal: number;
}

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const clamp = (n: number) => Math.min(9, Math.max(1, n));

/**
 * Affect Grid (Russell, Weiss & Mendelsohn, 1989). A 9x9 radio group:
 * x is valence (unpleasant to pleasant), y is arousal (low to high energy).
 * Arrow keys move in two dimensions; only one cell is in the tab order.
 */
export function AffectGrid({
  value,
  onChange,
}: {
  value: GridValue | null;
  onChange: (value: GridValue) => void;
}) {
  const cells = useRef(new Map<string, HTMLButtonElement>());
  const current = value ?? { valence: 5, arousal: 5 };

  function select(valence: number, arousal: number) {
    onChange({ valence, arousal });
    cells.current.get(`${valence}-${arousal}`)?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    const { valence: v, arousal: a } = current;
    const moves: Record<string, [number, number]> = {
      ArrowRight: [v + 1, a],
      ArrowLeft: [v - 1, a],
      ArrowUp: [v, a + 1],
      ArrowDown: [v, a - 1],
      Home: [1, a],
      End: [9, a],
      PageUp: [v, 9],
      PageDown: [v, 1],
    };
    const next = moves[e.key];
    if (next) {
      e.preventDefault();
      select(clamp(next[0]), clamp(next[1]));
    } else if ((e.key === " " || e.key === "Enter") && !value) {
      e.preventDefault();
      select(v, a);
    }
  }

  const cornerLabel = "text-[13px] font-bold leading-tight text-moody-ink";

  return (
    <div>
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-2 flex justify-between gap-4 pl-6">
          <span className={cornerLabel}>{MOOD_NAMES["high-unpleasant"]}</span>
          <span className={`${cornerLabel} text-right`}>
            {MOOD_NAMES["high-pleasant"]}
          </span>
        </div>

        <div className="flex gap-2">
          <div
            aria-hidden="true"
            className="text-moody-muted flex w-4 flex-col items-center justify-between py-1 text-[11px]"
          >
            <span>More</span>
            <span className="rotate-180 tracking-wide [writing-mode:vertical-rl]">
              Energy
            </span>
            <span>Less</span>
          </div>

          <div
            role="radiogroup"
            aria-label="Mood grid. Left to right is unpleasant to pleasant. Bottom to top is low to high energy."
            onKeyDown={onKeyDown}
            className="bg-moody-bg grid aspect-square flex-1 grid-cols-9 gap-[3px] rounded-[18px] p-1.5"
          >
            {[...SCALE].reverse().map((a) =>
              SCALE.map((v) => {
                const selected = value?.valence === v && value?.arousal === a;
                const tabbable = current.valence === v && current.arousal === a;
                const q = quadrantOf(v, a);
                // Color deepens with distance from the neutral center.
                const strength = Math.max(Math.abs(v - 5), Math.abs(a - 5));
                const fill =
                  q === "neutral"
                    ? QUADRANT_COLORS.neutral
                    : `color-mix(in srgb, ${QUADRANT_COLORS[q]} ${20 + strength * 20}%, #fbfaf7)`;
                return (
                  <button
                    key={`${v}-${a}`}
                    ref={(el) => {
                      if (el) cells.current.set(`${v}-${a}`, el);
                      else cells.current.delete(`${v}-${a}`);
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Pleasantness ${v} of 9, energy ${a} of 9. ${MOOD_NAMES[q]}.`}
                    tabIndex={tabbable ? 0 : -1}
                    onClick={() => select(v, a)}
                    style={{ backgroundColor: selected ? undefined : fill }}
                    className={`focus-visible:outline-moody-accent relative flex items-center justify-center rounded-[7px] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 ${
                      selected
                        ? "bg-moody-ink z-10 shadow-[0_0_0_3px_#fff,0_0_0_5px_#2f3b39]"
                        : "hover:brightness-95"
                    }`}
                  >
                    {selected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-between gap-4 pl-6">
          <span className={cornerLabel}>{MOOD_NAMES["low-unpleasant"]}</span>
          <span className={`${cornerLabel} text-right`}>
            {MOOD_NAMES["low-pleasant"]}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="text-moody-muted mt-1 flex justify-between pl-6 text-[11px]"
        >
          <span>Unpleasant</span>
          <span>Pleasant</span>
        </div>
      </div>

      <p aria-live="polite" className="mt-4 min-h-6 text-center text-[15px]">
        {value
          ? `${MOOD_NAMES[quadrantOf(value.valence, value.arousal)]} · pleasantness ${value.valence}, energy ${value.arousal}`
          : "Tap a square, or use the arrow keys."}
      </p>
    </div>
  );
}
