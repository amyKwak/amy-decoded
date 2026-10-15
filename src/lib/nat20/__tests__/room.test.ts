import { describe, expect, it } from "vitest";
import type { Hero } from "../game";
import { makeRoomCode, normalizeRoomCode, pruneClaims } from "../room";

const hero = (name: string): Hero => ({
  name,
  cls: "rogue",
  hp: 10,
  items: [],
});

describe("room codes", () => {
  it("makes four easy-to-read letters", () => {
    const code = makeRoomCode();
    expect(code).toMatch(/^[A-HJKMNP-Z]{4}$/);
  });

  it("cleans up what people type", () => {
    expect(normalizeRoomCode(" ab-cd9e ")).toBe("ABCD");
  });
});

describe("pruneClaims", () => {
  it("drops heroes who left the party", () => {
    expect(
      pruneClaims({ Mira: "phone-1", Pip: "phone-2" }, [hero("Mira")]),
    ).toEqual({ Mira: "phone-1" });
  });
});
