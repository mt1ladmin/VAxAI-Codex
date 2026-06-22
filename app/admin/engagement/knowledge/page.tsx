"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import {
  BADGE_COLORS, PAIN_POINT_CATEGORIES,
  type PainPoint, type SectorProfile, type Persona, type VatPrompt,
} from "@/lib/engagement/types";
import KnowledgeReviewPage from "../knowledge-review/page";

type Tab = "pain_points" | "sectors" | "personas" | "vat_prompts" | "knowledge_review" | "prospect_prep";

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

  // Prospect Prep states (client-side, no LLM)
  const [clientType, setClientType] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [prepNotes, setPrepNotes] = useState("");
  const [prepResults, setPrepResults] = useState<any>(null);
  const [savedPreps, setSavedPreps] = useState<any[]>([]);

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
    setPrepResults({
      sector,
      persona,
      relevantPains,
      relevantVats,
      clientType,
      prepNotes,
      keywords,
    });
  };

  const savePrep = () => {
    if (!prepResults) return;
    const newPrep = {
      id: Date.now().toString(),
      name: clientType.slice(0, 50) || "Prep " + new Date().toLocaleDateString(),
      ...prepResults,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPrep, ...savedPreps].slice(0, 20);
    setSavedPreps(updated);
    localStorage.setItem("prospectPreps", JSON.stringify(updated));
    localStorage.setItem("currentProspectPrep", JSON.stringify(newPrep));
    alert("Prep saved! Can be loaded in Live Call Assist.");
  };

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
            ["knowledge_review", "Knowledge Review"],
            ["prospect_prep", "Prospect Prep"],
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
        {tab !== "knowledge_review" && tab !== "prospect_prep" && (
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
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[#111111] mb-2">Quick Prospect Preparation</h3>
                  <p className="text-sm text-[#6f6b62] mb-4">No LLM call. Enter client info to quickly pull relevant sector, persona, pain points and VAT prompts. Save for live call use and later AI enhancement.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Client Type / Description</label>
                      <textarea
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value)}
                        placeholder="e.g. Small charity in education sector struggling with volunteer coordination and reporting"
                        className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-3 pr-3 text-sm outline-none focus:border-[#063b32] resize-y min-h-[60px]"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Sector</label>
                        <select value={selectedSectorId} onChange={(e) => setSelectedSectorId(e.target.value)} className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
                          <option value="">Select sector</option>
                          {sectors.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Persona (optional)</label>
                        <select value={selectedPersonaId} onChange={(e) => setSelectedPersonaId(e.target.value)} className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
                          <option value="">Select persona</option>
                          {personas.map((p) => (
                            <option key={p.id} value={p.id}>{p.persona_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Additional Notes</label>
                    <textarea value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-3 pr-3 text-sm outline-none focus:border-[#063b32] resize-y" rows={2} placeholder="Any other context or goals..." />
                  </div>
                  <button onClick={buildPrep} disabled={!clientType.trim() && !selectedSectorId} className="mt-3 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                    Build Prep (Quick & Efficient)
                  </button>
                </div>

                {prepResults && (
                  <div className="border border-[#111111]/10 rounded-xl p-5 bg-white">
                    <h4 className="font-semibold mb-3 text-[#111111]">Prepared Information (All in One Place)</h4>
                    {prepResults.sector && (
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Sector: {prepResults.sector.name}</p>
                        {prepResults.sector.description && <p className="text-sm text-[#111111]">{prepResults.sector.description}</p>}
                        {prepResults.sector.common_admin_pressures?.length > 0 && <p className="mt-1 text-xs text-[#6f6b62]">Pressures: {prepResults.sector.common_admin_pressures.join(", ")}</p>}
                      </div>
                    )}
                    {prepResults.persona && (
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Persona: {prepResults.persona.persona_name}</p>
                        {prepResults.persona.typical_role && <p className="text-sm text-[#111111]">{prepResults.persona.typical_role}</p>}
                      </div>
                    )}
                    {prepResults.relevantPains?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Relevant Pain Points ({prepResults.relevantPains.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {prepResults.relevantPains.map((pp: any) => (
                            <li key={pp.id}>• {pp.title} — {pp.plain_english_definition?.slice(0, 60)}...</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prepResults.relevantVats?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Relevant VAT Prompts ({prepResults.relevantVats.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {prepResults.relevantVats.map((v: any) => (
                            <li key={v.id}>• {v.prompt.slice(0, 70)}...</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Notes</p>
                      <p className="text-sm text-[#111111]">{prepResults.prepNotes || prepResults.clientType}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={savePrep} className="rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42]">Save Prep</button>
                      <button onClick={() => { localStorage.setItem("currentProspectPrep", JSON.stringify(prepResults)); alert("Ready for Live Call! Load it there."); }} className="rounded-lg border border-[#063b32]/30 px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f4ea]">Ready for Live Call</button>
                    </div>
                  </div>
                )}

                {savedPreps.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Saved Preps (for Live Call & later AI)</p>
                    <div className="space-y-2 text-sm">
                      {savedPreps.map((p, i) => (
                        <div key={i} className="border border-[#111111]/10 rounded p-3 flex justify-between items-start">
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-[#6f6b62]">{new Date(p.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <button onClick={() => { setClientType(p.clientType); setPrepResults(p); setPrepNotes(p.prepNotes || ""); }} className="underline text-[#063b32]">View</button>
                            <button onClick={() => { localStorage.setItem("currentProspectPrep", JSON.stringify(p)); alert("Attached for live call"); }} className="underline text-[#063b32]">Attach to Live Call</button>
                            <button onClick={() => { const u = savedPreps.filter((_, ii) => ii !== i); setSavedPreps(u); localStorage.setItem("prospectPreps", JSON.stringify(u)); }} className="underline text-red-600">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
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
