"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Sparkles, X } from "lucide-react";
import { PrepKnowledgeSummary } from "@/components/admin/PrepKnowledgeSummary";
import { buildProspectPrepMatch } from "@/lib/engagement/build-prospect-prep";
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
};

export function ProspectPrepModal({
  open,
  onClose,
  onSaved,
  defaultClientType = "",
  defaultPrepNotes = "",
  defaultName = "",
  source,
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
      void loadData();
    }
  }, [open, defaultClientType, defaultPrepNotes, defaultName, loadData]);

  const painPointResults = painPointSearch.trim()
    ? painPoints.filter((pp) => {
        const q = painPointSearch.trim().toLowerCase();
        return (
          pp.title.toLowerCase().includes(q) ||
          pp.category.toLowerCase().includes(q) ||
          pp.plain_english_definition?.toLowerCase().includes(q)
        );
      }).slice(0, 8)
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
      const json = await res.json() as { data?: ProspectPrepClient; error?: string };
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
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Notes</label>
                <textarea
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  rows={3}
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