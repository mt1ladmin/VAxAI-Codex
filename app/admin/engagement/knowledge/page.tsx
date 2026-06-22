"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, Search } from "lucide-react";
import {
  PAIN_POINT_CATEGORIES,
  type PainPoint, type SectorProfile, type Persona, type VatPrompt,
} from "@/lib/engagement/types";
import { prepFingerprint, type ProspectPrepClient } from "@/lib/engagement/prospect-prep";
import { KnowledgeReviewContent } from "../knowledge-review/page";

type Tab = "prospect_prep" | "sectors" | "personas" | "pain_points" | "vat_prompts" | "knowledge_review" | "prospect_prep_history";

const TAB_KEYS: Tab[] = ["prospect_prep", "sectors", "personas", "pain_points", "vat_prompts", "knowledge_review", "prospect_prep_history"];

type DialogConfig = {
  type: "alert" | "confirm" | "prompt";
  message: string;
};

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
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [savedPreps, setSavedPreps] = useState<ProspectPrepClient[]>([]);
  const [historyViewPrepId, setHistoryViewPrepId] = useState<string | null>(null);
  const [historyEditDraft, setHistoryEditDraft] = useState<ProspectPrepClient | null>(null);
  const [prepsLoading, setPrepsLoading] = useState(false);
  const [savingPrep, setSavingPrep] = useState(false);
  const [prepsError, setPrepsError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [dialogInput, setDialogInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const dialogResolve = useRef<((result?: boolean | string | null) => void) | null>(null);

  const finishDialog = (result?: boolean | string | null) => {
    const resolve = dialogResolve.current;
    dialogResolve.current = null;
    setDialog(null);
    setDialogInput("");
    resolve?.(result);
  };

  const showAlert = (message: string) => new Promise<void>((resolve) => {
    dialogResolve.current = () => resolve();
    setDialog({ type: "alert", message });
  });

  const showConfirm = (message: string) => new Promise<boolean>((resolve) => {
    dialogResolve.current = (result) => resolve(!!result);
    setDialog({ type: "confirm", message });
  });

  const showPrompt = (message: string, defaultValue = "") => new Promise<string | null>((resolve) => {
    setDialogInput(defaultValue);
    dialogResolve.current = (result) => {
      if (result === false || result === null || result === undefined) resolve(null);
      else resolve(String(result));
    };
    setDialog({ type: "prompt", message });
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

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

  const loadSavedPreps = useCallback(async () => {
    setPrepsLoading(true);
    setPrepsError(null);
    try {
      const res = await fetch("/api/admin/engagement/prospect-preps?limit=50");
      const json = await res.json() as { data?: ProspectPrepClient[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load prospect preps");
      setSavedPreps(json.data || []);
    } catch (e) {
      setPrepsError(e instanceof Error ? e.message : "Failed to load prospect preps");
    } finally {
      setPrepsLoading(false);
    }
  }, []);

  const migrateLocalPreps = useCallback(async () => {
    const local = localStorage.getItem("prospectPreps");
    if (!local) return;
    const list = JSON.parse(local) as any[];
    for (const p of list) {
      await fetch("/api/admin/engagement/prospect-preps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          clientType: p.clientType,
          prepNotes: p.prepNotes,
          sector: p.sector,
          persona: p.persona,
          relevantPains: p.relevantPains || [],
          relevantVats: p.relevantVats || [],
          keywords: p.keywords || [],
        }),
      });
    }
    localStorage.removeItem("prospectPreps");
  }, []);

  useEffect(() => {
    (async () => {
      await loadSavedPreps();
      await migrateLocalPreps();
      await loadSavedPreps();
    })();
  }, [loadSavedPreps, migrateLocalPreps]);

  useEffect(() => {
    if (tab === "prospect_prep_history") loadSavedPreps();
  }, [tab, loadSavedPreps]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && TAB_KEYS.includes(urlTab as Tab)) setTab(urlTab as Tab);
    const prepId = searchParams.get("prep");
    if (prepId) setHistoryViewPrepId(prepId);
  }, [searchParams]);

  useEffect(() => {
    if (!historyViewPrepId) {
      setHistoryEditDraft(null);
      return;
    }
    const prep = savedPreps.find((p) => p.id === historyViewPrepId);
    if (prep) setHistoryEditDraft({ ...prep });
  }, [historyViewPrepId, savedPreps]);

  // When arriving back or prep changes, sync a friendly name default for the form if building
  useEffect(() => {
    if (prepResults && !prepName) {
      setPrepName((clientType || prepResults.name || "Prospect Prep").slice(0, 70));
    }
  }, [prepResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const findDuplicatePrep = (prep: any) => {
    const fp = prepFingerprint(prep);
    const match = savedPreps.find((p) => prepFingerprint(p) === fp);
    return match || null;
  };

  const setCurrentProspectPrep = (prep: ProspectPrepClient | Record<string, unknown>) => {
    sessionStorage.setItem("currentProspectPrep", JSON.stringify(prep));
  };

  const resetPrepForm = () => {
    setClientType("");
    setSelectedSectorId("");
    setSelectedPersonaId("");
    setPrepNotes("");
    setPrepName("");
    setPrepResults(null);
  };

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

  const savePrep = async (options?: { customName?: string; navigatePrompt?: boolean }) => {
    if (!prepResults) return null;

    const duplicate = findDuplicatePrep(prepResults);
    if (duplicate) {
      if (options?.navigatePrompt !== false) {
        const viewHistory = await showConfirm("This prep is already saved in Prospect Prep History. Would you like to view it there?");
        if (viewHistory) {
          resetPrepForm();
          setTab("prospect_prep_history");
          setHistoryViewPrepId(duplicate.id);
        }
      }
      return duplicate;
    }

    setSavingPrep(true);
    setPrepsError(null);
    try {
      const name = (options?.customName || prepName || clientType || "").slice(0, 80) || "Prep " + new Date().toLocaleDateString();
      const res = await fetch("/api/admin/engagement/prospect-preps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          clientType: prepResults.clientType,
          prepNotes: prepResults.prepNotes,
          sector: prepResults.sector,
          persona: prepResults.persona,
          relevantPains: prepResults.relevantPains || [],
          relevantVats: prepResults.relevantVats || [],
          keywords: prepResults.keywords || [],
        }),
      });
      const json = await res.json() as { data?: ProspectPrepClient; error?: string };
      if (res.status === 409 && json.data) {
        await loadSavedPreps();
        if (options?.navigatePrompt !== false) {
          const viewHistory = await showConfirm("This prep is already saved in Prospect Prep History. Would you like to view it there?");
          if (viewHistory) {
            resetPrepForm();
            setTab("prospect_prep_history");
            setHistoryViewPrepId(json.data.id);
          }
        }
        return json.data;
      }
      if (!res.ok) throw new Error(json.error || "Failed to save prep");

      const newPrep = json.data!;
      setCurrentProspectPrep(newPrep);
      await loadSavedPreps();
      resetPrepForm();

      if (options?.navigatePrompt !== false) {
        const viewHistory = await showConfirm("Saved to Prospect Prep History. Would you like to view it there now?");
        if (viewHistory) {
          setTab("prospect_prep_history");
          setHistoryViewPrepId(newPrep.id);
        }
      }

      return newPrep;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save prep";
      setPrepsError(message);
      await showAlert(message);
      return null;
    } finally {
      setSavingPrep(false);
    }
  };

  const updateSavedPrep = async (id: string, updates: { name?: string; prepNotes?: string }) => {
    setSavingPrep(true);
    setPrepsError(null);
    try {
      const res = await fetch(`/api/admin/engagement/prospect-preps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json() as { data?: ProspectPrepClient; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update prep");
      await loadSavedPreps();
      return json.data!;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update prep";
      setPrepsError(message);
      await showAlert(message);
      return null;
    } finally {
      setSavingPrep(false);
    }
  };

  const deleteSavedPrep = async (id: string) => {
    setSavingPrep(true);
    try {
      const res = await fetch(`/api/admin/engagement/prospect-preps/${id}`, { method: "DELETE" });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to delete prep");
      if (historyViewPrepId === id) setHistoryViewPrepId(null);
      await loadSavedPreps();
    } catch (e) {
      await showAlert(e instanceof Error ? e.message : "Failed to delete prep");
    } finally {
      setSavingPrep(false);
    }
  };

  const attachPrep = async (prep: ProspectPrepClient | any, isUnsavedBuild = false) => {
    let toAttach: ProspectPrepClient | Record<string, unknown> = prep;
    if (isUnsavedBuild) {
      const shouldSave = await showConfirm("Save this prep to Prospect Prep History first (recommended for your records)?");
      if (shouldSave) {
        const nameInput = await showPrompt("Name for this saved prep:", prepName || clientType?.slice(0, 60) || "Quick Prospect Prep");
        const saved = await savePrep({ customName: nameInput || undefined, navigatePrompt: false });
        if (saved) toAttach = saved;
      } else {
        toAttach = {
          ...prep,
          name: prepName || clientType?.slice(0, 60) || "Unsaved prep",
        };
      }
    }
    setCurrentProspectPrep(toAttach as ProspectPrepClient);
    router.push("/admin/engagement/live-call");
  };

  return (
    <div className="min-h-screen bg-white">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-[#063b32]/20 bg-[#063b32] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-5">
              <p className="text-sm text-[#111111]">{dialog.message}</p>
              {dialog.type === "prompt" && (
                <input
                  value={dialogInput}
                  onChange={(e) => setDialogInput(e.target.value)}
                  autoFocus
                  className="mt-4 w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#063b32]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") finishDialog(dialogInput);
                    if (e.key === "Escape") finishDialog(null);
                  }}
                />
              )}
            </div>
            <div className="flex gap-3 border-t border-[#111111]/10 px-6 py-4">
              {dialog.type === "alert" && (
                <button
                  onClick={() => finishDialog()}
                  className="rounded-lg bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                >
                  OK
                </button>
              )}
              {dialog.type === "confirm" && (
                <>
                  <button
                    onClick={() => finishDialog(true)}
                    className="rounded-lg bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => finishDialog(false)}
                    className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                  >
                    No
                  </button>
                </>
              )}
              {dialog.type === "prompt" && (
                <>
                  <button
                    onClick={() => finishDialog(dialogInput)}
                    className="rounded-lg bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => finishDialog(null)}
                    className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                onClick={() => { setTab(key); setSearch(""); setCategory(""); setDimension(""); setHistoryViewPrepId(null); }}
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

      {tab !== "prospect_prep" && !(tab === "prospect_prep_history" && historyViewPrepId) && (
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
                        <CustomSelect
                          value={selectedSectorId}
                          onChange={setSelectedSectorId}
                          placeholder="Select sector"
                          options={[
                            { value: "", label: "Select sector" },
                            ...sectors.map((s) => ({ value: s.id, label: s.name })),
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Persona (optional)</label>
                        <CustomSelect
                          value={selectedPersonaId}
                          onChange={setSelectedPersonaId}
                          placeholder="Select persona"
                          options={[
                            { value: "", label: "Select persona" },
                            ...personas.map((p) => ({ value: p.id, label: p.persona_name })),
                          ]}
                        />
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
                      {findDuplicatePrep(prepResults) && (
                        <p className="w-full text-xs text-amber-700 mb-1">This prep is already in your history — it can only be saved once.</p>
                      )}
                      <button
                        onClick={() => void savePrep()}
                        disabled={!!findDuplicatePrep(prepResults) || savingPrep}
                        className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingPrep ? "Saving…" : "Save to History"}
                      </button>
                      {findDuplicatePrep(prepResults) && (
                        <button
                          onClick={() => {
                            const duplicate = findDuplicatePrep(prepResults)!;
                            resetPrepForm();
                            setTab("prospect_prep_history");
                            setHistoryViewPrepId(duplicate.id);
                          }}
                          className="rounded-lg border border-[#063b32]/25 px-4 py-1.5 text-sm font-semibold text-[#063b32] hover:bg-[#f7f4ea]"
                        >
                          View in History
                        </button>
                      )}
                      <button onClick={() => void attachPrep(prepResults, true)} className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42]">Attach to Live Call</button>
                      <button onClick={() => void attachPrep(prepResults, false)} className="rounded-lg border border-[#063b32]/25 px-4 py-1.5 text-sm font-semibold text-[#063b32] hover:bg-[#f7f4ea]">Attach without saving</button>
                    </div>
                    <p className="mt-2 text-[10px] text-[#6f6b62]">Attaching navigates to Live Call with this prep loaded on the left. Use "Attach to Live Call" to be asked about saving first.</p>
                  </div>
                )}
              </div>
            )}
            {tab === "prospect_prep_history" && (
              <div className="max-w-3xl mx-auto">
                {prepsError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {prepsError} — run the Supabase migration <code className="text-xs">20260624_prospect_preps.sql</code> if you have not already.
                  </div>
                )}
                {historyEditDraft ? (
                  <div className="rounded-2xl border border-[#111111]/10 bg-white p-6">
                    <button
                      onClick={() => setHistoryViewPrepId(null)}
                      className="mb-4 text-xs font-semibold text-[#063b32] hover:underline"
                    >
                      ← Back to history
                    </button>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#111111]">Prepared Summary</h4>
                      <span className="text-[10px] text-[#6f6b62]">{new Date(historyEditDraft.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Name this prep</label>
                      <input
                        value={historyEditDraft.name || ""}
                        onChange={(e) => setHistoryEditDraft({ ...historyEditDraft, name: e.target.value })}
                        className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                      />
                    </div>

                    {historyEditDraft.sector && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">SECTOR</p>
                        <p className="font-medium text-[#111111]">{historyEditDraft.sector.name}</p>
                        {historyEditDraft.sector.description && <p className="text-sm mt-1 text-[#111111]">{historyEditDraft.sector.description}</p>}
                        {historyEditDraft.sector.common_admin_pressures?.length > 0 && <p className="mt-1 text-xs text-[#6f6b62]">Key pressures: {historyEditDraft.sector.common_admin_pressures.join(" · ")}</p>}
                      </div>
                    )}
                    {historyEditDraft.persona && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">PERSONA</p>
                        <p className="font-medium text-[#111111]">{historyEditDraft.persona.persona_name}{historyEditDraft.persona.typical_role ? ` — ${historyEditDraft.persona.typical_role}` : ""}</p>
                      </div>
                    )}
                    {historyEditDraft.relevantPains?.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-1">RELEVANT PAIN POINTS ({historyEditDraft.relevantPains.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {historyEditDraft.relevantPains.map((pp, idx) => (
                            <li key={idx}>• {pp.title}{pp.plain_english_definition ? ` — ${pp.plain_english_definition.slice(0, 70)}` : ""}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {historyEditDraft.relevantVats?.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-[#111111]/10">
                        <p className="text-xs font-semibold text-[#6f6b62] mb-1">RELEVANT VAT PROMPTS ({historyEditDraft.relevantVats.length})</p>
                        <ul className="text-sm space-y-1 text-[#111111]">
                          {historyEditDraft.relevantVats.map((v, idx) => (
                            <li key={idx}>• {v.prompt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Notes / Context</label>
                      <textarea
                        value={historyEditDraft.prepNotes || historyEditDraft.clientType || ""}
                        onChange={(e) => setHistoryEditDraft({ ...historyEditDraft, prepNotes: e.target.value })}
                        className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                        rows={3}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#111111]/10">
                      <button
                        onClick={async () => {
                          const saved = await updateSavedPrep(historyEditDraft.id, {
                            name: historyEditDraft.name,
                            prepNotes: historyEditDraft.prepNotes,
                          });
                          if (saved) {
                            setCurrentProspectPrep(saved);
                            showToast("Changes saved.");
                          }
                        }}
                        disabled={savingPrep}
                        className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                      >
                        {savingPrep ? "Saving…" : "Save Changes"}
                      </button>
                      <button
                        onClick={() => void attachPrep(historyEditDraft, false)}
                        className="rounded-lg bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                      >
                        Attach to Live Call
                      </button>
                    </div>
                  </div>
                ) : prepsLoading ? (
                  <div className="py-12 text-center text-sm text-[#6f6b62]">Loading saved preps…</div>
                ) : savedPreps.length === 0 ? (
                  <div className="rounded-2xl border border-[#111111]/10 py-12 text-center bg-white">
                    <p className="text-sm text-[#6f6b62]">No saved preps yet. Build one in the Prospect Prep tab and save it.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedPreps.map((p) => (
                      <div key={p.id} className="rounded-xl border border-[#111111]/10 bg-white p-5">
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
                              onClick={() => setHistoryViewPrepId(p.id)}
                              className="rounded-md border border-[#111111]/15 px-3 py-1 text-xs font-semibold hover:bg-[#f7f4ea]"
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={() => void attachPrep(p, false)}
                              className="rounded-md bg-[#063b32] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                            >
                              Attach to Call
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await showConfirm("Delete this saved prep?");
                                if (!confirmed) return;
                                void deleteSavedPrep(p.id);
                              }}
                              disabled={savingPrep}
                              className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
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

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white px-8 py-16 text-sm text-[#6f6b62]">Loading knowledge hub…</div>}>
      <KnowledgePageInner />
    </Suspense>
  );
}
