import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

export function HumanMoatCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["human_moat"];
}) {
  return (
    <CardFrame name={name}>
      <CardHeader
        category="Category 05"
        title="Human Moat"
        question="If Claude had your LinkedIn, your calendar, and your job — how much of you is left?"
        score={data.score}
        label={data.label}
      />

      {/* Green terminal panel */}
      <div className="scanlines relative mt-5 overflow-hidden rounded-sm border border-[#0d2a16] bg-terminal px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#e05252] shadow-[0_0_6px_rgba(224,82,82,0.9)]" />
          <span
            className="phosphor-glow text-[0.6rem] uppercase tracking-[0.25em] text-phosphor"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Human Moat · Operator
          </span>
        </div>

        {/* Oscilloscope trace */}
        <svg viewBox="0 0 200 44" className="mt-3 w-full opacity-90">
          <line x1="0" y1="8" x2="200" y2="8" stroke="#45f882" strokeWidth="1.5" />
          <circle cx="100" cy="24" r="8" fill="none" stroke="#2fae5c" strokeWidth="1" />
          <path
            d="M 84 40 A 16 12 0 0 1 116 40"
            fill="none"
            stroke="#2fae5c"
            strokeWidth="1"
          />
        </svg>

        <p
          className="mt-3 text-[0.6rem] uppercase tracking-[0.25em] text-[#8fd8a6]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Value that survives Claude:
        </p>
        <p
          className="phosphor-glow mt-1 text-[2.6rem] leading-none text-phosphor"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {data.score}
          <span className="text-[1.2rem]">%</span>
        </p>

        <div className="mt-3 h-2.5 w-full border border-[#1d4a2c] bg-[#06180c]">
          <div
            className="h-full bg-phosphor shadow-[0_0_10px_rgba(69,248,130,0.7)]"
            style={{ width: `${Math.max(2, Math.min(100, data.score))}%` }}
          />
        </div>

        <p
          className="mt-2.5 text-[0.6rem] uppercase tracking-[0.25em] text-[#8fd8a6]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {data.label}
        </p>
      </div>

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
