"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, Search } from "lucide-react";
import {
  PAIN_POINT_CATEGORIES,
  type PainPoint, type SectorProfile, type Persona, type VatPrompt,
} from "@/lib/engagement/types";
import { KnowledgeReviewContent } from "../knowledge-review/knowledge-review-content";

type Tab = "sectors" | "personas" | "pain_points" | "vat_prompts" | "knowledge_review";

const TAB_KEYS: Tab[] = ["sectors", "personas", "pain_points", "vat_prompts", "knowledge_review"];

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-[#111111]/15 bg-white px-4 py-2.5 text-left text-sm text-[#111111] outline-none transition-colors hover:border-[#063b32]/40 focus:border-[#063b32]"
      >
        <span className={selected ? "text-[#111111]" : "text-[#6f6b62]"}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value || "__empty"}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${
                value === opt.value ? "bg-[#063b32]/8 font-semibold text-[#063b32]" : "text-[#111111]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KnowledgePageInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("sectors");
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
      const data = json.data || [];
      const unique = data.filter((s, i, a) => a.findIndex((t) => t.name.toLowerCase() === s.name.toLowerCase()) === i);
      setSectors(unique);
    } else if (tab === "personas") {
      const res = await fetch("/api/admin/engagement/personas?limit=50");
      const json = await res.json() as { data: Persona[] };
      const data = json.data || [];
      const unique = data.filter((p, i, a) => a.findIndex((t) => t.persona_name.toLowerCase() === p.persona_name.toLowerCase()) === i);
      setPersonas(unique);
    } else if (tab === "vat_prompts") {
      const params = new URLSearchParams();
      if (dimension) params.set("dimension", dimension);
      const res = await fetch(`/api/admin/engagement/vat-prompts?${params}&limit=100`);
      const json = await res.json() as { data: VatPrompt[] };
      const data = json.data || [];
      const unique = data.filter((p, i, a) => a.findIndex((t) => `${t.prompt.toLowerCase()}|${t.dimension}` === `${p.prompt.toLowerCase()}|${p.dimension}`) === i);
      setVatPrompts(unique);
    }
    setLoading(false);
  }, [tab, search, category, dimension]);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => { inputRef.current?.focus(); }, [tab]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && TAB_KEYS.includes(urlTab as Tab)) setTab(urlTab as Tab);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs at top right, above the Client Engagement / Knowledge Hub section, exactly like content page */}
      <div className="sticky top-0 z-30 border-b border-[#111111]/10 bg-white px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-[#111111]">Knowledge</span>
          <div className="ml-3 flex overflow-hidden rounded-lg border border-[#111111]/15">
            {([
              ["sectors", "Sectors"],
              ["personas", "Personas"],
              ["pain_points", "Pain points"],
              ["vat_prompts", "VAT prompts"],
              ["knowledge_review", "Knowledge Review"],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSearch(""); setCategory(""); setDimension(""); }}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                  tab === key ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">{tab === "sectors" ? "Sectors" : tab === "personas" ? "Personas" : tab === "pain_points" ? "Pain Points" : tab === "vat_prompts" ? "VAT Prompts" : "Knowledge Review"}</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">{tab === "sectors" ? "Browse sector profiles for industry context and pressures." : tab === "personas" ? "Explore typical client personas and their needs." : tab === "pain_points" ? "Browse pain points by category with counts and details." : tab === "vat_prompts" ? "View VAT prompts by dimension for relevant insights." : "Review and approve AI-generated draft pain points before they enter the knowledge library."}</p>
      </div>

      <div className="px-8 py-6">
        {/* Search + filters */}
        {tab !== "knowledge_review" && (
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
              <CustomSelect
                value={category}
                onChange={setCategory}
                placeholder="All categories"
                className="w-48"
                options={[
                  { value: "", label: "All categories" },
                  ...PAIN_POINT_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
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
        )}

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
                <div className="space-y-3">
                  {Object.entries(
                    painPoints.reduce<Record<string, PainPoint[]>>((acc, pp) => {
                      (acc[pp.category] ??= []).push(pp);
                      return acc;
                    }, {})
                  ).map(([cat, items]) => (
                    <div key={cat} className="rounded-xl border border-[#111111]/10 overflow-hidden">
                      <div className="flex w-full items-center justify-between px-5 py-4 bg-[#f7f4ea]">
                        <span className="font-semibold text-[#111111] text-sm">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#111111]/10 px-2 py-0.5 text-xs font-semibold text-[#6f6b62]">
                            {items.length}
                          </span>
                        </div>
                      </div>
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
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-[#6f6b62] group-hover:text-[#063b32] transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
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
            {tab === "knowledge_review" && <KnowledgeReviewContent />}
          </>
        )}
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white px-8 py-16 text-sm text-[#6f6b62]">Loading knowledge hub…</div>}>
      <KnowledgePageInner />
    </Suspense>
  );
}
