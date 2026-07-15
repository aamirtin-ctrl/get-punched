/**
 * Growth-loop promo — its own small LANDSCAPE card at the very end of the deck
 * (roughly a third the height of a normal card). Deliberately does NOT use
 * CardFrame, so it isn't forced to the full portrait height.
 */
export function FreeScanPromoCard() {
  return (
    <div className="w-full overflow-hidden rounded-md border-2 border-crimson bg-card">
      <div className="bg-crimson px-5 py-2 text-center">
        <p className="eyebrow-wide text-card">Want a free scan?</p>
      </div>
      <div className="px-6 py-5 text-center">
        <h2
          className="text-[1.35rem] leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Repost. Prove it. Scan a friend free.
        </h2>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-ink/80">
          Post your Get Punched verdict to your Instagram story, DM us for proof,
          and we&apos;ll scan a friend of yours for free.
        </p>
        <p
          className="eyebrow mt-3 text-crimson"
          style={{ fontSize: "0.5rem" }}
        >
          harvardwithinharvard.com
        </p>
      </div>
    </div>
  );
}
