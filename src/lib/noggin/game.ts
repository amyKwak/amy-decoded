export type Role = "host" | "guest";
/** "picking" is the wait while Claude chooses words for the prompt. */
export type Phase = "lobby" | "picking" | "countdown" | "playing" | "done";

/** Seconds between the words arriving and appearing: enough time to lift the phone. */
export const COUNTDOWN_SECONDS = 5;

export const PROMPT_MAX = 120;
/** How many past words to remember, so Claude doesn't repeat them. */
const RECENT_MAX = 30;

export type GameState = {
  phase: Phase;
  players: { host: string; guest: string | null };
  /** The word shown on each player's own phone, which that player is trying to guess. */
  words: { host: string; guest: string } | null;
  winner: Role | null;
  round: number;
  /** Rounds won by each player since the current guest joined. */
  score: Record<Role, number>;
  /** What the words should be, typed by the room's creator, like "a celebrity born after 1990". */
  prompt: string;
  /** Claude's short name for the prompt's category, shown above the word. */
  label: string | null;
  /** Words already used in this room. */
  recent: string[];
  /** Why the last round couldn't start. */
  pickError: string | null;
};

export type Action =
  | { type: "join"; name: string }
  | { type: "leave" }
  | { type: "prompt"; prompt: string }
  | { type: "start" }
  | {
      type: "words";
      round: number;
      words: { host: string; guest: string };
      label: string;
    }
  | { type: "wordsFailed"; round: number; error: string }
  | { type: "go"; round: number }
  | { type: "gotIt" }
  | { type: "lobby" };

export function initialState(hostName: string): GameState {
  return {
    phase: "lobby",
    players: { host: hostName, guest: null },
    words: null,
    winner: null,
    round: 0,
    score: { host: 0, guest: 0 },
    prompt: "",
    label: null,
    recent: [],
    pickError: null,
  };
}

/**
 * The host runs every action through this and sends the result to the guest.
 * Returns the same object when the action doesn't apply, so callers can skip a broadcast.
 */
export function reduce(
  state: GameState,
  action: Action,
  from: Role,
): GameState {
  switch (action.type) {
    case "join":
      if (from !== "guest") return state;
      // A new opponent starts the score fresh.
      return {
        ...state,
        players: { ...state.players, guest: action.name },
        score: { host: 0, guest: 0 },
      };
    case "leave":
      return {
        ...state,
        phase: "lobby",
        players: { ...state.players, guest: null },
        words: null,
        winner: null,
        score: { host: 0, guest: 0 },
      };
    case "prompt": {
      // Only the room's creator writes the prompt.
      if (from !== "host" || state.phase !== "lobby") return state;
      const prompt = action.prompt.slice(0, PROMPT_MAX);
      if (state.prompt === prompt) return state;
      return { ...state, prompt, pickError: null };
    }
    case "start":
      if (state.phase !== "lobby" || !state.players.guest) return state;
      if (!state.prompt.trim()) return state;
      // The host's phone asks Claude for words, then sends "words".
      return {
        ...state,
        phase: "picking",
        words: null,
        winner: null,
        pickError: null,
        round: state.round + 1,
      };
    case "words":
      // Only the host's phone fetches words, so a guest can't choose their own.
      if (from !== "host" || state.phase !== "picking") return state;
      if (state.round !== action.round) return state;
      return {
        ...state,
        phase: "countdown",
        words: action.words,
        label: action.label,
        recent: [...state.recent, action.words.host, action.words.guest].slice(
          -RECENT_MAX,
        ),
      };
    case "wordsFailed":
      if (from !== "host" || state.phase !== "picking") return state;
      if (state.round !== action.round) return state;
      return { ...state, phase: "lobby", pickError: action.error };
    case "go":
      if (state.phase !== "countdown" || state.round !== action.round)
        return state;
      return { ...state, phase: "playing" };
    case "gotIt":
      if (state.phase !== "playing") return state;
      return {
        ...state,
        phase: "done",
        winner: from,
        score: { ...state.score, [from]: state.score[from] + 1 },
      };
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
