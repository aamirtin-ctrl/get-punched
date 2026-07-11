import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

const STICKY_POSITIONS = [
  { top: "4%", left: "2%", rotate: "-4deg" },
  { top: "0%", right: "2%", rotate: "3deg" },
  { bottom: "2%", left: "14%", rotate: "2deg" },
] as const;

export function PaperTrailCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["paper_trail"];
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const notes = data.notes.slice(0, 3);

  return (
    <CardFrame name={name} variant="cork">
      <CardHeader
        category="Category 04"
        title="The Paper Trail"
        question="Is there a paper trail you'd rather not have framed?"
        score={data.score}
        label={data.label}
        dark
      />

      {/* Detective corkboard */}
      <div className="relative mt-4 h-[240px] rounded-sm border border-corkdeep bg-corkdeep/40">
        {/* Red string */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 18 14 L 50 46 L 82 12 M 50 46 L 34 84"
            fill="none"
            stroke="#c0392b"
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Center "photo" */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="rotate-1 border-4 border-[#f3ead8] bg-[#d8ccb4] p-1 shadow-lg">
            <div
              className="flex h-14 w-14 items-center justify-center bg-[#8f7f68] text-xl text-[#f3ead8]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {initials || "?"}
            </div>
          </div>
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#c0392b] shadow" />
        </div>

        {/* Sticky notes */}
        {notes.map((note, i) => {
          const pos = STICKY_POSITIONS[i];
          return (
            <div
              key={i}
              className="absolute z-20 w-[38%] bg-[#f6efdb] px-2.5 pb-2 pt-3 text-ink shadow-[0_5px_10px_-4px_rgba(0,0,0,0.55)]"
              style={{ ...pos, transform: `rotate(${pos.rotate})` }}
            >
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#c0392b] shadow" />
              <p
                className="text-[0.95rem] leading-[1.15]"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                {note}
              </p>
            </div>
          );
        })}
      </div>

      <WhyBlock score={data.score} why={data.why} dark />
    </CardFrame>
  );
}
