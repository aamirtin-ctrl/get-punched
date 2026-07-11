import type { ReactNode } from "react";

export type CardVariant = "cream" | "cork" | "ink";

const variantClasses: Record<CardVariant, string> = {
  cream: "bg-card text-ink border border-cardline",
  cork: "bg-cork text-[#f3ead8] border border-corkdeep",
  ink: "bg-inkdark text-[#efe6d2] border border-[#3a2f20]",
};

/**
 * Shared card shell: portrait (story-shaped), paper texture, footer with the
 * scanned name (left) and getpunched.com (right). Every card renders inside
 * this so downloads look identical to what's on screen.
 */
export function CardFrame({
  variant = "cream",
  name,
  children,
}: {
  variant?: CardVariant;
  name: string;
  children: ReactNode;
}) {
  const footerColor =
    variant === "ink"
      ? "text-goldsoft"
      : variant === "cork"
        ? "text-[#f3ead8]"
        : "text-crimson";

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-md px-6 pt-6 pb-5 shadow-[0_18px_50px_-18px_rgba(33,26,19,0.45)] ${variantClasses[variant]}`}
    >
      {variant === "ink" && (
        <div className="pointer-events-none absolute inset-2 rounded-sm border border-gold/60" />
      )}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      <div
        className={`relative z-10 mt-4 flex items-end justify-between border-t pt-3 ${
          variant === "ink"
            ? "border-gold/40"
            : variant === "cork"
              ? "border-[#8a7355]"
              : "border-cardline"
        }`}
      >
        <span className={`eyebrow ${footerColor}`}>{name}</span>
        <span
          className={`eyebrow ${variant === "ink" ? "text-goldsoft" : variant === "cork" ? "text-[#e8c9a0]" : "text-crimson"}`}
        >
          getpunched.com
        </span>
      </div>
    </div>
  );
}

/**
 * Standard scored-card header: eyebrow + serif title + italic question on
 * the left, big crimson score with sub-label on the right, then a thin
 * score-fill bar and the summary line.
 */
export function CardHeader({
  category,
  title,
  question,
  score,
  label,
  dark = false,
}: {
  category: string;
  title: string;
  question: string;
  score: number;
  label: string;
  dark?: boolean;
}) {
  const accent = dark ? "text-[#e05252]" : "text-crimson";
  const sub = dark ? "text-[#d8cbb4]" : "text-faded";
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`eyebrow ${accent}`}>{category}</p>
          <h2
            className="mt-1.5 text-[1.7rem] leading-[1.05] font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <p className={`mt-1.5 text-[0.82rem] italic leading-snug ${sub}`}>
            {question}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="leading-none">
            <span
              className={`text-[3rem] font-semibold ${accent}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {score}
            </span>
            <span className={`text-sm ${accent}`}>/100</span>
          </p>
          <p className={`eyebrow mt-1 ${dark ? "text-[#d8cbb4]" : "text-ink/70"}`}>
            {label}
          </p>
        </div>
      </div>
      <div
        className={`mt-3 h-[3px] w-full overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-cardline"}`}
      >
        <div
          className={`h-full rounded-full ${dark ? "bg-[#e05252]" : "bg-crimson"}`}
          style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}

/** "WHY YOU GOT A NN" section used at the bottom of every scored card. */
export function WhyBlock({
  score,
  why,
  dark = false,
}: {
  score: number;
  why: string;
  dark?: boolean;
}) {
  return (
    <div className={`mt-auto border-t pt-3 ${dark ? "border-white/20" : "border-cardline"}`}>
      <p className={`eyebrow ${dark ? "text-[#e05252]" : "text-crimson"}`}>
        Why you got a {score}
      </p>
      <p className="mt-1.5 text-[0.8rem] leading-[1.45]">{why}</p>
    </div>
  );
}
