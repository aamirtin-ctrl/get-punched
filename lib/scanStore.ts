import type { ScanPayload } from "./types";

/**
 * Scan cache — exactly ONE generated scan per paid Stripe session.
 *
 * This is a cost guard, not just a convenience: the expensive pipeline (Tavily
 * searches + optional LinkedIn scrape + the LLM call) runs inside create() and
 * costs real money each time. Backing this with Upstash means a paid session
 * resolves to one pipeline run for good — reloads, cold serverless instances,
 * and return visits all hit the cache instead of re-billing the APIs. Falls
 * back to an in-memory map when KV isn't configured (fine for local dev).
 */

function creds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

const store = (globalThis as unknown as {
  __scanStore?: Map<string, ScanPayload>;
}).__scanStore ?? new Map<string, ScanPayload>();

(globalThis as unknown as { __scanStore?: Map<string, ScanPayload> }).__scanStore =
  store;

const MAX_ENTRIES = 500;
const TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days — long enough that return
// visits to a session link never re-run (and re-bill) the pipeline.

export async function getScan(sessionId: string): Promise<ScanPayload | null> {
  const local = store.get(sessionId);
  if (local) return local;

  const c = creds();
  if (!c) return null;
  try {
    const r = await fetch(
      `${c.url}/get/scan:${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${c.token}` },
        cache: "no-store",
      }
    );
    const j = (await r.json()) as { result?: string | null };
    if (j.result) {
      const payload = JSON.parse(j.result) as ScanPayload;
      store.set(sessionId, payload); // warm the local cache
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveScan(
  sessionId: string,
  payload: ScanPayload
): Promise<void> {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(sessionId, payload);

  const c = creds();
  if (!c) return;
  try {
    await fetch(`${c.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", `scan:${sessionId}`, JSON.stringify(payload), "EX", TTL_SECONDS],
      ]),
    });
  } catch {
    // KV write failed — the in-memory copy still dedups on this instance.
  }
}

/**
 * In-flight locks so a double-fired request for the same session (double-click,
 * Stripe redirect hit twice) doesn't trigger two pipeline runs on this instance.
 * Cross-instance concurrent first-hits are rare and bounded by the rate limiter.
 */
const locks = (globalThis as unknown as {
  __scanLocks?: Map<string, Promise<ScanPayload>>;
}).__scanLocks ?? new Map<string, Promise<ScanPayload>>();

(globalThis as unknown as { __scanLocks?: Map<string, Promise<ScanPayload>> }).__scanLocks =
  locks;

export async function getOrCreateScan(
  sessionId: string,
  create: () => Promise<ScanPayload>
): Promise<ScanPayload> {
  const cached = await getScan(sessionId);
  if (cached) return cached;

  const inflight = locks.get(sessionId);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const payload = await create();
      await saveScan(sessionId, payload);
      return payload;
    } finally {
      locks.delete(sessionId);
    }
  })();

  locks.set(sessionId, promise);
  return promise;
}
