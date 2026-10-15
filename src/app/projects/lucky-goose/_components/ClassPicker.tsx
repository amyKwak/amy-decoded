import { useRef, type KeyboardEvent } from "react";
import { CLASS_BONUS, CLASSES, type ClassId } from "@/lib/lucky-goose/game";
import { Monogram } from "./ClassBadge";
import { CLASS_BLURB, CLASS_VARS, focusRing } from "./ui";

const KEYS = Object.keys(CLASSES) as ClassId[];

/** A 2 by 2 grid of class tiles that works as one radio group. */
export function ClassPicker({
  value,
  onChange,
  showBlurb,
  label = "Pick a class",
}: {
  value: ClassId;
  onChange: (cls: ClassId) => void;
  /** On the first hero, so new players learn what each class does. */
  showBlurb?: boolean;
  label?: string;
}) {
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move the choice around the group, like native radios.
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      e.key
    ];
    if (!step) return;
    e.preventDefault();
    const next = (i + step + KEYS.length) % KEYS.length;
    onChange(KEYS[next]);
    tiles.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-2 gap-(--space-3)"
    >
      {KEYS.map((cls, i) => {
        const on = value === cls;
        return (
          <button
            key={cls}
            ref={(el) => {
              tiles.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(cls)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`${CLASS_VARS[cls]} flex min-h-24 cursor-pointer flex-col gap-(--space-2) rounded-(--radius-md) border-2 p-(--space-3) text-left font-(family-name:--font-ui) text-(--cream) ${
              on
                ? "border-(--cls-bright) bg-(--cls) shadow-[0_0_0_2px_var(--cls-bright)]"
                : "border-(--edge) bg-(--oak-800)"
            } ${focusRing}`}
          >
            <span className="flex items-center gap-(--space-2)">
              <Monogram cls={cls} />
              <span className="text-[18px] leading-6 font-extrabold">
                {CLASSES[cls].name}
              </span>
            </span>
            <span
              className={`tag uppercase ${on ? "text-(--cream)" : "text-(--cream-muted)"}`}
            >
              +{CLASS_BONUS} {CLASSES[cls].stat}
            </span>
            {showBlurb && (
              <span
                className={`caption ${on ? "text-(--cream)" : "text-(--cream-muted)"}`}
              >
                {CLASS_BLURB[cls]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
