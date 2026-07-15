"use client";

import { useEffect, useState } from "react";

type CharType = "legacy" | "gunner" | "prep" | "consultant";

// Witty lines rotate under the scanner card (the "text box").
const LINES = [
  "Are you in the Harvard within Harvard™?",
  "Looking for legacy… or calculating net worth?",
  "Cross-referencing the punch list…",
  "Checking who your father knows…",
  "Measuring your final-club aura…",
  "Consulting the blackball committee…",
  "Reading your name aloud to a quiet room…",
];

// The four peekers, one per corner, each leaning in toward the card.
const CORNERS: {
  type: CharType;
  pos: string;
  rotate: string;
  delay: string;
  side: "left" | "right";
}[] = [
  { type: "legacy", pos: "-top-3 -left-4", rotate: "13deg", delay: "0s", side: "right" },
  { type: "gunner", pos: "-top-3 -right-4", rotate: "-13deg", delay: "0.5s", side: "left" },
  { type: "consultant", pos: "-bottom-4 -left-4", rotate: "-9deg", delay: "0.9s", side: "right" },
  { type: "prep", pos: "-bottom-4 -right-4", rotate: "9deg", delay: "1.3s", side: "left" },
];

export function LoadingScene() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % LINES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Stage: scanner card in the middle, caricatures peeking from the corners */}
      <div className="relative h-[15rem] w-full max-w-[22rem] overflow-hidden">
        {CORNERS.map((c, idx) => (
          <div
            key={idx}
            className={`absolute h-[6.5rem] w-[5rem] ${c.pos}`}
            style={{ transform: `rotate(${c.rotate})` }}
          >
            <div className="bob h-full w-full" style={{ animationDelay: c.delay }}>
              <Peeker type={c.type} side={c.side} />
            </div>
          </div>
        ))}

        {/* the original scanner card, dead center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-40 w-28 overflow-hidden border-2 border-crimson/50 bg-card shadow-[0_10px_30px_-12px_rgba(33,26,19,0.45)]">
            <div className="scan-sweep absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-crimson/25 to-transparent" />
            {/* corner ticks */}
            <span className="absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-crimson/50" />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 border-r-2 border-t-2 border-crimson/50" />
            <span className="absolute bottom-1 left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-crimson/50" />
            <span className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-crimson/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-3xl text-crimson/60"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ✕
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* the "text box" — rotating witty line, like the original */}
      <p className="eyebrow-wide scan-pulse mt-1 text-crimson">Scanning</p>
      <p
        key={i}
        className="bubble-fade mt-2 h-5 max-w-xs text-[0.9rem] italic leading-snug text-faded"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {LINES[i]}
      </p>
    </div>
  );
}

const SKIN: Record<CharType, string> = {
  legacy: "#f0d3b4",
  gunner: "#e3b892",
  prep: "#d3a172",
  consultant: "#eec8a2",
};

/**
 * A caricature bust (head + crimson blazer shoulders) leaning in from a corner,
 * with one arm raised and a little hand waving/reaching toward the card.
 */
function Peeker({ type, side }: { type: CharType; side: "left" | "right" }) {
  const skin = SKIN[type];
  return (
    <svg
      viewBox="0 0 120 150"
      className="h-full w-full"
      style={{ overflow: "visible" }}
      aria-hidden
    >
      {/* crimson blazer shoulders */}
      <path d="M14 150 V108 Q60 86 106 108 V150 Z" fill="#a51c30" />
      <path d="M48 102 L60 132 L54 104 Z" fill="#7f1524" />
      <path d="M72 102 L60 132 L66 104 Z" fill="#7f1524" />
      {/* shirt V */}
      <path d="M52 102 L60 122 L68 102 Z" fill="#f7f1e4" />
      <NeckAccessory type={type} />
      {/* raised arm + waving hand, on the side facing the card */}
      <WavingArm skin={skin} side={side} />
      {/* neck */}
      <rect x="52" y="84" width="16" height="18" rx="6" fill="#e0b083" />
      {/* head */}
      <circle cx="60" cy="60" r="27" fill={skin} />
      <circle cx="33" cy="61" r="5.5" fill={skin} />
      <circle cx="87" cy="61" r="5.5" fill={skin} />
      {/* eyes */}
      <circle cx="50" cy="59" r="2.8" fill="#33241a" />
      <circle cx="70" cy="59" r="2.8" fill="#33241a" />
      <path d="M44 50 q6 -3 12 0" stroke="#33241a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M64 50 q6 -3 12 0" stroke="#33241a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Mouth type={type} />
      <HairHat type={type} skin={skin} />
      <FaceAccessory type={type} />
    </svg>
  );
}

