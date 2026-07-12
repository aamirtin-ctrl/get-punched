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

// Fixed design size every card is authored against; we scale to fit.
const CARD_W = 390;
const CARD_H = 680;

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
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // Scale each fixed-size card so a whole one always fits the available box —
  // never a vertical scroll, never clipped text, on any screen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const compute = () => {
      const h = track.clientHeight - 8;
      const w = track.clientWidth - 24;
      setScale(Math.min(1, h / CARD_H, w / CARD_W));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Each card sits in a full-width snap slide, so one slide = one track width.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      setActive(Math.round(track.scrollLeft / track.clientWidth));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
  }, []);

  const renderPng = useCallback(async () => {
    const node = cardRefs.current[active];
    if (!node) return null;
    // Capture at full design resolution, undoing the on-screen fit scale.
    return toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      width: CARD_W,
      height: CARD_H,
      style: { transform: "none", transformOrigin: "top left", margin: "0" },
    });
  }, [active]);

  const download = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const dataUrl = await renderPng();
      if (dataUrl) {
        const a = document.createElement("a");
        a.download = `get-punched-${CARD_KEYS[active]}.png`;
        a.href = dataUrl;
        a.click();
        flash("Card saved ✓");
      }
    } catch {
      flash("Download failed — try again");
    } finally {
      setBusy(false);
    }
  }, [active, busy, renderPng, flash]);

  const shareUrlResolved = () =>
    shareUrl ?? (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrlResolved());
      flash("Link copied ✓");
    } catch {
      flash("Couldn't copy — long-press the URL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash, shareUrl]);

  // Instagram is visual: share the actual card image via the native sheet
  // (where Instagram / Stories appear on mobile). On desktop there's no web
  // path into Instagram, so we save the image and copy the link instead.
  const shareToInstagram = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const dataUrl = await renderPng();
      if (dataUrl) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `get-punched-${CARD_KEYS[active]}.png`, {
          type: "image/png",
        });
        const nav = navigator as Navigator & {
          canShare?: (d: { files: File[] }) => boolean;
        };
        if (nav.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Get Punched",
            text: `Where ${name} got cut. getpunched.com`,
          });
          return;
        }
        // Desktop fallback: save the image + copy the link to paste on IG.
        const a = document.createElement("a");
        a.download = `get-punched-${CARD_KEYS[active]}.png`;
        a.href = dataUrl;
        a.click();
      }
      try {
        await navigator.clipboard.writeText(shareUrlResolved());
      } catch {}
      flash("Saved image + copied link — post it to Instagram");
    } catch {
      flash("Share failed — try Download instead");
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, busy, name, renderPng, flash, shareUrl]);

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

  const onLastCard = active === CARD_KEYS.length - 1;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Card track — each card in a full-width snap slide, sized to fit height */}
      <div
        ref={trackRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => (
          <div
            key={CARD_KEYS[i]}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center overflow-hidden px-3"
          >
            {/* Outer box takes the scaled footprint and runs the entrance
                animation; inner card stays at design size and is
                transform-scaled to fit (content never reflows, never clips).
                The animation lives on the outer box so its transform doesn't
                clobber the inner fit-scale. */}
            <div
              className="card-in"
              style={{
                width: CARD_W * scale,
                height: CARD_H * scale,
                animationDelay: `${i * 45}ms`,
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {card}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="mt-2 flex shrink-0 items-center justify-center gap-2">
        {CARD_KEYS.map((key, i) => (
          <button
            key={key}
            aria-label={`Card ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-4 bg-crimson" : "w-1.5 bg-crimson/25 hover:bg-crimson/50"
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="mt-2.5 flex shrink-0 flex-col items-center gap-1.5 pb-1">
        {onLastCard && (
          <p className="eyebrow text-crimson" style={{ fontSize: "0.55rem" }}>
            Share your verdict
          </p>
        )}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={download}
            disabled={busy}
            className="eyebrow rounded-sm border-2 border-crimson px-4 py-2 text-crimson transition-colors hover:bg-crimson hover:text-card disabled:opacity-50"
            style={{ fontSize: "0.6rem" }}
          >
            {busy ? "…" : "Download"}
          </button>
          <button
            onClick={shareToInstagram}
            disabled={busy}
            className="eyebrow inline-flex items-center gap-1.5 rounded-sm bg-crimson px-4 py-2 text-card transition-colors hover:bg-crimsondeep disabled:opacity-50"
            style={{ fontSize: "0.6rem" }}
          >
            <InstagramGlyph />
            Instagram
          </button>
          <button
            onClick={copyLink}
            className="eyebrow rounded-sm border-2 border-crimson px-4 py-2 text-crimson transition-colors hover:bg-crimson hover:text-card"
            style={{ fontSize: "0.6rem" }}
          >
            Copy link
          </button>
        </div>
        <p
          className="h-3 text-center text-[0.62rem] text-faded transition-opacity"
          style={{ opacity: toast ? 1 : 0 }}
        >
          {toast ?? ""}
        </p>
      </div>
    </div>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
