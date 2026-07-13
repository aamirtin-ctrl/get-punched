/**
 * LinkedIn enrichment via Bright Data. When someone drops a LinkedIn URL into
 * the additional-info box, we scrape that profile and treat it as AUTHORITATIVE
 * identity — the strongest signal for grounding the scan, getting a reliable
 * headshot, and killing the wrong-person problem.
 *
 * Bright Data "LinkedIn People Profile" scraper, synchronous endpoint:
 *   POST https://api.brightdata.com/datasets/v3/scrape
 *        ?dataset_id=<id>&format=json
 *   Authorization: Bearer <LINKEDIN_API_KEY>
 *   body: [{ "url": "https://www.linkedin.com/in/..." }]
 *
 * Env: LINKEDIN_API_KEY (Bright Data token). Optional overrides:
 *   BRIGHTDATA_DATASET_ID (default gd_l1viktl72bvl7bjuj0)
 *   LINKEDIN_API_URL (full endpoint override).
 * No key = no-op (the URL still reaches the model as plain context text).
 */

const LINKEDIN_URL_RE =
  /https?:\/\/([\w-]+\.)*linkedin\.com\/(in|pub)\/[A-Za-z0-9\-_%.]+/i;

const DEFAULT_DATASET = "gd_l1viktl72bvl7bjuj0";
// Bright Data live scrapes take a while; cap so the whole scan stays under the
// 60s function limit. If it doesn't finish in time we degrade to web + context.
const TIMEOUT_MS = 38000;

export function extractLinkedInUrl(text: string | undefined): string | null {
  if (!text) return null;
  const m = text.match(LINKEDIN_URL_RE);
  return m ? m[0].replace(/[.,)\]]+$/, "") : null;
}

export interface LinkedInData {
  text: string;
  imageUrl?: string;
}

export function linkedInConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_API_KEY);
}

export async function scrapeLinkedIn(url: string): Promise<LinkedInData | null> {
  const key = process.env.LINKEDIN_API_KEY;
  if (!key) return null;

  const datasetId = process.env.BRIGHTDATA_DATASET_ID || DEFAULT_DATASET;
  const endpoint =
    process.env.LINKEDIN_API_URL ||
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}&format=json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ url }]),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const data = await res.json();
    // Bright Data returns an array of profile objects (one per input URL).
    const profile = (Array.isArray(data) ? data[0] : data) as
      | Record<string, unknown>
      | undefined;
    if (!profile || typeof profile !== "object" || "error" in profile) {
      return null;
    }

    const imageUrl =
      (profile.avatar as string) ||
      (profile.profile_image_url as string) ||
      (profile.profile_pic_url as string) ||
      (profile.image as string) ||
      undefined;

    // Feed the whole profile JSON to the model (capped); the exact field names
    // don't matter for grounding, only that it's the real person.
    return { text: JSON.stringify(profile).slice(0, 3500), imageUrl };
  } catch {
    return null;
  }
}
