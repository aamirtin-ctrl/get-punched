"use client";

import { useState } from "react";

export function ScanForm() {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    // FREE-MODE (no payment yet): go straight to the cards. When the Stripe
    // portal is wired up, this becomes a POST to /api/checkout that redirects
    // to Stripe Checkout and back to /scan?session_id=... on success.
    const params = new URLSearchParams({ name: name.trim() });
    if (context.trim()) params.set("context", context.trim());
    window.location.href = `/scan?${params.toString()}`;
  }

  return (
    <form onSubmit={submit} className="w-full text-left">
      <label className="eyebrow block text-ink/80" htmlFor="scan-name" style={{ fontSize: "0.62rem" }}>
        Your name
      </label>
      <input
        id="scan-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Mark Zuckerberg"
        required
        maxLength={120}
        className="mt-1.5 w-full rounded-md border border-[#c9bda0] bg-white/85 px-3.5 py-2.5 text-[0.98rem] outline-none transition-colors placeholder:italic placeholder:text-faded/70 focus:border-crimson"
        style={{ fontFamily: "var(--font-serif)" }}
      />

      <label className="eyebrow mt-3.5 block text-ink/80" htmlFor="scan-context" style={{ fontSize: "0.62rem" }}>
        Harvard context{" "}
        <span className="normal-case tracking-normal text-faded">(optional but helps)</span>
      </label>
      <textarea
        id="scan-context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Harvard '26, Ec concentrator, house, club, LinkedIn URL"
        rows={2}
        maxLength={600}
        className="mt-1.5 w-full resize-none rounded-md border border-[#c9bda0] bg-white/85 px-3.5 py-2.5 text-[0.92rem] outline-none transition-colors placeholder:italic placeholder:text-faded/70 focus:border-crimson"
        style={{ fontFamily: "var(--font-serif)" }}
      />

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="eyebrow-wide mt-4 w-full rounded-md bg-[#b4515e] py-3.5 text-card shadow transition-colors hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontSize: "0.82rem" }}
      >
        {submitting ? "Opening the punch list…" : "Scan me · $1.50"}
      </button>

      <p className="mt-2 text-center text-[0.7rem] italic text-faded">
        $1.50 per scan, paid securely via Stripe.
      </p>

      {error && (
        <p className="mt-2 text-center text-[0.8rem] text-crimson">{error}</p>
      )}
    </form>
  );
}
