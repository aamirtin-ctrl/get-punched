"use client";

import { useState } from "react";
import { CardFrame } from "./chrome";

/**
 * Trailing CTA card (after the Final Classification). Plays on the fact that
 * your real competition isn't the admissions office — it's your friends.
 * Enters another name and re-runs the scan.
 */
export function ScanAgainCard({ name }: { name: string }) {
  const [friend, setFriend] = useState("");
  const [context, setContext] = useState("");
  const [going, setGoing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!friend.trim() || going) return;
    setGoing(true);
    setError(null);
    // POST to /api/checkout → Stripe Checkout URL (or a dev-token /scan URL in
    // local dev), then redirect to whatever it returns.
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: friend.trim(), context: context.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGoing(false);
    }
  }

  const first = name.split(" ")[0] || "You";

  return (
    <CardFrame name={name}>
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <p className="eyebrow text-crimson">Grade On A Curve</p>
        <h2
          className="mt-3 text-[1.9rem] leading-[1.05]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You&apos;ve seen your scan.
        </h2>
        <p
          className="mt-2 text-[1.6rem] leading-[1.1] text-crimson"
          style={{ fontFamily: "var(--font-display)" }}
        >
          But a verdict means nothing in isolation.
        </p>

        <p className="mt-4 text-[0.9rem] leading-relaxed text-ink/80">
          {first}, a score is just a number until it has a curve. Drop in someone
          you actually measure yourself against — a friend, a roommate, your group
          chat&apos;s main character — and let the internet settle who ranks.
        </p>

        <form onSubmit={submit} className="mt-4">
          <label
            className="eyebrow block text-crimson"
            htmlFor="friend-name"
            style={{ fontSize: "0.58rem" }}
          >
            Scan someone next to you
          </label>
          <input
            id="friend-name"
            value={friend}
            onChange={(e) => setFriend(e.target.value)}
            placeholder="Their full name"
            maxLength={120}
            className="mt-1.5 w-full rounded-md border-2 border-ink/80 bg-white/70 px-3.5 py-2.5 text-[0.95rem] outline-none transition-colors placeholder:italic placeholder:text-faded/70 focus:border-crimson"
            style={{ fontFamily: "var(--font-serif)" }}
          />
          <textarea
            id="friend-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="School, club, LinkedIn URL — sharpens the read (optional)"
            rows={2}
            maxLength={600}
            className="mt-2 w-full resize-none rounded-md border-2 border-ink/40 bg-white/70 px-3.5 py-2 text-[0.88rem] outline-none transition-colors placeholder:italic placeholder:text-faded/70 focus:border-crimson"
            style={{ fontFamily: "var(--font-serif)" }}
          />
          <button
            type="submit"
            disabled={going || !friend.trim()}
            className="eyebrow-wide mt-3 w-full rounded-md bg-crimson py-3 text-card transition-colors hover:bg-crimsondeep disabled:opacity-60"
            style={{ fontSize: "0.78rem" }}
          >
            {going ? "Ruining a friendship…" : "Scan them · $1.50"}
          </button>
        </form>

        <p className="mt-2.5 text-center text-[0.72rem] italic text-faded">
          A LinkedIn URL gets the sharpest read. The curve decides.
        </p>

        {error && (
          <p className="mt-2 text-center text-[0.78rem] text-crimson">{error}</p>
        )}
      </div>
    </CardFrame>
  );
}
