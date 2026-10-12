import { describe, expect, it } from "vitest";
import { readTilt, screenElevation, type TiltState } from "../tilt";

describe("screenElevation", () => {
  it("reads upright, ceiling and floor in either sideways direction", () => {
    expect(screenElevation(0, 90)).toBeCloseTo(0);
    expect(screenElevation(0, -90)).toBeCloseTo(0);
    expect(screenElevation(0, 0)).toBeCloseTo(90);
    expect(screenElevation(180, 0)).toBeCloseTo(-90);
  });

  it("works held upright in portrait too", () => {
    expect(screenElevation(90, 0)).toBeCloseTo(0);
  });

  it("tells a tilt toward the ceiling from one toward the floor", () => {
    // Sideways phone, screen turned 50° up, then 50° down.
    expect(screenElevation(0, 40)).toBeCloseTo(50);
    expect(screenElevation(180, 40)).toBeCloseTo(-50);
  });
});

describe("readTilt", () => {
  /** Feeds a run of elevations through the detector and collects the moves. */
  function moves(elevations: number[]) {
    let state: TiltState = { armed: false };
    const out: string[] = [];
    for (const e of elevations) {
      // Up is beta 0, down is beta 180; gamma sets how far from upright.
      const beta = e >= 0 ? 0 : 180;
      const step = readTilt(state, beta, 90 - Math.abs(e));
      state = step.state;
      if (step.move) out.push(step.move);
    }
    return out;
  }

  it("scores tilting up and passes tilting down", () => {
    expect(moves([0, 50])).toEqual(["correct"]);
    expect(moves([0, -50])).toEqual(["pass"]);
  });

  it("needs the phone upright first, so lifting it into place doesn't count", () => {
    expect(moves([80, 60, 10])).toEqual([]);
  });

  it("counts a held tilt once, then again only after coming back upright", () => {
    expect(moves([0, 50, 60, 55, 30, 50])).toEqual(["correct"]);
    expect(moves([0, 50, 5, -50, 0, 50])).toEqual([
      "correct",
      "pass",
      "correct",
    ]);
  });

  it("ignores small wobbles", () => {
    expect(moves([0, 15, -15, 30, -30, 0])).toEqual([]);
  });
});
