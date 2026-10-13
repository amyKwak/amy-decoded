/**
 * The rules of Nat 20: heroes, dice, what the AI game master is told, and the
 * game data it hands back after each bit of story.
 */

export const GM_MODEL = "claude-opus-5-5";
export const QUEST_MAX = 120;
export const NAME_MAX = 16;
export const MAX_HP = 10;
export const MAX_HEROES = 4;
/** Roughly how many turns a quest lasts before the finale. */
export const QUEST_TURNS = 12;

export type Stat = "STR" | "DEX" | "INT" | "CHA";
export type ClassId = "warrior" | "rogue" | "mage" | "bard";

export const CLASSES: Record<
  ClassId,
  { name: string; stat: Stat; blurb: string }
> = {
  warrior: { name: "Warrior", stat: "STR", blurb: "Strong. Hits things." },
  rogue: { name: "Rogue", stat: "DEX", blurb: "Quick. Sneaks and steals." },
  mage: { name: "Mage", stat: "INT", blurb: "Clever. Casts spells." },
  bard: { name: "Bard", stat: "CHA", blurb: "Charming. Talks their way out." },
};
/** Your class's stat gets this bonus on rolls. */
export const CLASS_BONUS = 3;

export type Hero = {
  name: string;
  cls: ClassId;
  hp: number;
  items: string[];
};

export type Choice = { label: string; stat: Stat | "none"; dc: number };

/** One bit of story from the game master, and the game data that came with it. */
export type GmTurn = {
  choices: Choice[];
  hpChanges: { hero: string; amount: number }[];
  itemsGained: { hero: string; item: string }[];
  ending: "none" | "victory" | "defeat";
};

export type LogEntry =
  { role: "gm"; text: string } | { role: "player"; text: string };

// ---- Dice ----

export type Roll = {
  die: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
};

export function bonusFor(cls: ClassId, stat: Stat | "none"): number {
  return stat !== "none" && CLASSES[cls].stat === stat ? CLASS_BONUS : 0;
}

/** A d20 roll against a difficulty. A natural 20 always succeeds; a natural 1 always fails. */
export function rollCheck(
  bonus: number,
  dc: number,
  rng: () => number = Math.random,
): Roll {
  const die = 1 + Math.floor(rng() * 20);
  const total = die + bonus;
  const success = die === 20 ? true : die === 1 ? false : total >= dc;
  return { die, bonus, total, dc, success };
}

/** How a roll reads in the story, for the game master and the log. */
export function describeRoll(roll: Roll, stat: Stat | "none"): string {
  const special =
    roll.die === 20 ? " NATURAL 20!" : roll.die === 1 ? " NATURAL 1!" : "";
  const bonus = roll.bonus ? ` + ${roll.bonus}` : "";
  return `${stat === "none" ? "Roll" : `${stat} check`}: ${roll.die}${bonus} = ${roll.total} vs DC ${roll.dc}, ${roll.success ? "success" : "failure"}.${special}`;
}

// ---- Turn order ----

/** Heroes still standing take turns in order, skipping anyone knocked out. */
export function nextHero(heroes: Hero[], turn: number): Hero | null {
  const standing = heroes.filter((h) => h.hp > 0);
  return standing.length ? standing[turn % standing.length] : null;
}

/** Applies the game master's damage, healing and loot to the party. */
export function applyTurn(heroes: Hero[], turn: GmTurn): Hero[] {
  const key = (s: string) => s.trim().toLowerCase();
  return heroes.map((h) => {
    const hp = turn.hpChanges
      .filter((c) => key(c.hero) === key(h.name))
      .reduce((sum, c) => sum + c.amount, h.hp);
    const items = [
      ...h.items,
      ...turn.itemsGained
        .filter((g) => key(g.hero) === key(h.name))
        .map((g) => g.item),
    ];
    return { ...h, hp: Math.max(0, Math.min(MAX_HP, hp)), items };
  });
}

// ---- What the game master is told ----

