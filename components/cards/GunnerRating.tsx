import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

/**
 * EKG path scales with score: high score = frantic curve-wrecker spikes,
 * low score = burnt-out flatline.
 */
function ekgPath(score: number): string {
  const amp = 4 + (score / 100) * 16; // spike amplitude
  const mid = 26;
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
}: {
  name: string;
  data: ScanResult["gunner_rating"];
}) {
  const hoursSlept = Math.max(1.5, 8.5 - (data.score / 100) * 6.5);
  const bpm = Math.round(58 + (data.score / 100) * 70);
  const sleepPct = (hoursSlept / 9) * 100;

  return (
    <CardFrame name={name}>
      <CardHeader
        category="Category 06"
        title="Gunner Rating"
        question="Are you okay? Genuinely. When did you last sleep?"
        score={data.score}
        label={data.label}
      />

      {/* Vitals monitor */}
      <div className="mt-5 overflow-hidden rounded-sm border border-[#22303a] bg-[#0b1216] px-4 py-3.5">
        <div
          className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.2em] text-[#7fd4e8]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>Pre-med vitals · Lamont, 3:12 AM</span>
          <span className="text-[#e05252]">{bpm} BPM</span>
        </div>

        <svg viewBox="0 0 200 52" className="mt-2 w-full">
          {[13, 26, 39].map((y) => (
            <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#16242c" strokeWidth="0.5" />
          ))}
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

        {/* Hours-slept gauge */}
        <div className="mt-2 border-t border-[#16242c] pt-2.5">
          <div
            className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-[#7fd4e8]">Hours slept</span>
            <span className={hoursSlept < 4 ? "text-[#e05252]" : "text-[#4fe3c1]"}>
              {hoursSlept.toFixed(1)} HRS
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-[#16242c]">
            <div
              className={`h-full rounded-full ${hoursSlept < 4 ? "bg-[#e05252]" : "bg-[#4fe3c1]"}`}
              style={{ width: `${sleepPct}%` }}
            />
          </div>
        </div>
      </div>

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
