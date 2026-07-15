import type { Metadata } from "next";
import Link from "next/link";
import { getShare } from "@/lib/shareStore";
import { CardCarousel } from "@/components/CardCarousel";

/** Personalized link preview: name in the title, verdict in the description. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const payload = await getShare(id);
  if (!payload) {
    return { title: "Verdict not found — Harvard within Harvard" };
  }
  const name = payload.name;
  const first = name.split(" ")[0] || name;
  const club = payload.result?.final_club?.club;
  const tagline = payload.result?.tagline;
  const title = `${name} is in the Harvard within Harvard™`;
  const description = [
    tagline ? `${tagline}.` : null,
    club ? `Matched to the ${club}.` : null,
    `See ${first}'s full punch verdict.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Harvard within Harvard",
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

/** Short share link: /share/<id> — loads the stored verdict from KV. */
export default async function ShareByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payload = await getShare(id);

  if (!payload) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow text-crimson">Verdict not found</p>
        <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed">
          This link has expired or never existed. Verdicts are kept for a year.
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
