/**
 * Rate limiting to protect the LLM/search budget from abuse or runaway loops.
 *
 * Two ceilings:
 *   - per-IP hourly  (normal use: scan yourself + a few friends)
 *   - GLOBAL daily   (hard safety ceiling against a bug/attack burning the
 *                     whole free quota in one go)
 *
 * Backed by Upstash so counters are shared across serverless instances; falls
 * back to in-memory when KV isn't configured. (Note: none of the providers can
 * actually bill without a card on file — this guards the free quota + future.)
 */

// Tunable via env (raise these after upgrading the API plans).
const PER_IP_PER_HOUR = Number(process.env.RATE_LIMIT_IP_HOUR) || 10;
const GLOBAL_PER_DAY = Number(process.env.RATE_LIMIT_GLOBAL_DAY) || 300;
const HOUR = 3600;
const DAY = 86400;

function creds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/** INCR a key and set its TTL; returns the new count. */
async function kvIncr(
  c: { url: string; token: string },
  key: string,
  ttl: number
): Promise<number> {
  const r = await fetch(`${c.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, ttl],
    ]),
  });
  const arr = (await r.json()) as { result: number }[];
  return arr?.[0]?.result ?? 0;
}

// In-memory fallback (per instance; best-effort when KV is absent).
const mem = (globalThis as unknown as {
  __rl?: Map<string, number[]>;
}).__rl ?? new Map<string, number[]>();
(globalThis as unknown as { __rl?: Map<string, number[]> }).__rl = mem;

function memWindow(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const arr = (mem.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    mem.set(key, arr);
    return false;
  }
  arr.push(now);
  mem.set(key, arr);
  return true;
}

export async function checkRateLimit(
  ip: string
): Promise<{ ok: boolean; retryAfterMin?: number; reason?: string }> {
  const c = creds();

  if (!c) {
    // In-memory fallback: per-IP hourly + global daily.
    if (!memWindow(`ip:${ip}`, HOUR * 1000, PER_IP_PER_HOUR)) {
      return { ok: false, retryAfterMin: 60 };
    }
    if (!memWindow("global", DAY * 1000, GLOBAL_PER_DAY)) {
      return { ok: false, reason: "daily-cap" };
    }
    return { ok: true };
  }

  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const hourBucket = Math.floor(nowSec / HOUR);
    const dayBucket = Math.floor(nowSec / DAY);

    // Per-IP first, so one abusive IP can't inflate the global counter.
    const ipCount = await kvIncr(c, `rl:ip:${ip}:${hourBucket}`, HOUR);
    if (ipCount > PER_IP_PER_HOUR) {
      return { ok: false, retryAfterMin: 60 };
    }
    const globalCount = await kvIncr(c, `rl:day:${dayBucket}`, DAY);
    if (globalCount > GLOBAL_PER_DAY) {
      return { ok: false, reason: "daily-cap" };
    }
    return { ok: true };
  } catch {
    // Never block a scan because the limiter itself failed.
    return { ok: true };
  }
}

export function ipFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
