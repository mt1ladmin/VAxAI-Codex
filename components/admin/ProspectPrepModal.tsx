"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Globe, Loader2, Sparkles, X } from "lucide-react";
import { PrepKnowledgeSummary } from "@/components/admin/PrepKnowledgeSummary";
import { buildProspectPrepMatch } from "@/lib/engagement/build-prospect-prep";
import type { ProspectResearchResult } from "@/app/api/admin/ai/prospect-research/route";
import type { ProspectPrepSource } from "@/lib/engagement/prospect-prep";
import type { ProspectPrepClient } from "@/lib/engagement/prospect-prep";
import type { PainPoint, Persona, SectorProfile, VatPrompt } from "@/lib/engagement/types";

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-left text-sm outline-none hover:border-[#063b32]/40 focus:border-[#063b32]"
      >
        <span className={selected ? "text-[#111111]" : "text-[#6f6b62]"}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value || "__empty"}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] ${
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

export type ProspectPrepModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: (prep: ProspectPrepClient) => void;
  defaultClientType?: string;
  defaultPrepNotes?: string;
  defaultName?: string;
  source?: ProspectPrepSource;
  // Research context — org/contact to search for
  researchOrgName?: string;
  researchContactName?: string;
  researchEmail?: string;
  researchIndustry?: string;
  researchLocation?: string;
};

