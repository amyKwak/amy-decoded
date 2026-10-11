import type { DataConnection, Peer } from "peerjs";
import {
  COUNTDOWN_SECONDS,
  initialState,
  makeRoomCode,
  reduce,
  type Action,
  type GameState,
  type Role,
} from "./game";

/**
 * Two phones talk directly over WebRTC (PeerJS), so there's no game server.
 * The host's phone owns the game state: the guest sends actions, the host
 * runs them through `reduce` and sends the new state back.
 */

type ToHost = { type: "action"; action: Action };
type ToGuest = { type: "state"; state: GameState } | { type: "full" };

export type RoomSnapshot = {
  role: Role;
  code: string;
  status: "connecting" | "open" | "failed";
  state: GameState | null;
  error: string | null;
  /** A one-off message, such as the opponent leaving. */
  notice: string | null;
};

const CONNECT_TIMEOUT_MS = 15_000;
const peerId = (code: string) => `amy-decoded-noggin-${code}`;

export class NogginRoom {
  private snapshot: RoomSnapshot;
  private listeners = new Set<() => void>();
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private countdown: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  private constructor(role: Role, code: string) {
    this.snapshot = {
      role,
      code,
      status: "connecting",
      state: null,
      error: null,
      notice: null,
    };
  }

  static host(name: string): NogginRoom {
    const room = new NogginRoom("host", makeRoomCode());
    void room.startHost(name, 0);
    return room;
  }

  static join(code: string, name: string): NogginRoom {
    const room = new NogginRoom("guest", code);
    void room.startGuest(name);
    return room;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  dispatch(action: Action) {
    if (this.snapshot.role === "host") this.apply(action, "host");
    else if (this.conn?.open)
      this.conn.send({ type: "action", action } satisfies ToHost);
  }

  clearNotice() {
    this.set({ notice: null });
  }

  destroy() {
    this.destroyed = true;
    if (this.countdown) clearTimeout(this.countdown);
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

  private async startHost(name: string, attempt: number) {
    const { Peer } = await import("peerjs");
    if (this.destroyed) return;

    const code = attempt === 0 ? this.snapshot.code : makeRoomCode();
    this.set({ code });
    const peer = new Peer(peerId(code));
    this.peer = peer;

    peer.on("open", () =>
      this.set({ status: "open", state: initialState(name) }),
    );
    peer.on("connection", (conn) => this.acceptGuest(conn));
    // Losing the signaling server doesn't drop an open game, but reconnect so new joins still work.
    peer.on("disconnected", () => {
      if (!this.destroyed && !peer.destroyed) peer.reconnect();
    });
    peer.on("error", (err) => {
      if (err.type === "unavailable-id" && attempt < 5) {
        peer.destroy();
        void this.startHost(name, attempt + 1);
      } else if (this.snapshot.status === "connecting") {
        this.fail(
          "Couldn't create a room. Check your connection and try again.",
        );
      }
    });
  }

  private acceptGuest(conn: DataConnection) {
    if (this.conn?.open) {
      conn.on("open", () => {
        conn.send({ type: "full" } satisfies ToGuest);
        setTimeout(() => conn.close(), 500);
      });
      return;
    }

    this.conn = conn;
    conn.on("open", () => this.sendState());
    conn.on("data", (raw) => {
      const msg = raw as ToHost;
      if (msg?.type === "action") this.apply(msg.action, "guest");
    });
    conn.on("close", () => {
      if (this.conn !== conn) return;
      this.conn = null;
      const name = this.snapshot.state?.players.guest;
      this.apply({ type: "leave" }, "guest");
      if (name) this.set({ notice: `${name} left the room.` });
    });
  }

  private apply(action: Action, from: Role) {
    const prev = this.snapshot.state;
    if (!prev) return;
    const next = reduce(prev, action, from);
    if (next === prev) return;

    this.set({ state: next });
    this.sendState();

    if (next.phase === "countdown" && prev.phase !== "countdown") {
      if (this.countdown) clearTimeout(this.countdown);
      this.countdown = setTimeout(
        () => this.apply({ type: "go", round: next.round }, "host"),
        COUNTDOWN_SECONDS * 1000,
      );
    }
  }

  private sendState() {
    const state = this.snapshot.state;
    if (state && this.conn?.open)
      this.conn.send({ type: "state", state } satisfies ToGuest);
  }

  // ---- Guest ----

  private async startGuest(name: string) {
    const { Peer } = await import("peerjs");
    if (this.destroyed) return;

    const code = this.snapshot.code;
    const peer = new Peer();
    this.peer = peer;
    this.connectTimer = setTimeout(
      () =>
        this.fail(
          "Couldn't reach that room. Make sure the code is right and try again.",
        ),
      CONNECT_TIMEOUT_MS,
    );

    peer.on("open", () => {
      const conn = peer.connect(peerId(code), { reliable: true });
      this.conn = conn;
      conn.on("open", () =>
        conn.send({
          type: "action",
          action: { type: "join", name },
        } satisfies ToHost),
      );
      conn.on("data", (raw) => {
        const msg = raw as ToGuest;
        if (msg?.type === "full") {
          this.fail("That room already has two players.");
        } else if (msg?.type === "state") {
          if (this.connectTimer) clearTimeout(this.connectTimer);
          this.set({ status: "open", state: msg.state });
        }
      });
      conn.on("close", () => {
        if (this.snapshot.status === "open")
          this.set({ status: "failed", error: "The host left the room." });
      });
    });
    peer.on("error", (err) => {
      if (err.type === "peer-unavailable")
        this.fail(`No room found with code ${code}.`);
      else if (this.snapshot.status === "connecting")
        this.fail("Couldn't connect. Check your connection and try again.");
    });
  }
}
