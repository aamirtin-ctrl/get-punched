import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Admin-only diagnostic: is the scan database wired up and how many scans are
 * stored. Gated behind ADMIN_TOKEN (same as /admin) and locked by default — no
 * dataset info (not even counts) is exposed publicly. Pass the token as `?key=`
 * or an `x-admin-key` header. No records or PII are ever returned.
 */
function authorized(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false; // locked until a token is configured
  const key =
    new URL(req.url).searchParams.get("key") ?? req.headers.get("x-admin-key");
  return key === token;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
    mockMode: process.env.MOCK_SCAN === "1" || (!hasGemini && !hasAnthropic),
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
