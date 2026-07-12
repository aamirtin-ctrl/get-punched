import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { EvidenceItem, ScanResult } from "@/lib/types";

/**
 * EKG path scales with score: high score = frantic curve-wrecker spikes,
 * low score = burnt-out flatline.
 */
function ekgPath(score: number): string {
  const amp = 3 + (score / 100) * 13;
  const mid = 18;
  let d = `M 0 ${mid}`;
  for (let i = 0; i < 4; i++) {
    const x = i * 50;
    d += ` L ${x + 14} ${mid} L ${x + 19} ${mid - amp * 0.35} L ${x + 24} ${mid + amp * 0.5} L ${x + 28} ${mid - amp} L ${x + 32} ${mid + amp * 0.3} L ${x + 38} ${mid}`;
  }
  d += ` L 200 ${mid}`;
  return d;
}

export function GunnerRatingCard({
  name,
  data,
  evidence,
}: {
  name: string;
  data: ScanResult["gunner_rating"];
  evidence?: EvidenceItem[];
}) {
  const hoursSlept = Math.max(1.5, 8.5 - (data.score / 100) * 6.5);
  const bpm = Math.round(58 + (data.score / 100) * 70);
  const items = (evidence ?? []).slice(0, 4);

  return (
    <CardFrame name={name}>
      <CardHeader
        category="Category 06"
        title="Gunner Rating"
        question="Are you okay? Genuinely. When did you last sleep?"
        score={data.score}
        label={data.label}
      />

      {/* Compact vitals strip */}
      <div className="mt-3 overflow-hidden rounded-sm border border-[#22303a] bg-[#0b1216] px-3 py-2">
        <div
          className="flex items-center justify-between text-[0.52rem] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="text-[#7fd4e8]">Vitals · Lamont, 3:12 AM</span>
          <span className="text-[#e05252]">{bpm} BPM · {hoursSlept.toFixed(1)}h slept</span>
        </div>
        <svg viewBox="0 0 200 36" className="mt-1 w-full">
          <line x1="0" y1="18" x2="200" y2="18" stroke="#16242c" strokeWidth="0.5" />
          <path
            d={ekgPath(data.score)}
            fill="none"
            stroke="#4fe3c1"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="ekg-line"
            style={{ filter: "drop-shadow(0 0 4px rgba(79,227,193,0.6))" }}
          />
        </svg>
      </div>

      {/* Track record — real things they've actually done */}
      {items.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <p className="eyebrow text-crimson">On the record</p>
            <div className="h-px flex-1 bg-cardline" />
          </div>
          <div className="mt-2 space-y-2">
            {items.map((e, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                <div className="min-w-0">
                  <p className="eyebrow text-faded" style={{ fontSize: "0.5rem" }}>
                    {e.category}
                  </p>
                  <p className="text-[0.8rem] font-semibold leading-tight text-ink">
                    {e.title}
                  </p>
                  <p className="text-[0.72rem] leading-tight text-ink/70">
                    {e.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
