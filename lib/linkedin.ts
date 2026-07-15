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

    // `default_avatar: true` means the "photo" is LinkedIn's gray silhouette
    // placeholder, not a real headshot — don't pass it off as their face.
    const imageUrl =
      profile.default_avatar === true
        ? undefined
        : (profile.avatar as string) ||
          (profile.profile_image_url as string) ||
          (profile.profile_pic_url as string) ||
          (profile.image as string) ||
          undefined;

    return { text: summarizeProfile(profile), imageUrl };
  } catch {
    return null;
  }
}

const s = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? (v as Record<string, unknown>[]) : [];

/**
 * Distill the raw Bright Data profile down to the high-signal identity fields
 * the scan actually grounds on. Dumping the full JSON (~20k chars) and slicing
 * to a budget drops experience/education behind bulky `about`/`posts`; a curated
 * summary keeps the useful bits and stays well under the model budget.
 */
function summarizeProfile(p: Record<string, unknown>): string {
  const lines: string[] = [];
  const push = (label: string, val: string) => {
    if (val) lines.push(`${label}: ${val}`);
  };

  push("Name", s(p.name) || `${s(p.first_name)} ${s(p.last_name)}`.trim());
  push("Headline", s(p.position));
  push("Location", s(p.location) || s(p.city));

  const cc = (p.current_company as Record<string, unknown>) || {};
  const ccName = s(cc.name) || s(p.current_company_name);
  if (ccName) push("Current", `${s(cc.title) || "—"} at ${ccName}`.trim());

  const followers = Number(p.followers);
  if (Number.isFinite(followers) && followers > 0)
    push("Followers", followers.toLocaleString("en-US"));

  push("About", s(p.about).slice(0, 700));

  const edu =
    arr(p.education)
      .slice(0, 4)
      .map((e) => {
        const yr = [s(e.start_year), s(e.end_year)].filter(Boolean).join("–");
        return `${s(e.title)}${yr ? ` (${yr})` : ""}`;
      })
      .filter((x) => x.replace(/[()–\s]/g, ""))
      .join("; ") || s(p.educations_details);
  push("Education", edu);

  const exp = arr(p.experience)
    .slice(0, 6)
    .map((e) => {
      const dates = [s(e.start_date), s(e.end_date)].filter(Boolean).join("–");
      return `- ${s(e.title)}${e.company ? ` at ${s(e.company)}` : ""}${
        dates ? ` (${dates})` : ""
      }`;
    })
    .filter((x) => x.replace(/[-\s]/g, ""));
  if (exp.length) lines.push("Experience:\n" + exp.join("\n"));

  const honors = arr(p.honors_and_awards)
    .slice(0, 5)
    .map((h) => s(h.title) || s(h.name))
    .filter(Boolean)
    .join("; ");
  push("Honors", honors);

  return lines.join("\n").slice(0, 3500);
}
