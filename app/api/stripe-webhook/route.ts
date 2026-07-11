import { NextResponse } from "next/server";
import { getStripe, stripeEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook — signature-verified receipt log. Scan generation itself
 * happens on /api/scan (server-verified session), so this endpoint just
 * acknowledges events; wire fulfillment emails or KV persistence here later.
 */
export async function POST(req: Request) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  try {
    const event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    if (event.type === "checkout.session.completed") {
      // One-scan-per-session enforcement lives in /api/scan.
      console.log(`[stripe] checkout completed: ${event.data.object.id}`);
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
