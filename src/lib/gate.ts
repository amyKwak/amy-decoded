import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The password gate in front of the projects that call Claude, so strangers
 * can't run up the token bill. One shared password lives in
 * PROJECTS_PASSWORD; unlocking stores a signed token in a cookie. Changing
 * the password signs everyone out.
 */
export const GATE_COOKIE = "projects_unlock";
export const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const GATED_PROJECTS = [
  { name: "Meme This!", page: "/projects/meme", api: "/api/meme" },
  { name: "The Lucky Goose", page: "/projects/lucky-goose", api: "/api/lucky-goose" },
  { name: "Clueless", page: "/projects/clueless", api: "/api/clueless" },
  { name: "Noggin", page: "/projects/noggin", api: "/api/noggin" },
  { name: "Moody", page: "/projects/moody", api: "/api/moody" },
];

const under = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

/** The gated project a page path belongs to, if any. */
export function gatedProjectFor(pathname: string) {
  return GATED_PROJECTS.find((p) => under(pathname, p.page));
}

const tokenFor = (password: string) =>
  createHmac("sha256", password).update("amy-decoded projects gate v1").digest();

const sameBytes = (a: Buffer, b: Buffer) =>
  a.length === b.length && timingSafeEqual(a, b);

export const gateConfigured = () => Boolean(process.env.PROJECTS_PASSWORD);

/** The cookie value for a correct password, or null if it's wrong. */
export function unlockToken(attempt: string): string | null {
  const password = process.env.PROJECTS_PASSWORD;
  if (!password) return null;
  const ok = sameBytes(tokenFor(attempt), tokenFor(password));
  return ok ? tokenFor(password).toString("base64url") : null;
}

/** Whether a request's cookie value unlocks the gated projects. */
export function isUnlocked(cookie: string | undefined): boolean {
  const password = process.env.PROJECTS_PASSWORD;
  if (!password || !cookie) return false;
  return sameBytes(Buffer.from(cookie, "base64url"), tokenFor(password));
}
