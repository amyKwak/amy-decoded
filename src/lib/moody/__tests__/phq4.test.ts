import { describe, expect, it } from "vitest";
import { isPhq4Due, phq4Band, scorePhq4 } from "../phq4";

describe("scorePhq4", () => {
  it("sums total and subscales (items 1-2 anxiety, 3-4 depression)", () => {
    const s = scorePhq4([1, 2, 0, 1]);
    expect(s).toMatchObject({ total: 4, anxiety: 3, depression: 1, band: "mild" });
    expect(s.anxietyFlag).toBe(true);
    expect(s.depressionFlag).toBe(false);
  });

  it.each([
    [0, "normal"],
    [2, "normal"],
    [3, "mild"],
    [5, "mild"],
    [6, "moderate"],
    [8, "moderate"],
    [9, "severe"],
    [12, "severe"],
  ] as const)("total %i is %s", (total, band) => {
    expect(phq4Band(total)).toBe(band);
  });

  it("marks elevated for moderate+ totals or a flagged subscale", () => {
    expect(scorePhq4([0, 0, 0, 0]).elevated).toBe(false);
    expect(scorePhq4([1, 1, 0, 0]).elevated).toBe(false); // mild, subscale 2
    expect(scorePhq4([0, 0, 2, 1]).elevated).toBe(true); // depression subscale 3
    expect(scorePhq4([2, 0, 2, 2]).elevated).toBe(true); // moderate total
    expect(scorePhq4([3, 3, 3, 3])).toMatchObject({ total: 12, band: "severe", elevated: true });
  });

  it("rejects bad input", () => {
    expect(() => scorePhq4([1, 2, 3])).toThrow();
    expect(() => scorePhq4([0, 0, 0, 4])).toThrow();
    expect(() => scorePhq4([0, 0, 0.5, 0])).toThrow();
  });
});

describe("isPhq4Due", () => {
  const today = "2026-10-10";
  it("is due with no prior PHQ-4", () => {
    expect(isPhq4Due([{ date: "2026-10-09", phq4: null }], today)).toBe(true);
  });
  it("is not due within 7 days of the last one", () => {
    expect(isPhq4Due([{ date: "2026-10-05", phq4: [0, 0, 0, 0] }], today)).toBe(false);
  });
  it("is due again after 7 days", () => {
    expect(isPhq4Due([{ date: "2026-10-03", phq4: [0, 0, 0, 0] }], today)).toBe(true);
  });
  it("respects a dismissal for a week", () => {
    expect(isPhq4Due([], today, "2026-10-08")).toBe(false);
    expect(isPhq4Due([], today, "2026-10-01")).toBe(true);
  });
});
