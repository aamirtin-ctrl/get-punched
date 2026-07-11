/**
 * Simple in-memory sliding-window rate limiter, keyed by IP.
 * Protects the LLM/search budget from abuse. For multi-instance production
 * scale, swap for Upstash/Vercel KV — the call-site contract stays the same.
 */

interface Window {
  timestamps: number[];
}

const buckets = (globalThis as unknown as {
  __rateBuckets?: Map<string, Window>;
}).__rateBuckets ?? new Map<string, Window>();

(globalThis as unknown as { __rateBuckets?: Map<string, Window> }).__rateBuckets =
  buckets;

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SCANS_PER_WINDOW = 6;

export function checkRateLimit(ip: string): { ok: boolean; retryAfterMin?: number } {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_SCANS_PER_WINDOW) {
    const oldest = bucket.timestamps[0];
    return {
      ok: false,
      retryAfterMin: Math.ceil((WINDOW_MS - (now - oldest)) / 60000),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(ip, bucket);
  return { ok: true };
}

export function ipFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
