"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search, Zap } from "lucide-react";
import { PAIN_POINT_CATEGORIES, type PainPoint } from "@/lib/engagement/types";
import { AppSelect } from "@/components/ui/AppSelect";

export default function PainPointNavigator() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (q: string, cat: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const res = await fetch(`/api/admin/engagement/pain-points?${params}`);
    const json = await res.json() as { data: PainPoint[] };
    setPainPoints(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search, category), 250);
    return () => clearTimeout(t);
  }, [search, category, load]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const grouped = painPoints.reduce<Record<string, PainPoint[]>>((acc, pp) => {
    (acc[pp.category] ??= []).push(pp);
    return acc;
  }, {});

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (cat: string) =>
    setExpanded((p) => ({ ...p, [cat]: !p[cat] }));

  // Auto-expand all when searching
  useEffect(() => {
    if (search || category) {
      const allExpanded: Record<string, boolean> = {};
      Object.keys(grouped).forEach((c) => (allExpanded[c] = true));
      setExpanded(allExpanded);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, painPoints.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Pain Point Navigator</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">
          Search a phrase from the conversation — &ldquo;inbox&rdquo;, &ldquo;reporting takes days&rdquo;, &ldquo;things fall through gaps&rdquo;.
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a pain point, phrase or symptom…"
              className="w-full rounded-lg border border-[#111111]/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#063b32] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6b62] hover:text-[#111111]"
              >
                ×
              </button>
            )}
          </div>
          <AppSelect
            value={category}
            onChange={setCategory}
            options={PAIN_POINT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            placeholder="All categories"
            size="sm"
            className="min-w-[9rem]"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : painPoints.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-white py-16 text-center">
            <Zap className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm font-semibold text-[#111111]">No pain points found</p>
            <p className="mt-1 text-sm text-[#6f6b62]">Try different words or browse all categories</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Quick result count */}
            {search && (
              <p className="text-sm text-[#6f6b62]">
                {painPoints.length} result{painPoints.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </p>
            )}

            {Object.entries(grouped).map(([cat, items]) => {
              const isExpanded = expanded[cat] ?? !search;
              return (
                <div key={cat} className="rounded-xl border border-[#111111]/10 overflow-hidden">
                  <button
                    onClick={() => toggle(cat)}
                    className="flex w-full items-center justify-between px-5 py-4 bg-[#f7f4ea] hover:bg-[#f0ead8] transition-colors"
                  >
                    <span className="font-semibold text-[#111111] text-sm">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#111111]/10 px-2 py-0.5 text-xs font-semibold text-[#6f6b62]">
                        {items.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#6f6b62]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#6f6b62]" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-white divide-y divide-[#111111]/5">
                      {items.map((pp) => (
                        <Link
                          key={pp.id}
                          href={`/admin/engagement/pain-points/${pp.id}`}
                          className="flex items-start justify-between px-5 py-4 hover:bg-[#f7f4ea] transition-colors group"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">
                              {pp.title}
                            </p>
                            {pp.plain_english_definition && (
                              <p className="mt-0.5 text-sm text-[#6f6b62] line-clamp-1">
                                {pp.plain_english_definition}
                              </p>
                            )}
                            {(pp as PainPoint & { synonyms?: string[] }).synonyms?.length ? (
                              <p className="mt-1 text-xs text-[#6f6b62]/70">
                                Also: {(pp as PainPoint & { synonyms?: string[] }).synonyms?.slice(0, 4).join(", ")}
                              </p>
                            ) : null}
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 mt-1 text-[#6f6b62] group-hover:text-[#063b32] transition-colors" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
