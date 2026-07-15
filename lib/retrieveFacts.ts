/**
 * Retrieval layer — one web-search call per scan to ground cards in real
 * facts. Abstracted behind retrieveFacts() so the provider can be swapped
 * via SEARCH_PROVIDER without touching the scan pipeline.
 *
 * Supported providers: "tavily" (default), "brave", "serper".
 * A missing/failed search returns [] — the emptiness is the joke, never an
 * error.
 */

import { extractLinkedInUrl, scrapeLinkedIn } from "./linkedin";

export interface FactSnippet {
  title: string;
  snippet: string;
  url: string;
}

export interface Retrieval {
  snippets: FactSnippet[];
  images: string[];
}

const EMPTY: Retrieval = { snippets: [], images: [] };

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function searchTavily(query: string, key: string): Promise<Retrieval> {
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      query,
      max_results: 8,
      // Deep read: advanced search + scraped page bodies, not just snippets.
      search_depth: "advanced",
      include_raw_content: true,
      include_images: true,
    }),
  });
  if (!res.ok) return EMPTY;
  const data = await res.json();
  const snippets = (data.results ?? []).map(
    (r: {
      title?: string;
      content?: string;
      raw_content?: string;
      url?: string;
    }) => ({
      title: r.title ?? "",
      snippet: (r.raw_content || r.content || "").slice(0, 1200),
      url: r.url ?? "",
    })
  );
  // Tavily returns images as URL strings (or {url} objects).
  const images = (data.images ?? [])
    .map((im: string | { url?: string }) => (typeof im === "string" ? im : im?.url))
    .filter(Boolean) as string[];
  return { snippets, images };
}

async function searchBrave(query: string, key: string): Promise<Retrieval> {
  const res = await fetchWithTimeout(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8`,
    { headers: { "X-Subscription-Token": key, Accept: "application/json" } }
  );
  if (!res.ok) return EMPTY;
  const data = await res.json();
  const snippets = (data.web?.results ?? []).map(
    (r: { title?: string; description?: string; url?: string }) => ({
      title: r.title ?? "",
      snippet: r.description ?? "",
      url: r.url ?? "",
    })
  );
  return { snippets, images: [] };
}

async function searchSerper(query: string, key: string): Promise<Retrieval> {
  const res = await fetchWithTimeout("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) return EMPTY;
  const data = await res.json();
  const snippets = (data.organic ?? []).map(
    (r: { title?: string; snippet?: string; link?: string }) => ({
      title: r.title ?? "",
      snippet: r.snippet ?? "",
      url: r.link ?? "",
    })
  );
  return { snippets, images: [] };
}

export async function retrieveFacts(
  name: string,
  context: string
): Promise<Retrieval> {
  const snippets: FactSnippet[] = [];
  const images: string[] = [];

  const liUrl = extractLinkedInUrl(context);
  const key = process.env.SEARCH_API_KEY;

  const provider = (process.env.SEARCH_PROVIDER ?? "tavily").toLowerCase();
  const runOne = (query: string) => {
    switch (provider) {
      case "brave":
        return searchBrave(query, key as string);
      case "serper":
        return searchSerper(query, key as string);
      case "tavily":
      default:
        return searchTavily(query, key as string);
    }
  };

  // 3 web queries (each advanced Tavily search = 2 credits → ~6/scan). Biased
  // toward students, since the subject is almost always a 14–20-year-old — a
  // bare name otherwise surfaces a famous older namesake.
  const ctx = context.slice(0, 140);
  // Quote the name so the search backend treats it as an exact phrase and does
  // NOT autocorrect an uncommon spelling to a common one (e.g. searching
  // "Tarik Syed" otherwise returns results for "Tariq Syed"). Strip any quotes
  // the user typed so we don't break the phrase quoting.
  const q = `"${name.replace(/["]/g, "").trim()}"`;
  const queries = [
    [q, ctx].filter(Boolean).join(" "),
    `${q} student OR college OR "high school" OR university`,
    `${q} LinkedIn`,
  ].filter(Boolean);

  // Run the LinkedIn scrape (authoritative) and the web search concurrently so
  // total retrieval time is bounded by the slower one, not the sum.
  const [li, batches] = await Promise.all([
    liUrl ? scrapeLinkedIn(liUrl).catch(() => null) : Promise.resolve(null),
    key
      ? Promise.all(queries.map((q) => runOne(q).catch(() => EMPTY)))
      : Promise.resolve([] as Retrieval[]),
  ]);

  // LinkedIn goes first — it's authoritative identity.
  if (li && liUrl) {
    snippets.push({
      title: "LinkedIn profile (self-provided, AUTHORITATIVE — this is the subject)",
      snippet: li.text,
      url: liUrl,
    });
    if (li.imageUrl) images.push(li.imageUrl);
  }

  const seen = new Set<string>(snippets.map((s) => s.url || s.title));
  const imgSeen = new Set<string>(images);
  for (const b of batches) {
    for (const snip of b.snippets) {
      const k = snip.url || snip.title;
      if (k && !seen.has(k)) {
        seen.add(k);
        snippets.push(snip);
      }
    }
    for (const img of b.images) {
      if (img && !imgSeen.has(img)) {
        imgSeen.add(img);
        images.push(img);
      }
    }
  }
  return { snippets: snippets.slice(0, 14), images: images.slice(0, 6) };
}
