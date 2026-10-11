import { describe, expect, it } from "vitest";
import { heardWord, normalizeSpeech, numberWords } from "../voice";

describe("numberWords", () => {
  it("spells out the game's range", () => {
    expect(numberWords(1)).toBe("one");
    expect(numberWords(13)).toBe("thirteen");
    expect(numberWords(40)).toBe("forty");
    expect(numberWords(67)).toBe("sixty seven");
    expect(numberWords(100)).toBe("one hundred");
  });
});

describe("normalizeSpeech", () => {
  it("drops accents, case and punctuation", () => {
    expect(normalizeSpeech("Is it Beyoncé?!")).toBe("is it beyonce");
    expect(normalizeSpeech("sixty-seven")).toBe("sixty seven");
  });
});

describe("heardWord", () => {
  it("hears a celebrity inside a question", () => {
    expect(heardWord("am I Taylor Swift", "Taylor Swift")).toBe(true);
    expect(heardWord("is it beyonce", "Beyoncé")).toBe(true);
  });

  it("needs the whole name", () => {
    expect(heardWord("am I Taylor", "Taylor Swift")).toBe(false);
    expect(heardWord("am I a singer", "Taylor Swift")).toBe(false);
  });

  it("hears numbers as digits or words", () => {
    expect(heardWord("is it 67", "67")).toBe(true);
    expect(heardWord("is it sixty seven", "67")).toBe(true);
    expect(heardWord("is it sixty-seven", "67")).toBe(true);
    expect(heardWord("a hundred", "100")).toBe(true);
  });

  it("doesn't match a number inside a bigger one", () => {
    expect(heardWord("is it 167", "67")).toBe(false);
    expect(heardWord("is it 6", "67")).toBe(false);
    expect(heardWord("is it sixty", "67")).toBe(false);
  });

  it("tolerates names written without spaces", () => {
    expect(heardWord("am I lil nasx", "Lil Nas X")).toBe(true);
  });

  it("ignores empty input", () => {
    expect(heardWord("", "Drake")).toBe(false);
  });
});
