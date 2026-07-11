import Link from "next/link";
import { decodeSharePayload } from "@/lib/share";
import { CardCarousel } from "@/components/CardCarousel";
import { Disclaimer } from "@/components/Disclaimer";

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
    <main className="flex flex-1 flex-col py-10">
      <header className="px-6 text-center">
        <p className="eyebrow-wide text-crimson">Harvard within Harvard</p>
        <h1
          className="mt-3 text-[1.8rem] leading-tight sm:text-[2.2rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The verdict on <em className="text-crimson">{payload.name}</em>
        </h1>
      </header>

      <div className="mt-8">
        <CardCarousel name={payload.name} result={payload.result} />
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="eyebrow-wide inline-block bg-crimson px-6 py-3.5 text-card transition-colors hover:bg-crimsondeep"
        >
          Scan yourself · $2
        </Link>
      </div>

      <footer className="mt-12">
        <Disclaimer />
      </footer>
    </main>
  );
}
