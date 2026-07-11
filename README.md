# Get Punched — Harvard within Harvard

A satirical $2 web scan. A user enters their name (+ optional Harvard
context), pays $2 via Stripe Checkout, and gets 8 shareable story-shaped
cards scoring them against Harvard's status culture — ending with the final
club that would actually take them.

**Satire disclaimer:** not a real measure of anything; public info only; no
doxxing, protected traits, or accusations of wrongdoing; not affiliated with
Harvard or any final club.

## Run it locally (zero keys required)

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no keys configured, payment is skipped
(signed dev token) and mock scan cards render — the full flow is demoable
for free.

## Wiring up the real thing

Copy `.env.example` to `.env.local` and fill keys in this order:

| Key | Where to get it | What turns on |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys | Real LLM-generated cards (Prompt B is already installed) |
| `SCAN_MODEL` | — | Model override; defaults to `claude-haiku-4-5-20251001` |
| `SEARCH_API_KEY` | [Tavily](https://app.tavily.com) (default), [Brave](https://api-dashboard.search.brave.com), or [Serper](https://serper.dev) — set `SEARCH_PROVIDER` to match | Fact retrieval grounding the roast in real public info |
| `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) (start with `sk_test_`/`pk_test_`) | Real $2 Checkout (test card `4242 4242 4242 4242`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → add endpoint `<base-url>/api/stripe-webhook` (or `stripe listen --forward-to localhost:3000/api/stripe-webhook`) | Signature-verified payment events |
| `NEXT_PUBLIC_BASE_URL` | Your deploy URL | Correct Stripe redirect + share links |
| `SHARE_SECRET` | Any long random string (`openssl rand -hex 32`) | Signs stateless share links |

### Prompt B (installed)

`lib/scanPrompt.ts` contains the full Prompt B scan-engine system prompt.
Real LLM cards generate as soon as `ANTHROPIC_API_KEY` is set. If Prompt B
returns `"refused": true` (malicious/minor-targeting input), the API responds
with the generic guardrail message and nothing is cached or rendered.

## Deploy to Vercel

```bash
npm i -g vercel
vercel            # link the project
# add every env var in the Vercel dashboard (Project → Settings → Environment Variables)
vercel --prod
```

Then point the Stripe webhook at `https://<your-domain>/api/stripe-webhook`
and set `NEXT_PUBLIC_BASE_URL` to the production URL.

## How it works

- **Payment integrity** — `/api/scan` verifies the Stripe Checkout session
  server-side (`payment_status === "paid"`) before generating anything.
  Exactly one scan per session: results are cached (in-memory) and re-visits
  re-render the cache instead of re-calling the LLM. An in-flight lock stops
  double-fires.
- **Pipeline** — `retrieveFacts(name, context)` (swappable provider) → one
  Anthropic Messages API call with the Prompt B system prompt → fence-stripped
  JSON parse → normalized against the card schema (missing fields backfilled,
  scores clamped). Thin/empty search results still render — "About 0 results"
  is the joke.
- **Share links** — stateless: the whole scan payload is base64url-encoded
  and HMAC-signed into the URL (`/share?d=…&sig=…`). No database.
- **Guardrails** — server-side input screen rejects attempts to target
  private minors or defame non-public people (generic "we only scan public
  figures and willing participants" message), per-IP rate limiting (6
  scans/hour), Anthropic key never leaves the server.

## Repo map

```
app/page.tsx              landing (hero, archetype marquee, form, disclaimer)
app/scan/                 post-payment scan view (loading → 8-card carousel)
app/share/page.tsx        stateless signed share re-render
app/api/checkout/         creates the $2 Stripe Checkout session
app/api/scan/             verifies payment, runs the scan pipeline
app/api/stripe-webhook/   signature-verified event receipt
components/cards/         CardFrame chrome + the 8 card templates
lib/scanPrompt.ts         Prompt B scan-engine system prompt
lib/retrieveFacts.ts      swappable search provider (tavily/brave/serper)
lib/anthropic.ts          LLM call + JSON normalization + mock fallback
lib/share.ts              HMAC-signed share links & dev tokens
lib/guardrails.ts         input screening
lib/rateLimit.ts          per-IP sliding window
lib/scanStore.ts          one-scan-per-session cache
```
