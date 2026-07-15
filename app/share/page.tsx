import Link from "next/link";
import { decodeSharePayload } from "@/lib/share";
import { CardCarousel } from "@/components/CardCarousel";

export const metadata = {
  title: "A Punch Verdict — Get Punched",
};

/**
 * Stateless share view: the entire scan payload rides inside the signed URL,
 * so shared links re-render forever with no database.
 */
export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const d = typeof params.d === "string" ? params.d : "";
  const sig = typeof params.sig === "string" ? params.sig : "";
  const payload = d && sig ? decodeSharePayload(d, sig) : null;

  if (!payload) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow text-crimson">Invalid share link</p>
        <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed">
          This verdict has been tampered with, which is honestly very Harvard
          of someone.
        </p>
        <Link
          href="/"
          className="eyebrow mt-8 border-2 border-crimson px-5 py-2.5 text-crimson transition-colors hover:bg-crimson hover:text-card"
        >
          Get your own scan
        </Link>
      </main>
    );
  }

  return (
    <main className="flex h-svh flex-col overflow-hidden">
      <header className="shrink-0 px-6 pt-4 pb-1 text-center">
        <p className="eyebrow-wide text-crimson" style={{ fontSize: "0.6rem" }}>
          Harvard within Harvard
        </p>
        <h1
          className="mt-1.5 text-[1.5rem] leading-tight sm:text-[1.8rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The verdict on <em className="text-crimson">{payload.name}</em>
        </h1>
      </header>

      <div className="min-h-0 flex-1">
        <CardCarousel name={payload.name} result={payload.result} />
      </div>

      <div className="shrink-0 pb-1 text-center">
        <Link
          href="/"
          className="eyebrow inline-block rounded-sm bg-crimson px-5 py-1.5 text-card transition-colors hover:bg-crimsondeep"
          style={{ fontSize: "0.6rem" }}
        >
          Scan yourself · $1.50
        </Link>
      </div>
      <p className="shrink-0 px-6 pb-2 text-center text-[0.5rem] leading-tight text-faded/70">
        Satirical public-internet scan. Public info only, not a real measure of
        anything. Not affiliated with Harvard or any final club.
      </p>
    </main>
  );
}
