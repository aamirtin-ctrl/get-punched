import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

const DIFFICULTIES = ["EASY", "NORMAL", "HARD", "NIGHTMARE"] as const;

function Bill({ green }: { green: boolean }) {
  return (
    <div
      className={`flex h-7 w-14 items-center justify-center rounded-[3px] border ${
        green
          ? "border-[#7fae8a] bg-[#cfe6d2]"
          : "border-[#c7bda6] bg-[#e9e2d0]"
      } shadow-[0_2px_4px_-2px_rgba(33,26,19,0.4)]`}
      style={{ transform: `rotate(${green ? -2 : 2}deg)` }}
    >
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[0.5rem] ${
          green ? "border-[#5c8f68] text-[#3f6e4b]" : "border-[#b3a88e] text-[#9a8f74]"
        }`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        V
      </div>
    </div>
  );
}

export function LegacyMultiplierCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["legacy_multiplier"];
}) {
  const greenBills = Math.max(0, Math.min(8, Math.round((data.score / 100) * 8)));

  return (
    <CardFrame name={name}>
      <CardHeader
        category="Category 03"
        title="Legacy Multiplier"
        question="How much of the journey was funded before move-in day?"
        score={data.score}
        label={data.label}
      />

      <div className="mt-5">
        <p className="text-center text-[0.85rem] italic text-faded">
          What mode are you living life on?
        </p>

        {/* Difficulty selector */}
        <div className="mt-3 flex overflow-hidden border-2 border-ink">
          {DIFFICULTIES.map((d) => (
            <div
              key={d}
              className={`flex-1 py-2 text-center ${
                d === data.difficulty ? "bg-crimson text-card" : "bg-card text-ink/70"
              }`}
            >
              <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>
                {d}
              </span>
            </div>
          ))}
        </div>

        {/* Stacked cash */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Bill key={i} green={i < greenBills} />
            ))}
          </div>
          <div className="flex gap-2">
            {[4, 5, 6, 7].map((i) => (
              <Bill key={i} green={i < greenBills} />
            ))}
          </div>
        </div>
      </div>

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
