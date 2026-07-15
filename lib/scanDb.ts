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
  /** The additional info they typed (house, clubs, LinkedIn, etc.). */
  context: string;
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
  context?: string;
  result: ScanResult;
  verdictUrl: string;
  scannerId?: string;
  email?: string;
}): ScanRecord {
  const { name, context, result, verdictUrl, scannerId, email } = input;
  return {
    id: randomUUID(),
    createdAt: Date.now(),
    scannerId,
    email,
    name,
    context: context ?? "",
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

/** Read an Upstash pipeline and return the raw result array. */
async function kvRead(
  commands: (string | number)[][]
): Promise<{ result: unknown }[]> {
  const creds = kvCreds();
  if (!creds) return [];
  const r = await fetch(`${creds.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  return (await r.json()) as { result: unknown }[];
}

// Illustrative rows so the admin view has something to show in local dev
// (no Upstash configured). Never used in production, where real records exist.
const SAMPLE_SCANS: ScanRecord[] = [
  {
    id: "sample-1", createdAt: 1752604800000, scannerId: "v-a1c9",
    email: "maya.patel@college.edu", name: "Maya Patel",
    context: "Harvard '27, Currier, comping the Crimson — Web: undergrad journalist",
    overall: 78,
    scores: { punch_worthiness: 82, sellout_index: 64, legacy_multiplier: 40, paper_trail: 71, human_moat: 66, gunner_rating: 88, certifiably_cracked: 74, final_match: 81 },
    club: "Fly", accomplishments: ["Editor, The Crimson", "Debate nationals finalist"],
    verdictUrl: "https://harvardwithinharvard.com/share/ab12cd34ef",
  },
  {
    id: "sample-2", createdAt: 1752691200000, scannerId: "v-a1c9",
    email: "maya.patel@college.edu", name: "Daniel Okafor",
    context: "Roommate, econ, McKinsey sophomore intern",
    overall: 63,
    scores: { punch_worthiness: 58, sellout_index: 91, legacy_multiplier: 55, paper_trail: 44, human_moat: 47, gunner_rating: 70, certifiably_cracked: 61, final_match: 72 },
    club: "Owl", accomplishments: ["McKinsey intern"],
    verdictUrl: "https://harvardwithinharvard.com/share/77ab90cde1",
  },
  {
    id: "sample-3", createdAt: 1752777600000, scannerId: "v-7f2b",
    email: "jsmith2027@gmail.com", name: "Jordan Smith",
    context: "",
    overall: 34,
    scores: { punch_worthiness: 22, sellout_index: 30, legacy_multiplier: 25, paper_trail: 18, human_moat: 55, gunner_rating: 41, certifiably_cracked: 47, final_match: 63 },
    club: "Fox", accomplishments: [],
    verdictUrl: "https://harvardwithinharvard.com/share/3c5e7a9b0d",
  },
  {
    id: "sample-4", createdAt: 1752864000000, scannerId: "v-e4d1",
    email: "reese.laurent@nyu.edu", name: "Reese Laurent",
    context: "Third-gen legacy, Porcellian rumors — Web: family foundation board",
    overall: 89,
    scores: { punch_worthiness: 94, sellout_index: 70, legacy_multiplier: 96, paper_trail: 85, human_moat: 78, gunner_rating: 90, certifiably_cracked: 88, final_match: 92 },
    club: "Porcellian", accomplishments: ["Family foundation board", "Junior sailing champion"],
    verdictUrl: "https://harvardwithinharvard.com/share/aa11bb22cc",
  },
];

/**
 * Every recorded scan, newest first. Reads Upstash when configured, else the
 * in-memory store (or a small sample set in local dev so the admin view isn't
 * empty). Returns [] on any failure — the admin page renders "no entries".
 */
export async function listScans(limit = 1000): Promise<ScanRecord[]> {
  if (kvConfigured()) {
    try {
      const idsResp = await kvRead([["LRANGE", "scans:all", "0", String(limit - 1)]]);
      const ids = (idsResp[0]?.result as string[] | undefined) ?? [];
      if (!ids.length) return [];
      const valsResp = await kvRead([["MGET", ...ids.map((id) => `scan:${id}`)]]);
      const vals = (valsResp[0]?.result as (string | null)[] | undefined) ?? [];
      return vals
        .filter((v): v is string => Boolean(v))
        .map((v) => JSON.parse(v) as ScanRecord);
    } catch {
      return [];
    }
  }
  if (memory.length) return [...memory].reverse();
  return process.env.NODE_ENV === "development" ? SAMPLE_SCANS : [];
}
