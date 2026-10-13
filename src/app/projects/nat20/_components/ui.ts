import type { ClassId } from "@/lib/nat20/game";

// Shared styles for The Lucky Goose. Every value comes from
// design-system/tokens.css; type styles use its classes (title-lg, button…).

export const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-(--focus)";

/** The chunky lip that disappears when pressed (80ms, off under reduced motion). */
export const press =
  "shadow-(--shadow-press) transition-[translate,box-shadow] duration-80 ease-out active:translate-y-0.5 active:shadow-none motion-reduce:transition-none";

/**
 * Sets --cls and --cls-bright for a hero's class, so children can use
 * bg-(--cls) for fills and text-(--cls-bright) for text and rings on wood.
 */
export const CLASS_VARS: Record<ClassId, string> = {
  warrior: "[--cls:var(--warrior)] [--cls-bright:var(--warrior-bright)]",
  rogue: "[--cls:var(--rogue)] [--cls-bright:var(--rogue-bright)]",
  mage: "[--cls:var(--mage)] [--cls-bright:var(--mage-bright)]",
  bard: "[--cls:var(--bard)] [--cls-bright:var(--bard-bright)]",
};

/** Copy that only the interface shows (the game master never sees it). */
export const CLASS_BLURB: Record<ClassId, string> = {
  warrior: "Hits hard, lifts heavy things",
  rogue: "Sneaky, quick, a little sticky-fingered",
  mage: "Knows spells, reads the fine print",
  bard: "Talks, sings and charms their way in",
};
