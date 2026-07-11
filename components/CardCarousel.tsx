"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { ScanResult } from "@/lib/types";
import { PunchWorthinessCard } from "./cards/PunchWorthiness";
import { SelloutIndexCard } from "./cards/SelloutIndex";
import { LegacyMultiplierCard } from "./cards/LegacyMultiplier";
import { PaperTrailCard } from "./cards/PaperTrail";
import { HumanMoatCard } from "./cards/HumanMoat";
import { GunnerRatingCard } from "./cards/GunnerRating";
import { CertifiablyCrackedCard } from "./cards/CertifiablyCracked";
import { FinalClassificationCard } from "./cards/FinalClassification";

const CARD_KEYS = [
  "punch-worthiness",
  "sellout-index",
  "legacy-multiplier",
  "paper-trail",
  "human-moat",
  "gunner-rating",
  "certifiably-cracked",
  "final-classification",
] as const;

export function CardCarousel({
  name,
  result,
  shareUrl,
}: {
  name: string;
  result: ScanResult;
  shareUrl?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Track which card is snapped into view
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const cardWidth = track.scrollWidth / CARD_KEYS.length;
      setActive(Math.round(track.scrollLeft / cardWidth));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.scrollWidth / CARD_KEYS.length;
    track.scrollTo({ left: cardWidth * i, behavior: "smooth" });
  }, []);

  const download = useCallback(async () => {
    const node = cardRefs.current[active];
    if (!node || busy) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.download = `get-punched-${CARD_KEYS[active]}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      // Downloads can fail on odd browsers; not worth breaking the page over.
    } finally {
      setBusy(false);
    }
  }, [active, busy]);

  const share = useCallback(async () => {
    const url = shareUrl ?? window.location.href;
    const text = `Getting into Harvard was easy. Punch season is the real admissions. See where ${name} got cut:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Get Punched", text, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing else to do
    }
  }, [name, shareUrl]);

  const cards = [
    <PunchWorthinessCard key="pw" name={name} data={result.punch_worthiness} />,
    <SelloutIndexCard key="si" name={name} data={result.sellout_index} />,
    <LegacyMultiplierCard key="lm" name={name} data={result.legacy_multiplier} />,
    <PaperTrailCard key="pt" name={name} data={result.paper_trail} />,
    <HumanMoatCard key="hm" name={name} data={result.human_moat} />,
    <GunnerRatingCard key="gr" name={name} data={result.gunner_rating} />,
    <CertifiablyCrackedCard key="cc" name={name} data={result.certifiably_cracked} />,
    <FinalClassificationCard key="fc" name={name} data={result.final_club} />,
  ];

  return (
    <div className="w-full">
      {/* Card track */}
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc(50vw-215px))] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => (
          <div key={CARD_KEYS[i]} className="snap-center">
            <div
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="card-in h-[680px] w-[390px] max-w-[88vw] shrink-0 sm:h-[700px] sm:w-[400px]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {card}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2.5">
        {CARD_KEYS.map((key, i) => (
          <button
            key={key}
            aria-label={`Card ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-5 bg-crimson" : "w-2 bg-crimson/25 hover:bg-crimson/50"
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={download}
          disabled={busy}
          className="eyebrow rounded-sm border-2 border-crimson px-5 py-2.5 text-crimson transition-colors hover:bg-crimson hover:text-card disabled:opacity-50"
        >
          {busy ? "Rendering…" : "Download card"}
        </button>
        <button
          onClick={share}
          className="eyebrow rounded-sm bg-crimson px-5 py-2.5 text-card transition-colors hover:bg-crimsondeep"
        >
          {copied ? "Link copied ✓" : "Share scan"}
        </button>
      </div>
    </div>
  );
}