export const GM_SYSTEM = `You are the game master of Nat 20, a lighthearted fantasy tabletop adventure, like a cozy game of Dungeons & Dragons played on one phone. You write the story, but the players perform it: each turn you write a short script that the friends read aloud to each other, like a table read of a play.

How to write the script:
- Write 4 to 8 lines. Put each line on its own line, in exactly this format:
  Reader | Speaker | direction | Words to read aloud
  - Reader: the name of the player who reads this line. Use only the party's hero names.
  - Speaker: who is talking: Narrator, a character the heroes meet (like Grumpy Owl), or a hero by name.
  - direction: a 1 to 3 word hint for how to read it (like whispering, booming, nervous), or leave it empty.
  - Words: what they say, 8 to 30 words, written to be fun to say out loud.
  For example:
  Mira | Narrator | spooky | The candles flicker as the door creaks open on its own.
  Bo | Grumpy Owl | grumpy | Who goes there? Nobody gets past me without the password.
- Share the reading around: rotate the Narrator between players, and give the characters' voices to players other than the hero whose turn is next, so everyone gets to perform. A hero's own lines are read by that hero's player. If there's one player, they read everything.
- No other text: no headings, markdown, blank commentary, or game numbers.
- React to what the hero just did. If they rolled, the roll decides how it went: success means it works (a natural 20 is spectacular), failure means a fun complication (a natural 1 is a hilarious disaster). Never ignore a roll.
- Keep it family friendly: danger and peril, but no gore. Humor is welcome.
- End with a Narrator line that turns to the hero whose turn is next, by name, and asks what they do.

After narrating, always call the set_scene tool exactly once:
- choices: 2 or 3 short, distinct actions (under 8 words each) for the next hero. Give risky actions a stat check (STR for force, DEX for agility or stealth, INT for magic or knowledge, CHA for talking) and a difficulty from 8 (easy) to 18 (very hard); safe actions use stat "none" and dc 0. Offer at least one choice that suits the next hero's class.
- hp_changes: damage (negative) or healing (positive) from this turn, usually 1 to 4. Heroes have 10 HP.
- items_gained: anything a hero picked up this turn.
- ending: "none" while the quest continues. Build to a finale around turn ${QUEST_TURNS}, then end with "victory" or, if the party truly failed, "defeat". When you end the quest, write a satisfying final scene (still as a script) instead of asking what they do, and give no choices.

If the quest asks for something hateful, sexual, or about real private people, steer the story to a safe, fun version instead.`;

// ---- The script ----

export type ScriptLine = {
  /** The hero whose player reads this line aloud. */
  reader: string;
  /** Who is talking in the story: Narrator, a character, or a hero. */
  speaker: string;
  /** How to read it, like "whispering". Empty when there's no hint. */
  direction: string;
  text: string;
};

/**
 * Parses one script line, "Reader | Speaker | direction | Words". A reader
 * who isn't in the party falls back to `fallback`, so every line has someone
 * to read it. Lines without the pipes are read by the fallback as narration.
 */
export function parseScriptLine(
  raw: string,
  heroNames: string[],
  fallback: string,
): ScriptLine | null {
  const line = raw.trim().replace(/^[-*]\s+/, "");
  if (!line) return null;
  const parts = line.split("|").map((p) => p.trim());
  const match = (name: string) =>
    heroNames.find((h) => h.toLowerCase() === name.toLowerCase());
  if (parts.length < 4) {
    return { reader: fallback, speaker: "Narrator", direction: "", text: line };
  }
  const [reader, speaker, direction, ...words] = parts;
  const text = words.join(" | ").trim();
  if (!text) return null;
  return {
    reader: match(reader) ?? fallback,
    speaker: speaker || "Narrator",
    direction: direction.replace(/^\(|\)$/g, "").slice(0, 30),
    text,
  };
}

/**
 * Splits a game master turn into script lines. While the text is still
 * streaming, the last line may be cut off; `complete` says whether to keep it.
 */
export function parseScript(
  text: string,
  heroNames: string[],
  complete: boolean,
): ScriptLine[] {
  const rows = text.split("\n");
  if (!complete) rows.pop();
  const lines: ScriptLine[] = [];
  for (const row of rows) {
    const fallback = heroNames[lines.length % Math.max(1, heroNames.length)];
    const line = parseScriptLine(row, heroNames, fallback ?? "Narrator");
    if (line) lines.push(line);
  }
  return lines;
}

export const SET_SCENE_TOOL = {
  name: "set_scene",
  description:
    "Hand the game the choices for the next hero and any changes to the party from this turn. Call once, after narrating.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      choices: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            stat: {
              type: "string",
              enum: ["STR", "DEX", "INT", "CHA", "none"],
            },
            dc: { type: "integer" },
          },
          required: ["label", "stat", "dc"],
          additionalProperties: false,
        },
      },
      hp_changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            hero: { type: "string" },
            amount: { type: "integer" },
          },
          required: ["hero", "amount"],
          additionalProperties: false,
        },
      },
      items_gained: {
        type: "array",
        items: {
          type: "object",
          properties: {
            hero: { type: "string" },
            item: { type: "string" },
          },
          required: ["hero", "item"],
          additionalProperties: false,
        },
      },
      ending: { type: "string", enum: ["none", "victory", "defeat"] },
    },
    required: ["choices", "hp_changes", "items_gained", "ending"],
    additionalProperties: false,
  },
};

