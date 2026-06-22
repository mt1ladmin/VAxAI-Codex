"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import {
  BADGE_COLORS, PAIN_POINT_CATEGORIES,
  type PainPoint, type SectorProfile, type Persona, type VatPrompt,
} from "@/lib/engagement/types";
import KnowledgeReviewPage from "../knowledge-review/page";

type Tab = "prospect_prep" | "sectors" | "personas" | "pain_points" | "vat_prompts" | "knowledge_review" | "prospect_prep_history";

export default function KnowledgePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("prospect_prep");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dimension, setDimension] = useState("");
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [sectors, setSectors] = useState<SectorProfile[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [vatPrompts, setVatPrompts] = useState<VatPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prospect Prep states (client-side, no LLM)
  const [clientType, setClientType] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [prepNotes, setPrepNotes] = useState("");
  const [prepName, setPrepName] = useState("");
  const [prepResults, setPrepResults] = useState<any>(null);
  const [savedPreps, setSavedPreps] = useState<any[]>([]);
  const [historyViewPrep, setHistoryViewPrep] = useState<{ prep: any; index: number } | null>(null);

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
    } else if (tab === "prospect_prep") {
      // Preload data for quick prep (no LLM)
      if (sectors.length === 0) {
        const res = await fetch(`/api/admin/engagement/sectors?limit=50`);
        const json = await res.json() as { data: SectorProfile[] };
        const data = json.data || [];
        const unique = data.filter((s, i, a) => a.findIndex((t) => t.name.toLowerCase() === s.name.toLowerCase()) === i);
        setSectors(unique);
      }
      if (personas.length === 0) {
        const res = await fetch("/api/admin/engagement/personas?limit=50");
        const json = await res.json() as { data: Persona[] };
        const data = json.data || [];
        const unique = data.filter((p, i, a) => a.findIndex((t) => t.persona_name.toLowerCase() === p.persona_name.toLowerCase()) === i);
        setPersonas(unique);
      }
      if (painPoints.length === 0) {
        const res = await fetch(`/api/admin/engagement/pain-points?limit=100`);
        const json = await res.json() as { data: PainPoint[] };
        setPainPoints(json.data || []);
      }
      if (vatPrompts.length === 0) {
        const res = await fetch(`/api/admin/engagement/vat-prompts?limit=100`);
        const json = await res.json() as { data: VatPrompt[] };
        setVatPrompts(json.data || []);
      }
    }
    setLoading(false);
  }, [tab, search, category, dimension]);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => { inputRef.current?.focus(); }, [tab]);

  useEffect(() => {
    const saved = localStorage.getItem('prospectPreps');
    if (saved) setSavedPreps(JSON.parse(saved));
  }, []);

  // When arriving back or prep changes, sync a friendly name default for the form if building
  useEffect(() => {
    if (prepResults && !prepName) {
      setPrepName((clientType || prepResults.name || "Prospect Prep").slice(0, 70));
    }
  }, [prepResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildPrep = () => {
    const sector = sectors.find((s) => s.id === selectedSectorId);
    const persona = personas.find((p) => p.id === selectedPersonaId);
    const keywords = (clientType + " " + prepNotes).toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const relevantPains = painPoints
      .filter((pp) => {
        const text = [pp.title, pp.plain_english_definition, ...(pp.what_person_says || [])].join(" ").toLowerCase();
        const sectorMatch = sector && pp.relevant_sectors && pp.relevant_sectors.some((rs: string) => rs.toLowerCase().includes(sector.name.toLowerCase()));
        const keywordMatch = keywords.some((k) => text.includes(k));
        return sectorMatch || keywordMatch;
      })
      .slice(0, 5);
    const relevantVats = vatPrompts
      .filter((v) => {
        const text = [v.prompt, ...(v.context_tags || [])].join(" ").toLowerCase();
        const sectorMatch = sector && v.context_tags && v.context_tags.some((t: string) => t.toLowerCase().includes(sector.name.toLowerCase()));
        const keywordMatch = keywords.some((k) => text.includes(k));
        return sectorMatch || keywordMatch;
      })
      .slice(0, 5);
    const results = {
      sector,
      persona,
      relevantPains,
      relevantVats,
      clientType,
      prepNotes,
      keywords,
    };
    setPrepResults(results);
    if (!prepName) {
      setPrepName((clientType || "Prospect Prep").slice(0, 70));
    }
  };

  const savePrep = (customName?: string) => {
    if (!prepResults) return;
    const name = (customName || prepName || clientType || "").slice(0, 80) || "Prep " + new Date().toLocaleDateString();
    const newPrep = {
      id: Date.now().toString(),
      name,
      ...prepResults,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPrep, ...savedPreps].slice(0, 20);
    setSavedPreps(updated);
    localStorage.setItem("prospectPreps", JSON.stringify(updated));
    localStorage.setItem("currentProspectPrep", JSON.stringify(newPrep));
    setPrepName(name);
    return newPrep;
  };

  const updateSavedPrep = (index: number, updates: Partial<any>) => {
    const updated = savedPreps.map((p, i) => (i === index ? { ...p, ...updates } : p));
    setSavedPreps(updated);
    localStorage.setItem("prospectPreps", JSON.stringify(updated));
    const merged = { ...savedPreps[index], ...updates };
    if (historyViewPrep?.index === index) {
      setHistoryViewPrep({ prep: merged, index });
    }
    return merged;
  };

  const attachPrep = (prep: any, isUnsavedBuild = false) => {
    let toAttach = prep;
    if (isUnsavedBuild) {
      const shouldSave = window.confirm("Save this prep to Prospect Prep History first (recommended for your records)?");
      if (shouldSave) {
        const nameInput = window.prompt("Name for this saved prep:", prepName || clientType?.slice(0, 60) || "Quick Prospect Prep");
        const saved = savePrep(nameInput || undefined);
        if (saved) toAttach = saved;
      } else {
        toAttach = {
          ...prep,
          name: prepName || clientType?.slice(0, 60) || "Unsaved prep",
        };
      }
    }
    localStorage.setItem("currentProspectPrep", JSON.stringify(toAttach));
    router.push("/admin/engagement/live-call");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs at top right, above the Client Engagement / Knowledge Hub section, exactly like content page */}
      <div className="sticky top-0 z-30 border-b border-[#111111]/10 bg-white px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-[#111111]">Knowledge</span>
          <div className="ml-3 flex overflow-hidden rounded-lg border border-[#111111]/15">
            {([
              ["prospect_prep", "Prospect Prep"],
              ["sectors", "Sectors"],
              ["personas", "Personas"],
              ["pain_points", "Pain points"],
              ["vat_prompts", "VAT prompts"],
              ["knowledge_review", "Knowledge Review"],
              ["prospect_prep_history", "Prospect Prep History"],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSearch(""); setCategory(""); setDimension(""); setHistoryViewPrep(null); }}
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

      {tab !== "prospect_prep" && (
        <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#111111]">{tab === "sectors" ? "Sectors" : tab === "personas" ? "Personas" : tab === "pain_points" ? "Pain Points" : tab === "vat_prompts" ? "VAT Prompts" : tab === "knowledge_review" ? "Knowledge Review" : "Prospect Prep History"}</h1>
          <p className="mt-0.5 text-sm text-[#6f6b62]">{tab === "sectors" ? "Browse sector profiles for industry context and pressures." : tab === "personas" ? "Explore typical client personas and their needs." : tab === "pain_points" ? "Browse pain points by category with counts and details." : tab === "vat_prompts" ? "View VAT prompts by dimension for relevant insights." : tab === "knowledge_review" ? "Review and approve AI-generated draft pain points before they enter the knowledge library." : "Your saved prospect preps. View, attach directly to a live call, or delete. Saved preps appear here for history and reuse."}</p>
        </div>
      )}

      <div className="px-8 py-6">
        {/* Search + filters */}
        {tab !== "knowledge_review" && tab !== "prospect_prep" && tab !== "prospect_prep_history" && (
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
            {tab === "knowledge_review" && (
              <div className="[&>div>div:first-child]:hidden">
                <KnowledgeReviewPage />
              </div>
            )}
            {tab === "prospect_prep" && (
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border border-[#111111]/10 bg-white p-8 shadow-sm">
                  <div className="text-center mb-6">
                    <h3 className="font-semibold text-xl text-[#111111]">Quick Prospect Prep</h3>
                    <p className="mt-1 text-sm text-[#6f6b62]">Build a fast briefing from your library. Save it for history, then attach to a live call.</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Client / Prospect Description</label>
                      <textarea
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value)}
                        placeholder="e.g. Small charity in education sector struggling with volunteer coordination and reporting"
                        className="w-full rounded-xl border border-[#111111]/15 bg-white py-3 px-4 text-sm outline-none focus:border-[#063b32] resize-y min-h-[72px]"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Sector</label>
                        <select value={selectedSectorId} onChange={(e) => setSelectedSectorId(e.target.value)} className="w-full rounded-xl border border-[#111111]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#063b32]">
                          <option value="">Select sector</option>
                          {sectors.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Persona (optional)</label>
                        <select value={selectedPersonaId} onChange={(e) => setSelectedPersonaId(e.target.value)} className="w-full rounded-xl border border-[#111111]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#063b32]">
                          <option value="">Select persona</option>
                          {personas.map((p) => (
                            <option key={p.id} value={p.id}>{p.persona_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Additional Notes</label>
                      <textarea value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 px-4 text-sm outline-none focus:border-[#063b32] resize-y" rows={2} placeholder="Any other context or goals..." />
                    </div>
                  </div>

                  <button
                    onClick={buildPrep}
                    disabled={!clientType.trim() && !selectedSectorId}
                    className="mt-6 w-full rounded-xl bg-[#063b32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50 transition-colors"
                  >
                    Build Prep
                  </button>
                </div>

                {prepResults && (
                  <div className="mt-6 rounded-2xl border border-[#111111]/10 bg-white p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#111111]">Prepared Summary</h4>
                      <span className="text-[10px] text-[#6f6b62]">Ready to save or attach</span>
                    </div>

                    {/* Name for history */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Name this prep (for history)</label>
                      <input
                        value={prepName}
                        onChange={(e) => setPrepName(e.target.value)}
                        placeholder={clientType.slice(0, 60) || "My Prospect Prep"}
                        className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                      />
                    </div>

                    {prepResults.sector && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">SECTOR</p>
                        <p className="font-medium text-[#111111]">{prepResults.sector.name}</p>
                        {prepResults.sector.description && <p className="text-sm mt-1 text-[#111111]">{prepResults.sector.description}</p>}
                        {prepResults.sector.common_admin_pressures?.length > 0 && <p className="mt-1 text-xs text-[#6f6b62]">Key pressures: {prepResults.sector.common_admin_pressures.join(" · ")}</p>}
                      </div>
                    )}
                    {prepResults.persona && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">PERSONA</p>
                        <p className="font-medium text-[#111111]">{prepResults.persona.persona_name}{prepResults.persona.typical_role ? ` — ${prepResults.persona.typical_role}` : ""}</p>
                      </div>
                    )}
                    {prepResults.relevantPains?.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-1">RELEVANT PAIN POINTS ({prepResults.relevantPains.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {prepResults.relevantPains.map((pp: any, idx: number) => (
                            <li key={idx}>• {pp.title}{pp.plain_english_definition ? ` — ${pp.plain_english_definition.slice(0, 70)}` : ""}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prepResults.relevantVats?.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-1">RELEVANT VAT PROMPTS ({prepResults.relevantVats.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {prepResults.relevantVats.map((v: any, idx: number) => (
                            <li key={idx}>• {v.prompt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">NOTES / CONTEXT</p>
                      <p className="text-sm text-[#111111]">{prepResults.prepNotes || prepResults.clientType || "—"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#111111]/10">
                      <button onClick={() => savePrep()} className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42]">Save to History</button>
                      <button onClick={() => attachPrep(prepResults, true)} className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42]">Attach to Live Call</button>
                      <button onClick={() => attachPrep(prepResults, false)} className="rounded-lg border border-[#063b32]/25 px-4 py-1.5 text-sm font-semibold text-[#063b32] hover:bg-[#f7f4ea]">Attach without saving</button>
                    </div>
                    <p className="mt-2 text-[10px] text-[#6f6b62]">Attaching navigates to Live Call with this prep loaded on the left. Use "Attach to Live Call" to be asked about saving first.</p>
                  </div>
                )}
              </div>
            )}
            {tab === "prospect_prep_history" && (
              <div className="max-w-3xl mx-auto">
                {historyViewPrep ? (
                  <div className="rounded-2xl border border-[#111111]/10 bg-white p-6">
                    <button
                      onClick={() => setHistoryViewPrep(null)}
                      className="mb-4 text-xs font-semibold text-[#063b32] hover:underline"
                    >
                      ← Back to history
                    </button>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#111111]">Prepared Summary</h4>
                      <span className="text-[10px] text-[#6f6b62]">{new Date(historyViewPrep.prep.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Name this prep</label>
                      <input
                        value={historyViewPrep.prep.name || ""}
                        onChange={(e) => setHistoryViewPrep({
                          ...historyViewPrep,
                          prep: { ...historyViewPrep.prep, name: e.target.value },
                        })}
                        className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                      />
                    </div>

                    {historyViewPrep.prep.sector && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">SECTOR</p>
                        <p className="font-medium text-[#111111]">{historyViewPrep.prep.sector.name}</p>
                        {historyViewPrep.prep.sector.description && <p className="text-sm mt-1 text-[#111111]">{historyViewPrep.prep.sector.description}</p>}
                        {historyViewPrep.prep.sector.common_admin_pressures?.length > 0 && <p className="mt-1 text-xs text-[#6f6b62]">Key pressures: {historyViewPrep.prep.sector.common_admin_pressures.join(" · ")}</p>}
                      </div>
                    )}
                    {historyViewPrep.prep.persona && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">PERSONA</p>
                        <p className="font-medium text-[#111111]">{historyViewPrep.prep.persona.persona_name}{historyViewPrep.prep.persona.typical_role ? ` — ${historyViewPrep.prep.persona.typical_role}` : ""}</p>
                      </div>
                    )}
                    {historyViewPrep.prep.relevantPains?.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-1">RELEVANT PAIN POINTS ({historyViewPrep.prep.relevantPains.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {historyViewPrep.prep.relevantPains.map((pp: any, idx: number) => (
                            <li key={idx}>• {pp.title}{pp.plain_english_definition ? ` — ${pp.plain_english_definition.slice(0, 70)}` : ""}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {historyViewPrep.prep.relevantVats?.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-1">RELEVANT VAT PROMPTS ({historyViewPrep.prep.relevantVats.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {historyViewPrep.prep.relevantVats.map((v: any, idx: number) => (
                            <li key={idx}>• {v.prompt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Notes / Context</label>
                      <textarea
                        value={historyViewPrep.prep.prepNotes || historyViewPrep.prep.clientType || ""}
                        onChange={(e) => setHistoryViewPrep({
                          ...historyViewPrep,
                          prep: { ...historyViewPrep.prep, prepNotes: e.target.value },
                        })}
                        className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                        rows={3}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#111111]/10">
                      <button
                        onClick={() => {
                          const saved = updateSavedPrep(historyViewPrep.index, {
                            name: historyViewPrep.prep.name,
                            prepNotes: historyViewPrep.prep.prepNotes,
                          });
                          localStorage.setItem("currentProspectPrep", JSON.stringify(saved));
                          alert("Changes saved.");
                        }}
                        className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => attachPrep(historyViewPrep.prep, false)}
                        className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                      >
                        Attach to Live Call
                      </button>
                    </div>
                  </div>
                ) : savedPreps.length === 0 ? (
                  <div className="rounded-2xl border border-[#111111]/10 py-12 text-center bg-white">
                    <p className="text-sm text-[#6f6b62]">No saved preps yet. Build one in the Prospect Prep tab and save it.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedPreps.map((p, idx) => (
                      <div key={p.id || idx} className="rounded-xl border border-[#111111]/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#111111]">{p.name}</p>
                            <p className="text-xs text-[#6f6b62] mt-0.5">{new Date(p.createdAt).toLocaleString()}</p>
                            {p.clientType && <p className="mt-1 text-sm text-[#6f6b62] line-clamp-1">{p.clientType}</p>}
                            {p.sector && <p className="text-xs mt-1"><span className="text-[#6f6b62]">Sector:</span> {p.sector.name}</p>}
                            {p.persona && <p className="text-xs"><span className="text-[#6f6b62]">Persona:</span> {p.persona.persona_name}</p>}
                            {p.relevantPains?.length > 0 && <p className="text-xs text-[#6f6b62] mt-0.5">{p.relevantPains.length} pain points • {p.relevantVats?.length || 0} VAT prompts</p>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0 text-sm">
                            <button
                              onClick={() => setHistoryViewPrep({ prep: p, index: idx })}
                              className="rounded-md border border-[#111111]/15 px-3 py-1 text-xs font-semibold hover:bg-[#f7f4ea]"
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={() => attachPrep(p, false)}
                              className="rounded-md bg-[#063b32] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                            >
                              Attach to Call
                            </button>
                            <button
                              onClick={() => {
                                if (!confirm("Delete this saved prep?")) return;
                                const u = savedPreps.filter((_, ii) => ii !== idx);
                                setSavedPreps(u);
                                localStorage.setItem("prospectPreps", JSON.stringify(u));
                              }}
                              className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {p.prepNotes && <p className="mt-2 text-xs text-[#6f6b62] italic">Notes: {p.prepNotes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
