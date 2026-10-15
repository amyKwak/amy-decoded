import type { DataConnection, Peer } from "peerjs";
import type { Choice, GmTurn, Hero, Roll, Stat } from "./game";

/**
 * More phones at the table, talking directly over WebRTC (PeerJS), so there's
 * no game server. The host's phone runs the game and the game master: it
 * shares the table with every phone, and the others send back what their
 * players tap. Each guest phone claims heroes; any hero nobody claims stays
 * on the host's phone.
 */

/** Reading-aloud speeds for the teleprompter, in words per second. */
export const PACES = { slow: 1.8, normal: 2.4, fast: 3.1 } as const;
export type Pace = keyof typeof PACES;

/** What the story log shows: the words, plus the extras around them. */
export type Entry =
  | { kind: "gm"; text: string; live: boolean; turn: GmTurn | null }
  | {
      kind: "player";
      hero: Hero;
      action: string;
      roll: (Roll & { stat: Stat }) | null;
    };

export type Status = "gm" | "choose" | "rolling" | "over" | "error";

/** Everything a phone needs to draw the adventure. */
export type PlayView = {
  heroes: Hero[];
  entries: Entry[];
  status: Status;
  choices: Choice[];
  ending: "victory" | "defeat" | null;
  error: string | null;
  /** The roll on screen, until its hero taps Keep going. */
  pending: { hero: Hero; choice: Choice; roll: Roll } | null;
  /** The script line being read in the newest game master turn. */
  cursor: number;
  paused: boolean;
  pace: Pace;
  /** Whose turn it is. */
  active: string | null;
};

/** What the host shares with every phone. */
export type Table = {
  heroes: Hero[];
  /** Hero name to the guest phone (peer id) playing them. */
  claims: Record<string, string>;
  /** Null while the host is still setting up the party and quest. */
  play: PlayView | null;
};

/** Something a player tapped on a guest phone. */
export type Act =
  | { kind: "pick"; label: string }
  | { kind: "custom"; text: string }
  | { kind: "rolled" }
  | { kind: "pause" }
  | { kind: "skip"; cursor: number }
  | { kind: "pace"; pace: Pace }
  | { kind: "retry" };

type ToHost =
  { type: "claim"; hero: string | null } | { type: "act"; act: Act };
type ToGuest = { type: "table"; table: Table };

export type RoomSnapshot = {
  role: "host" | "guest";
  code: string;
  status: "connecting" | "open" | "failed";
  /** This phone's peer id, which claims point at. */
  me: string;
  table: Table | null;
  /** How many guest phones are connected (host only). */
  guests: number;
  error: string | null;
  /** A one-off message, such as a phone leaving. */
  notice: string | null;
};

const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";
const CONNECT_TIMEOUT_MS = 15_000;
/** Story text streams in fast, so table updates go out at most this often. */
const SEND_EVERY_MS = 120;
const peerId = (code: string) => `amy-decoded-goose-${code}`;

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

/** Drops claims for heroes no longer in the party. */
export function pruneClaims(
  claims: Record<string, string>,
  heroes: Hero[],
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(claims).filter(([name]) =>
      heroes.some((h) => h.name === name),
    ),
  );
}

export class NatRoom {
  private snapshot: RoomSnapshot;
  private listeners = new Set<() => void>();
  private peer: Peer | null = null;
  /** Host: every guest phone. Guest: just the host. */
  private conns = new Map<string, DataConnection>();
  private sendTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  /** Host only: the adventure handles what guests tap. */
  onAct: ((act: Act, from: string) => void) | null = null;

  private constructor(role: "host" | "guest", code: string) {
    this.snapshot = {
      role,
      code,
      status: "connecting",
      me: "",
      table: null,
      guests: 0,
      error: null,
      notice: null,
    };
  }

  static host(heroes: Hero[]): NatRoom {
    const room = new NatRoom("host", makeRoomCode());
    room.snapshot.table = { heroes, claims: {}, play: null };
    void room.startHost(0);
    return room;
  }

