"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CardCarousel } from "@/components/CardCarousel";
import type { ScanPayload } from "@/lib/types";

type ScanResponse = ScanPayload & { share?: { d: string; sig: string } };

const LOADING_LINES = [
  "Pulling what little the internet has on you…",
  "Reading your name aloud to a quiet room…",
  "Checking if your surname is on a building…",
  "Cross-referencing the Crimson archives…",
  "Letting the graduate board finish laughing…",
];

export function ScanClient({
  sessionId,
  devToken,
  name,
  context,
}: {
  sessionId?: string;
  devToken?: string;
  name?: string;
  context?: string;
}) {
  const [data, setData] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setLineIdx((i) => (i + 1) % LOADING_LINES.length),
      1800
    );
    return () => clearInterval(t);
  }, []);

  const missingSession = !sessionId && !devToken && !name;

  useEffect(() => {
    if (missingSession) return;
    const params = new URLSearchParams();
    if (sessionId) params.set("session_id", sessionId);
    if (devToken) params.set("dev_token", devToken);
    if (name) params.set("name", name);
    if (context) params.set("context", context);
    fetch(`/api/scan?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Scan failed.");
        setData(body);
      })
      .catch((e: Error) => setError(e.message));
  }, [sessionId, devToken, name, context, missingSession]);

  const displayError = missingSession
    ? "Missing session. Start from the landing page."
    : error;

  if (displayError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow text-crimson">Scan interrupted</p>
        <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed">{displayError}</p>
        <Link
          href="/"
          className="eyebrow mt-8 border-2 border-crimson px-5 py-2.5 text-crimson transition-colors hover:bg-crimson hover:text-card"
        >
          Back to the gate
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Scanner animation */}
        <div className="relative h-40 w-28 overflow-hidden border-2 border-crimson/50 bg-card">
          <div className="scan-sweep absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-crimson/25 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-3xl text-crimson/60"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ✕
            </span>
          </div>
        </div>
        <p className="eyebrow-wide scan-pulse mt-8 text-crimson">Scanning</p>
        <p className="mt-3 text-[0.9rem] italic text-faded">
          {LOADING_LINES[lineIdx]}
        </p>
      </div>
    );
  }

  const shareUrl = data.share
    ? `${window.location.origin}/share?d=${encodeURIComponent(data.share.d)}&sig=${encodeURIComponent(data.share.sig)}`
    : undefined;

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="shrink-0 px-6 pt-4 pb-1 text-center">
        <p className="eyebrow-wide text-crimson" style={{ fontSize: "0.6rem" }}>
          Harvard within Harvard
        </p>
        <h1
          className="mt-1.5 text-[1.5rem] leading-tight sm:text-[1.8rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The verdict on <em className="text-crimson">{data.name}</em>
        </h1>
        {data.factCount === 0 && (
          <p
            className="mt-1 text-[0.68rem] text-faded"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            About 0 results (0.42 seconds). The internet has never heard of you.
            At Harvard that isn&apos;t privacy, it&apos;s a verdict.
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1">
        <CardCarousel name={data.name} result={data.result} shareUrl={shareUrl} />
      </div>

      <p className="shrink-0 px-6 pb-2 text-center text-[0.5rem] leading-tight text-faded/70">
        Satirical public-internet scan. Public info only, not a real measure of
        anything. Not affiliated with Harvard or any final club.
      </p>
    </div>
  );
}
