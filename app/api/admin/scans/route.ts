import { NextResponse } from "next/server";
import { listScans } from "@/lib/scanDb";
import type { ScanRecord } from "@/lib/scanDb";

export const runtime = "nodejs";

/**
 * Admin-only dump of every recorded scan. Gated by ADMIN_TOKEN (set it in the
 * env). Accepts the token as `?key=` (for the CSV download link) or an
 * `x-admin-key` header (for the table fetch). Returns JSON, or CSV when
 * `?format=csv`.
 */
function authorized(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false; // no token configured → locked by default
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? req.headers.get("x-admin-key");
  return key === token;
}

const CSV_COLS: { header: string; get: (r: ScanRecord) => string | number }[] = [
  { header: "date", get: (r) => new Date(r.createdAt).toISOString() },
  { header: "name", get: (r) => r.name },
  { header: "email", get: (r) => r.email ?? "" },
  { header: "overall", get: (r) => r.overall },
  { header: "club", get: (r) => r.club },
  { header: "punch_worthiness", get: (r) => r.scores.punch_worthiness },
  { header: "sellout_index", get: (r) => r.scores.sellout_index },
  { header: "legacy_multiplier", get: (r) => r.scores.legacy_multiplier },
  { header: "paper_trail", get: (r) => r.scores.paper_trail },
  { header: "human_moat", get: (r) => r.scores.human_moat },
  { header: "gunner_rating", get: (r) => r.scores.gunner_rating },
  { header: "certifiably_cracked", get: (r) => r.scores.certifiably_cracked },
  { header: "final_match", get: (r) => r.scores.final_match },
  { header: "context", get: (r) => r.context },
  { header: "accomplishments", get: (r) => r.accomplishments.join(" | ") },
  { header: "scanner_id", get: (r) => r.scannerId ?? "" },
  { header: "verdict_url", get: (r) => r.verdictUrl },
];

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: ScanRecord[]): string {
  const head = CSV_COLS.map((c) => c.header).join(",");
  const body = rows
    .map((r) => CSV_COLS.map((c) => csvCell(c.get(r))).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const scans = await listScans(1000);
  const format = new URL(req.url).searchParams.get("format");

  if (format === "csv") {
    return new NextResponse(toCsv(scans), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="get-punched-scans.csv"`,
      },
    });
  }
  return NextResponse.json({ count: scans.length, scans });
}