  static join(code: string): NatRoom {
    const room = new NatRoom("guest", code);
    void room.startGuest();
    return room;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  clearNotice() {
    this.set({ notice: null });
  }

  destroy() {
    this.destroyed = true;
    if (this.sendTimer) clearTimeout(this.sendTimer);
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.peer?.destroy();
    this.listeners.clear();
  }

  private set(patch: Partial<RoomSnapshot>) {
    if (this.destroyed) return;
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((l) => l());
  }

  private fail(error: string) {
    if (this.destroyed || this.snapshot.status === "failed") return;
    this.set({ status: "failed", error });
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.peer?.destroy();
  }

  // ---- Host ----

  /** Host only: changes the shared table and sends it to every phone. */
  update(patch: Partial<Table>) {
    const table = this.snapshot.table;
    if (this.snapshot.role !== "host" || !table) return;
    const next = { ...table, ...patch };
    next.claims = pruneClaims(next.claims, next.heroes);
    this.set({ table: next });
    this.scheduleSend();
  }

  private async startHost(attempt: number) {
    const { Peer } = await import("peerjs");
    if (this.destroyed) return;

    const code = attempt === 0 ? this.snapshot.code : makeRoomCode();
    this.set({ code });
    const peer = new Peer(peerId(code));
    this.peer = peer;

    peer.on("open", (id) => this.set({ status: "open", me: id }));
    peer.on("connection", (conn) => this.acceptGuest(conn));
    // Losing the signaling server doesn't drop open phones, but reconnect so new joins still work.
    peer.on("disconnected", () => {
      if (!this.destroyed && !peer.destroyed) peer.reconnect();
    });
    peer.on("error", (err) => {
      if (err.type === "unavailable-id" && attempt < 5) {
        peer.destroy();
        void this.startHost(attempt + 1);
      } else if (this.snapshot.status === "connecting") {
        this.fail(
          "Couldn't open the table. Check your connection and try again.",
        );
      }
    });
  }

  private acceptGuest(conn: DataConnection) {
    const id = conn.peer;
    conn.on("open", () => {
      this.conns.set(id, conn);
      this.set({ guests: this.conns.size });
      this.sendTo(conn);
    });
    conn.on("data", (raw) => {
      const msg = raw as ToHost;
      if (msg?.type === "claim") this.claim(id, msg.hero);
      else if (msg?.type === "act" && msg.act) this.onAct?.(msg.act, id);
    });
    conn.on("close", () => {
      if (this.conns.get(id) !== conn) return;
      this.conns.delete(id);
      const table = this.snapshot.table;
      const theirs = table
        ? Object.keys(table.claims).filter((n) => table.claims[n] === id)
        : [];
      this.set({
        guests: this.conns.size,
        notice: theirs.length
          ? `${theirs.join(" and ")} left. ${theirs.length === 1 ? "Their hero is" : "Their heroes are"} back on this phone.`
          : this.snapshot.notice,
      });
      if (theirs.length) this.claim(id, null);
    });
  }

  /** A guest phone takes a hero (one per phone), or lets go with null. */
  private claim(from: string, hero: string | null) {
    const table = this.snapshot.table;
    if (!table) return;
    if (hero !== null) {
      const taken = table.claims[hero];
      if (!table.heroes.some((h) => h.name === hero)) return;
      if (taken && taken !== from) return this.scheduleSend();
    }
    const claims = Object.fromEntries(
      Object.entries(table.claims).filter(([, who]) => who !== from),
    );
    if (hero !== null) claims[hero] = from;
    this.update({ claims });
  }

  private scheduleSend() {
    if (this.sendTimer) return;
    this.sendTimer = setTimeout(() => {
      this.sendTimer = null;
      this.conns.forEach((conn) => this.sendTo(conn));
    }, SEND_EVERY_MS);
  }

  private sendTo(conn: DataConnection) {
    const table = this.snapshot.table;
    if (table && conn.open)
      conn.send({ type: "table", table } satisfies ToGuest);
  }

  // ---- Guest ----

  /** Guest only: plays this hero on this phone (null to pick again). */
  claimHero(hero: string | null) {
    this.toHost({ type: "claim", hero });
  }

  /** Guest only: sends a tap to the host. */
  act(act: Act) {
    this.toHost({ type: "act", act });
  }

  private toHost(msg: ToHost) {
    const conn = [...this.conns.values()][0];
    if (conn?.open) conn.send(msg);
  }

  private async startGuest() {
    const { Peer } = await import("peerjs");
    if (this.destroyed) return;

    const code = this.snapshot.code;
    const peer = new Peer();
    this.peer = peer;
    this.connectTimer = setTimeout(
      () =>
        this.fail(
          "Couldn't reach that table. Make sure the code is right and try again.",
        ),
      CONNECT_TIMEOUT_MS,
    );

    peer.on("open", (id) => {
      this.set({ me: id });
      const conn = peer.connect(peerId(code), { reliable: true });
      this.conns.set("host", conn);
      conn.on("data", (raw) => {
        const msg = raw as ToGuest;
        if (msg?.type !== "table") return;
        if (this.connectTimer) clearTimeout(this.connectTimer);
        this.set({ status: "open", table: msg.table });
      });
      conn.on("close", () => {
        if (this.snapshot.status === "open")
          this.set({ status: "failed", error: "The host left the game." });
      });
    });
    peer.on("error", (err) => {
      if (err.type === "peer-unavailable")
        this.fail(`No game found with code ${code}.`);
      else if (this.snapshot.status === "connecting")
        this.fail("Couldn't connect. Check your connection and try again.");
    });
  }
}
