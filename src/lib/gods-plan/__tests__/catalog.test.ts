import { describe, expect, it } from "vitest";
import { GAMES, filterGames } from "../catalog";

const names = (filter: Parameters<typeof filterGames>[1]) =>
  filterGames(GAMES, filter).map((g) => g.name);

describe("filterGames", () => {
  it("returns everything with no filter", () => {
    expect(filterGames(GAMES, {})).toHaveLength(GAMES.length);
  });

  it("keeps games that fit the number of players", () => {
    expect(names({ players: { min: 7, max: 7 } })).toContain("Heavy 13");
    expect(names({ players: { min: 7, max: 7 } })).not.toContain("Card Janggi");
    expect(names({ players: { min: 1, max: 1 } })).toContain("Equation Traffic Light");
  });

  it("combines filters", () => {
    expect(names({ season: 3, type: "Ascension", playableOnly: true })).toEqual(["Equation Traffic Light"]);
    expect(names({ season: 2 })).toEqual([]);
  });

  it("matches a range of players", () => {
    expect(names({ players: { min: 3, max: 6 } })).toContain("Hit, Stay");
    expect(names({ players: { min: 3, max: 6 } })).not.toContain("Card Janggi");
  });

  it("searches names and summaries, ignoring case", () => {
    expect(names({ query: "  EQUATION " })).toContain("Equation Traffic Light");
    expect(names({ query: "cubes" })).toEqual(["Count the Cubes"]);
    expect(names({ query: "zzz" })).toEqual([]);
  });

  it("lists playable games first", () => {
    expect(filterGames(GAMES, {})[0].name).toBe("Equation Traffic Light");
  });

  it("gives every game a unique slug", () => {
    expect(new Set(GAMES.map((g) => g.slug)).size).toBe(GAMES.length);
  });
});
