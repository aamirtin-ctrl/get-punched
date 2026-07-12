import { randomUUID } from "crypto";
import type { ScanResult } from "./types";

/**
 * Scan database — records every scan someone runs.
 *
 * Backend is swappable: if Vercel KV / Upstash Redis REST is configured
 * (KV_REST_API_URL + KV_REST_API_TOKEN), records persist there; otherwise
 * they go to a non-persistent in-memory store and the console (dev). Writing
 * is always fire-and-forget and wrapped so it can never break a scan.
 *
 * Grouping: each visitor gets a `scannerId` (cookie), so we can see who a
 * person scanned — themselves plus every friend. `email` is left open for
 * when the email-capture source is wired in.
 */

export interface ScanRecord {
  id: string;
  createdAt: number;
  /** Anonymous per-browser id, so we can group everyone one visitor scanned. */
  scannerId?: string;
  /** Scanner's email — source TBD; empty until email capture is wired. */
  email?: string;
  /** The person who was scanned. */
  name: string;
  /** Overall / main score (average of the seven categories). */
  overall: number;
  /** The seven individual category scores + final club match. */
  scores: {
    punch_worthiness: number;
    sellout_index: number;
    legacy_multiplier: number;
    paper_trail: number;
    human_moat: number;
    gunner_rating: number;
    certifiably_cracked: number;
    final_match: number;
  };
  club: string;
  /** Biggest accomplishments, pulled from the scrape (evidence titles). */
  accomplishments: string[];
  /** Permanent link to this person's verdict. */
  verdictUrl: string;
}

/**
 * Upstash Redis REST credentials. Accept either the Upstash-native names or
 * the KV_REST_API_* names (Vercel injects one or the other depending on how
 * the integration is added).
 */
function kvCreds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function kvConfigured(): boolean {
  return kvCreds() !== null;
}

/** Upstash Redis REST pipeline: array of Redis command arrays. */
async function kvPipeline(commands: (string | number)[][]): Promise<void> {
  const creds = kvCreds();
  if (!creds) return;
  await fetch(`${creds.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
}

// Non-persistent fallback (single warm instance / local dev).
const memory = (globalThis as unknown as { __scanRecords?: ScanRecord[] })
  .__scanRecords ?? [];
(globalThis as unknown as { __scanRecords?: ScanRecord[] }).__scanRecords =
  memory;

export function overallFrom(result: ScanResult): number {
  const s = [
    result.punch_worthiness.score,
    result.sellout_index.score,
    result.legacy_multiplier.score,
    result.paper_trail.score,
    result.human_moat.score,
    result.gunner_rating.score,
    result.certifiably_cracked.score,
  ];
  return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
}

export function buildScanRecord(input: {
  name: string;
  result: ScanResult;
  verdictUrl: string;
  scannerId?: string;
  email?: string;
}): ScanRecord {
  const { name, result, verdictUrl, scannerId, email } = input;
  return {
    id: randomUUID(),
    createdAt: Date.now(),
    scannerId,
    email,
    name,
    overall: overallFrom(result),
    scores: {
      punch_worthiness: result.punch_worthiness.score,
      sellout_index: result.sellout_index.score,
      legacy_multiplier: result.legacy_multiplier.score,
      paper_trail: result.paper_trail.score,
      human_moat: result.human_moat.score,
      gunner_rating: result.gunner_rating.score,
      certifiably_cracked: result.certifiably_cracked.score,
      final_match: result.final_club.match_pct,
    },
    club: result.final_club.club,
    accomplishments: (result.evidence ?? []).map((e) => e.title).filter(Boolean),
    verdictUrl,
  };
}

/** Fire-and-forget: records a scan, never throws. */
export function recordScan(record: ScanRecord): void {
  void (async () => {
    try {
      if (kvConfigured()) {
        const value = JSON.stringify(record);
        const cmds: (string | number)[][] = [
          ["SET", `scan:${record.id}`, value],
          ["LPUSH", "scans:all", record.id],
        ];
        if (record.scannerId) {
          cmds.push(["LPUSH", `scans:by:${record.scannerId}`, record.id]);
        }
        if (record.email) {
          cmds.push(["LPUSH", `scans:email:${record.email.toLowerCase()}`, record.id]);
        }
        await kvPipeline(cmds);
      } else {
        memory.push(record);
        if (memory.length > 2000) memory.shift();
        console.log(
          `[scanDb] recorded scan (in-memory; KV not configured): ${record.name} · overall ${record.overall} · ${record.club}`
        );
      }
    } catch (err) {
      console.error("[scanDb] record failed (ignored):", err);
    }
  })();
}
