import { SCAN_SYSTEM_PROMPT, scanPromptIsPlaceholder } from "./scanPrompt";
import { retrieveFacts } from "./retrieveFacts";
import { mockScan } from "./mockScan";
import { seededScanFor } from "./seededScans";
import type { CutRound, Difficulty, ScanResult } from "./types";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

/** Strip markdown code fences and grab the outermost JSON object. */
function extractJson(text: string): string {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end > start) t = t.slice(start, end + 1);
  return t;
}

const clamp = (n: unknown, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));

const str = (v: unknown, fallback = "") =>
  typeof v === "string" ? v : fallback;

const CUT_ROUNDS: CutRound[] = [
  "cocktail",
  "outing",
  "date_event",
  "final_dinner",
  "punched",
  "none",
];
const DIFFICULTIES: Difficulty[] = ["EASY", "NORMAL", "HARD", "NIGHTMARE"];

/**
 * Coerce whatever the model returned into a fully-populated ScanResult.
 * Missing pieces get filled from the mock so a card never renders blank.
 */
function normalize(raw: unknown, name: string): ScanResult {
  const fallback = mockScan(name);
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, Record<string, unknown>>;

  const section = <K extends keyof ScanResult>(key: K) =>
    (r[key] && typeof r[key] === "object" ? r[key] : {}) as Record<string, unknown>;

  const pw = section("punch_worthiness");
  const si = section("sellout_index");
  const lm = section("legacy_multiplier");
  const pt = section("paper_trail");
  const hm = section("human_moat");
  const gr = section("gunner_rating");
  const cc = section("certifiably_cracked");
  const fc = section("final_club");
  const top = raw as Record<string, unknown>;

  const evidence = Array.isArray(top.evidence)
    ? (top.evidence as unknown[])
        .slice(0, 5)
        .map((e) => {
          const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
          return { category: str(o.category), title: str(o.title), detail: str(o.detail) };
        })
        .filter((x) => x.title)
    : fallback.evidence;
  const lk = (fc.lookalike as Record<string, unknown> | undefined) ?? {};

  return {
    tagline: str(top.tagline) || fallback.tagline,
    web_summary: str(top.web_summary) || fallback.web_summary,
    wrong_person: top.wrong_person === true,
    evidence,
    punch_worthiness: {
      score: clamp(pw.score ?? fallback.punch_worthiness.score),
      cut_round: CUT_ROUNDS.includes(pw.cut_round as CutRound)
        ? (pw.cut_round as CutRound)
        : fallback.punch_worthiness.cut_round,
      label: str(pw.label, fallback.punch_worthiness.label),
      roast: str(pw.roast, fallback.punch_worthiness.roast),
      why: str(pw.why, fallback.punch_worthiness.why),
    },
    sellout_index: {
      score: clamp(si.score ?? fallback.sellout_index.score),
      label: str(si.label, fallback.sellout_index.label),
      why: str(si.why, fallback.sellout_index.why),
    },
    legacy_multiplier: {
      score: clamp(lm.score ?? fallback.legacy_multiplier.score),
      difficulty: DIFFICULTIES.includes(lm.difficulty as Difficulty)
        ? (lm.difficulty as Difficulty)
        : fallback.legacy_multiplier.difficulty,
      label: str(lm.label, fallback.legacy_multiplier.label),
      why: str(lm.why, fallback.legacy_multiplier.why),
    },
    paper_trail: {
      score: clamp(pt.score ?? fallback.paper_trail.score),
      label: str(pt.label, fallback.paper_trail.label),
      notes: Array.isArray(pt.notes)
        ? pt.notes.slice(0, 3).map((n) => str(n)).filter(Boolean)
        : fallback.paper_trail.notes,
      why: str(pt.why, fallback.paper_trail.why),
    },
    human_moat: {
      score: clamp(hm.score ?? fallback.human_moat.score),
      label: str(hm.label, fallback.human_moat.label),
      why: str(hm.why, fallback.human_moat.why),
    },
    gunner_rating: {
      score: clamp(gr.score ?? fallback.gunner_rating.score),
      label: str(gr.label, fallback.gunner_rating.label),
      why: str(gr.why, fallback.gunner_rating.why),
    },
    certifiably_cracked: {
      score: clamp(cc.score ?? fallback.certifiably_cracked.score),
      label: str(cc.label, fallback.certifiably_cracked.label),
      why: str(cc.why, fallback.certifiably_cracked.why),
    },
    final_club: {
      club: str(fc.club, fallback.final_club.club),
      match_pct: clamp(fc.match_pct ?? fallback.final_club.match_pct),
      odds_pct: clamp(fc.odds_pct ?? fallback.final_club.odds_pct),
      traits: Array.isArray(fc.traits)
        ? fc.traits.slice(0, 4).map((t) => str(t)).filter(Boolean)
        : fallback.final_club.traits,
      line: str(fc.line, fallback.final_club.line),
      lookalike: {
        name: str(lk.name, fallback.final_club.lookalike.name),
        line: str(lk.line, fallback.final_club.lookalike.line),
        pct:
          typeof lk.pct === "number"
            ? clamp(lk.pct)
            : fallback.final_club.lookalike.pct ??
              clamp(fc.match_pct ?? fallback.final_club.match_pct),
      },
    },
  };
}

