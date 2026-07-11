import { CardFrame, CardHeader, WhyBlock } from "./chrome";
import type { ScanResult } from "@/lib/types";

const ROUNDS = [
  { key: "cocktail", label: "Cocktail" },
  { key: "outing", label: "Outing" },
  { key: "date_event", label: "Date Event" },
  { key: "final_dinner", label: "Final Dinner" },
] as const;

export function PunchWorthinessCard({
  name,
  data,
}: {
  name: string;
  data: ScanResult["punch_worthiness"];
}) {
  // Index of the round where the comp died. -1 = never invited, 4 = punched.
  const cutIndex =
    data.cut_round === "punched"
      ? 4
      : data.cut_round === "none"
        ? -1
        : ROUNDS.findIndex((r) => r.key === data.cut_round);

  return (
    <CardFrame name={name}>
      <CardHeader
        category="Punch Worthiness · Category 01"
        title="Punch Worthiness"
        question="Would you survive punch season, or die at the cocktail hour?"
        score={data.score}
        label={data.label}
      />

      {/* Four-round punch tracker */}
      <div className="mt-5">
        <div className="flex items-start">
          {ROUNDS.map((round, i) => {
            const passed = cutIndex > i || cutIndex === 4;
            const isCut = cutIndex === i;
            return (
              <div key={round.key} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <div
                    className={`h-px flex-1 ${i === 0 ? "opacity-0" : passed || isCut ? "bg-crimson" : "bg-cardline"}`}
                  />
                  <div
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[0.65rem] font-semibold ${
                      isCut
                        ? "border-crimson bg-crimson text-card"
                        : passed
                          ? "border-crimson bg-crimson/90 text-card"
                          : "border-cardline bg-card text-faded"
                    }`}
                  >
                    {isCut ? (
                      <span className="text-sm leading-none">✕</span>
                    ) : passed ? (
                      <span className="text-xs leading-none">✓</span>
                    ) : (
                      <span style={{ fontFamily: "var(--font-mono)" }}>{i + 1}</span>
                    )}
                  </div>
                  <div
                    className={`h-px flex-1 ${i === ROUNDS.length - 1 ? "opacity-0" : passed ? "bg-crimson" : "bg-cardline"}`}
                  />
                </div>
                <p
                  className={`eyebrow mt-2 text-center leading-tight ${
                    isCut ? "text-crimson" : passed ? "text-ink/80" : "text-faded"
                  }`}
                  style={{ fontSize: "0.52rem" }}
                >
                  {round.label}
                </p>
              </div>
            );
          })}
        </div>

        {cutIndex === 4 && (
          <p className="eyebrow mt-3 inline-block -rotate-2 border-2 border-crimson px-2 py-1 text-crimson">
            Punched ✓
          </p>
        )}
        {cutIndex === -1 && (
          <p className="eyebrow mt-3 inline-block -rotate-2 border-2 border-crimson px-2 py-1 text-crimson">
            Never invited
          </p>
        )}
      </div>

      {/* Where you got cut */}
      <div className="mt-4 border-l-2 border-crimson bg-crimson/[0.06] px-3 py-2.5">
        <p className="eyebrow text-crimson">
          {cutIndex === 4 ? "How you got through" : "Where you got cut"}
        </p>
        <p className="mt-1 text-[0.8rem] leading-[1.45]">{data.roast}</p>
      </div>

      <WhyBlock score={data.score} why={data.why} />
    </CardFrame>
  );
}
