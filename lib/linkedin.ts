/**
 * LinkedIn enrichment. When someone drops a LinkedIn URL into the additional-
 * info box, we scrape that profile and treat it as AUTHORITATIVE identity — the
 * single strongest signal for grounding the scan and killing the wrong-person
 * problem (we now know exactly who they are, plus a reliable headshot).
 *
 * Provider-agnostic: set LINKEDIN_API_KEY (+ optional LINKEDIN_API_URL). The
 * default request shape targets a Proxycurl-style GET endpoint
 * (?url=<profile>&Authorization: Bearer <key>); swap LINKEDIN_API_URL / the
 * auth style to match whatever scraper you plug in. No key = no-op (the URL
 * still reaches the model as plain text via the context).
 */

const LINKEDIN_URL_RE =
  /https?:\/\/([\w-]+\.)*linkedin\.com\/(in|pub)\/[A-Za-z0-9\-_%.]+/i;

/** Pull a linkedin.com/in/... URL out of free text (the context box). */
export function extractLinkedInUrl(text: string | undefined): string | null {
  if (!text) return null;
  const m = text.match(LINKEDIN_URL_RE);
  return m ? m[0].replace(/[.,)\]]+$/, "") : null;
}

export interface LinkedInData {
  /** Flattened profile text to feed the model as an authoritative snippet. */
  text: string;
  /** Profile photo, if the provider returns one. */
  imageUrl?: string;
}

export function linkedInConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_API_KEY);
}

export async function scrapeLinkedIn(url: string): Promise<LinkedInData | null> {
  const key = process.env.LINKEDIN_API_KEY;
  if (!key) return null;
  const endpoint =
    process.env.LINKEDIN_API_URL || "https://nubela.co/proxycurl/api/v2/linkedin";

  try {
    const res = await fetch(
      `${endpoint}?url=${encodeURIComponent(url)}&use_cache=if-present`,
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(12000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;

    // Provider-agnostic: hand the model the raw JSON (capped) plus try a few
    // common field names for the photo.
    const imageUrl =
      (data.profile_pic_url as string) ||
      (data.profilePicture as string) ||
      (data.profile_picture as string) ||
      (data.photo_url as string) ||
      (data.avatar as string) ||
      undefined;

    return { text: JSON.stringify(data).slice(0, 3500), imageUrl };
  } catch {
    return null;
  }
}
