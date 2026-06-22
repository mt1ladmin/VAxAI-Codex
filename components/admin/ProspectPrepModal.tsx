"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Sparkles, X } from "lucide-react";
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
      setBuilt(null);
      setError(null);
      void loadData();
    }
  }, [open, defaultClientType, defaultPrepNotes, defaultName, loadData]);

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
                  {built.sector && <p className="text-sm text-[#111111]"><span className="font-medium">Sector:</span> {built.sector.name}</p>}
                  {built.persona && <p className="text-sm text-[#111111]"><span className="font-medium">Persona:</span> {built.persona.persona_name}</p>}
                  {built.relevantPains.length > 0 && (
                    <ul className="list-disc pl-4 text-xs text-[#111111]">
                      {built.relevantPains.map((pp) => <li key={pp.id}>{pp.title}</li>)}
                    </ul>
                  )}
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