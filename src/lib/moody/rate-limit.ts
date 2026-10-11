/**
 * In-memory sliding-window rate limiter keyed by IP.
 *
 * On serverless hosts each instance has its own memory, so this is a soft
 * limit that stops casual abuse, not a guarantee. The real cost backstop is
 * the monthly spend limit in the Anthropic console.
 */
export interface RateLimiter {
  check(key: string, now?: number): { ok: boolean; retryAfterSec: number };
}

const MAX_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, retryAfterSec: Math.ceil((recent[0] + windowMs - now) / 1000) };
      }
      recent.push(now);
      hits.delete(key); // re-insert so Map order tracks recency
      hits.set(key, recent);
      if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value as string);
      return { ok: true, retryAfterSec: 0 };
    },
  };
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitMessage(retryAfterSec: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Moody needs a breather. This demo limits how often each visitor can use the AI. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}. Your check-ins still save without it.`;
}
