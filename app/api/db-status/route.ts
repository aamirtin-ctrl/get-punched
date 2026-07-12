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

  // Config check (presence only — never returns key values).
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasSearch = Boolean(process.env.SEARCH_API_KEY);
  const engine = {
    gemini: hasGemini,
    anthropic: hasAnthropic,
    search: hasSearch,
    searchProvider: process.env.SEARCH_PROVIDER || "tavily",
    // True means live scans fall back to the generic mock cards.
    mockMode:
      process.env.MOCK_SCAN === "1" || (!hasGemini && !hasAnthropic),
  };

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      engine,
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
      engine,
      connected: ping === "PONG",
      storage: "upstash (persistent)",
      totalScans: totalScans ?? 0,
      totalKeys: totalKeys ?? 0,
    });
  } catch {
    return NextResponse.json({
      engine,
      connected: false,
      reason: "Env vars present but the DB was unreachable.",
    });
  }
}
