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
  const [going, setGoing] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!friend.trim() || going) return;
    setGoing(true);
    // Free-mode: straight to their cards. Wrap in checkout once Stripe is on.
    window.location.href = `/scan?name=${encodeURIComponent(friend.trim())}`;
  }

  const first = name.split(" ")[0] || "You";

  return (
    <CardFrame name={name}>
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <p className="eyebrow text-crimson">The Real Bracket</p>
        <h2
          className="mt-3 text-[1.9rem] leading-[1.05]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You&apos;re not competing
          <br />
          with Harvard.
        </h2>
        <p
          className="mt-2 text-[1.6rem] leading-[1.1] text-crimson"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You&apos;re competing with your friends.
        </p>

        <p className="mt-4 text-[0.9rem] leading-relaxed text-ink/80">
          {first}, they&apos;ve already seen where you got cut. The only real
          question left is whether they&apos;d survive their own scan. Find out
          before they screenshot yours.
        </p>

        <form onSubmit={submit} className="mt-5">
          <label
            className="eyebrow block text-crimson"
            htmlFor="friend-name"
            style={{ fontSize: "0.58rem" }}
          >
            Scan a friend
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
          <button
            type="submit"
            disabled={going || !friend.trim()}
            className="eyebrow-wide mt-3 w-full rounded-md bg-crimson py-3 text-card transition-colors hover:bg-crimsondeep disabled:opacity-60"
            style={{ fontSize: "0.78rem" }}
          >
            {going ? "Ruining a friendship…" : "Scan them · $1.50"}
          </button>
        </form>

        <p className="mt-3 text-center text-[0.72rem] italic text-faded">
          Same scan. New victim. Winner never lets it go.
        </p>
      </div>
    </CardFrame>
  );
}
