"use client";

import { useMemo, useState } from "react";

type Scan = {
  id: string;
  createdAt: number;
  email?: string;
  name: string;
  context: string;
  overall: number;
  scores: Record<string, number>;
  club: string;
  accomplishments: string[];
  verdictUrl: string;
};

type SortKey = "createdAt" | "name" | "email" | "overall" | "club";

const SCORE_COLS: { key: string; label: string }[] = [
  { key: "punch_worthiness", label: "Punch" },
  { key: "sellout_index", label: "Sellout" },
  { key: "legacy_multiplier", label: "Legacy" },
  { key: "paper_trail", label: "Paper" },
  { key: "human_moat", label: "Moat" },
  { key: "gunner_rating", label: "Gunner" },
  { key: "certifiably_cracked", label: "Cracked" },
  { key: "final_match", label: "Match" },
];

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<{ col: SortKey; dir: 1 | -1 }>({
    col: "createdAt",
    dir: -1,
  });

  async function load(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/scans", {
        headers: { "x-admin-key": key.trim() },
      });
      if (res.status === 401) throw new Error("Wrong password.");
      if (!res.ok) throw new Error("Failed to load.");
      const data = await res.json();
      setScans(data.scans ?? []);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  const sorted = useMemo(() => {
    const rows = [...scans];
    rows.sort((a, b) => {
      const av = a[sort.col] ?? "";
      const bv = b[sort.col] ?? "";
      if (av < bv) return -1 * sort.dir;
      if (av > bv) return 1 * sort.dir;
      return 0;
    });
    return rows;
  }, [scans, sort]);

  const avg = scans.length
    ? Math.round(scans.reduce((a, s) => a + s.overall, 0) / scans.length)
    : 0;
  const withEmail = scans.filter((s) => s.email).length;

  function th(col: SortKey, label: string) {
    const active = sort.col === col;
    return (
      <th
        onClick={() =>
          setSort((s) =>
            s.col === col ? { col, dir: (s.dir * -1) as 1 | -1 } : { col, dir: -1 }
          )
        }
        className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left font-semibold hover:text-crimson"
      >
        {label} {active ? (sort.dir === 1 ? "▲" : "▼") : ""}
      </th>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-paper px-6">
        <form
          onSubmit={load}
          className="w-full max-w-sm rounded-md border border-cardline bg-card p-6 text-center"
        >
          <p className="eyebrow-wide text-crimson">Harvard within Harvard</p>
          <h1
            className="mt-2 text-[1.6rem]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Scan Database
          </h1>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin password"
            className="mt-4 w-full rounded-md border border-cardline bg-white/80 px-3 py-2.5 outline-none focus:border-crimson"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="eyebrow-wide mt-3 w-full rounded-md bg-crimson py-2.5 text-card transition-colors hover:bg-crimsondeep disabled:opacity-60"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
          {error && <p className="mt-3 text-[0.85rem] text-crimson">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-paper px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-wide text-crimson">Scan Database</p>
            <h1
              className="text-[1.8rem] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {scans.length} entries
            </h1>
            <p className="mt-1 text-[0.85rem] text-faded">
              Avg overall {avg} · {withEmail} with email
            </p>
          </div>
          <a
            href={`/api/admin/scans?format=csv&key=${encodeURIComponent(key)}`}
            className="eyebrow rounded-md border-2 border-crimson px-4 py-2 text-crimson transition-colors hover:bg-crimson hover:text-card"
          >
            Download CSV
          </a>
        </div>

        <div className="mt-5 overflow-x-auto rounded-md border border-cardline bg-card">
          <table className="w-full border-collapse text-[0.8rem]">
            <thead className="border-b border-cardline bg-paper/60 text-faded">
              <tr>
                {th("createdAt", "Date")}
                {th("name", "Name")}
                {th("email", "Email")}
                {th("overall", "Overall")}
                {th("club", "Club")}
                {SCORE_COLS.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-2 py-2 text-right font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-left font-semibold">Context</th>
                <th className="px-3 py-2 text-left font-semibold">Link</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-b border-cardline/60 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-faded">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-medium">{s.name}</td>
                  <td className="whitespace-nowrap px-3 py-2">{s.email || "—"}</td>
                  <td className="px-3 py-2 text-right font-semibold text-crimson">
                    {s.overall}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{s.club}</td>
                  {SCORE_COLS.map((c) => (
                    <td key={c.key} className="px-2 py-2 text-right tabular-nums text-faded">
                      {s.scores?.[c.key] ?? "—"}
                    </td>
                  ))}
                  <td className="max-w-[22rem] px-3 py-2 text-faded">{s.context || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <a
                      href={s.verdictUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crimson underline"
                    >
                      open
                    </a>
                  </td>
                </tr>
              ))}
              {!sorted.length && (
                <tr>
                  <td colSpan={16} className="px-3 py-8 text-center text-faded">
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
