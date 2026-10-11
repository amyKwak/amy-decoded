import { describe, expect, it } from "vitest";
import {
  initialState,
  makeRoomCode,
  normalizeRoomCode,
  pickPair,
  reduce,
} from "../game";
import { CELEBRITIES } from "../celebrities";

describe("pickPair", () => {
  it("never gives both players the same word", () => {
    for (const mode of ["number", "celeb"] as const) {
      for (let i = 0; i < 500; i++) {
        const { host, guest } = pickPair(mode);
        expect(host).not.toBe(guest);
      }
    }
  });

  it("covers the edges of the number range", () => {
    expect(pickPair("number", () => 0)).toEqual({ host: "1", guest: "2" });
    expect(pickPair("number", () => 0.9999)).toEqual({
      host: "100",
      guest: "99",
    });
  });

  it("has no duplicate celebrities", () => {
    expect(new Set(CELEBRITIES).size).toBe(CELEBRITIES.length);
  });
});

describe("reduce", () => {
  const lobby = initialState("Amy");
  const full = reduce(lobby, { type: "join", name: "Sam" }, "guest");

  it("won't start until a second player joins", () => {
    expect(reduce(lobby, { type: "start" }, "host")).toBe(lobby);
    expect(reduce(full, { type: "start" }, "guest").phase).toBe("countdown");
  });

  it("runs a full round", () => {
    const counting = reduce(full, { type: "start" }, "host");
    expect(counting.words).not.toBeNull();
    expect(
      reduce(counting, { type: "go", round: counting.round - 1 }, "host"),
    ).toBe(counting);

    const playing = reduce(
      counting,
      { type: "go", round: counting.round },
      "host",
    );
    expect(playing.phase).toBe("playing");

    const done = reduce(playing, { type: "gotIt" }, "guest");
    expect(done).toMatchObject({ phase: "done", winner: "guest" });
    expect(reduce(done, { type: "gotIt" }, "host")).toBe(done);

    expect(reduce(done, { type: "lobby" }, "host").phase).toBe("lobby");
  });

  it("ignores a guest claiming to be the host", () => {
    expect(reduce(full, { type: "join", name: "Imposter" }, "host")).toBe(full);
  });

  it("goes back to the lobby when the guest leaves mid-round", () => {
    const playing = reduce(
      reduce(full, { type: "start" }, "host"),
      { type: "go", round: 1 },
      "host",
    );
    expect(reduce(playing, { type: "leave" }, "guest")).toMatchObject({
      phase: "lobby",
      words: null,
      players: { guest: null },
    });
  });
});

describe("room codes", () => {
  it("makes four easy-to-read letters", () => {
    expect(makeRoomCode()).toMatch(/^[A-HJKMNP-Z]{4}$/);
  });

  it("cleans up typed codes", () => {
    expect(normalizeRoomCode(" ab-cd9e ")).toBe("ABCD");
  });
});
