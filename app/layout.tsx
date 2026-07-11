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

export const metadata: Metadata = {
  title: "Get Punched — Harvard within Harvard",
  description:
    "Getting into Harvard was easy. Punch season is the real admissions. A satirical $2 public-internet status scan.",
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
