import { describe, expect, it } from "vitest";
import {
  initialState,
  makeRoomCode,
  normalizeRoomCode,
  reduce,
  type GameState,
  type Role,
} from "../game";

const lobby = initialState("Amy");
const full = reduce(lobby, { type: "join", name: "Sam" }, "guest");
const prompted = reduce(
  full,
  { type: "prompt", prompt: "Disney movies" },
  "host",
);

/** Start a round and hand it the words, as the host's phone does after asking Claude. */
function startWithWords(state: GameState, host = "Frozen", guest = "Moana") {
  const picking = reduce(state, { type: "start" }, "host");
  return reduce(
    picking,
    {
      type: "words",
      round: picking.round,
      words: { host, guest },
      label: "Disney Movies",
    },
    "host",
  );
}

function playRound(state: GameState, winner: Role) {
  const counting = startWithWords(state);
  const playing = reduce(
    counting,
    { type: "go", round: counting.round },
    "host",
  );
  return reduce(
    reduce(playing, { type: "gotIt" }, winner),
    { type: "lobby" },
    "host",
  );
}

describe("reduce", () => {
  it("won't start without a second player and a prompt", () => {
    const alone = reduce(lobby, { type: "prompt", prompt: "Animals" }, "host");
    expect(reduce(alone, { type: "start" }, "host")).toBe(alone);
    expect(reduce(full, { type: "start" }, "host")).toBe(full);
    expect(reduce(prompted, { type: "start" }, "guest").phase).toBe("picking");
  });

  it("only lets the room's creator write the prompt", () => {
    expect(reduce(full, { type: "prompt", prompt: "Animals" }, "guest")).toBe(
      full,
    );
    expect(prompted.prompt).toBe("Disney movies");
  });

  it("waits for the host's words before counting down", () => {
    const picking = reduce(prompted, { type: "start" }, "host");
    expect(picking).toMatchObject({ phase: "picking", words: null });

    const words = {
      type: "words" as const,
      round: picking.round,
      words: { host: "Frozen", guest: "Moana" },
      label: "Disney Movies",
    };
    expect(reduce(picking, words, "guest")).toBe(picking);
    expect(reduce(picking, { ...words, round: 0 }, "host")).toBe(picking);

    expect(reduce(picking, words, "host")).toMatchObject({
      phase: "countdown",
      words: { host: "Frozen", guest: "Moana" },
      label: "Disney Movies",
      recent: ["Frozen", "Moana"],
    });
  });

  it("goes back to the lobby with the reason when picking words fails", () => {
    const picking = reduce(prompted, { type: "start" }, "host");
    const failed = reduce(
      picking,
      {
        type: "wordsFailed",
        round: picking.round,
        error: "Try something else.",
      },
      "host",
    );
    expect(failed).toMatchObject({
      phase: "lobby",
      pickError: "Try something else.",
    });
  });

  it("runs a full round", () => {
    const counting = startWithWords(prompted);
    expect(
      reduce(counting, { type: "go", round: counting.round - 1 }, "host"),
    ).toBe(counting);

    const playing = reduce(
      counting,
      { type: "go", round: counting.round },
      "host",
    );
    expect(playing.phase).toBe("playing");

    const done = reduce(playing, { type: "gotIt" }, "guest");
    expect(done).toMatchObject({ phase: "done", winner: "guest" });
    expect(reduce(done, { type: "gotIt" }, "host")).toBe(done);

    expect(reduce(done, { type: "lobby" }, "host").phase).toBe("lobby");
  });

  it("keeps score across rounds and resets it for a new opponent", () => {
    let state = playRound(prompted, "guest");
    state = playRound(state, "guest");
    state = playRound(state, "host");
    expect(state.score).toEqual({ host: 1, guest: 2 });

    const left = reduce(state, { type: "leave" }, "guest");
    expect(left.score).toEqual({ host: 0, guest: 0 });
    const rejoined = reduce(state, { type: "join", name: "Kai" }, "guest");
    expect(rejoined.score).toEqual({ host: 0, guest: 0 });
  });

  it("ignores a guest claiming to be the host", () => {
    expect(reduce(full, { type: "join", name: "Imposter" }, "host")).toBe(full);
  });

  it("goes back to the lobby when the guest leaves mid-round", () => {
    const counting = startWithWords(prompted);
    const playing = reduce(
      counting,
      { type: "go", round: counting.round },
      "host",
    );
    expect(reduce(playing, { type: "leave" }, "guest")).toMatchObject({
      phase: "lobby",
      words: null,
      players: { guest: null },
    });
  });
});

describe("room codes", () => {
  it("makes four easy-to-read letters", () => {
    expect(makeRoomCode()).toMatch(/^[A-HJKMNP-Z]{4}$/);
  });

  it("cleans up typed codes", () => {
    expect(normalizeRoomCode(" ab-cd9e ")).toBe("ABCD");
  });
});
