import { describe, expect, it } from "vitest";
import { parseAnswer, resolveStat, verifyEvidence } from "../answer";
import { computeStats } from "../stats";
import type { Entry } from "../types";

const valid = {
  headline: "Poor sleep is your biggest mood drain",
  tone: "negative",
  findings: [
    { title: "Bad nights, heavier days", detail: "Mood dips after short sleep.", tone: "negative", stat: { metric: "valence", group_by: "triggers", key: "poor sleep" } },
    { title: "Exercise helps", detail: "Runs line up with better days.", tone: "positive", stat: null },
  ],
  evidence: [{ date: "2026-10-03", quote: "Foggy all day" }],
  confidence: "solid",
  confidence_note: "Based on 30 days",
  suggestion: "Try a consistent bedtime this week.",
};

function entry(date: string, journal: string, extra: Partial<Entry> = {}): Entry {
  return {
    id: date, date, createdAt: 0, valence: 5, arousal: 5, sleepHours: null, sleepQuality: null, journal,
    emotions: [], people: [], activities: [], triggers: [], summary: "", phq4: null, ...extra,
  };
}

describe("parseAnswer", () => {
  it("parses a well-formed answer", () => {
    const a = parseAnswer(JSON.stringify(valid))!;
    expect(a.headline).toBe(valid.headline);
    expect(a.findings).toHaveLength(2);
    expect(a.findings[0].stat).toEqual({ metric: "valence", group_by: "triggers", key: "poor sleep" });
    expect(a.suggestion).toBe(valid.suggestion);
  });

  it("returns null for non-JSON or a missing headline", () => {
    expect(parseAnswer("Your sleep matters a lot.")).toBeNull();
    expect(parseAnswer(JSON.stringify({ ...valid, headline: "" }))).toBeNull();
    expect(parseAnswer("[]")).toBeNull();
  });

  it("caps findings and evidence, strips markup, and defaults bad enums", () => {
    const a = parseAnswer(
      JSON.stringify({
        ...valid,
        headline: "<b>Sleep</b> **matters**",
        tone: "ecstatic",
        findings: Array.from({ length: 6 }, (_, i) => ({ title: `f${i}`, detail: "", tone: "angry", stat: { metric: "mood", group_by: "x", key: "y" } })),
        evidence: [...Array(5)].map(() => ({ date: "2026-10-03", quote: "q" })).concat({ date: "yesterday", quote: "x" }),
        confidence: "very",
        suggestion: "",
      }),
    )!;
    expect(a.headline).toBe("Sleep matters");
    expect(a.tone).toBe("neutral");
    expect(a.findings).toHaveLength(3);
    expect(a.findings[0]).toMatchObject({ tone: "neutral", stat: null });
    expect(a.evidence).toHaveLength(3);
    expect(a.confidence).toBe("some");
    expect(a.suggestion).toBeNull();
  });
});

describe("verifyEvidence", () => {
  const entries = [entry("2026-10-03", "Woke up at 3am and couldn't fall back asleep. Foggy all day.")];

  it("keeps quotes that appear in that day's journal, ignoring case and punctuation", () => {
    expect(verifyEvidence([{ date: "2026-10-03", quote: "foggy all day." }], entries)).toHaveLength(1);
    expect(verifyEvidence([{ date: "2026-10-03", quote: "couldn’t fall back asleep" }], entries)).toHaveLength(1);
  });

  it("drops invented quotes and quotes from the wrong date", () => {
    expect(verifyEvidence([{ date: "2026-10-03", quote: "I felt hopeless" }], entries)).toEqual([]);
    expect(verifyEvidence([{ date: "2026-10-04", quote: "Foggy all day" }], entries)).toEqual([]);
  });
});

describe("resolveStat", () => {
  const entries = [
    entry("2026-10-01", "", { valence: 3, triggers: ["poor sleep"] }),
    entry("2026-10-02", "", { valence: 3, triggers: ["poor sleep"] }),
    entry("2026-10-03", "", { valence: 3, triggers: ["poor sleep"] }),
    entry("2026-10-04", "", { valence: 7 }),
  ];

  it("uses numbers from get_stats results seen in the conversation", () => {
    const seen = [computeStats(entries, "valence", "triggers")];
    const r = resolveStat({ metric: "valence", group_by: "triggers", key: "Poor Sleep" }, seen, entries)!;
    expect(r.group).toMatchObject({ key: "poor sleep", mean: 3, n: 3, reliable: true });
    expect(r.overall).toBe(4);
  });

  it("falls back to computing in code, and returns null for unknown groups", () => {
    expect(resolveStat({ metric: "valence", group_by: "triggers", key: "poor sleep" }, [], entries)?.group.mean).toBe(3);
    expect(resolveStat({ metric: "valence", group_by: "triggers", key: "aliens" }, [], entries)).toBeNull();
  });
});
