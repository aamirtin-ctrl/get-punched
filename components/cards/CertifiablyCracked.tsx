import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

export function CertifiablyCrackedCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["certifiably_cracked"];
}) {
  return (
    <CardFrame name={name}>
      <CardHeader
        category="Category 07"
        title="Certifiably Cracked"
        question="Did you actually contribute something intellectually interesting?"
        score={data.score}
        label={data.label}
      />

      {/* Certificate */}
      <div className="relative mt-5 border-2 border-crimson/70 bg-[#fbf7ec] p-1">
        <div className="border border-crimson/40 px-4 pb-4 pt-3.5 text-center">
          <p className="eyebrow text-crimson">Award of Excellence</p>
          <p
            className="mt-1.5 text-[1.15rem] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </p>
          <p className="mt-1 text-[0.68rem] italic text-faded">
            is hereby recognized, pending committee review, as
          </p>
          <p
            className="mt-0.5 text-[0.95rem] text-crimson"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.label}
          </p>

          {/* Ribbon + wax seal */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-cardline" />
            <div className="relative">
              <div className="absolute left-1/2 top-6 -z-0 flex -translate-x-1/2 gap-1">
                <span className="block h-6 w-2 -rotate-12 bg-crimson/80" />
                <span className="block h-6 w-2 rotate-12 bg-crimson/80" />
              </div>
              <div className="relative z-10 h-11 w-11">
                {/* soft red halo — a radial gradient renders centered; a
                    box-shadow glow drifts off the seal in the download PNG */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    inset: "-0.55rem",
                    background:
                      "radial-gradient(circle, rgba(110,20,20,0.5) 0%, rgba(110,20,20,0) 70%)",
                  }}
                />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#b02234] to-crimson">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c46a6a]">
                    <span
                      className="text-[0.55rem] text-[#f0d9d9]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ΦBK
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px flex-1 bg-cardline" />
          </div>
          <p className="eyebrow mt-6 text-faded" style={{ fontSize: "0.5rem" }}>
            Phi Beta Kappa · Status Pending Forever
          </p>
        </div>
      </div>

      {/* Evidence divider */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-cardline" />
        <p className="eyebrow text-crimson">Evidence</p>
        <div className="h-px flex-1 bg-cardline" />
      </div>

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
