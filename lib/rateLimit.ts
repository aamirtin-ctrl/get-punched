/**
 * Rate limiting to protect the API budget from a bug or abuse.
 *
 * Two DAILY ceilings — no hourly or per-minute cap, so a real customer can scan
 * several friends back to back without getting throttled:
 *   - per-IP daily   (one device can't quietly run away with the whole quota)
 *   - GLOBAL daily   (hard safety ceiling against a bug/attack)
 *
 * Set either env var to 0 to disable that ceiling entirely. Backed by Upstash
 * so counters are shared across serverless instances; falls back to in-memory
 * when KV isn't configured. Fails open — a limiter error never blocks a paid
 * scan. (Every scan is payment-gated anyway, so these are a backstop, not the
 * primary cost control.)
 */

// Tunable via env (0 = disable that ceiling).
const PER_IP_PER_DAY =
  process.env.RATE_LIMIT_IP_DAY !== undefined
    ? Number(process.env.RATE_LIMIT_IP_DAY)
    : 50;
const GLOBAL_PER_DAY =
  process.env.RATE_LIMIT_GLOBAL_DAY !== undefined
    ? Number(process.env.RATE_LIMIT_GLOBAL_DAY)
    : 300;
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
): Promise<{ ok: boolean; reason?: string }> {
  const c = creds();
  const perIpOn = Number.isFinite(PER_IP_PER_DAY) && PER_IP_PER_DAY > 0;
  const globalOn = Number.isFinite(GLOBAL_PER_DAY) && GLOBAL_PER_DAY > 0;

  if (!c) {
    // In-memory fallback: both ceilings on a rolling 24h window.
    if (perIpOn && !memWindow(`ip:${ip}`, DAY * 1000, PER_IP_PER_DAY)) {
      return { ok: false, reason: "ip-cap" };
    }
    if (globalOn && !memWindow("global", DAY * 1000, GLOBAL_PER_DAY)) {
      return { ok: false, reason: "daily-cap" };
    }
    return { ok: true };
  }

  try {
    const dayBucket = Math.floor(Date.now() / 1000 / DAY);

    // Per-IP first, so one abusive IP can't inflate the global counter.
    if (perIpOn) {
      const ipCount = await kvIncr(c, `rl:ip:${ip}:${dayBucket}`, DAY);
      if (ipCount > PER_IP_PER_DAY) return { ok: false, reason: "ip-cap" };
    }
    if (globalOn) {
      const globalCount = await kvIncr(c, `rl:day:${dayBucket}`, DAY);
      if (globalCount > GLOBAL_PER_DAY) return { ok: false, reason: "daily-cap" };
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