function partySummary(heroes: Hero[]): string {
  return heroes
    .map(
      (h) =>
        `- ${h.name}, ${CLASSES[h.cls].name} (${CLASSES[h.cls].stat}), ${h.hp}/${MAX_HP} HP${h.hp === 0 ? ", knocked out" : ""}${h.items.length ? `, carrying ${h.items.join(", ")}` : ""}`,
    )
    .join("\n");
}

/**
 * The conversation so far, as Claude messages. The game master has no memory
 * of its own: every turn, the whole story is sent again, and the latest party
 * status and whose turn it is ride along with the newest message.
 */
export function gmMessages(
  quest: string,
  heroes: Hero[],
  log: LogEntry[],
  next: string,
  turn: number,
): { role: "user" | "assistant"; content: string }[] {
  const status = `Party now:\n${partySummary(heroes)}\n\nThis is turn ${turn + 1} of about ${QUEST_TURNS}. Next up: ${next}.`;
  const opening = `The quest: "${quest}"\n\nThe party:\n${partySummary(heroes)}\n\nBegin the adventure.`;

  const messages: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: opening },
  ];
  for (const entry of log) {
    if (entry.role === "gm") {
      messages.push({ role: "assistant", content: entry.text });
    } else {
      messages.push({ role: "user", content: entry.text });
    }
  }
  const last = messages[messages.length - 1];
  last.content = `${last.content}\n\n${status}`;
  return messages;
}

// ---- Cleaning what comes in ----

const STATS = ["STR", "DEX", "INT", "CHA", "none"] as const;

/** Makes the game master's tool input safe to use, with sane defaults. */
export function cleanGmTurn(input: unknown): GmTurn {
  const raw = (input ?? {}) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  const choices = list(raw.choices)
    .map((c) => c as Record<string, unknown>)
    .filter((c) => typeof c?.label === "string" && c.label.trim())
    .slice(0, 3)
    .map((c): Choice => {
      const stat = STATS.includes(c.stat as Stat) ? (c.stat as Stat) : "none";
      const dc =
        stat === "none"
          ? 0
          : Math.min(20, Math.max(5, Math.round(Number(c.dc) || 12)));
      return { label: (c.label as string).trim().slice(0, 60), stat, dc };
    });
  const ending =
    raw.ending === "victory" || raw.ending === "defeat" ? raw.ending : "none";
  return {
    choices,
    hpChanges: list(raw.hp_changes)
      .map((c) => c as Record<string, unknown>)
      .filter((c) => typeof c?.hero === "string" && Number.isFinite(c.amount))
      .map((c) => ({
        hero: c.hero as string,
        amount: Math.max(-6, Math.min(6, Math.round(c.amount as number))),
      })),
    itemsGained: list(raw.items_gained)
      .map((c) => c as Record<string, unknown>)
      .filter((c) => typeof c?.hero === "string" && typeof c.item === "string")
      .slice(0, 3)
      .map((c) => ({
        hero: c.hero as string,
        item: (c.item as string).trim().slice(0, 40),
      })),
    ending,
  };
}

/** Checks a party sent from the browser before it goes into a prompt. */
export function cleanHeroes(input: unknown): Hero[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_HEROES)
    .map((h) => h as Record<string, unknown>)
    .filter(
      (h) =>
        typeof h?.name === "string" &&
        h.name.trim() &&
        typeof h.cls === "string" &&
        h.cls in CLASSES,
    )
    .map((h) => ({
      name: (h.name as string).trim().slice(0, NAME_MAX),
      cls: h.cls as ClassId,
      hp: Math.max(0, Math.min(MAX_HP, Math.round(Number(h.hp) || 0))),
      items: (Array.isArray(h.items) ? h.items : [])
        .filter((i): i is string => typeof i === "string")
        .slice(0, 12)
        .map((i) => i.slice(0, 40)),
    }));
}

/** Checks a story log sent from the browser: alternating, GM first, capped. */
export function cleanLog(input: unknown): LogEntry[] {
  if (!Array.isArray(input)) return [];
  const log: LogEntry[] = [];
  for (const e of input.slice(-60)) {
    const entry = e as Record<string, unknown>;
    const expected = log.length % 2 === 0 ? "gm" : "player";
    if (entry?.role !== expected || typeof entry.text !== "string") break;
    log.push({ role: expected, text: entry.text.slice(0, 1500) });
  }
  return log;
}
