import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Same-origin image proxy for scraped headshots. Two reasons:
 *  1. html-to-image can't render cross-origin images without CORS headers —
 *     they taint the canvas and silently break Download / Share.
 *  2. Some hosts block hotlinking; fetching server-side dodges that.
 * Basic SSRF guard: only http(s), and no localhost / private ranges.
 */
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "0.0.0.0" ||
    h.startsWith("127.") ||
    h.startsWith("10.") ||
    h.startsWith("169.254.") ||
    h.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  );
}

export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get("url");
  if (!target) return new NextResponse("missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    isBlockedHost(parsed.hostname)
  ) {
    return new NextResponse("blocked", { status: 400 });
  }

  try {
    const r = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GetPunchedBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const contentType = r.headers.get("content-type") || "";
    if (!r.ok || !contentType.startsWith("image/")) {
      return new NextResponse("not an image", { status: 404 });
    }
    const buf = await r.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("fetch failed", { status: 502 });
  }
}
