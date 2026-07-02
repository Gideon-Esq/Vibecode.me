/**
 * Lightweight fixed-window rate limiter (in-memory, per server instance).
 *
 * Good enough to blunt abuse of the public endpoints (registration spam,
 * contact-form abuse, certificate scraping) without adding infrastructure.
 * On serverless each instance keeps its own window, so treat the limits as
 * per-instance minimums rather than exact global counts.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Evict expired buckets so the map can't grow unbounded. */
function sweep(now: number) {
  if (buckets.size < 10_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

/**
 * Consume one hit for `key`. Allows `limit` hits per `windowMs` window.
 * Key by route + client IP, e.g. `register:1.2.3.4`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true };
}

/**
 * Best-effort client IP. Behind a proxy/CDN (Vercel, Codespaces) the first
 * x-forwarded-for entry is the client; falls back to a shared key so the
 * limiter still bounds total abuse when no IP is available.
 */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Standard 429 JSON response with a Retry-After header. */
export function tooManyRequests(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}
