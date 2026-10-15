import { CLASSES, type ClassId } from "@/lib/lucky-goose/game";
import { Monogram } from "./ClassBadge";
import { CLASS_VARS, focusRing } from "./ui";

/** One hero in the party list. */
export function HeroSlot({
  name,
  cls,
  onRemove,
}: {
  name: string;
  cls: ClassId;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`${CLASS_VARS[cls]} flex min-h-(--tap-min) items-center gap-(--space-3) rounded-(--radius-md) border-2 border-transparent bg-(--oak-800) py-(--space-2) pr-(--space-2) pl-(--space-3)`}
    >
      <Monogram cls={cls} name={name} large />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-(family-name:--font-ui) text-[18px] leading-6 font-extrabold text-(--cream)">
          {name}
        </span>
        <span className="tag text-(--cls-bright) uppercase">
          {CLASSES[cls].name} · {CLASSES[cls].stat}
        </span>
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className={`flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-(--radius-pill) border-0 bg-transparent text-(--cream-muted) ${focusRing}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** The empty slot that adds the next hero. Hidden once the party is full. */
export function AddHeroSlot({
  count,
  max,
  onAdd,
}: {
  count: number;
  max: number;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={`flex min-h-(--tap-min) w-full cursor-pointer items-center justify-center rounded-(--radius-md) border-2 border-dashed border-(--edge) bg-transparent px-(--space-3) font-(family-name:--font-ui) text-base font-bold text-(--cream-muted) ${focusRing}`}
    >
      + Add a hero ({count} of {max})
    </button>
  );
}
