"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Check, ChevronDown, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  ObjectionsPanel,
  PricingBandsPanel,
  ScriptsBlocksPanel,
} from "@/components/admin/KnowledgeSalesTools";
import { KnowledgeAddModal } from "@/components/admin/KnowledgeAddModal";
import {
  PAIN_POINT_CATEGORIES,
  type PainPoint, type SectorProfile, type Persona, type VatPrompt,
} from "@/lib/engagement/types";
import { useSetAIContext } from "@/lib/ai-assistant-context";

type Tab = "sectors" | "personas" | "pain_points" | "vat_prompts" | "pricing" | "scripts" | "objections";

const TAB_KEYS: Tab[] = ["sectors", "personas", "pain_points", "vat_prompts", "pricing", "scripts", "objections"];

const TAB_META: Record<Tab, { label: string; title: string; description: string }> = {
  sectors: {
    label: "Sectors",
    title: "Sectors",
    description:
      "How admin pressure shows up for founders, SMEs, charities and public sector organisations — and where VAxAI can help with backlog recovery, AI readiness, ongoing support and maintenance.",
  },
  personas: {
    label: "Personas",
    title: "Personas",
    description:
      "Who feels the admin load day to day, so outreach and matching stay human and specific.",
  },
  pain_points: {
    label: "Pain points",
    title: "Pain Points",
    description:
      "Operational pressures VAxAI addresses: clearing backlogs, organising information for AI and automation, keeping essential admin moving, and stopping problems from returning.",
  },
  vat_prompts: {
    label: "VAT prompts",
    title: "VAT Prompts",
    description:
      "Value, Alignment and Trust prompts for judging whether AI or process change genuinely helps — without selling tools or over-promising automation.",
  },
  pricing: {
    label: "Pricing bands",
    title: "Pricing Bands",
    description:
      "Internal scoping bands only. Public pages invite organisations to contact us for a quote after we understand the work and the right person to deliver it.",
  },
  scripts: {
    label: "Scripts & blocks",
    title: "Scripts & Blocks",
    description:
      "Approved outreach language for free Admin Reviews, project work and monthly support — human-led, practical, and free of fixed public prices.",
  },
  objections: {
    label: "Objections",
    title: "Objections",
    description:
      "Consistent responses when organisations push back on cost, capacity, AI risk or whether external support is needed.",
  },
};

const INPUT = "w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm text-[#111111] outline-none focus:border-[#122428]";
const TEXTAREA = `${INPUT} resize-none`;

