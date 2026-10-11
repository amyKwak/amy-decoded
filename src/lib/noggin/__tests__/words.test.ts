import { describe, expect, it } from "vitest";
import { pickTwo, wordsUserMessage } from "../words";

describe("pickTwo", () => {
  it("picks two different words", () => {
    for (let i = 0; i < 200; i++) {
      const pair = pickTwo(["Zendaya", "Billie Eilish", "Olivia Rodrigo"], []);
      expect(pair).not.toBeNull();
      expect(pair![0]).not.toBe(pair![1]);
    }
  });

  it("skips used words, blanks and duplicates, ignoring case", () => {
    expect(
      pickTwo(
        ["Zendaya", " zendaya ", "", "Lorde", "Tom Holland"],
        ["LORDE"],
        () => 0,
      ),
    ).toEqual(["Zendaya", "Tom Holland"]);
  });

  it("gives up when fewer than two are left", () => {
    expect(pickTwo(["Zendaya", "Lorde"], ["lorde"])).toBeNull();
  });
});

describe("wordsUserMessage", () => {
  it("lists used words only when there are some", () => {
    expect(wordsUserMessage("animals", [])).toBe("Description: animals");
    expect(wordsUserMessage("animals", ["Cat", "Dog"])).toContain("Cat; Dog");
  });
});
