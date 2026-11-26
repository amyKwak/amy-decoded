import type { TrapId } from "./traps";

/** A feeling and how strong it is, 0 to 100, before and after the record. */
export interface Feeling {
  name: string;
  before: number;
  after: number | null;
}

/**
 * One thought record, in the order of the classic 7-column worksheet
 * (Beck; Greenberger & Padesky, Mind Over Mood).
 */
export interface ThoughtRecord {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  createdAt: number;
  situation: string;
  feelings: Feeling[];
  /** The "hot thought": the one that carries the most feeling. */
  thought: string;
  /** How much the user believes the thought, 0 to 100. */
  beliefBefore: number;
  beliefAfter: number | null;
  evidenceFor: string;
  /** The user's answers to the Socratic questions, plus anything else. */
  answers: { question: string; answer: string }[];
  evidenceAgainst: string;
  /** Thinking traps the user agreed fit. Claude only suggests them. */
  traps: TrapId[];
  balanced: string;
  demo?: boolean;
}

/** What the coach route returns after parsing. */
export interface Examination {
  traps: { id: TrapId; why: string }[];
  questions: string[];
  safety_concern: boolean;
}

export const LIMITS = {
  situation: 600,
  thought: 300,
  evidence: 1200,
  answer: 600,
  balanced: 400,
  feelingName: 30,
  feelings: 3,
} as const;
