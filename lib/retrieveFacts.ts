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

async function searchTavily(query: string, key: string): Promise<FactSnippet[]> {
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, max_results: 8, search_depth: "basic" }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map(
    (r: { title?: string; content?: string; url?: string }) => ({
      title: r.title ?? "",
      snippet: r.content ?? "",
      url: r.url ?? "",
    })
  );
}

async function searchBrave(query: string, key: string): Promise<FactSnippet[]> {
  const res = await fetchWithTimeout(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8`,
    { headers: { "X-Subscription-Token": key, Accept: "application/json" } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.web?.results ?? []).map(
    (r: { title?: string; description?: string; url?: string }) => ({
      title: r.title ?? "",
      snippet: r.description ?? "",
      url: r.url ?? "",
    })
  );
}

async function searchSerper(query: string, key: string): Promise<FactSnippet[]> {
  const res = await fetchWithTimeout("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic ?? []).map(
    (r: { title?: string; snippet?: string; link?: string }) => ({
      title: r.title ?? "",
      snippet: r.snippet ?? "",
      url: r.link ?? "",
    })
  );
}

export async function retrieveFacts(
  name: string,
  context: string
): Promise<FactSnippet[]> {
  const key = process.env.SEARCH_API_KEY;
  if (!key) return [];

  const provider = (process.env.SEARCH_PROVIDER ?? "tavily").toLowerCase();
  const query = [name, "Harvard", context.slice(0, 120)].filter(Boolean).join(" ");

  try {
    switch (provider) {
      case "brave":
        return await searchBrave(query, key);
      case "serper":
        return await searchSerper(query, key);
      case "tavily":
      default:
        return await searchTavily(query, key);
    }
  } catch {
    // Thin results are handled downstream ("About 0 results" is the joke).
    return [];
  }
}
