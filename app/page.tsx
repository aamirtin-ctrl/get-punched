import { PortraitWall } from "@/components/PortraitWall";
import { ScanForm } from "@/components/ScanForm";

export default function Home() {
  return (
    <main>
      {/* ── One-screen hero: portrait wall + floating panel ── */}
      <section id="hero" className="relative h-svh overflow-hidden">
        <PortraitWall />

        {/* Top bar — wordmark (with shield) left, Learn More right. Sits above
            the card; on desktop it flanks the card over the portraits. The
            container is click-through so it never blocks the form. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-5 py-4 sm:px-8">
          <div className="pointer-events-auto flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/harvard-shield.png"
              alt="Harvard shield"
              className="h-8 w-auto drop-shadow-sm"
            />
            <div className="leading-none">
              <p
                className="text-[1.25rem] font-bold text-crimson"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Harvard
              </p>
              <p className="eyebrow mt-0.5 text-ink/80" style={{ fontSize: "0.48rem" }}>
                Within Harvard
              </p>
            </div>
          </div>
          <a
            href="#hero"
            className="pointer-events-auto rounded-md bg-crimson px-4 py-2 text-[0.78rem] font-semibold italic text-card shadow transition-colors hover:bg-crimsondeep"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Learn More
          </a>
        </div>

        {/* Center panel — full-height opaque card with a ruled inset edge */}
        <div className="absolute inset-0 z-10 flex items-stretch justify-center px-4 py-3">
          <div className="relative h-full w-full max-w-[32rem] overflow-hidden rounded-2xl border border-[#c9bda0] bg-[#f5efe1] shadow-[0_24px_70px_-18px_rgba(33,26,19,0.55)]">
            {/* ruled inset edge, fixed to the card (does not scroll) */}
            <div className="pointer-events-none absolute inset-[9px] z-10 rounded-xl border border-[#b3a47f]/55" />
            {/* Scroll container + min-h-full centering wrapper: content centers
                when it fits and scrolls from the top (no clipping) when it
                overflows. Plain justify-center on an overflowing flex box would
                clip both the shield (top) and the sign-off (bottom). */}
            <div className="h-full overflow-y-auto">
              <div className="flex min-h-full flex-col justify-center px-8 py-10 sm:px-11">
                <div className="relative">
            {/* Crest — shield stacked over EST. 1636, flanked by short rules */}
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/harvard-shield.png"
                alt="Harvard shield"
                className="h-14 w-auto"
              />
              <div className="mt-2.5 flex items-center gap-3">
                <span className="h-px w-7 bg-cardline" />
                <span
                  className="text-[0.62rem] tracking-[0.34em] text-ink/50"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  EST. 1636
                </span>
                <span className="h-px w-7 bg-cardline" />
              </div>
            </div>

            <h1
              className="mt-6 text-center text-[1.85rem] leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Getting in was easy.
            </h1>
            <p
              className="mt-1.5 text-center text-[1.6rem] leading-snug text-crimson"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Punch season is the real
              <br />
              admissions process.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-cardline" />
              <span className="text-[0.7rem] text-crimson">✦</span>
              <div className="h-px flex-1 bg-cardline" />
            </div>

            <p className="mt-4 text-center text-[1.15rem] text-ink">
              Are you in the{" "}
              <em className="text-crimson" style={{ fontFamily: "var(--font-display)" }}>
                Harvard within Harvard™
              </em>
              ?
            </p>

            <div className="mt-4">
              <ScanForm />
            </div>

            <p
              className="mt-4 text-center text-[1.2rem] font-bold text-crimson"
              style={{ fontFamily: "var(--font-display)" }}
            >
              12,468 scans and counting
            </p>

            <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-faded">
              This is a satirical public internet scan, not a real measure of
              worth, talent, character, morality, or belonging. Only publicly
              available information is used. No private data, doxxing, protected
              traits, or accusations of wrongdoing. Not affiliated with or
              endorsed by Harvard University or any final club.
            </p>

            <p className="mt-3 text-center text-[0.95rem] italic text-ink/80">
              Be part of something smaller.
            </p>
            <p
              className="mt-1 text-center text-[1.6rem] text-crimson"
              style={{ fontFamily: "var(--font-hand)" }}
            >
              Veritas Remembers
            </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
