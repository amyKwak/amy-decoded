export const SLEEP_QUALITIES = [
  "very poor",
  "poor",
  "fair",
  "good",
  "very good",
] as const;

export type SleepQuality = (typeof SLEEP_QUALITIES)[number];

/** PHQ-4 answers in standard item order, each 0 to 3. */
export type Phq4Answers = [number, number, number, number];

export interface Entry {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  createdAt: number;
  /** Affect Grid, self-reported. 1 = very unpleasant, 9 = very pleasant. */
  valence: number;
  /** Affect Grid, self-reported. 1 = very low energy, 9 = very high energy. */
  arousal: number;
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  journal: string;
  /** Feeling words the user confirmed. */
  emotions: string[];
  people: string[];
  activities: string[];
  triggers: string[];
  summary: string;
  phq4: Phq4Answers | null;
  demo?: boolean;
}

/** Shape returned by the extraction route after parsing. */
export interface Extraction {
  emotions: string[];
  people: string[];
  activities: string[];
  triggers: string[];
  summary: string;
  safety_concern: boolean;
}

export const MAX_JOURNAL_CHARS = 2000;
export const MAX_QUESTION_CHARS = 500;
