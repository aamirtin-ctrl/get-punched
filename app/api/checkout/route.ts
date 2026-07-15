import { NextResponse } from "next/server";
import { getStripe, stripeEnabled, baseUrl } from "@/lib/stripe";
import { screenInput, GUARDRAIL_MESSAGE } from "@/lib/guardrails";
import { encodeDevToken } from "@/lib/share";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let name = "";
  let context = "";
  try {
    const body = await req.json();
    name = String(body.name ?? "").trim();
    context = String(body.context ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!screenInput(name, context)) {
    return NextResponse.json({ error: GUARDRAIL_MESSAGE }, { status: 400 });
  }

  // Dev path: no Stripe key configured → signed dev token, skip payment.
  if (!stripeEnabled()) {
    if (process.env.NODE_ENV === "production" && process.env.DEV_SKIP_PAYMENT !== "1") {
      return NextResponse.json(
        { error: "Payments are not configured yet." },
        { status: 503 }
      );
    }
    const token = encodeDevToken(name, context);
    return NextResponse.json({
      url: `${baseUrl()}/scan?dev_token=${encodeURIComponent(token)}`,
    });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 150,
          product_data: {
            name: "Get Punched — Harvard Status Scan",
            description: `Public-internet punch scan for ${name}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      // Stripe caps metadata values at 500 chars.
      scan_name: name.slice(0, 400),
      scan_context: context.slice(0, 480),
    },
    success_url: `${baseUrl()}/scan?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
