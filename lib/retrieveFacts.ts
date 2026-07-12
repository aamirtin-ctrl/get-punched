/**
 * Retrieval layer — one web-search call per scan to ground cards in real
 * facts. Abstracted behind retrieveFacts() so the provider can be swapped
 * via SEARCH_PROVIDER without touching the scan pipeline.
 *
 * Supported providers: "tavily" (default), "brave", "serper".
 * A missing/failed search returns [] — the emptiness is the joke, never an
 * error.
 */

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
  const key = process.env.SEARCH_API_KEY;
  if (!key) return EMPTY;

  const provider = (process.env.SEARCH_PROVIDER ?? "tavily").toLowerCase();
  const runOne = (query: string) => {
    switch (provider) {
      case "brave":
        return searchBrave(query, key);
      case "serper":
        return searchSerper(query, key);
      case "tavily":
      default:
        return searchTavily(query, key);
    }
  };

  // Several targeted angles for a genuinely deep read of the person, rather
  // than one generic query. We do NOT force "Harvard" into the search — that
  // biases away from finding who they actually are.
  const ctx = context.slice(0, 140);
  const queries = [
    [name, ctx].filter(Boolean).join(" "),
    `${name} LinkedIn`,
    `${name} founder OR startup OR project`,
    ctx ? `${name} ${ctx} interview OR profile` : "",
    `${name} headshot OR photo`,
  ].filter(Boolean);

  try {
    const batches = await Promise.all(
      queries.map((q) => runOne(q).catch(() => EMPTY))
    );
    // Merge + dedupe snippets by URL; merge + dedupe image URLs.
    const seen = new Set<string>();
    const snippets: FactSnippet[] = [];
    const imgSeen = new Set<string>();
    const images: string[] = [];
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
  } catch {
    // Thin results are handled downstream ("About 0 results" is the joke).
    return EMPTY;
  }
}
