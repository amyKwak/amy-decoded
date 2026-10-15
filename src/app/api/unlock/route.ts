import { cookies } from "next/headers";
import { GATE_COOKIE, GATE_MAX_AGE, gateConfigured, unlockToken } from "@/lib/gate";
import { clientIp, createRateLimiter } from "@/lib/moody/rate-limit";

// Enough for a few typos, not enough to guess the password.
const limiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

const fail = (error: string, status: number) => Response.json({ error }, { status });

/** Checks the projects password and, if it's right, sets the unlock cookie. */
export async function POST(request: Request) {
  if (!gateConfigured()) return fail("Access isn't configured on this server yet.", 503);

  const { ok } = limiter.check(clientIp(request.headers));
  if (!ok) return fail("Too many attempts. Please wait a few minutes and try again.", 429);

  const body = await request.json().catch(() => null);
  const attempt = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  const token = attempt ? unlockToken(attempt) : null;
  if (!token) return fail("Incorrect password. Please try again.", 401);

  (await cookies()).set(GATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
  return Response.json({ ok: true });
}
