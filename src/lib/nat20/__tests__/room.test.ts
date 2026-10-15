import { describe, expect, it } from "vitest";
import type { Hero } from "../game";
import {
  addGuestHero,
  makeRoomCode,
  normalizeRoomCode,
  pruneClaims,
} from "../room";

const hero = (name: string): Hero => ({
  name,
  cls: "thief",
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

describe("addGuestHero", () => {
  const table = { heroes: [hero("Mira")], claims: {}, play: null };

  it("adds the guest's hero to the party, and it's theirs", () => {
    const next = addGuestHero(table, " Pip ", "thief", "phone-2");
    expect(next?.heroes.map((h) => h.name)).toEqual(["Mira", "Pip"]);
    expect(next?.claims).toEqual({ Pip: "phone-2" });
  });

  it("refuses a name that's taken, any case", () => {
    expect(addGuestHero(table, "mira", "thief", "phone-2")).toBeNull();
  });

  it("refuses once the party is full", () => {
    const full = {
      ...table,
      heroes: ["A", "B", "C", "D"].map(hero),
    };
    expect(addGuestHero(full, "Pip", "thief", "phone-2")).toBeNull();
  });
});
