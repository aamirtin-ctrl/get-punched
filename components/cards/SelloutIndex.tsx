import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

export function SelloutIndexCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["sellout_index"];
}) {
  return (
    <CardFrame name={name}>
      <CardHeader
        category="Category 02"
        title="The Sellout Index"
        question="How long before the recruiting pipeline claimed you?"
        score={data.score}
        label={data.label}
      />

      {/* Mock offer letter */}
      <div className="relative mt-5 border border-cardline bg-[#fbf7ec] px-4 py-4">
        <div className="absolute -top-2.5 right-3 rotate-6">
          <span className="eyebrow inline-block border-2 border-crimson bg-card px-2 py-1 text-crimson">
            Offer extended
          </span>
        </div>

        <p className="eyebrow text-faded">Re: Your future</p>
        <p
          className="mt-2 text-[1.05rem] leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {data.label}
        </p>

        <div className="mt-3 space-y-1.5">
          <p className="text-[0.72rem] leading-relaxed text-ink/75">
            Dear {name.split(" ")[0]}: we were impressed by your ability to
            describe ambition as service. We are pleased to extend the following.
          </p>
          <div
            className="flex items-baseline gap-2 text-[0.72rem]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-faded">BASE COMP:</span>
            <span className="inline-block h-3.5 w-28 rounded-[2px] bg-ink align-middle" />
          </div>
          <div
            className="flex items-baseline gap-2 text-[0.72rem]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-faded">SIGNING:</span>
            <span className="inline-block h-3.5 w-20 rounded-[2px] bg-ink align-middle" />
            <span className="text-faded">+ SOUL</span>
          </div>
        </div>
      </div>

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
