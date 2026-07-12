"use client";

import { useState } from "react";

/**
 * Scraped headshot with a graceful monogram fallback (missing URL, load
 * error, or hotlink block). Sepia-toned to match the yearbook aesthetic.
 */
export function PersonPhoto({
  src,
  name,
  className = "",
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#e4d8bf] ${className}`}
      >
        <span
          className="text-[1.4em] text-[#8f7c58]"
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
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`object-cover object-top ${className}`}
      style={{ filter: "sepia(0.18) contrast(1.02) brightness(1.02)" }}
      draggable={false}
    />
  );
}