/** Thrown when Prompt B returns "refused": true — the route maps this to the generic guardrail message. */
export class ScanRefusedError extends Error {
  constructor() {
    super("scan refused");
    this.name = "ScanRefusedError";
  }
}

/** Google Gemini — the default engine. Forces JSON output. */
async function callGemini(key: string, userContent: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SCAN_SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        generationConfig: {
          temperature: 1,
          maxOutputTokens: 8000,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** Anthropic — used if ANTHROPIC_API_KEY is set and no Gemini key is present. */
async function callAnthropic(key: string, userContent: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.SCAN_MODEL || DEFAULT_MODEL,
      max_tokens: 3000,
      system: SCAN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

export async function runScan(
  name: string,
  context: string
): Promise<{ result: ScanResult; factCount: number }> {
  const { snippets, images } = await retrieveFacts(name, context);
  const scrapedImage = images[0];

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const useMock =
    process.env.MOCK_SCAN === "1" ||
    (!geminiKey && !anthropicKey) ||
    scanPromptIsPlaceholder();

  if (useMock) {
    // Free test path: hand-authored seeds for known names, generic mock
    // otherwise. Only attach a scraped photo to a KNOWN seed (a famous person
    // whose top image is reliably them) — never to the generic fixture, or
    // you get a stranger's face on someone else's cards.
    const seeded = seededScanFor(name);
    const base = seeded ?? mockScan(name);
    const result = {
      ...base,
      image_url: base.image_url ?? (seeded ? scrapedImage : undefined),
    };
    return {
      result,
      factCount: seeded ? Math.max(snippets.length, 6) : snippets.length,
    };
  }

  const userContent = JSON.stringify({
    name,
    context,
    snippets: snippets.map((f) => `${f.title}: ${f.snippet}`),
  });

  try {
    const text = geminiKey
      ? await callGemini(geminiKey, userContent)
      : await callAnthropic(anthropicKey as string, userContent);
    const parsed = JSON.parse(extractJson(text));
    if (parsed && typeof parsed === "object" && parsed.refused === true) {
      throw new ScanRefusedError();
    }
    const norm = normalize(parsed, name);
    // Only show the scraped photo when the model is confident the scrape is
    // actually about this person (not a famous namesake).
    const result = {
      ...norm,
      image_url: norm.wrong_person ? undefined : scrapedImage,
    };
    return { result, factCount: norm.wrong_person ? 0 : snippets.length };
  } catch (err) {
    if (err instanceof ScanRefusedError) throw err;
    // Generation failed — fall back to a seed if we have one, else the generic
    // fixture. Do NOT attach the scraped image: the cards are generic, so a
    // real photo would just be a mismatched stranger.
    const seeded = seededScanFor(name);
    const base = seeded ?? mockScan(name);
    return {
      result: { ...base, image_url: base.image_url },
      factCount: seeded ? Math.max(snippets.length, 6) : 0,
    };
  }
}
