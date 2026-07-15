"use client";

import { useEffect, useState } from "react";

/**
 * Scraped headshot with a graceful monogram fallback (missing URL, load
 * error, or hotlink block). Sepia-toned to match the yearbook aesthetic.
 *
 * The image is inlined as a data: URL before it's needed. On screen a plain
 * <img> is fine, but html-to-image has to rasterize this card into a PNG for
 * Download/Share, and on mobile Safari it can't reliably re-fetch a remote (or
 * even proxied) URL at capture time — which left the headshot blank in the
 * downloaded image. A data: URL has nothing to fetch, so it always rasterizes.
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
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  // Route external images through our proxy so they're same-origin.
  const proxied =
    src && /^https?:\/\//.test(src)
      ? `/api/img?url=${encodeURIComponent(src)}`
      : src;

  useEffect(() => {
    if (!proxied) return;
    let cancelled = false;
    setDataUrl(null);
    fetch(proxied)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("bad status"))))
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = () => reject(new Error("read failed"));
            fr.readAsDataURL(blob);
          })
      )
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      // Inlining failed — keep showing the proxied <img> on screen; only a hard
      // image load error (below) falls back to the monogram.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [proxied]);

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
      src={dataUrl ?? proxied}
      alt={name}
      onError={() => setFailed(true)}
      className={`object-cover object-top ${className}`}
      style={{ filter: "sepia(0.18) contrast(1.02) brightness(1.02)" }}
      draggable={false}
    />
  );
}
