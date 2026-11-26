import { describe, expect, it } from "vitest";
import { GAMES, filterGames } from "../catalog";

const names = (filter: Parameters<typeof filterGames>[1]) =>
  filterGames(GAMES, filter).map((g) => g.name);

describe("filterGames", () => {
  it("returns everything with no filter", () => {
    expect(filterGames(GAMES, {})).toHaveLength(GAMES.length);
  });

  it("keeps games that fit the number of players", () => {
    expect(names({ players: 7 })).toContain("Heavy 13");
    expect(names({ players: 7 })).not.toContain("Card Janggi");
    expect(names({ players: 1 })).toContain("Equation Traffic Light");
  });

  it("combines filters", () => {
    expect(names({ season: 3, type: "Final", playableOnly: true })).toEqual(["Equation Traffic Light"]);
    expect(names({ season: 2 })).toEqual([]);
  });

  it("gives every game a unique slug", () => {
    expect(new Set(GAMES.map((g) => g.slug)).size).toBe(GAMES.length);
  });
});
