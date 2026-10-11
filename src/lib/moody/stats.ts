import { SLEEP_QUALITIES, type Entry } from "./types";

export const METRICS = ["valence", "arousal", "sleepHours", "sleepQuality", "phq4"] as const;
export type Metric = (typeof METRICS)[number];

export const GROUP_BYS = ["people", "activities", "triggers", "emotions", "weekday"] as const;
export type GroupBy = (typeof GROUP_BYS)[number];

/** Groups with fewer data points than this are flagged reliable: false. */
export const MIN_RELIABLE_N = 3;
const MAX_GROUPS = 15;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export interface GroupStat {
  key: string;
  mean: number;
  n: number;
  /** Group mean minus the overall mean. */
  diff_from_overall: number;
  reliable: boolean;
}

export interface StatsResult {
  metric: Metric;
  group_by: GroupBy | null;
  start_date: string | null;
  end_date: string | null;
  overall: { mean: number | null; n: number };
  groups: GroupStat[];
  note?: string;
}

const round = (x: number) => Math.round(x * 100) / 100;

/** Numeric value of a metric for one entry, or null if not recorded. */
export function metricValue(entry: Entry, metric: Metric): number | null {
  switch (metric) {
    case "valence":
      return entry.valence;
    case "arousal":
      return entry.arousal;
    case "sleepHours":
      return entry.sleepHours;
    case "sleepQuality":
      // 1 = very poor ... 5 = very good
      return entry.sleepQuality ? SLEEP_QUALITIES.indexOf(entry.sleepQuality) + 1 : null;
    case "phq4":
      return entry.phq4 ? entry.phq4.reduce((a, b) => a + b, 0) : null;
  }
}

export function weekdayOf(date: string): string {
  // Parse as UTC so the weekday matches the stored calendar date everywhere.
  return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
}

function groupKeys(entry: Entry, groupBy: GroupBy): string[] {
  if (groupBy === "weekday") return [weekdayOf(entry.date)];
  return entry[groupBy];
}

export function filterByDate(entries: Entry[], range: DateRange = {}): Entry[] {
  return entries.filter(
    (e) =>
      (!range.start_date || e.date >= range.start_date) &&
      (!range.end_date || e.date <= range.end_date),
  );
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function computeStats(
  entries: Entry[],
  metric: Metric,
  groupBy: GroupBy | null,
  range: DateRange = {},
): StatsResult {
  const scoped = filterByDate(entries, range).filter((e) => metricValue(e, metric) !== null);
  const values = scoped.map((e) => metricValue(e, metric) as number);
  const overallMean = values.length ? mean(values) : null;

  const result: StatsResult = {
    metric,
    group_by: groupBy,
    start_date: range.start_date ?? null,
    end_date: range.end_date ?? null,
    overall: { mean: overallMean === null ? null : round(overallMean), n: values.length },
    groups: [],
  };

  if (values.length === 0) {
    result.note = "No entries with this metric in the date range.";
    return result;
  }
  if (!groupBy) return result;

  const buckets = new Map<string, number[]>();
  for (const e of scoped) {
    const v = metricValue(e, metric) as number;
    for (const key of new Set(groupKeys(e, groupBy))) {
      const list = buckets.get(key) ?? [];
      list.push(v);
      buckets.set(key, list);
    }
  }

  const groups = [...buckets.entries()]
    .map(([key, xs]) => {
      const m = mean(xs);
      return {
        key,
        mean: round(m),
        n: xs.length,
        diff_from_overall: round(m - (overallMean as number)),
        reliable: xs.length >= MIN_RELIABLE_N,
      };
    })
    .sort((a, b) => b.n - a.n || Math.abs(b.diff_from_overall) - Math.abs(a.diff_from_overall));

  result.groups = groups.slice(0, MAX_GROUPS);
  if (groups.length > MAX_GROUPS) {
    result.note = `Showing the ${MAX_GROUPS} most frequent of ${groups.length} groups.`;
  }
  return result;
}
