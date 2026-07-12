"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import type { ScanResult } from "@/lib/types";
import { OverviewCard } from "./cards/Overview";
import { PunchWorthinessCard } from "./cards/PunchWorthiness";
import { SelloutIndexCard } from "./cards/SelloutIndex";
import { LegacyMultiplierCard } from "./cards/LegacyMultiplier";
import { PaperTrailCard } from "./cards/PaperTrail";
import { HumanMoatCard } from "./cards/HumanMoat";
import { GunnerRatingCard } from "./cards/GunnerRating";
import { CertifiablyCrackedCard } from "./cards/CertifiablyCracked";
import { FinalClassificationCard } from "./cards/FinalClassification";
import { ScanAgainCard } from "./cards/ScanAgain";

const CARD_KEYS = [
  "overview",
  "punch-worthiness",
  "sellout-index",
  "legacy-multiplier",
  "paper-trail",
  "human-moat",
  "gunner-rating",
  "certifiably-cracked",
  "final-classification",
  "scan-again",
] as const;

// The trailing CTA card is not a verdict, so it's excluded from Download all.
const DOWNLOADABLE = (key: string) => key !== "scan-again";

const CARD_W = 390;

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
  // Per-card { natural height, fit scale }; cards have variable content height.
  const [metrics, setMetrics] = useState<{ h: number; scale: number }[]>([]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // Measure each card's natural height (transform-independent) and scale it to
  // fit the available box, so a whole card always shows — no clip, no scroll.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const compute = () => {
      const availH = track.clientHeight - 8;
      const availW = track.clientWidth - 24;
      setMetrics(
        cardRefs.current.map((node) => {
          const h = node?.offsetHeight || 680;
          return { h, scale: Math.min(1, availH / h, availW / CARD_W) };
        })
      );
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(track);
    return () => ro.disconnect();
  }, [result]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () =>
      setActive(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
  }, []);

  const renderCardPng = useCallback(async (i: number, pixelRatio = 3) => {
    const node = cardRefs.current[i];
    if (!node) return null;
    return toPng(node, {
      pixelRatio,
      cacheBust: true,
      width: CARD_W,
      height: node.offsetHeight,
      style: { transform: "none", transformOrigin: "top left", margin: "0" },
    });
  }, []);

  const triggerDownload = (dataUrl: string, key: string) => {
    const a = document.createElement("a");
    a.download = `get-punched-${key}.png`;
    a.href = dataUrl;
    a.click();
  };

  // Download EVERY card, not just the active one.
  const downloadAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    flash("Rendering all cards…");
    try {
      let n = 0;
      for (let i = 0; i < CARD_KEYS.length; i++) {
        if (!DOWNLOADABLE(CARD_KEYS[i])) continue;
        const dataUrl = await renderCardPng(i, 2);
        if (dataUrl) {
          triggerDownload(dataUrl, `${String(i + 1).padStart(2, "0")}-${CARD_KEYS[i]}`);
          n++;
          await new Promise((r) => setTimeout(r, 350));
        }
      }
      flash(`Saved ${n} cards ✓`);
    } catch {
      flash("Download failed — try again");
    } finally {
      setBusy(false);
    }
  }, [busy, renderCardPng, flash]);

  const linkUrl = () =>
    shareUrl ?? (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(linkUrl());
      flash("Link copied ✓");
    } catch {
      flash("Couldn't copy — long-press the URL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash, shareUrl]);

  // Instagram is visual: share the active card image via the native sheet
  // (Instagram / Stories appear there on mobile). Desktop fallback: save the
  // image and copy the link to paste manually.
  const shareToInstagram = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const dataUrl = await renderCardPng(active, 3);
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
        triggerDownload(dataUrl, CARD_KEYS[active]);
      }
      try {
        await navigator.clipboard.writeText(linkUrl());
      } catch {}
      flash("Saved image + copied link — post it to Instagram");
    } catch {
      flash("Share failed — try Download");
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, busy, name, renderCardPng, flash, shareUrl]);

  const cards = [
    <OverviewCard key="ov" name={name} result={result} />,
    <PunchWorthinessCard key="pw" name={name} data={result.punch_worthiness} />,
    <SelloutIndexCard key="si" name={name} data={result.sellout_index} />,
    <LegacyMultiplierCard key="lm" name={name} data={result.legacy_multiplier} />,
    <PaperTrailCard
      key="pt"
      name={name}
      data={result.paper_trail}
      imageUrl={result.image_url}
    />,
    <HumanMoatCard key="hm" name={name} data={result.human_moat} />,
    <GunnerRatingCard
      key="gr"
      name={name}
      data={result.gunner_rating}
      evidence={result.evidence}
    />,
    <CertifiablyCrackedCard key="cc" name={name} data={result.certifiably_cracked} />,
    <FinalClassificationCard key="fc" name={name} data={result.final_club} />,
    <ScanAgainCard key="sa" name={name} />,
  ];

  return (
    <div className="flex h-full w-full flex-col">
      {/* Card track — each card in a full-width snap slide, scaled to fit */}
      <div
        ref={trackRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => {
          const m = metrics[i];
          const scale = m?.scale ?? 1;
          return (
            <div
              key={CARD_KEYS[i]}
              className="flex h-full w-full shrink-0 snap-center items-center justify-center overflow-hidden px-3"
            >
              <div
                className="card-in"
                style={{
                  width: CARD_W * scale,
                  height: m ? m.h * scale : undefined,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{
                    width: CARD_W,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {card}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="mt-2 flex shrink-0 items-center justify-center gap-1.5">
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
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={downloadAll}
            disabled={busy}
            className="eyebrow rounded-sm border-2 border-crimson px-4 py-2 text-crimson transition-colors hover:bg-crimson hover:text-card disabled:opacity-50"
            style={{ fontSize: "0.6rem" }}
          >
            {busy ? "…" : "Download all"}
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
