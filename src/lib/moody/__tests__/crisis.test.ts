import { describe, expect, it } from "vitest";
import { detectCrisis } from "../crisis";

describe("detectCrisis", () => {
  it.each([
    "I want to die",
    "honestly i just wanna die",
    "I've been thinking about killing myself",
    "I could kill myself",
    "I keep wanting to hurt myself",
    "thinking about self-harm again",
    "self harm urges today",
    "Everyone would be better off without me",
    "they'd be better off if I wasn't here",
    "I don’t want to be alive anymore", // curly apostrophe
    "I wish I was dead",
    "I want to end my life",
    "having suicidal thoughts",
    "I can't go on like this",
    "there's no reason to live",
  ])("flags %j", (text) => {
    expect(detectCrisis(text)).toBe(true);
  });

  it.each([
    "This deadline is killing me",
    "My feet are killing me after that hike",
    "I'm dying to see the new movie",
    "Killed it at the presentation today",
    "dead tired after work",
    "I could die of embarrassment lol",
    "The plants died while I was away",
    "Better off without the extra meeting",
    "I'd kill for a coffee right now",
    "",
  ])("does not flag %j", (text) => {
    expect(detectCrisis(text)).toBe(false);
  });
});
