"use client";

import { useRef, type KeyboardEvent } from "react";
import { describeCell, quadrantOf, QUADRANT_LABELS } from "@/lib/moody/affect";
import { QUADRANT_COLORS } from "./ui";

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

  const cornerLabel = "text-[11px] font-bold leading-tight text-moody-ink tablet:text-xs";

  return (
    <div>
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-1.5 flex justify-between gap-4 pl-6">
          <span className={cornerLabel}>{QUADRANT_LABELS["high-unpleasant"]}</span>
          <span className={`${cornerLabel} text-right`}>{QUADRANT_LABELS["high-pleasant"]}</span>
        </div>

        <div className="flex gap-1.5">
          <div aria-hidden="true" className="flex w-4.5 flex-col items-center justify-between py-1 text-[10px] text-moody-muted">
            <span>High</span>
            <span className="[writing-mode:vertical-rl] rotate-180 tracking-wide">Energy</span>
            <span>Low</span>
          </div>

          <div
            role="radiogroup"
            aria-label="Affect Grid. Left to right is unpleasant to pleasant. Bottom to top is low to high energy."
            onKeyDown={onKeyDown}
            className="grid aspect-square flex-1 grid-cols-9 gap-[3px] rounded-[14px] border-2 border-moody-ink bg-white p-1"
          >
            {[...SCALE].reverse().map((a) =>
              SCALE.map((v) => {
                const selected = value?.valence === v && value?.arousal === a;
                const tabbable = current.valence === v && current.arousal === a;
                const onAxis = v === 5 || a === 5;
                // Color deepens with distance from the neutral center.
                const strength = Math.max(Math.abs(v - 5), Math.abs(a - 5));
                const fill = onAxis
                  ? QUADRANT_COLORS.neutral
                  : `color-mix(in srgb, ${QUADRANT_COLORS[quadrantOf(v, a)]} ${30 + strength * 15}%, white)`;
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
                    aria-label={describeCell(v, a)}
                    tabIndex={tabbable ? 0 : -1}
                    onClick={() => select(v, a)}
                    style={{ backgroundColor: selected ? undefined : fill }}
                    className={`relative rounded-[6px] transition-transform focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-moody-ink ${
                      selected ? "z-10 scale-125 bg-moody-accent ring-2 ring-white shadow-[0_4px_12px_rgba(91,91,208,0.45)]" : "hover:brightness-95"
                    }`}
                  >
                    {selected && <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white" />}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="mt-1.5 flex justify-between gap-4 pl-6">
          <span className={cornerLabel}>{QUADRANT_LABELS["low-unpleasant"]}</span>
          <span className={`${cornerLabel} text-right`}>{QUADRANT_LABELS["low-pleasant"]}</span>
        </div>
        <div aria-hidden="true" className="mt-2 flex justify-between pl-6 text-[10px] text-moody-muted">
          <span>Unpleasant</span>
          <span>Pleasant</span>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 text-center text-sm text-moody-ink">
        {value
          ? `${QUADRANT_LABELS[quadrantOf(value.valence, value.arousal)]} (pleasantness ${value.valence}, energy ${value.arousal})`
          : "Tap a square, or use the arrow keys."}
      </p>
    </div>
  );
}