function CustomSelect({ value, onChange, options, placeholder, className = "" }: {
  value: string; onChange: (value: string) => void;
  options: { value: string; label: string }[]; placeholder: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-[#111111]/15 bg-white px-4 py-2.5 text-left text-sm text-[#111111] outline-none transition-colors hover:border-[#122428]/40 focus:border-[#122428]">
        <span className={selected ? "text-[#111111]" : "text-[#5F686A]"}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#5F686A] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button key={opt.value || "__empty"} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F8F8] ${value === opt.value ? "bg-[#122428]/8 font-semibold text-[#122428]" : "text-[#111111]"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  return (
    <div className="rounded-lg border border-[#111111]/15 p-2 focus-within:border-[#122428]">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-[#F5F8F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#5F686A]">
            {tag}<button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="Type and press Enter" className="w-full text-xs outline-none bg-transparent text-[#111111] placeholder:text-[#5F686A]" />
    </div>
  );
}

function ListInput({ value, onChange, rows = 3 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  return (
    <textarea rows={rows} value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      placeholder="One item per line" className={TEXTAREA} />
  );
}

function ConfirmDelete({ onConfirm, onCancel, saving }: { onConfirm: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-red-600">Delete?</span>
      <button type="button" onClick={onConfirm} disabled={saving} className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-red-700">{saving ? "…" : "Yes"}</button>
      <button type="button" onClick={onCancel} className="rounded-lg border border-[#111111]/15 px-2.5 py-1 text-xs font-semibold text-[#5F686A] hover:bg-[#F5F8F8]">No</button>
    </div>
  );
}

function EditSaveRow({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#5F686A] hover:bg-[#F5F8F8]"><X className="h-3 w-3" /> Cancel</button>
      <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}</button>
    </div>
  );
}

// ── Sector card ────────────────────────────────────────────────────────────

function SectorCard({ sector, selected, selectMode, onSelect, onDeleted, onSaved, highlight }: {
  sector: SectorProfile; selected: boolean; selectMode: boolean; onSelect: () => void;
  onDeleted: () => void; onSaved: () => void; highlight: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({ name: sector.name, description: sector.description ?? "" });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/sectors/${sector.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draft.name.trim(), description: draft.description.trim() || null }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/sectors/${sector.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
  };

  const cardClass = `rounded-xl border bg-white p-5 transition-all ${highlight ? "border-[#122428] ring-2 ring-[#122428]/25 bg-[#122428]/5" : "border-[#111111]/10"} ${editing ? "border-[#122428]/40" : ""}`;

  if (editing) {
    return (
      <div className={cardClass}>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A] mb-2">Name
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={`mt-1 ${INPUT}`} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Description
          <textarea rows={2} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className={`mt-1 ${TEXTAREA}`} />
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={cardClass} id={highlight ? `sector-${sector.id}` : undefined}>
      <div className="flex items-start gap-2">
        {selectMode && (
          <input type="checkbox" checked={selected} onChange={onSelect} className="mt-1 h-4 w-4 shrink-0 accent-[#122428] cursor-pointer" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link href={`/admin/engagement/knowledge/sectors/${sector.id}`} className="font-semibold text-[#111111] hover:text-[#122428] transition-colors">{sector.name}</Link>
            <div className="flex shrink-0 items-center gap-1.5">
              {confirmDelete ? (
                <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
              ) : (
                <>
                  <button type="button" onClick={() => setEditing(true)} className="grid h-6 w-6 place-items-center rounded-md border border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"><Pencil className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-6 w-6 place-items-center rounded-md border border-[#111111]/15 text-[#5F686A] hover:border-red-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  <Link href={`/admin/engagement/knowledge/sectors/${sector.id}`} className="grid h-6 w-6 place-items-center rounded-md border border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"><ArrowRight className="h-3 w-3" /></Link>
                </>
              )}
            </div>
          </div>
          {sector.description && <p className="text-sm text-[#5F686A] line-clamp-2">{sector.description}</p>}
          {sector.common_admin_pressures && sector.common_admin_pressures.length > 0 && (
            <p className="mt-3 text-xs text-[#5F686A]">{sector.common_admin_pressures.slice(0, 2).join(" · ")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Persona card ───────────────────────────────────────────────────────────

function PersonaCard({ persona, selected, selectMode, onSelect, onDeleted, onSaved }: {
  persona: Persona; selected: boolean; selectMode: boolean; onSelect: () => void;
  onDeleted: () => void; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({
    persona_name: persona.persona_name, typical_role: persona.typical_role ?? "",
    goals: persona.goals ?? [], likely_concerns: persona.likely_concerns ?? [],
    pressures: persona.pressures ?? [],
  });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/personas/${persona.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        persona_name: draft.persona_name.trim(), typical_role: draft.typical_role.trim() || null,
        goals: draft.goals, likely_concerns: draft.likely_concerns, pressures: draft.pressures,
      }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/personas/${persona.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-[#122428]/30 bg-white p-5 space-y-3">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Persona name
          <input value={draft.persona_name} onChange={(e) => setDraft((d) => ({ ...d, persona_name: e.target.value }))} className={`mt-1 ${INPUT}`} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Typical role
          <input value={draft.typical_role} onChange={(e) => setDraft((d) => ({ ...d, typical_role: e.target.value }))} className={`mt-1 ${INPUT}`} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Goals (one per line)
          <ListInput value={draft.goals} onChange={(v) => setDraft((d) => ({ ...d, goals: v }))} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Likely concerns (one per line)
          <ListInput value={draft.likely_concerns} onChange={(v) => setDraft((d) => ({ ...d, likely_concerns: v }))} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Pressures (one per line)
          <ListInput value={draft.pressures} onChange={(v) => setDraft((d) => ({ ...d, pressures: v }))} />
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#111111]/10 bg-white p-5">
      <div className="flex items-start gap-2">
        {selectMode && <input type="checkbox" checked={selected} onChange={onSelect} className="mt-1 h-4 w-4 shrink-0 accent-[#122428] cursor-pointer" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-[#111111]">{persona.persona_name}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              {confirmDelete ? (
                <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
              ) : (
                <>
                  <button type="button" onClick={() => setEditing(true)} className="grid h-6 w-6 place-items-center rounded-md border border-[#111111]/15 text-[#5F686A] hover:border-[#122428] hover:text-[#122428]"><Pencil className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-6 w-6 place-items-center rounded-md border border-[#111111]/15 text-[#5F686A] hover:border-red-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </>
              )}
            </div>
          </div>
          {persona.typical_role && <p className="mt-0.5 text-sm text-[#5F686A]">{persona.typical_role}</p>}
          {persona.goals && persona.goals.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5F686A] mb-1">Goals</p>
              <ul className="space-y-0.5">{persona.goals.slice(0, 3).map((g, i) => <li key={i} className="text-xs text-[#111111] before:content-['·'] before:mr-1.5 before:text-[#5F686A]">{g}</li>)}</ul>
            </div>
          )}
          {persona.likely_concerns && persona.likely_concerns.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5F686A] mb-1">Likely concerns</p>
              <ul className="space-y-0.5">{persona.likely_concerns.slice(0, 2).map((c, i) => <li key={i} className="text-xs text-[#111111] before:content-['·'] before:mr-1.5 before:text-[#5F686A]">{c}</li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pain point row ─────────────────────────────────────────────────────────

function PainPointRow({ pp, selected, selectMode, onSelect, onDeleted, onSaved }: {
  pp: PainPoint; selected: boolean; selectMode: boolean; onSelect: () => void;
  onDeleted: () => void; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({
    title: pp.title, category: pp.category, plain_english_definition: pp.plain_english_definition ?? "",
  });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/pain-points/${pp.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: draft.title.trim(), category: draft.category, plain_english_definition: draft.plain_english_definition.trim() || null }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/pain-points/${pp.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
  };

  if (editing) {
    return (
      <div className="px-5 py-4 space-y-3 bg-[#F5F8F8]/50">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Title
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className={`mt-1 ${INPUT}`} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Category
          <select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className={`mt-1 ${INPUT}`}>
            {PAIN_POINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Plain English definition
          <textarea rows={2} value={draft.plain_english_definition} onChange={(e) => setDraft((d) => ({ ...d, plain_english_definition: e.target.value }))} className={`mt-1 ${TEXTAREA}`} />
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between px-5 py-4 hover:bg-[#F5F8F8] transition-colors group">
      <div className="flex items-start gap-3 min-w-0">
        {selectMode && <input type="checkbox" checked={selected} onChange={onSelect} className="mt-0.5 h-4 w-4 shrink-0 accent-[#122428] cursor-pointer" />}
        <div className="min-w-0">
          <p className="font-semibold text-[#111111] group-hover:text-[#122428] transition-colors">{pp.title}</p>
          {pp.plain_english_definition && <p className="mt-0.5 text-sm text-[#5F686A] line-clamp-1">{pp.plain_english_definition}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 ml-3">
        {confirmDelete ? (
          <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="grid h-6 w-6 place-items-center rounded-md border border-transparent text-[#5F686A] hover:border-[#122428] hover:text-[#122428] opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-3 w-3" /></button>
            <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-6 w-6 place-items-center rounded-md border border-transparent text-[#5F686A] hover:border-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
            <Link href={`/admin/engagement/pain-points/${pp.id}`} className="grid h-6 w-6 place-items-center rounded-md border border-transparent text-[#5F686A] hover:border-[#122428] hover:text-[#122428] opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="h-3 w-3" /></Link>
          </>
        )}
      </div>
    </div>
  );
}

// ── VAT Prompt row ─────────────────────────────────────────────────────────

function VatPromptRow({ prompt, selected, selectMode, onSelect, onDeleted, onSaved }: {
  prompt: VatPrompt; selected: boolean; selectMode: boolean; onSelect: () => void;
  onDeleted: () => void; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({ prompt: prompt.prompt, context_tags: prompt.context_tags ?? [] });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/vat-prompts/${prompt.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: draft.prompt.trim(), context_tags: draft.context_tags }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const del = async () => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/vat-prompts/${prompt.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
  };

  if (editing) {
    return (
      <div className="px-5 py-4 space-y-3 bg-[#F5F8F8]/50">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Prompt
          <textarea rows={3} value={draft.prompt} onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))} className={`mt-1 ${TEXTAREA}`} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Context tags
          <div className="mt-1"><TagsInput value={draft.context_tags} onChange={(v) => setDraft((d) => ({ ...d, context_tags: v }))} /></div>
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between px-5 py-3.5 hover:bg-[#F5F8F8]/50 transition-colors group">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {selectMode && <input type="checkbox" checked={selected} onChange={onSelect} className="mt-0.5 h-4 w-4 shrink-0 accent-[#122428] cursor-pointer" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#111111]">{prompt.prompt}</p>
          {prompt.context_tags && prompt.context_tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {prompt.context_tags.map((tag) => <span key={tag} className="rounded-full bg-[#F5F8F8] px-2 py-0.5 text-[10px] text-[#5F686A]">{tag}</span>)}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 ml-3">
        {confirmDelete ? (
          <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="grid h-6 w-6 place-items-center rounded-md border border-transparent text-[#5F686A] hover:border-[#122428] hover:text-[#122428] opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-3 w-3" /></button>
            <button type="button" onClick={() => setConfirmDelete(true)} className="grid h-6 w-6 place-items-center rounded-md border border-transparent text-[#5F686A] hover:border-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

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
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = () => setReloadTick((t) => t + 1);

  const aiContext = useMemo(() => ({
    type: "general" as const,
    id: `knowledge-${tab}`,
    label: `Knowledge Hub — ${TAB_META[tab].title}`,
    summary: TAB_META[tab].description,
  }), [tab]);
  useSetAIContext(aiContext);

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
      setSectors(data.filter((s, i, a) => a.findIndex((t) => t.name.toLowerCase() === s.name.toLowerCase()) === i));
    } else if (tab === "personas") {
      const res = await fetch("/api/admin/engagement/personas?limit=50");
      const json = await res.json() as { data: Persona[] };
      const data = json.data || [];
      setPersonas(data.filter((p, i, a) => a.findIndex((t) => t.persona_name.toLowerCase() === p.persona_name.toLowerCase()) === i));
    } else if (tab === "vat_prompts") {
      const params = new URLSearchParams();
      if (dimension) params.set("dimension", dimension);
      const res = await fetch(`/api/admin/engagement/vat-prompts?${params}&limit=100`);
      const json = await res.json() as { data: VatPrompt[] };
      const data = json.data || [];
      setVatPrompts(data.filter((p, i, a) => a.findIndex((t) => `${t.prompt.toLowerCase()}|${t.dimension}` === `${p.prompt.toLowerCase()}|${p.dimension}`) === i));
    }
    setLoading(false);
  }, [tab, search, category, dimension, reloadTick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = setTimeout(() => load(), 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { inputRef.current?.focus(); }, [tab]);

  useEffect(() => {
    if (tab !== "sectors" || highlightIds.size === 0 || loading) return;
    const first = [...highlightIds][0];
    document.getElementById(`sector-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tab, highlightIds, loading, sectors.length]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && TAB_KEYS.includes(urlTab as Tab)) setTab(urlTab as Tab);
    const highlight = searchParams.get("highlight");
    setHighlightIds(highlight ? new Set(highlight.split(",").map((s) => s.trim()).filter(Boolean)) : new Set());
  }, [searchParams]);

  const switchTab = (key: Tab) => {
    setTab(key); setSearch(""); setCategory(""); setDimension("");
    setSelectedIds(new Set()); setSelectMode(false); setConfirmBulkDelete(false);
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const deleteSelected = async () => {
    setDeletingSelected(true);
    const endpoint = tab === "sectors" ? "sectors" : tab === "personas" ? "personas" : tab === "pain_points" ? "pain-points" : "vat-prompts";
    await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/engagement/${endpoint}/${id}`, { method: "DELETE" })));
    setSelectedIds(new Set());
    setSelectMode(false);
    setConfirmBulkDelete(false);
    setDeletingSelected(false);
    reload();
  };

  const canSelect = ["sectors", "personas", "pain_points", "vat_prompts"].includes(tab);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-[#111111]/10 bg-white px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-[#111111]">Knowledge</span>
          <div className="ml-3 flex flex-wrap overflow-hidden rounded-lg border border-[#111111]/15">
            {TAB_KEYS.map((key) => (
              <button key={key} onClick={() => switchTab(key)}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${tab === key ? "bg-[#122428] text-white" : "text-[#5F686A] hover:bg-[#F5F8F8]"}`}>
                {TAB_META[key].label}
              </button>
            ))}
          </div>
          {/* Global + button */}
          <button type="button" onClick={() => setAddModalOpen(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#122428]/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#122428]">Client Engagement</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">{TAB_META[tab].title}</h1>
            <p className="mt-0.5 text-sm text-[#5F686A]">{TAB_META[tab].description}</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Search + filters */}
        {!(["pricing", "scripts", "objections"] as Tab[]).includes(tab) && (
          <div className="flex gap-3 mb-5 flex-wrap">
            {tab !== "vat_prompts" && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F686A]" />
                <input ref={inputRef} value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "pain_points" ? "Search pain points…" : tab === "sectors" ? "Search sectors…" : "Search…"}
                  className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#122428]" />
              </div>
            )}
            {tab === "pain_points" && (
              <CustomSelect value={category} onChange={setCategory} placeholder="All categories" className="w-48"
                options={[{ value: "", label: "All categories" }, ...PAIN_POINT_CATEGORIES.map((c) => ({ value: c, label: c }))]} />
            )}
            {tab === "vat_prompts" && (
              <div className="flex gap-2">
                {(["value", "alignment", "trust"] as const).map((dim) => (
                  <button key={dim} onClick={() => setDimension(dimension === dim ? "" : dim)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                      dimension === dim
                        ? dim === "value" ? "bg-[#122428] text-white" : dim === "alignment" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                        : "border border-[#111111]/15 text-[#5F686A] hover:text-[#111111]"
                    }`}>{dim}</button>
                ))}
              </div>
            )}
            {/* Select mode toggle */}
            {canSelect && (
              <button type="button" onClick={() => { setSelectMode((v) => !v); setSelectedIds(new Set()); setConfirmBulkDelete(false); }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${selectMode ? "border-[#122428] bg-[#122428]/8 text-[#122428]" : "border-[#111111]/15 text-[#5F686A] hover:border-[#122428]/30"}`}>
                {selectMode ? "Cancel select" : "Select"}
              </button>
            )}
          </div>
        )}

        {/* Bulk delete bar */}
        {selectMode && selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
            <span className="text-xs font-semibold text-red-700">{selectedIds.size} selected</span>
            {confirmBulkDelete ? (
              <>
                <span className="text-xs text-red-600">Delete {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""}?</span>
                <button type="button" onClick={() => void deleteSelected()} disabled={deletingSelected} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-red-700">{deletingSelected ? "Deleting…" : "Confirm"}</button>
                <button type="button" onClick={() => setConfirmBulkDelete(false)} className="text-xs font-semibold text-[#5F686A] hover:text-[#111111]">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmBulkDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">
                <Trash2 className="h-3 w-3" /> Delete selected
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-[#5F686A]">Loading…</div>
        ) : (
          <>
            {/* SECTORS */}
            {tab === "sectors" && (
              sectors.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#5F686A]">No sectors found.</div>
              ) : (
                <>
                  {highlightIds.size > 0 && (
                    <p className="mb-4 rounded-xl border border-[#122428]/20 bg-[#122428]/5 px-4 py-3 text-sm text-[#122428]">
                      Highlighted sectors may be relevant to this prospect based on their sector tags.
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sectors.map((s) => (
                      <SectorCard key={s.id} sector={s} selected={selectedIds.has(s.id)} selectMode={selectMode}
                        onSelect={() => toggleSelect(s.id)} onDeleted={reload} onSaved={reload} highlight={highlightIds.has(s.id)} />
                    ))}
                  </div>
                </>
              )
            )}

            {/* PERSONAS */}
            {tab === "personas" && (
              personas.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#5F686A]">No personas found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {personas.map((p) => (
                    <PersonaCard key={p.id} persona={p} selected={selectedIds.has(p.id)} selectMode={selectMode}
                      onSelect={() => toggleSelect(p.id)} onDeleted={reload} onSaved={reload} />
                  ))}
                </div>
              )
            )}

            {/* PAIN POINTS */}
            {tab === "pain_points" && (
              painPoints.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-[#5F686A]/40 mb-3" />
                  <p className="text-sm text-[#5F686A]">No pain points found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(painPoints.reduce<Record<string, PainPoint[]>>((acc, pp) => { (acc[pp.category] ??= []).push(pp); return acc; }, {})).map(([cat, items]) => (
                    <div key={cat} className="rounded-xl border border-[#111111]/10 overflow-hidden">
                      <div className="flex w-full items-center justify-between px-5 py-4 bg-[#F5F8F8]">
                        <span className="font-semibold text-[#111111] text-sm">{cat}</span>
                        <span className="rounded-full bg-[#111111]/10 px-2 py-0.5 text-xs font-semibold text-[#5F686A]">{items.length}</span>
                      </div>
                      <div className="bg-white divide-y divide-[#111111]/5">
                        {items.map((pp) => (
                          <PainPointRow key={pp.id} pp={pp} selected={selectedIds.has(pp.id)} selectMode={selectMode}
                            onSelect={() => toggleSelect(pp.id)} onDeleted={reload} onSaved={reload} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* VAT PROMPTS */}
            {tab === "vat_prompts" && (
              vatPrompts.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#5F686A]">No prompts found.</div>
              ) : (
                <div className="space-y-3">
                  {(["value", "alignment", "trust"] as const).filter((dim) => !dimension || dimension === dim).map((dim) => {
                    const dimPrompts = vatPrompts.filter((p) => p.dimension === dim);
                    if (dimPrompts.length === 0) return null;
                    return (
                      <div key={dim} className="rounded-xl border border-[#111111]/10 overflow-hidden">
                        <div className={`px-5 py-3 ${dim === "value" ? "bg-[#122428]/8" : dim === "alignment" ? "bg-blue-50" : "bg-amber-50"}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${dim === "value" ? "text-[#122428]" : dim === "alignment" ? "text-blue-700" : "text-amber-700"}`}>{dim} ({dimPrompts.length})</p>
                        </div>
                        <div className="divide-y divide-[#111111]/5">
                          {dimPrompts.map((p) => (
                            <VatPromptRow key={p.id} prompt={p} selected={selectedIds.has(p.id)} selectMode={selectMode}
                              onSelect={() => toggleSelect(p.id)} onDeleted={reload} onSaved={reload} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {tab === "pricing" && <PricingBandsPanel />}
            {tab === "scripts" && <ScriptsBlocksPanel />}
            {tab === "objections" && <ObjectionsPanel />}
          </>
        )}
      </div>

      <KnowledgeAddModal
        open={addModalOpen}
        defaultSection={tab as Tab}
        onClose={() => setAddModalOpen(false)}
        onSaved={(section) => { if (section === tab) reload(); }}
      />
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white px-8 py-16 text-sm text-[#5F686A]">Loading knowledge hub…</div>}>
      <KnowledgePageInner />
    </Suspense>
  );
}