function WavingArm({ skin, side }: { skin: string; side: "left" | "right" }) {
  // Draw on the right, then mirror across x=60 for the left side.
  const arm = (
    <g>
      {/* crimson sleeve from shoulder up to the raised hand */}
      <path
        d="M92 116 Q112 110 108 84 Q106 74 100 70"
        stroke="#a51c30"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      {/* hand */}
      <circle cx="100" cy="64" r="7.5" fill={skin} />
      {/* little fingers fanned up in a wave */}
      <g stroke={skin} strokeWidth="3.4" strokeLinecap="round">
        <line x1="96" y1="60" x2="94" y2="51" />
        <line x1="100" y1="59" x2="100" y2="49" />
        <line x1="104" y1="60" x2="107" y2="51" />
      </g>
    </g>
  );
  return side === "left" ? (
    <g transform="translate(120,0) scale(-1,1)">{arm}</g>
  ) : (
    arm
  );
}

function Mouth({ type }: { type: CharType }) {
  if (type === "gunner")
    return <line x1="52" y1="73" x2="68" y2="73" stroke="#8a5a3c" strokeWidth="2.2" strokeLinecap="round" />;
  if (type === "consultant")
    return <path d="M50 71 q10 8 20 0" stroke="#8a5a3c" strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  return <path d="M50 72 q12 5 20 -2" stroke="#8a5a3c" strokeWidth="2.4" fill="none" strokeLinecap="round" />;
}

function HairHat({ type, skin }: { type: CharType; skin: string }) {
  if (type === "gunner") {
    return (
      <g>
        <path d="M36 40 Q60 20 84 40 L84 44 Q60 30 36 44 Z" fill="#2a2620" />
        <path d="M58 22 L96 34 L60 46 L24 34 Z" fill="#1c1a15" />
        <circle cx="60" cy="34" r="2.4" fill="#c9a227" />
        <line x1="60" y1="34" x2="90" y2="34" stroke="#c9a227" strokeWidth="1.4" />
        <line x1="90" y1="34" x2="90" y2="50" stroke="#c9a227" strokeWidth="1.4" />
        <circle cx="90" cy="52" r="2.6" fill="#c9a227" />
      </g>
    );
  }
  if (type === "prep") {
    return (
      <g>
        <path d="M34 44 Q60 20 86 44 Q60 34 34 44 Z" fill="#8b1a2a" />
        <path d="M34 44 Q60 22 86 44 L86 42 Q60 30 34 42 Z" fill="#a51c30" />
        <path d="M84 44 Q102 44 104 51 L84 49 Z" fill="#7f1524" />
        <text x="60" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f7f1e4" style={{ fontFamily: "Georgia, serif" }}>H</text>
      </g>
    );
  }
  if (type === "consultant") {
    return (
      <path d="M34 52 Q36 30 60 30 Q84 30 86 52 Q82 40 60 40 Q46 40 40 46 Q37 42 34 52 Z" fill="#4a3524" />
    );
  }
  return (
    <path d="M33 54 Q34 28 60 28 Q86 28 87 54 Q84 42 78 40 Q80 46 74 46 Q70 38 60 38 Q42 38 33 54 Z" fill="#241c14" />
  );
}

function NeckAccessory({ type }: { type: CharType }) {
  if (type === "legacy") {
    // bowtie
    return (
      <g fill="#7f1524">
        <path d="M60 102 L48 96 L48 108 Z" />
        <path d="M60 102 L72 96 L72 108 Z" />
        <circle cx="60" cy="102" r="2.4" fill="#5c0f1b" />
      </g>
    );
  }
  if (type === "consultant") {
    // straight tie
    return <path d="M60 102 L56 107 L60 128 L64 107 Z" fill="#7f1524" />;
  }
  return null;
}

function FaceAccessory({ type }: { type: CharType }) {
  if (type === "gunner") {
    return (
      <g stroke="#33241a" strokeWidth="1.8" fill="none">
        <circle cx="50" cy="60" r="7" />
        <circle cx="70" cy="60" r="7" />
        <line x1="57" y1="60" x2="63" y2="60" />
      </g>
    );
  }
  if (type === "legacy") {
    return (
      <g>
        <circle cx="70" cy="60" r="8" fill="none" stroke="#c9a227" strokeWidth="1.8" />
        <path d="M70 68 q-2 8 -8 12" stroke="#c9a227" strokeWidth="1" fill="none" />
      </g>
    );
  }
  if (type === "consultant") {
    return (
      <g>
        <circle cx="86" cy="64" r="3.2" fill="#2a2a2a" />
        <path d="M86 67 q3 8 -2 14" stroke="#2a2a2a" strokeWidth="1.4" fill="none" />
      </g>
    );
  }
  return null;
}
