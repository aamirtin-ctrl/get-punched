import { randomUUID } from "crypto";
import type { ScanPayload } from "./types";

/**
 * Short share links. Instead of base64-encoding the whole scan into a 7 KB
 * URL (which gets truncated when pasted into Instagram / iMessage), we store
 * the payload in Upstash under a short id and share /share/<id>.
 *
 * Falls back to an in-memory map when KV isn't configured (fine locally; on
 * serverless the stateless /share?d=&sig= link still works as a backup).
 */

function creds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

const mem = (globalThis as unknown as { __shareMem?: Map<string, ScanPayload> })
  .__shareMem ?? new Map<string, ScanPayload>();
(globalThis as unknown as { __shareMem?: Map<string, ScanPayload> }).__shareMem =
  mem;

const TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

export async function putShare(payload: ScanPayload): Promise<string | null> {
  const id = randomUUID().replace(/-/g, "").slice(0, 10);
  const c = creds();
  if (!c) {
    mem.set(id, payload);
    if (mem.size > 1000) mem.delete(mem.keys().next().value as string);
    return id;
  }
  try {
    await fetch(`${c.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", `share:${id}`, JSON.stringify(payload), "EX", TTL_SECONDS],
      ]),
    });
    return id;
  } catch {
    mem.set(id, payload);
    return id;
  }
}

export async function getShare(id: string): Promise<ScanPayload | null> {
  if (!/^[a-f0-9]{6,32}$/.test(id)) return null;
  const c = creds();
  if (!c) return mem.get(id) ?? null;
  try {
    const r = await fetch(`${c.url}/get/share:${id}`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: "no-store",
    });
    const j = await r.json();
    if (j.result) return JSON.parse(j.result) as ScanPayload;
    return mem.get(id) ?? null;
  } catch {
    return mem.get(id) ?? null;
  }
}
