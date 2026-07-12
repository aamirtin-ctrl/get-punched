import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Lightweight diagnostic: is the scan database wired up and reachable, and how
 * many scans are stored. No records or PII are returned. If ADMIN_KEY is set,
 * requires ?key=<ADMIN_KEY>; otherwise it's open (lock it down by setting
 * ADMIN_KEY, or delete this route once you've confirmed the connection).
 */
export async function GET(req: Request) {
  const adminKey = process.env.ADMIN_KEY;
  if (adminKey) {
    const key = new URL(req.url).searchParams.get("key");
    if (key !== adminKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      connected: false,
      reason: "No Upstash/KV env vars found. Connect the DB and redeploy.",
      storage: "in-memory (non-persistent)",
    });
  }

  try {
    const call = async (path: string) => {
      const r = await fetch(`${url}/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const j = await r.json();
      return j.result;
    };
    const [ping, totalScans, totalKeys] = await Promise.all([
      call("ping"),
      call("llen/scans:all"),
      call("dbsize"),
    ]);
    return NextResponse.json({
      connected: ping === "PONG",
      storage: "upstash (persistent)",
      totalScans: totalScans ?? 0,
      totalKeys: totalKeys ?? 0,
    });
  } catch {
    return NextResponse.json({
      connected: false,
      reason: "Env vars present but the DB was unreachable.",
    });
  }
}
