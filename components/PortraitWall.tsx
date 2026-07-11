"use client";

import { useEffect, useRef, useState } from "react";
import { PEOPLE, type Person } from "@/lib/people";

/**
 * Full-viewport background wall of vintage yearbook cards, four marquee rows
 * scrolling at different speeds — the Stanford-within-Stanford layout,
 * reskinned crimson. Portraits are pre-toned sepia scans, so the CSS filter
 * here only lightly unifies them.
 */

function PortraitImage({ person }: { person: Person }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const initials = person.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  // onError can fire before hydration attaches the handler; re-check after mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#d9c9a8]">
        <span
          className="text-3xl text-[#8f7c58]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {initials}
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={`/portraits/${person.slug}.jpg`}
      alt={person.name}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover object-top"
      style={{ filter: "sepia(0.12) contrast(1.02) brightness(1.02)" }}
      draggable={false}
    />
  );
}

function YearbookCard({ person }: { person: Person }) {
  return (
    <div className="flex w-[11.25rem] shrink-0 flex-col border border-[#9c8a66] bg-[#e8dcc0] p-[3px] shadow-[0_3px_10px_-5px_rgba(33,26,19,0.4)]">
      <div className="h-[8.2rem] overflow-hidden bg-[#d9c9a8]">
        <PortraitImage person={person} />
      </div>
      <div className="px-1.5 pb-1.5 pt-1 text-center">
        <p
          className="truncate text-[0.6rem] font-bold tracking-[0.06em] text-ink"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {person.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[0.55rem] italic leading-tight text-ink/70">
          {person.line}
        </p>
        <p
          className="mt-0.5 text-[0.68rem] font-bold text-crimson"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {person.pct}% in it
        </p>
      </div>
    </div>
  );
}

function Row({
  people,
  reverse,
  duration,
}: {
  people: Person[];
  reverse?: boolean;
  duration: string;
}) {
  // Exactly two copies of the set, so the -50% keyframe lands on the copy
  // boundary for a seamless loop with no blank gaps. One set (all 12 cards)
  // is wider than any viewport, so a card is always on screen.
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div
        className={`flex h-full w-max items-center gap-2.5 pr-2.5 ${reverse ? "marquee-track-reverse" : "marquee-track"}`}
        style={{ animationDuration: duration }}
      >
        {[...people, ...people].map((p, i) => (
          <YearbookCard key={`${p.slug}-${i}`} person={p} />
        ))}
      </div>
    </div>
  );
}

function rotate(arr: Person[], n: number): Person[] {
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

export function PortraitWall() {
  // Every row shows all 12 people (so each set spans well past the viewport),
  // rotated by a different offset so the rows don't line up vertically.
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col gap-2.5 overflow-hidden py-2.5"
    >
      <Row people={rotate(PEOPLE, 0)} duration="150s" />
      <Row people={rotate(PEOPLE, 3)} reverse duration="175s" />
      <Row people={rotate(PEOPLE, 6)} duration="160s" />
      <Row people={rotate(PEOPLE, 9)} reverse duration="185s" />
    </div>
  );
}
