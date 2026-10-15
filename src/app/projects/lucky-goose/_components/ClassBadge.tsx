import { CLASSES, type ClassId } from "@/lib/lucky-goose/game";
import { CLASS_VARS } from "./ui";

/** A hero's mark: the first letter of their name in their class colour. */
export function Monogram({
  cls,
  name,
  large,
}: {
  cls: ClassId;
  name?: string;
  large?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`${CLASS_VARS[cls]} inline-flex flex-none items-center justify-center rounded-(--radius-pill) bg-(--oak-900) font-(family-name:--font-display) leading-none text-(--cls-bright) ${
        large ? "h-11 w-11 text-[26px]" : "h-7 w-7 text-[18px]"
      }`}
    >
      {(name || CLASSES[cls].name).charAt(0).toUpperCase()}
    </span>
  );
}

/** A pill showing a class: colour, monogram, name and stat. */
export function ClassBadge({ cls }: { cls: ClassId }) {
  return (
    <span
      className={`${CLASS_VARS[cls]} inline-flex items-center gap-(--space-2) rounded-(--radius-pill) bg-(--cls) py-(--space-1) pr-(--space-3) pl-(--space-1) font-(family-name:--font-ui) text-[15px] leading-5 font-extrabold text-(--on-class)`}
    >
      <Monogram cls={cls} />
      {CLASSES[cls].name}
      <span className="tag uppercase">{CLASSES[cls].stat}</span>
    </span>
  );
}
