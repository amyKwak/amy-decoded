/**
 * Common thinking traps (cognitive distortions), from Beck (1976) and
 * Burns (Feeling Good, 1980), named in plain words. Claude may only suggest
 * ids from this list, and the user decides which fit.
 */
export const TRAPS = [
  {
    id: "all-or-nothing",
    name: "All or nothing",
    description: "Seeing things in black and white, with no middle ground.",
  },
  {
    id: "overgeneralizing",
    name: "Overgeneralizing",
    description: "Treating one event as a pattern that always or never happens.",
  },
  {
    id: "mental-filter",
    name: "Mental filter",
    description: "Focusing on one negative detail and tuning out the rest.",
  },
  {
    id: "discounting-positives",
    name: "Discounting positives",
    description: "Deciding the good things don't count.",
  },
  {
    id: "mind-reading",
    name: "Mind reading",
    description: "Assuming you know what someone else is thinking.",
  },
  {
    id: "fortune-telling",
    name: "Fortune telling",
    description: "Predicting things will turn out badly, as if it were certain.",
  },
  {
    id: "catastrophizing",
    name: "Catastrophizing",
    description: "Jumping to the worst case, or treating something as unbearable.",
  },
  {
    id: "emotional-reasoning",
    name: "Emotional reasoning",
    description: "Believing something is true because it feels true.",
  },
  {
    id: "should-statements",
    name: "Should statements",
    description: "Rigid rules about how you or others must act.",
  },
  {
    id: "labeling",
    name: "Labeling",
    description: "Calling yourself or someone else a name based on one thing.",
  },
  {
    id: "personalizing",
    name: "Personalizing",
    description: "Taking the blame for things that weren't fully in your control.",
  },
] as const;

export type TrapId = (typeof TRAPS)[number]["id"];

export const TRAP_IDS = TRAPS.map((t) => t.id) as TrapId[];

export const isTrapId = (x: unknown): x is TrapId =>
  typeof x === "string" && (TRAP_IDS as string[]).includes(x);

export const trapById = (id: TrapId) => TRAPS.find((t) => t.id === id)!;

/**
 * Socratic questions from the standard thought record prompts (Greenberger &
 * Padesky). Shown when Claude is unavailable, so the record still works.
 */
export const FALLBACK_QUESTIONS = [
  "Is there anything that doesn't quite fit this thought?",
  "If a close friend had this thought, what would you say to them?",
  "Have you been in a situation like this before? How did it turn out?",
];
