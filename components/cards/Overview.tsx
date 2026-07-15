import { CardFrame } from "./chrome";
import { PersonPhoto } from "../PersonPhoto";
import type { ScanResult } from "@/lib/types";

/**
 * Card 01 — at-a-glance scorecard: headshot, overall match, archetype
 * (lookalike), and every category score as a bar. Everything here is derived
 * from the other cards, so it never needs its own LLM fields.
 */
export function OverviewCard({
  name,
  result,
}: {
  name: string;
  result: ScanResult;
}) {
  const rows = [
    { label: "Punch Worthiness", score: result.punch_worthiness.score },
    { label: "The Sellout Index", score: result.sellout_index.score },
    { label: "Legacy Multiplier", score: result.legacy_multiplier.score },
    { label: "The Paper Trail", score: result.paper_trail.score },
    { label: "Human Moat", score: result.human_moat.score },
    { label: "Gunner Rating", score: result.gunner_rating.score },
    { label: "Certifiably Cracked", score: result.certifiably_cracked.score },
  ];
  const overall = Math.round(
    rows.reduce((a, r) => a + r.score, 0) / rows.length
  );
  const tier =
    overall >= 80 ? "HIGH" : overall >= 65 ? "STRONG" : overall >= 50 ? "MIXED" : "LOW";
  const look = result.final_club.lookalike;
  const lookPct = look.pct ?? result.final_club.match_pct;

  return (
    <CardFrame name={name}>
      <p className="eyebrow text-crimson">Harvard within Harvard · The Scan</p>

      {/* Identity row */}
      <div className="mt-3 flex items-center gap-3">
        {/* Border lives on the wrapper, not the <img>. Mobile Safari's
            html-to-image fails to rasterize an image that has a border/radius
            on the image element itself (that's why this headshot was blank in
            the download while Paper Trail's — a plain img in a bordered div —
            rendered fine). */}
        <div className="shrink-0 border-2 border-[#d9cfba]">
          <PersonPhoto
            src={result.image_url}
            name={name}
            className="h-[4.2rem] w-[4.2rem]"
          />
        </div>
        <div className="min-w-0">
          <h2
            className="truncate text-[1.5rem] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h2>
          {result.tagline && (
            <p className="mt-0.5 line-clamp-2 text-[0.82rem] italic leading-snug text-faded">
              &quot;{result.tagline}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Overall */}
      <div className="mt-3 flex items-end gap-2.5">
        <p className="leading-none">
          <span
            className="text-[3rem] font-semibold text-crimson"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {overall}
          </span>
          <span className="text-lg text-crimson">%</span>
        </p>
        <span className="eyebrow mb-2 rounded-sm bg-crimson px-2 py-1 text-card">
          {tier}
        </span>
      </div>

      {/* Archetype */}
      <div className="mt-2 flex items-center justify-between border-y border-cardline py-2">
        <span className="eyebrow text-faded">Archetype</span>
        <span className="text-[0.9rem]" style={{ fontFamily: "var(--font-display)" }}>
          {look.name} <span className="text-crimson">· {lookPct}%</span>
        </span>
      </div>

      {/* Score bars */}
      <div className="mt-3 flex flex-1 flex-col justify-center gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-[8.6rem] shrink-0 text-[0.8rem] leading-tight">
              {r.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-cardline">
              <div
                className="h-full rounded-full bg-crimson"
                style={{ width: `${Math.max(3, Math.min(100, r.score))}%` }}
              />
            </div>
            <span
              className="w-7 text-right text-[1.05rem] font-semibold text-crimson"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {r.score}
            </span>
          </div>
        ))}
      </div>
    </CardFrame>
  );
}
