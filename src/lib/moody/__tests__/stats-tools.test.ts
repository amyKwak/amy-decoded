import { describe, expect, it } from "vitest";
import { computeStats, MIN_RELIABLE_N, weekdayOf } from "../stats";
import { generateDemoEntries } from "../demo-data";
import { MOODY_TOOLS, runTool, TOOL_IMPLEMENTATIONS } from "../tools";
import type { Entry } from "../types";

function entry(partial: Partial<Entry> & { date: string }): Entry {
  return {
    id: partial.date,
    createdAt: 0,
    valence: 5,
    arousal: 5,
    sleepHours: null,
    sleepQuality: null,
    journal: "",
    emotions: [],
    people: [],
    activities: [],
    triggers: [],
    summary: "",
    phq4: null,
    ...partial,
  };
}

const sample: Entry[] = [
  entry({ date: "2026-10-01", valence: 8, activities: ["exercise"], people: ["maya"] }),
  entry({ date: "2026-10-02", valence: 7, activities: ["exercise"] }),
  entry({ date: "2026-10-03", valence: 9, activities: ["exercise"] }),
  entry({ date: "2026-10-04", valence: 2, triggers: ["deadline"], people: ["maya"] }),
  entry({ date: "2026-10-05", valence: 4, sleepHours: 5, sleepQuality: "poor" }),
];

describe("computeStats", () => {
  it("computes overall mean, group means, n, and diff from overall", () => {
    const r = computeStats(sample, "valence", "activities");
    expect(r.overall).toEqual({ mean: 6, n: 5 });
    expect(r.groups).toEqual([{ key: "exercise", mean: 8, n: 3, diff_from_overall: 2, reliable: true }]);
  });

  it(`flags groups under ${MIN_RELIABLE_N} data points as unreliable`, () => {
    const r = computeStats(sample, "valence", "people");
    expect(r.groups).toEqual([{ key: "maya", mean: 5, n: 2, diff_from_overall: -1, reliable: false }]);
  });

  it("skips entries missing the metric and scores sleep quality 1 to 5", () => {
    const r = computeStats(sample, "sleepQuality", "triggers");
    expect(r.overall).toEqual({ mean: 2, n: 1 });
  });

  it("respects date ranges", () => {
    const r = computeStats(sample, "valence", null, { start_date: "2026-10-04" });
    expect(r.overall).toEqual({ mean: 3, n: 2 });
  });

  it("groups by weekday", () => {
    expect(weekdayOf("2026-10-10")).toBe("Saturday");
    const r = computeStats(sample, "valence", "weekday");
    expect(r.groups.every((g) => g.n === 1 && !g.reliable)).toBe(true);
  });

  it("returns a note when there's no data", () => {
    expect(computeStats([], "phq4", "weekday").note).toMatch(/no entries/i);
  });
});

describe("tools", () => {
  it("every tool definition has a working implementation", () => {
    const inputs: Record<string, unknown> = {
      get_entries: { limit: 3 },
      get_stats: { metric: "valence", group_by: "activities" },
      search_entries: { query: "deadline" },
    };
    for (const tool of MOODY_TOOLS) {
      expect(TOOL_IMPLEMENTATIONS[tool.name], tool.name).toBeTypeOf("function");
      expect(inputs[tool.name], `test input for ${tool.name}`).toBeDefined();
      expect(() => runTool(tool.name, inputs[tool.name], sample)).not.toThrow();
    }
    expect(Object.keys(TOOL_IMPLEMENTATIONS).sort()).toEqual(MOODY_TOOLS.map((t) => t.name).sort());
  });

  it("get_entries returns compact entries newest first with a limit", () => {
    const r = runTool("get_entries", { limit: 2 }, sample) as { entries: { date: string }[]; total_matching: number };
    expect(r.total_matching).toBe(5);
    expect(r.entries.map((e) => e.date)).toEqual(["2026-10-05", "2026-10-04"]);
  });

  it("search_entries matches journal text and tags", () => {
    const r = runTool("search_entries", { query: "deadline" }, sample) as { entries: { date: string }[] };
    expect(r.entries.map((e) => e.date)).toEqual(["2026-10-04"]);
  });

  it("throws on unknown tools and invalid metrics", () => {
    expect(() => runTool("delete_everything", {}, sample)).toThrow(/unknown tool/i);
    expect(() => runTool("get_stats", { metric: "happiness", group_by: "people" }, sample)).toThrow();
  });
});

describe("demo data", () => {
  const demo = generateDemoEntries("2026-10-10");

  it("has 30 days of entries", () => {
    expect(demo).toHaveLength(30);
    expect(demo.at(-1)!.date).toBe("2026-10-10");
    expect(demo[0].date).toBe("2026-09-11");
  });

  it("contains a reliable poor-sleep pattern that lowers valence", () => {
    const r = computeStats(demo, "valence", "triggers");
    const poorSleep = r.groups.find((g) => g.key === "poor sleep");
    expect(poorSleep).toBeDefined();
    expect(poorSleep!.reliable).toBe(true);
    expect(poorSleep!.n).toBeGreaterThanOrEqual(5);
    expect(poorSleep!.diff_from_overall).toBeLessThanOrEqual(-1);
  });

  it("has exercise and friends raising valence, deadlines raising arousal", () => {
    const acts = computeStats(demo, "valence", "activities").groups;
    expect(acts.find((g) => g.key === "exercise")!.diff_from_overall).toBeGreaterThan(0);
    expect(acts.find((g) => g.key === "time with friends")!.diff_from_overall).toBeGreaterThan(0);
    const deadline = computeStats(demo, "arousal", "triggers").groups.find((g) => g.key === "deadline");
    expect(deadline!.diff_from_overall).toBeGreaterThan(0);
  });
});
