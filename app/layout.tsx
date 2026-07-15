import type { Metadata } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  IBM_Plex_Mono,
  Caveat,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

// Canonical site URL for absolute OG/Twitter image links. Prefers the custom
// domain (NEXT_PUBLIC_BASE_URL), falls back to the Vercel production URL, then
// the vercel.app alias — so the share image always resolves to a live host.
const SITE =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://get-punched.vercel.app");

const OG_TITLE = "Are you in the Harvard within Harvard™?";
const OG_DESC =
  "Getting in was easy. Punch season is the real admissions. Get scanned against final-club status culture and see where you actually land.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Harvard within Harvard — The Punch Scan",
  description:
    "You got into Harvard. But are you in the Harvard within Harvard? A satirical $1.50 scan of where you land in final-club status culture.",
  openGraph: {
    type: "website",
    siteName: "Harvard within Harvard",
    title: OG_TITLE,
    description: OG_DESC,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Harvard within Harvard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="paper-grain min-h-full flex flex-col">
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
