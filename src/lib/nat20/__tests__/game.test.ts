import { describe, expect, it } from "vitest";
import {
  applyTurn,
  bonusFor,
  cleanGmTurn,
  cleanHeroes,
  cleanLog,
  describeRoll,
  gmMessages,
  nextHero,
  parseScript,
  parseScriptLine,
  rollCheck,
  type Hero,
} from "../game";

const mira: Hero = { name: "Mira", cls: "thief", hp: 10, items: [] };
const bo: Hero = { name: "Bo", cls: "knight", hp: 10, items: [] };

describe("dice", () => {
  it("adds the class bonus only for the class's stat", () => {
    expect(bonusFor("thief", "DEX")).toBe(3);
    expect(bonusFor("thief", "STR")).toBe(0);
    expect(bonusFor("thief", "none")).toBe(0);
  });

  it("compares the total to the difficulty", () => {
    // rng 0.5 rolls an 11.
    expect(rollCheck(3, 14, () => 0.5)).toMatchObject({
      die: 11,
      total: 14,
      success: true,
    });
    expect(rollCheck(0, 14, () => 0.5).success).toBe(false);
  });

  it("always succeeds on a natural 20 and fails on a natural 1", () => {
    expect(rollCheck(0, 25, () => 0.99).success).toBe(true);
    expect(rollCheck(10, 5, () => 0).success).toBe(false);
  });

  it("describes rolls for the story", () => {
    expect(
      describeRoll(
        rollCheck(3, 12, () => 0.99),
        "DEX",
      ),
    ).toBe("DEX check: 20 + 3 = 23 vs DC 12, success. NATURAL 20!");
  });
});

describe("turns", () => {
  it("rotates through standing heroes", () => {
    const party = [mira, { ...bo, hp: 0 }, { ...mira, name: "Kai" }];
    expect(nextHero(party, 0)?.name).toBe("Mira");
    expect(nextHero(party, 1)?.name).toBe("Kai");
    expect(nextHero(party, 2)?.name).toBe("Mira");
    expect(nextHero([{ ...bo, hp: 0 }], 0)).toBeNull();
  });

  it("applies damage, healing and loot by name, within 0 to 10 HP", () => {
    const party = applyTurn([mira, bo], {
      choices: [],
      hpChanges: [
        { hero: "mira", amount: -4 },
        { hero: "Bo", amount: 5 },
        { hero: "Nobody", amount: -9 },
      ],
      itemsGained: [{ hero: "Mira", item: "Rusty key" }],
      ending: "none",
    });
    expect(party[0]).toMatchObject({ hp: 6, items: ["Rusty key"] });
    expect(party[1].hp).toBe(10);
    expect(
      applyTurn([mira], {
        ...emptyTurn,
        hpChanges: [{ hero: "Mira", amount: -20 }],
      })[0].hp,
    ).toBe(0);
  });
});

const emptyTurn = {
  choices: [],
  hpChanges: [],
  itemsGained: [],
  ending: "none" as const,
};

describe("gmMessages", () => {
  it("starts with the quest and party, and adds the status to the newest message", () => {
    const msgs = gmMessages(
      "Steal the moon",
      [mira, bo],
      [
        { role: "gm", text: "You stand on a hill." },
        { role: "player", text: "Mira climbs the tree." },
      ],
      "Bo",
      1,
    );
    expect(msgs.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(msgs[0].content).toContain('"Steal the moon"');
    expect(msgs[2].content).toContain("Mira climbs the tree.");
    expect(msgs[2].content).toContain("Next up: Bo.");
    expect(msgs[0].content).not.toContain("Next up");
  });
});

describe("cleaning", () => {
  it("keeps the game master's data safe and in range", () => {
    expect(
      cleanGmTurn({
        choices: [
          { label: "Pick the lock", stat: "DEX", dc: 40 },
          { label: "Knock", stat: "none", dc: 9 },
          { label: "  ", stat: "STR", dc: 10 },
          { label: "Sing", stat: "LUCK", dc: 10 },
        ],
        hp_changes: [{ hero: "Mira", amount: -50 }, { hero: 3 }],
        items_gained: [{ hero: "Bo", item: "Shield" }],
        ending: "maybe",
      }),
    ).toEqual({
      choices: [
        { label: "Pick the lock", stat: "DEX", dc: 20 },
        { label: "Knock", stat: "none", dc: 0 },
        { label: "Sing", stat: "none", dc: 0 },
      ],
      hpChanges: [{ hero: "Mira", amount: -6 }],
      itemsGained: [{ hero: "Bo", item: "Shield" }],
      ending: "none",
    });
    expect(cleanGmTurn(null).choices).toEqual([]);
  });

  it("keeps only valid heroes", () => {
    expect(
      cleanHeroes([
        { name: "Mira", cls: "thief", hp: 12, items: ["Key", 4] },
        { name: "", cls: "wizard", hp: 5 },
        { name: "Zed", cls: "pirate", hp: 5 },
      ]),
    ).toEqual([{ name: "Mira", cls: "thief", hp: 10, items: ["Key"] }]);
  });

  it("keeps the log alternating, game master first", () => {
    expect(
      cleanLog([
        { role: "gm", text: "Hi" },
        { role: "player", text: "Go" },
        { role: "player", text: "Again" },
      ]),
    ).toEqual([
      { role: "gm", text: "Hi" },
      { role: "player", text: "Go" },
    ]);
  });
});

describe("script", () => {
  const names = ["Mira", "Bo"];

  it("reads who reads, who speaks, how, and what", () => {
    expect(
      parseScriptLine(
        "bo | Grumpy Owl | (grumpy) | Who goes there?",
        names,
        "Mira",
      ),
    ).toEqual({
      reader: "Bo",
      speaker: "Grumpy Owl",
      direction: "grumpy",
      text: "Who goes there?",
    });
  });

  it("gives lines with an unknown reader, or no format, to someone in the party", () => {
    expect(
      parseScriptLine("Zed | Narrator | | The door creaks.", names, "Mira")
        ?.reader,
    ).toBe("Mira");
    expect(parseScriptLine("Just some prose.", names, "Bo")).toEqual({
      reader: "Bo",
      speaker: "Narrator",
      direction: "",
      text: "Just some prose.",
    });
    expect(parseScriptLine("   ", names, "Bo")).toBeNull();
    expect(parseScriptLine("Bo | Owl | grumpy |  ", names, "Bo")).toBeNull();
  });

  it("holds back a line that's still streaming in", () => {
    const text =
      "Mira | Narrator | spooky | The candles flicker.\nBo | Owl | | Who go";
    expect(parseScript(text, names, false).map((l) => l.text)).toEqual([
      "The candles flicker.",
    ]);
    expect(parseScript(text, names, true).map((l) => l.text)).toEqual([
      "The candles flicker.",
      "Who go",
    ]);
  });
});