export function ProspectPrepModal({
  open,
  onClose,
  onSaved,
  defaultClientType = "",
  defaultPrepNotes = "",
  defaultName = "",
  source,
  researchOrgName,
  researchContactName,
  researchEmail,
  researchIndustry,
  researchLocation,
}: ProspectPrepModalProps) {
  const [sectors, setSectors] = useState<SectorProfile[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [vatPrompts, setVatPrompts] = useState<VatPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState(defaultClientType);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [knownPainPoints, setKnownPainPoints] = useState<PainPoint[]>([]);
  const [painPointSearch, setPainPointSearch] = useState("");
  const [prepNotes, setPrepNotes] = useState(defaultPrepNotes);
  const [prepName, setPrepName] = useState(defaultName);
  const [built, setBuilt] = useState<ReturnType<typeof buildProspectPrepMatch> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Research state
  const [researching, setResearching] = useState(false);
  const [researchData, setResearchData] = useState<ProspectResearchResult | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchExpanded, setResearchExpanded] = useState(false);

  const canResearch = !!(researchOrgName?.trim());

  const loadData = useCallback(async () => {
    setLoading(true);
    const [sRes, pRes, ppRes, vRes] = await Promise.all([
      fetch("/api/admin/engagement/sectors?limit=50"),
      fetch("/api/admin/engagement/personas?limit=50"),
      fetch("/api/admin/engagement/pain-points?limit=100"),
      fetch("/api/admin/engagement/vat-prompts?limit=100"),
    ]);
    const [sJ, pJ, ppJ, vJ] = await Promise.all([
      sRes.json() as Promise<{ data: SectorProfile[] }>,
      pRes.json() as Promise<{ data: Persona[] }>,
      ppRes.json() as Promise<{ data: PainPoint[] }>,
      vRes.json() as Promise<{ data: VatPrompt[] }>,
    ]);
    setSectors(sJ.data || []);
    setPersonas(pJ.data || []);
    setPainPoints(ppJ.data || []);
    setVatPrompts(vJ.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setClientType(defaultClientType);
      setPrepNotes(defaultPrepNotes);
      setPrepName(defaultName);
      setSelectedSectorId("");
      setSelectedPersonaId("");
      setKnownPainPoints([]);
      setPainPointSearch("");
      setBuilt(null);
      setError(null);
      setResearchData(null);
      setResearchError(null);
      setResearchExpanded(false);
      void loadData();
    }
  }, [open, defaultClientType, defaultPrepNotes, defaultName, loadData]);

  const handleResearch = async () => {
    if (!canResearch || researching) return;
    setResearching(true);
    setResearchError(null);
    setResearchData(null);

    try {
      const res = await fetch("/api/admin/ai/prospect-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: researchOrgName,
          contactName: researchContactName,
          email: researchEmail,
          industry: researchIndustry || clientType,
          location: researchLocation,
          existingNotes: prepNotes,
        }),
      });
      const json = (await res.json()) as { data?: ProspectResearchResult; error?: string };

      if (!res.ok || !json.data) {
        setResearchError(json.error ?? "Research failed — please fill in manually.");
        return;
      }

      const research = json.data;
      setResearchData(research);
      setResearchExpanded(true);

      // Auto-populate fields from research results
      if (research.suggestedPrepNotes && !prepNotes.trim()) {
        setPrepNotes(research.suggestedPrepNotes);
      }
      if (research.suggestedSectorId) {
        const matchedSector = sectors.find((s) => s.id === research.suggestedSectorId);
        if (matchedSector) setSelectedSectorId(matchedSector.id);
      }
      if (research.suggestedPersonaId) {
        const matchedPersona = personas.find((p) => p.id === research.suggestedPersonaId);
        if (matchedPersona) setSelectedPersonaId(matchedPersona.id);
      }
      if (research.suggestedPainPointIds?.length) {
        const matched = painPoints.filter((pp) =>
          research.suggestedPainPointIds.includes(pp.id),
        );
        if (matched.length) setKnownPainPoints(matched);
      }
    } catch {
      setResearchError("Could not complete research — please fill in manually.");
    } finally {
      setResearching(false);
    }
  };

  const applyResearchNotes = () => {
    if (researchData?.suggestedPrepNotes) {
      setPrepNotes(researchData.suggestedPrepNotes);
    }
  };

  const painPointResults = painPointSearch.trim()
    ? painPoints
        .filter((pp) => {
          const q = painPointSearch.trim().toLowerCase();
          return (
            pp.title.toLowerCase().includes(q) ||
            pp.category.toLowerCase().includes(q) ||
            pp.plain_english_definition?.toLowerCase().includes(q)
          );
        })
        .slice(0, 8)
    : [];

  const addKnownPainPoint = (pp: PainPoint) => {
    if (knownPainPoints.some((p) => p.id === pp.id)) return;
    setKnownPainPoints((prev) => [...prev, pp]);
    setPainPointSearch("");
  };

  const removeKnownPainPoint = (id: string) => {
    setKnownPainPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBuild = () => {
    const sector = sectors.find((s) => s.id === selectedSectorId) || null;
    const persona = personas.find((p) => p.id === selectedPersonaId) || null;
    const result = buildProspectPrepMatch({
      clientType,
      prepNotes,
      sector,
      persona,
      painPoints,
      vatPrompts,
      knownPainPoints,
    });
    setBuilt(result);
    if (!prepName) setPrepName((clientType || "Prospect Prep").slice(0, 70));
  };

  const handleSave = async () => {
    if (!built) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/engagement/prospect-preps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prepName || clientType || "Prospect Prep",
          clientType: built.clientType,
          prepNotes: built.prepNotes,
          sector: built.sector,
          persona: built.persona,
          relevantPains: built.relevantPains,
          relevantVats: built.relevantVats,
          keywords: built.keywords,
          enquiryId: source?.enquiryId,
          contactId: source?.contactId,
          organisationId: source?.organisationId,
          queueId: source?.queueId,
          sourceType: source?.sourceType,
          sourceLabel: source?.sourceLabel,
        }),
      });
      const json = (await res.json()) as { data?: ProspectPrepClient; error?: string };
      if (res.status === 409 && json.data) {
        onSaved(json.data);
        onClose();
        return;
      }
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onSaved(json.data!);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#111111]/10 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#111111]/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">New prospect prep</p>
            <h2 className="text-lg font-semibold text-[#111111]">Build &amp; save</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#6f6b62] hover:bg-[#f7f4ea]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-[#6f6b62]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading knowledge base…
            </div>
          ) : (
            <>
              {/* ── AI Research ─────────────────────────────────────────── */}
              {canResearch && (
                <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/4 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[#063b32]" />
                      <p className="text-xs font-semibold text-[#063b32]">
                        AI prospect research
                        {researchData?.webSearchUnavailable && (
                          <span className="ml-1.5 text-[#6f6b62] font-normal">(knowledge base only)</span>
                        )}
                      </p>
                    </div>
                    {!researching && !researchData && (
                      <button
                        type="button"
                        onClick={() => void handleResearch()}
                        className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Research {researchOrgName}
                      </button>
                    )}
                    {researching && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6f6b62]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Researching…
                      </div>
                    )}
                    {researchData && !researching && (
                      <button
                        type="button"
                        onClick={() => void handleResearch()}
                        className="text-[10px] font-semibold text-[#6f6b62] hover:text-[#111111]"
                      >
                        Re-research
                      </button>
                    )}
                  </div>

                  {researchError && (
                    <p className="text-xs text-red-600">{researchError}</p>
                  )}

                  {researchData && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-[#063b32] font-medium">
                        {researchData.companyOverview}
                      </p>

                      <button
                        type="button"
                        onClick={() => setResearchExpanded((v) => !v)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-[#6f6b62] hover:text-[#111111]"
                      >
                        {researchExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {researchExpanded ? "Hide" : "Show"} full findings
                      </button>

                      {researchExpanded && (
                        <div className="space-y-2 border-t border-[#063b32]/10 pt-2">
                          {researchData.recentNews?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6f6b62]">Recent context</p>
                              <ul className="mt-1 space-y-0.5">
                                {researchData.recentNews.map((n, i) => (
                                  <li key={i} className="text-[11px] text-[#111111] before:content-['•'] before:mr-1.5 before:text-[#063b32]">{n}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {researchData.contactBackground && (
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6f6b62]">Contact</p>
                              <p className="mt-0.5 text-[11px] text-[#111111]">{researchData.contactBackground}</p>
                            </div>
                          )}
                          {researchData.sectorSignals?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6f6b62]">Sector signals</p>
                              <ul className="mt-1 space-y-0.5">
                                {researchData.sectorSignals.map((s, i) => (
                                  <li key={i} className="text-[11px] text-[#111111] before:content-['•'] before:mr-1.5 before:text-amber-500">{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {researchData.sources?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {researchData.sources.slice(0, 4).map((src, i) => {
                                try {
                                  const host = new URL(src).hostname.replace("www.", "");
                                  return (
                                    <a
                                      key={i}
                                      href={src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-0.5 rounded border border-[#111111]/10 px-1.5 py-0.5 text-[9px] text-[#6f6b62] hover:bg-[#f7f4ea]"
                                    >
                                      {host}
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  );
                                } catch {
                                  return null;
                                }
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Apply research notes button */}
                      {researchData.suggestedPrepNotes && prepNotes.trim() && prepNotes !== researchData.suggestedPrepNotes && (
                        <button
                          type="button"
                          onClick={applyResearchNotes}
                          className="text-[10px] font-semibold text-[#063b32] hover:underline"
                        >
                          Replace notes with AI-generated brief ↓
                        </button>
                      )}
                    </div>
                  )}

                  {!researchData && !researching && !researchError && (
                    <p className="text-[11px] text-[#6f6b62]">
                      Research {researchContactName ? `${researchContactName} at ` : ""}{researchOrgName} — auto-fills notes, sector, and pain points.
                    </p>
                  )}
                </div>
              )}

              {/* ── Manual fields ─────────────────────────────────────── */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Client type</label>
                <input
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  placeholder="e.g. Health charity, SME, local authority"
                  className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Sector</label>
                <CustomSelect
                  value={selectedSectorId}
                  onChange={setSelectedSectorId}
                  placeholder="Select sector (optional)"
                  options={[{ value: "", label: "— None —" }, ...sectors.map((s) => ({ value: s.id, label: s.name }))]}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Persona</label>
                <CustomSelect
                  value={selectedPersonaId}
                  onChange={setSelectedPersonaId}
                  placeholder="Select persona (optional)"
                  options={[{ value: "", label: "— None —" }, ...personas.map((p) => ({ value: p.id, label: p.persona_name }))]}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Pain points (if known)</label>
                <input
                  value={painPointSearch}
                  onChange={(e) => setPainPointSearch(e.target.value)}
                  placeholder="Search pain points…"
                  className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
                {painPointResults.length > 0 && (
                  <div className="mt-1 max-h-32 overflow-auto rounded-lg border border-[#111111]/10 bg-white shadow-sm">
                    {painPointResults.map((pp) => (
                      <button
                        key={pp.id}
                        type="button"
                        onClick={() => addKnownPainPoint(pp)}
                        disabled={knownPainPoints.some((p) => p.id === pp.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] disabled:opacity-40"
                      >
                        <span className="font-semibold text-[#111111]">{pp.title}</span>
                        <span className="block text-[10px] text-[#6f6b62]">{pp.category}</span>
                      </button>
                    ))}
                  </div>
                )}
                {knownPainPoints.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {knownPainPoints.map((pp) => (
                      <span key={pp.id} className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {pp.title}
                        <button type="button" onClick={() => removeKnownPainPoint(pp.id)} className="text-amber-600 hover:text-amber-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Notes</label>
                  {researchData?.suggestedPrepNotes && prepNotes === researchData.suggestedPrepNotes && (
                    <span className="text-[9px] font-semibold text-[#063b32]">✓ AI-generated brief</span>
                  )}
                </div>
                <textarea
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  rows={5}
                  placeholder="Context from enquiry or what you know about this prospect…"
                  className="w-full resize-none rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              </div>

              {!built ? (
                <button
                  type="button"
                  onClick={handleBuild}
                  disabled={!clientType.trim() && !prepNotes.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
                >
                  <Sparkles className="h-4 w-4" /> Build prep
                </button>
              ) : (
                <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p className="text-xs font-semibold text-violet-800">Matched from knowledge hub</p>
                  <p className="text-[10px] text-violet-700">Click sector, persona, or pain points to view knowledge hub details.</p>
                  <PrepKnowledgeSummary
                    sector={built.sector}
                    persona={built.persona}
                    relevantPains={built.relevantPains}
                    compact
                  />
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Save as</label>
                    <input
                      value={prepName}
                      onChange={(e) => setPrepName(e.target.value)}
                      className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    />
                  </div>
                  {source?.sourceLabel && (
                    <p className="text-[10px] text-violet-600">Will be linked to: {source.sourceLabel}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save &amp; link
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilt(null)}
                      className="rounded-lg border border-[#111111]/15 px-3 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-white"
                    >
                      Rebuild
                    </button>
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
