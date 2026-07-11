import type { ScanPayload } from "./types";

/**
 * Ephemeral scan cache — exactly one scan per paid Stripe session.
 * In-memory for MVP (fine on a single warm serverless instance / dev).
 * Swap for Vercel KV if share-link persistence is ever needed; the
 * interface is already async to make that a drop-in change.
 */

const store = (globalThis as unknown as {
  __scanStore?: Map<string, ScanPayload>;
}).__scanStore ?? new Map<string, ScanPayload>();

(globalThis as unknown as { __scanStore?: Map<string, ScanPayload> }).__scanStore =
  store;

const MAX_ENTRIES = 500;

export async function getScan(sessionId: string): Promise<ScanPayload | null> {
  return store.get(sessionId) ?? null;
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
}

/**
 * In-flight locks so a double-fired request for the same session doesn't
 * trigger two LLM calls.
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
