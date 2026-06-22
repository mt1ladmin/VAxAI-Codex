"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import {
  BADGE_COLORS, PAIN_POINT_CATEGORIES,
  type PainPoint, type SectorProfile, type Persona, type VatPrompt,
} from "@/lib/engagement/types";

type Tab = "pain_points" | "sectors" | "personas" | "vat_prompts";

export default function KnowledgePage() {
  const [tab, setTab] = useState<Tab>("pain_points");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dimension, setDimension] = useState("");
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [sectors, setSectors] = useState<SectorProfile[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [vatPrompts, setVatPrompts] = useState<VatPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "pain_points") {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      const res = await fetch(`/api/admin/engagement/pain-points?${params}&limit=100`);
      const json = await res.json() as { data: PainPoint[] };
      setPainPoints(json.data || []);
    } else if (tab === "sectors") {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/engagement/sectors?${params}&limit=50`);
      const json = await res.json() as { data: SectorProfile[] };
      setSectors(json.data || []);
    } else if (tab === "personas") {
      const res = await fetch("/api/admin/engagement/personas?limit=50");
      const json = await res.json() as { data: Persona[] };
      setPersonas(json.data || []);
    } else if (tab === "vat_prompts") {
      const params = new URLSearchParams();
      if (dimension) params.set("dimension", dimension);
      const res = await fetch(`/api/admin/engagement/vat-prompts?${params}&limit=100`);
      const json = await res.json() as { data: VatPrompt[] };
      setVatPrompts(json.data || []);
    }
    setLoading(false);
  }, [tab, search, category, dimension]);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => { inputRef.current?.focus(); }, [tab]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Knowledge Library</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Browse pain points, sector profiles, personas and VAT prompts.</p>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#111111]/10 mb-6">
          {([
            ["pain_points", "Pain points"],
            ["sectors", "Sectors"],
            ["personas", "Personas"],
            ["vat_prompts", "VAT prompts"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearch(""); setCategory(""); setDimension(""); }}
              className={`-mb-px px-5 py-2.5 text-sm font-semibold transition-colors ${
                tab === key ? "border-b-2 border-[#063b32] text-[#063b32]" : "text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex gap-3 mb-5">
          {tab !== "vat_prompts" && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === "pain_points" ? "Search pain points…" : tab === "sectors" ? "Search sectors…" : "Search…"}
                className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
              />
            </div>
          )}
          {tab === "pain_points" && (
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
              <option value="">All categories</option>
              {PAIN_POINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {tab === "vat_prompts" && (
            <div className="flex gap-2">
              {(["value", "alignment", "trust"] as const).map((dim) => (
                <button
                  key={dim}
                  onClick={() => setDimension(dimension === dim ? "" : dim)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                    dimension === dim
                      ? dim === "value" ? "bg-[#063b32] text-white" : dim === "alignment" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                      : "border border-[#111111]/15 text-[#6f6b62] hover:text-[#111111]"
                  }`}
                >
                  {dim}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : (
          <>
            {/* PAIN POINTS */}
            {tab === "pain_points" && (
              painPoints.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
                  <p className="text-sm text-[#6f6b62]">No pain points found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {painPoints.map((pp) => (
                    <Link
                      key={pp.id}
                      href={`/admin/engagement/pain-points/${pp.id}`}
                      className="rounded-xl border border-[#111111]/10 bg-white p-5 hover:border-[#063b32]/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">{pp.category}</p>
                          <p className="font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">{pp.title}</p>
                          {pp.plain_english_definition && (
                            <p className="mt-1 text-sm text-[#6f6b62] line-clamp-2">{pp.plain_english_definition}</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-[#6f6b62] group-hover:text-[#063b32]" />
                      </div>
                      {pp.risk_sensitivity && pp.risk_sensitivity !== "Standard" && (
                        <div className="mt-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${BADGE_COLORS[pp.risk_sensitivity] || "bg-gray-100 text-gray-600"}`}>
                            {pp.risk_sensitivity}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* SECTORS */}
            {tab === "sectors" && (
              sectors.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No sectors found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sectors.map((s) => (
                    <Link
                      key={s.id}
                      href={`/admin/engagement/knowledge/sectors/${s.id}`}
                      className="rounded-xl border border-[#111111]/10 bg-white p-5 hover:border-[#063b32]/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">{s.name}</p>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#6f6b62] group-hover:text-[#063b32]" />
                      </div>
                      {s.description && <p className="text-sm text-[#6f6b62] line-clamp-2">{s.description}</p>}
                      {s.common_admin_pressures && s.common_admin_pressures.length > 0 && (
                        <p className="mt-3 text-xs text-[#6f6b62]">
                          {s.common_admin_pressures.slice(0, 2).join(" · ")}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* PERSONAS */}
            {tab === "personas" && (
              personas.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No personas found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {personas.map((p) => (
                    <div key={p.id} className="rounded-xl border border-[#111111]/10 bg-white p-5">
                      <p className="font-semibold text-[#111111]">{p.persona_name}</p>
                      {p.typical_role && <p className="mt-0.5 text-sm text-[#6f6b62]">{p.typical_role}</p>}
                      {p.goals && p.goals.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Goals</p>
                          <ul className="space-y-0.5">
                            {p.goals.slice(0, 3).map((g, i) => (
                              <li key={i} className="text-xs text-[#111111] before:content-['·'] before:mr-1.5 before:text-[#6f6b62]">{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {p.likely_concerns && p.likely_concerns.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Likely concerns</p>
                          <ul className="space-y-0.5">
                            {p.likely_concerns.slice(0, 2).map((c, i) => (
                              <li key={i} className="text-xs text-[#111111] before:content-['·'] before:mr-1.5 before:text-[#6f6b62]">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* VAT PROMPTS */}
            {tab === "vat_prompts" && (
              vatPrompts.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No prompts found.</div>
              ) : (
                <div className="space-y-3">
                  {(["value", "alignment", "trust"] as const)
                    .filter((dim) => !dimension || dimension === dim)
                    .map((dim) => {
                      const dimPrompts = vatPrompts.filter((p) => p.dimension === dim);
                      if (dimPrompts.length === 0) return null;
                      return (
                        <div key={dim} className="rounded-xl border border-[#111111]/10 overflow-hidden">
                          <div className={`px-5 py-3 ${dim === "value" ? "bg-[#063b32]/8" : dim === "alignment" ? "bg-blue-50" : "bg-amber-50"}`}>
                            <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${dim === "value" ? "text-[#063b32]" : dim === "alignment" ? "text-blue-700" : "text-amber-700"}`}>
                              {dim} ({dimPrompts.length})
                            </p>
                          </div>
                          <div className="divide-y divide-[#111111]/5">
                            {dimPrompts.map((p) => (
                              <div key={p.id} className="px-5 py-3.5">
                                <p className="text-sm text-[#111111]">{p.prompt}</p>
                                {p.context_tags && p.context_tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {p.context_tags.map((tag) => (
                                      <span key={tag} className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] text-[#6f6b62]">{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
