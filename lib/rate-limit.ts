import type { NextRequest } from "next/server";

/**
 * Minimal in-memory fixed-window rate limiter (per server instance).
 * Good enough to blunt brute force / spam on auth, coupon and upload endpoints.
 * For multi-instance production deployments, back this with Redis/Upstash.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: NextRequest | Request, scope: string) {
  const h = request.headers;
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

// Opportunistic cleanup so the map cannot grow without bound.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    buckets.forEach((value, key) => {
      if (value.resetAt <= now) buckets.delete(key);
    });
  }, 60_000);
  (timer as unknown as { unref?: () => void }).unref?.();
}
