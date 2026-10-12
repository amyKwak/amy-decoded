import { describe, expect, it } from "vitest";
import { cleanDeck, deckUserMessage } from "../deck";

describe("cleanDeck", () => {
  it("drops blanks, duplicates and used words, ignoring case", () => {
    const deck = cleanDeck(
      ["Frozen", " frozen ", "", "Moana", "Cars", "Up"],
      ["CARS"],
    );
    expect([...deck].sort()).toEqual(["Frozen", "Moana", "Up"]);
  });

  it("shuffles", () => {
    const words = Array.from({ length: 20 }, (_, i) => `Word ${i}`);
    const orders = new Set(
      Array.from({ length: 10 }, () => cleanDeck(words, []).join()),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("deckUserMessage", () => {
  it("lists used words only when there are some", () => {
    expect(deckUserMessage("animals", [])).toBe("Topic: animals");
    expect(deckUserMessage("animals", ["Cat", "Dog"])).toContain("Cat; Dog");
  });
});
