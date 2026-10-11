import { CELEBRITIES } from "./celebrities";

export type Mode = "number" | "celeb";
export type Role = "host" | "guest";
export type Phase = "lobby" | "countdown" | "playing" | "done";

/** Seconds between pressing Start and the words appearing: enough time to lift the phone. */
export const COUNTDOWN_SECONDS = 5;

export type GameState = {
  mode: Mode;
  phase: Phase;
  players: { host: string; guest: string | null };
  /** The word shown on each player's own phone, which that player is trying to guess. */
  words: { host: string; guest: string } | null;
  winner: Role | null;
  round: number;
};

export type Action =
  | { type: "join"; name: string }
  | { type: "leave" }
  | { type: "mode"; mode: Mode }
  | { type: "start" }
  | { type: "go"; round: number }
  | { type: "gotIt" }
  | { type: "lobby" };

export function initialState(
  hostName: string,
  mode: Mode = "celeb",
): GameState {
  return {
    mode,
    phase: "lobby",
    players: { host: hostName, guest: null },
    words: null,
    winner: null,
    round: 0,
  };
}

/** Two different words for the given mode. */
export function pickPair(
  mode: Mode,
  rng: () => number = Math.random,
): { host: string; guest: string } {
  const pool =
    mode === "number"
      ? Array.from({ length: 100 }, (_, i) => String(i + 1))
      : CELEBRITIES;
  const a = Math.floor(rng() * pool.length);
  // Pick from the remaining n - 1 entries so the two never match.
  let b = Math.floor(rng() * (pool.length - 1));
  if (b >= a) b += 1;
  return { host: pool[a], guest: pool[b] };
}

/**
 * The host runs every action through this and sends the result to the guest.
 * Returns the same object when the action doesn't apply, so callers can skip a broadcast.
 */
export function reduce(
  state: GameState,
  action: Action,
  from: Role,
  rng?: () => number,
): GameState {
  switch (action.type) {
    case "join":
      if (from !== "guest") return state;
      return { ...state, players: { ...state.players, guest: action.name } };
    case "leave":
      return {
        ...state,
        phase: "lobby",
        players: { ...state.players, guest: null },
        words: null,
        winner: null,
      };
    case "mode":
      if (state.phase !== "lobby" || state.mode === action.mode) return state;
      return { ...state, mode: action.mode };
    case "start":
      if (state.phase !== "lobby" || !state.players.guest) return state;
      return {
        ...state,
        phase: "countdown",
        words: pickPair(state.mode, rng),
        winner: null,
        round: state.round + 1,
      };
    case "go":
      if (state.phase !== "countdown" || state.round !== action.round)
        return state;
      return { ...state, phase: "playing" };
    case "gotIt":
      if (state.phase !== "playing") return state;
      return { ...state, phase: "done", winner: from };
    case "lobby":
      if (state.phase !== "done") return state;
      return { ...state, phase: "lobby" };
  }
}

// No 0/O, 1/I/L so codes are easy to read aloud and type.
const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";

export function makeRoomCode(rng: () => number = Math.random): string {
  return Array.from(
    { length: 4 },
    () => CODE_LETTERS[Math.floor(rng() * CODE_LETTERS.length)],
  ).join("");
}

export function normalizeRoomCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);
}
