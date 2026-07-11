import { CardFrame } from "./chrome";
import type { ScanResult } from "@/lib/types";

export function FinalClassificationCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["final_club"];
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <CardFrame name={name} variant="ink">
      <div className="flex items-start justify-between px-1 pt-1">
        <p className="eyebrow text-gold">Final Classification</p>
        <p className="eyebrow text-goldsoft/80">№ 08 · Final</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
        {/* Monogram medallion */}
        <div className="flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-full border border-gold/70 bg-gradient-to-b from-[#241c11] to-[#17110c] shadow-[0_0_30px_-8px_rgba(201,162,39,0.45)]">
          <div className="flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full border border-gold/40">
            <span
              className="text-2xl text-goldsoft"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {initials || "?"}
            </span>
          </div>
        </div>

        <p className="eyebrow-wide mt-4 text-goldsoft/90">You&apos;d get into</p>
        <h2
          className="mt-1.5 text-[2.1rem] leading-[1.02] text-[#f5edda]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {data.club}
        </h2>
        <p
          className="mt-1.5 text-[0.82rem] tracking-[0.2em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {data.match_pct}% MATCH
        </p>
        <p className="eyebrow mt-1 text-goldsoft/60" style={{ fontSize: "0.52rem" }}>
          {data.odds_pct}% chance they actually let you in
        </p>

        {/* Trait pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {data.traits.map((trait) => (
            <span
              key={trait}
              className="eyebrow rounded-full border border-gold/60 px-3 py-1.5 text-goldsoft"
              style={{ fontSize: "0.55rem" }}
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Lookalike comparison */}
        <div className="mt-5 w-full border-t border-gold/30 pt-4">
          <p className="eyebrow-wide text-goldsoft/90" style={{ fontSize: "0.55rem" }}>
            You&apos;re basically
          </p>
          <p
            className="mt-1 text-[1.25rem] leading-tight text-[#f5edda]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.lookalike.name}
          </p>
          <p className="mx-auto mt-2 max-w-[32ch] text-[0.74rem] italic leading-[1.5] text-[#d9ceb6]">
            {data.lookalike.line}
          </p>
        </div>

        {/* Closing roast */}
        <p className="mt-4 max-w-[32ch] text-[0.78rem] leading-[1.5] text-[#c8bda2]">
          {data.line}
        </p>
      </div>
    </CardFrame>
  );
}
