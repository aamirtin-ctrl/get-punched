import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getStripe, stripeEnabled, baseUrl } from "@/lib/stripe";
import { runScan, ScanRefusedError } from "@/lib/anthropic";
import { getOrCreateScan, getScan } from "@/lib/scanStore";
import { checkRateLimit, ipFromRequest } from "@/lib/rateLimit";
import { screenInput, GUARDRAIL_MESSAGE } from "@/lib/guardrails";
import { decodeDevToken, encodeSharePayload } from "@/lib/share";
import { recordScan, buildScanRecord } from "@/lib/scanDb";
import { putShare } from "@/lib/shareStore";
import type { ScanPayload } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function generate(name: string, context: string): Promise<ScanPayload> {
  const { result, factCount } = await runScan(name, context);
  return { name, context, result, factCount, createdAt: Date.now() };
}

/**
 * Build the success response: signs the share link, records the scan in the
 * database (fire-and-forget), and stamps the visitor cookie so we can group
 * everyone a person scanned.
 */
async function respond(
  payload: ScanPayload,
  scannerId: string,
  isNewVisitor: boolean,
  record: boolean
) {
  const share = encodeSharePayload(payload);
  // Short link (stored in KV); falls back to the long stateless link.
  const shareId = await putShare(payload);
  const verdictUrl = shareId
    ? `${baseUrl()}/share/${shareId}`
    : `${baseUrl()}/share?d=${encodeURIComponent(share.d)}&sig=${encodeURIComponent(share.sig)}`;
  if (record) {
    // DB context = what they typed + a plain 1–2 sentence scrape summary.
    const webSummary = payload.result.web_summary?.trim();
    const combinedContext = [
      payload.context?.trim(),
      webSummary ? `Web: ${webSummary}` : "",
    ]
      .filter(Boolean)
      .join(" — ");
    recordScan(
      buildScanRecord({
        name: payload.name,
        context: combinedContext,
        result: payload.result,
        verdictUrl,
        scannerId,
      })
    );
  }
  const res = NextResponse.json({ ...payload, share, shareId });
  if (isNewVisitor) {
    res.cookies.set("gp_visitor", scannerId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const devToken = url.searchParams.get("dev_token");
  const nameParam = url.searchParams.get("name");

  // Anonymous visitor id, so we can group who a person scanned.
  const existingVisitor = (req.headers.get("cookie") || "").match(
    /(?:^|;\s*)gp_visitor=([^;]+)/
  )?.[1];
  const scannerId = existingVisitor || randomUUID();
  const isNewVisitor = !existingVisitor;

  // ---- Paid path: verify the Stripe session server-side, always. ----
  if (sessionId) {
    if (!stripeEnabled()) {
      return NextResponse.json(
        { error: "Payments are not configured." },
        { status: 503 }
      );
    }

    // Re-visits re-render the cached result — no rate-limit hit, no re-call.
    const cached = await getScan(sessionId);
    if (cached) {
      return NextResponse.json({ ...cached, share: encodeSharePayload(cached) });
    }

    let paid = false;
    let name = "";
    let context = "";
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      name = session.metadata?.scan_name ?? "";
      context = session.metadata?.scan_context ?? "";
    } catch {
      return NextResponse.json({ error: "Unknown session." }, { status: 404 });
    }

    if (!paid) {
      return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
    }
    if (!screenInput(name, context)) {
      return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
    }

    const limit = await checkRateLimit(ipFromRequest(req));
    if (!limit.ok) {
      return NextResponse.json(
        {
          error:
            limit.reason === "ip-cap"
              ? "You've hit today's scan limit from this device. Try again tomorrow."
              : "We're at today's scan limit. Check back tomorrow.",
        },
        { status: 429 }
      );
    }

    try {
      const payload = await getOrCreateScan(sessionId, () => generate(name, context));
      return await respond(payload, scannerId, isNewVisitor, true);
    } catch (err) {
      if (err instanceof ScanRefusedError) {
        return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
      }
      throw err;
    }
  }

  // ---- Dev path: signed token issued by /api/checkout when Stripe is off. ----
  if (devToken) {
    if (stripeEnabled()) {
      return NextResponse.json({ error: "Payment required." }, { status: 402 });
    }
    const decoded = decodeDevToken(devToken);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token." }, { status: 403 });
    }
    if (!screenInput(decoded.name, decoded.context)) {
      return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
    }

    const limit = await checkRateLimit(ipFromRequest(req));
    if (!limit.ok) {
      return NextResponse.json(
        {
          error:
            limit.reason === "ip-cap"
              ? "You've hit today's scan limit from this device. Try again tomorrow."
              : "We're at today's scan limit. Check back tomorrow.",
        },
        { status: 429 }
      );
    }

    try {
      const devKey = `dev:${devToken.slice(-32)}`;
      const wasCached = Boolean(await getScan(devKey));
      const payload = await getOrCreateScan(devKey, () =>
        generate(decoded.name, decoded.context)
      );
      return await respond(payload, scannerId, isNewVisitor, !wasCached);
    } catch (err) {
      if (err instanceof ScanRefusedError) {
        return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
      }
      throw err;
    }
  }

  // ---- Free-mode path: no payment configured, scan straight from the name.
  // Disabled the moment Stripe is turned on, so it can't bypass a live portal.
  if (nameParam !== null) {
    if (stripeEnabled()) {
      return NextResponse.json({ error: "Payment required." }, { status: 402 });
    }
    const name = nameParam.trim();
    const context = (url.searchParams.get("context") ?? "").trim();
    if (!screenInput(name, context)) {
      return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
    }

    const limit = await checkRateLimit(ipFromRequest(req));
    if (!limit.ok) {
      return NextResponse.json(
        {
          error:
            limit.reason === "ip-cap"
              ? "You've hit today's scan limit from this device. Try again tomorrow."
              : "We're at today's scan limit. Check back tomorrow.",
        },
        { status: 429 }
      );
    }

    try {
      const freeKey = `free:${name}|${context}`;
      const wasCached = Boolean(await getScan(freeKey));
      const payload = await getOrCreateScan(freeKey, () => generate(name, context));
      return await respond(payload, scannerId, isNewVisitor, !wasCached);
    } catch (err) {
      if (err instanceof ScanRefusedError) {
        return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
      }
      throw err;
    }
  }

  return NextResponse.json({ error: "Missing session." }, { status: 400 });
}
