import { NextResponse } from "next/server";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { runScan, ScanRefusedError } from "@/lib/anthropic";
import { getOrCreateScan, getScan } from "@/lib/scanStore";
import { checkRateLimit, ipFromRequest } from "@/lib/rateLimit";
import { screenInput, GUARDRAIL_MESSAGE } from "@/lib/guardrails";
import { decodeDevToken, encodeSharePayload } from "@/lib/share";
import type { ScanPayload } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function generate(name: string, context: string): Promise<ScanPayload> {
  const { result, factCount } = await runScan(name, context);
  return { name, context, result, factCount, createdAt: Date.now() };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const devToken = url.searchParams.get("dev_token");
  const nameParam = url.searchParams.get("name");

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

    const limit = checkRateLimit(ipFromRequest(req));
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Slow down. Try again in ${limit.retryAfterMin} minutes.` },
        { status: 429 }
      );
    }

    try {
      const payload = await getOrCreateScan(sessionId, () => generate(name, context));
      return NextResponse.json({ ...payload, share: encodeSharePayload(payload) });
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

    const limit = checkRateLimit(ipFromRequest(req));
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Slow down. Try again in ${limit.retryAfterMin} minutes.` },
        { status: 429 }
      );
    }

    try {
      const payload = await getOrCreateScan(`dev:${devToken.slice(-32)}`, () =>
        generate(decoded.name, decoded.context)
      );
      return NextResponse.json({ ...payload, share: encodeSharePayload(payload) });
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

    const limit = checkRateLimit(ipFromRequest(req));
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Slow down. Try again in ${limit.retryAfterMin} minutes.` },
        { status: 429 }
      );
    }

    try {
      const payload = await getOrCreateScan(`free:${name}|${context}`, () =>
        generate(name, context)
      );
      return NextResponse.json({ ...payload, share: encodeSharePayload(payload) });
    } catch (err) {
      if (err instanceof ScanRefusedError) {
        return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
      }
      throw err;
    }
  }

  return NextResponse.json({ error: "Missing session." }, { status: 400 });
}
