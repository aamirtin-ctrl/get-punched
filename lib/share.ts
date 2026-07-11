import { createHmac, timingSafeEqual } from "crypto";
import type { ScanPayload } from "./types";

/**
 * Stateless signed share links. The whole scan payload is compressed into
 * the URL and HMAC-signed, so a share link re-renders forever with no
 * database. SHARE_SECRET signs it; falls back to the Stripe secret so no
 * extra env var is strictly required.
 */

function secret(): string {
  return (
    process.env.SHARE_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    "dev-only-insecure-secret"
  );
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function encodeSharePayload(payload: ScanPayload): {
  d: string;
  sig: string;
} {
  const d = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return { d, sig: sign(d) };
}

export function decodeSharePayload(d: string, sig: string): ScanPayload | null {
  try {
    const expected = sign(d);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(d, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Short-lived signed token for the dev/no-Stripe path so the scan API never
 * generates on the client's word alone, even in dev mode.
 */
export function encodeDevToken(name: string, context: string): string {
  const body = Buffer.from(
    JSON.stringify({ name, context, ts: Date.now() }),
    "utf8"
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeDevToken(
  token: string
): { name: string; context: string } | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const a = Buffer.from(sig);
    const b = Buffer.from(sign(body));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (Date.now() - parsed.ts > 60 * 60 * 1000) return null;
    return { name: parsed.name, context: parsed.context };
  } catch {
    return null;
  }
}
