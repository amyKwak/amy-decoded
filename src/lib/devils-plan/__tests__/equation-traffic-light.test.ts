import { describe, expect, it } from "vitest";
import {
  checkEquation,
  isSolved,
  randomEquation,
  score,
  toTiles,
} from "../equation-traffic-light";

const check = (text: string) => checkEquation(toTiles(text));

describe("checkEquation", () => {
  it("accepts valid nine-cell equations", () => {
    expect(check("12×3+4=40")).toEqual({ ok: true });
    expect(check("2^10=1024")).toEqual({ ok: true });
    expect(check("7÷2×2=7+0")).toEqual({ ok: true });
    expect(check("1-9+2=2-8")).toEqual({ ok: true }); // both sides are -6
  });

  it("does exponents before multiplication, like the players confirmed", () => {
    // 91 × 9^0 = 91, the one from the final.
    expect(check("91×9^0=91")).toEqual({ ok: true });
    expect(check("2×3^2=6×3")).toEqual({ ok: true });
    expect(check("2×3^2=36")).toMatchObject({ ok: false }); // 8 cells
    expect(check("2×3^2=036")).toMatchObject({ ok: false }); // (2×3)^2 isn't how it reads
  });

  it("reads chained exponents right to left", () => {
    expect(check("2^3^2=512")).toEqual({ ok: true });
    expect(check("2^3^2=064")).toMatchObject({ ok: false });
  });

  it("rejects the show's banned shapes", () => {
    expect(check("12×3+4=40")).toEqual({ ok: true });
    expect(check("12×+3=4+0")).toMatchObject({ reason: "Two symbols can't sit next to each other." });
    expect(check("05+5=10+0")).toMatchObject({ reason: "Numbers can't start with 0." });
    expect(check("+12×3=36+")).toMatchObject({ reason: "Start and end with a number." });
    expect(check("12345=678")).toMatchObject({ ok: false });
    expect(check("1+1=2=1+1")).toMatchObject({ reason: "Use exactly one =." });
    expect(check("12×3+4=4")).toMatchObject({ reason: "Use all 9 cells." });
  });

  it("rejects unbalanced, undefined and huge sides", () => {
    expect(check("12×3+4=41")).toMatchObject({ reason: "Both sides must be equal." });
    expect(check("8÷0=10-10")).toMatchObject({ ok: false });
    expect(check("0^0=1×1+0")).toMatchObject({ ok: false });
    expect(check("9^9^9=999")).toMatchObject({ ok: false });
  });
});

describe("score", () => {
  const secret = toTiles("12×3+4=40");

  it("lights every cell green on a correct guess", () => {
    const lights = score(secret, secret);
    expect(lights.every((l) => l === "green")).toBe(true);
    expect(isSolved(lights)).toBe(true);
  });

  it("marks right place green, wrong place yellow, missing red", () => {
    expect(score(secret, toTiles("40=4+3×21"))).toEqual([
      "yellow", "yellow", "yellow", "yellow", "green", "yellow", "yellow", "yellow", "yellow",
    ]);
    expect(score(secret, toTiles("56÷7-8^99"))).toEqual(Array(9).fill("red"));
  });

  it("lights a repeated tile only as often as the equation has it", () => {
    // The secret has one 1, so only the first guessed 1 lights yellow.
    const lights = score(secret, toTiles("111111111"));
    expect(lights).toEqual(["green", ...Array(8).fill("red")]);
    // Green takes priority over an earlier yellow for the same tile.
    expect(score(toTiles("1+2=3+0×0"), toTiles("2222+2222")).filter((l) => l !== "red")).toHaveLength(2);
  });

  it("scores guesses that aren't valid equations", () => {
    expect(score(secret, toTiles("========="))).toEqual([
      ...Array(6).fill("red"), "green", "red", "red",
    ]);
  });
});

describe("randomEquation", () => {
  it("always returns a valid equation", () => {
    let seed = 1;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 300; i++) {
      const tiles = randomEquation(random);
      expect(checkEquation(tiles), tiles.join("")).toEqual({ ok: true });
    }
  });
});
