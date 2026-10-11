import { quadrantOf, QUADRANT_WORDS } from "./affect";
import type { Entry, Phq4Answers, SleepQuality } from "./types";

/** Small seeded PRNG so the sample data is the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const clamp = (x: number) => Math.min(9, Math.max(1, Math.round(x)));

const FRIENDS = ["maya", "jordan"];

/**
 * 30 days of fake entries with built-in patterns:
 * - poor sleep lowers valence (and energy)
 * - exercise and seeing friends raise valence
 * - deadlines raise arousal and lower valence
 */
export function generateDemoEntries(today: string, days = 30, seed = 42): Entry[] {
  const rand = mulberry32(seed);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const entries: Entry[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const isWeekday = weekday >= 1 && weekday <= 5;

    // Every 4th day is a guaranteed bad night so the pattern stays reliable.
    const poorSleep = i % 4 === 1 || rand() < 0.1;
    const sleepHours = poorSleep ? 4.5 + Math.round(rand() * 2) / 2 : 7 + Math.round(rand() * 3) / 2;
    const sleepQuality: SleepQuality = poorSleep
      ? pick(["very poor", "poor"] as SleepQuality[])
      : pick(["fair", "good", "good", "very good"] as SleepQuality[]);

    const exercise = rand() < 0.4;
    const friend = rand() < (isWeekday ? 0.25 : 0.6) ? pick(FRIENDS) : null;
    const deadline = isWeekday && rand() < 0.35;
    const cooking = rand() < 0.3;

    const valence = clamp(
      5.2 + (poorSleep ? -2 : 0.4) + (exercise ? 1.2 : 0) + (friend ? 1.3 : 0) + (deadline ? -1.5 : 0) + (rand() - 0.5) * 1.4,
    );
    const arousal = clamp(
      5 + (poorSleep ? -1.5 : 0) + (exercise ? 1 : 0) + (deadline ? 2 : 0) + (rand() - 0.5) * 1.4,
    );

    const lines: string[] = [];
    const people: string[] = [];
    const activities: string[] = [];
    const triggers: string[] = [];

    if (poorSleep) {
      lines.push(pick([
        `Barely slept, maybe ${sleepHours} hours. Dragged myself through the morning.`,
        "Woke up at 3am and couldn't fall back asleep. Foggy all day.",
        "Bad night of sleep again. Everything felt harder than it should.",
      ]));
      triggers.push("poor sleep");
    }
    if (exercise) {
      lines.push(pick([
        "Went for a run before work and felt clearer after.",
        "Yoga class at lunch. My shoulders finally dropped.",
        "Got to the gym after work, which always helps.",
      ]));
      activities.push("exercise");
    }
    if (friend) {
      const name = friend[0].toUpperCase() + friend.slice(1);
      lines.push(pick([
        `Dinner with ${name}. We laughed so much.`,
        `Long walk and coffee with ${name}, really needed that.`,
        `${name} came over and we watched a movie.`,
      ]));
      people.push(friend);
      activities.push("time with friends");
    }
    if (deadline) {
      lines.push(pick([
        "The launch doc deadline is Friday and my stomach is in knots.",
        "Deadline pressure all day. Kept checking Slack.",
        "Crunching on the quarterly report. Too many tabs open in my head.",
      ]));
      triggers.push("deadline");
      activities.push("work");
    }
    if (cooking) {
      lines.push("Cooked a real dinner for once.");
      activities.push("cooking");
    }
    if (lines.length === 0) lines.push(pick(["Quiet day, nothing special.", "Regular workday. Fine.", "Lazy day at home."]));

    const words = QUADRANT_WORDS[quadrantOf(valence, arousal)];
    const emotions = [pick(words), pick(words)].filter((w, idx, arr) => arr.indexOf(w) === idx);

    // Weekly PHQ-4 on the 28th, 21st, 14th, and 7th days back.
    let phq4: Phq4Answers | null = null;
    if (i > 0 && i % 7 === 0) phq4 = [pick([0, 1]), pick([0, 1]), pick([0, 1]), pick([0, 1, 1])] as Phq4Answers;

    entries.push({
      id: `demo-${date}`,
      date,
      createdAt: Date.parse(`${date}T21:00:00Z`),
      valence,
      arousal,
      sleepHours,
      sleepQuality,
      journal: lines.join(" "),
      emotions,
      people,
      activities,
      triggers,
      summary: lines[0],
      phq4,
      demo: true,
    });
  }
  return entries;
}
