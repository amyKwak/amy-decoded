import type { ClassId } from "@/lib/lucky-goose/game";

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
  knight: "[--cls:var(--knight)] [--cls-bright:var(--knight-bright)]",
  thief: "[--cls:var(--thief)] [--cls-bright:var(--thief-bright)]",
  wizard: "[--cls:var(--wizard)] [--cls-bright:var(--wizard-bright)]",
  jester: "[--cls:var(--jester)] [--cls-bright:var(--jester-bright)]",
};

/** Copy that only the interface shows (the game master never sees it). */
export const CLASS_BLURB: Record<ClassId, string> = {
  knight: "Hits hard, lifts heavy things",
  thief: "Sneaky, quick, a little sticky-fingered",
  wizard: "Knows spells, reads the fine print",
  jester: "Talks, sings and charms their way in",
};
