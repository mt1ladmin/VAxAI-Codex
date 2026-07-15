"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  MessageSquareQuote,
  MessageSquareText,
  Pencil,
  Plus,
  Scale,
  Search,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";
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

const LIBRARY_TABS: Tab[] = ["sectors", "personas", "pain_points", "vat_prompts"];
const SALES_TABS: Tab[] = ["pricing", "scripts", "objections"];

const TAB_META: Record<
  Tab,
  { label: string; title: string; description: string; icon: ComponentType<{ className?: string }> }
> = {
  sectors: {
    label: "Sectors",
    title: "Sectors",
    description:
      "How admin pressure shows up for founders, SMEs, charities and public sector — and where VAxAI helps.",
    icon: Building2,
  },
  personas: {
    label: "Personas",
    title: "Personas",
    description: "Who feels the admin load day to day, so outreach and matching stay human and specific.",
    icon: Users,
  },
  pain_points: {
    label: "Pain points",
    title: "Pain points",
    description:
      "Operational pressures: backlogs, AI-ready organisation, essential admin, and stopping problems returning.",
    icon: Target,
  },
  vat_prompts: {
    label: "VAT prompts",
    title: "VAT prompts",
    description:
      "Value, Alignment and Trust prompts for judging whether AI or process change genuinely helps.",
    icon: Scale,
  },
  pricing: {
    label: "Pricing bands",
    title: "Pricing bands",
    description:
      "Internal scoping bands only. Public pages invite a quote after we understand the work.",
    icon: CircleDollarSign,
  },
  scripts: {
    label: "Scripts & blocks",
    title: "Scripts & blocks",
    description:
      "Approved outreach language for Admin Reviews, project work and monthly support.",
    icon: MessageSquareText,
  },
  objections: {
    label: "Objections",
    title: "Objections",
    description:
      "Consistent responses on cost, capacity, AI risk or whether external support is needed.",
    icon: MessageSquareQuote,
  },
};

const INPUT =
  "w-full rounded-xl border border-pine-900/12 bg-white px-3.5 py-2 text-sm text-ink outline-none transition-colors focus:border-pine-900/40 focus:ring-2 focus:ring-pine-900/8";
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-pine-900/12 bg-white px-4 py-2.5 text-left text-sm text-ink outline-none transition-colors hover:border-pine-900/30 focus:border-pine-900"
      >
        <span className={selected ? "text-ink" : "text-muted"}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-pine-900/12 bg-white shadow-lift">
          {options.map((opt) => (
            <button
              key={opt.value || "__empty"}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-pine-50 ${
                value === opt.value ? "bg-pine-900/8 font-semibold text-pine-900" : "text-ink"
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

function IconButton({
  onClick,
  danger,
  children,
  href,
}: {
  onClick?: () => void;
  danger?: boolean;
  children: ReactNode;
  href?: string;
}) {
  const cls = `grid h-8 w-8 place-items-center rounded-lg border border-pine-900/10 bg-white text-muted transition-colors ${
    danger ? "hover:border-red-300 hover:bg-red-50 hover:text-red-600" : "hover:border-pine-900/25 hover:bg-pine-50 hover:text-pine-900"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-pine-900/15 bg-white px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-900 text-acid">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-pine-900">{title}</p>
      {hint ? <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{hint}</p> : null}
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
    <div className="rounded-xl border border-pine-900/12 bg-white p-2.5 focus-within:border-pine-900/40 focus-within:ring-2 focus-within:ring-pine-900/8">
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full border border-pine-900/10 bg-pine-50 px-2.5 py-0.5 text-[11px] font-semibold text-pine-900"
          >
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-500">
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Type and press Enter"
        className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
      />
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
      <button
        type="button"
        onClick={onConfirm}
        disabled={saving}
        className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? "…" : "Yes"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-pine-900/12 px-2.5 py-1 text-xs font-semibold text-muted hover:bg-pine-50"
      >
        No
      </button>
    </div>
  );
}

function EditSaveRow({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 border-t border-pine-900/8 pt-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-xl border border-pine-900/12 px-3 py-1.5 text-xs font-semibold text-muted hover:bg-pine-50"
      >
        <X className="h-3 w-3" /> Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-xl bg-pine-900 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-pine-800 disabled:opacity-50"
      >
        <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
      </button>
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

  const cardClass = `group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-card ${
    highlight
      ? "border-pine-900 ring-2 ring-pine-900/15"
      : "border-pine-900/10 hover:border-pine-900/20"
  } ${editing ? "border-pine-900/30" : ""}`;

  if (editing) {
    return (
      <div className={cardClass}>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Name
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className={`mt-1 ${INPUT}`}
          />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Description
          <textarea
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            className={`mt-1 ${TEXTAREA}`}
          />
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={cardClass} id={highlight ? `sector-${sector.id}` : undefined}>
      {highlight ? <span className="absolute inset-y-0 left-0 w-1 bg-acid" aria-hidden /> : null}
      <div className="flex items-start gap-3">
        {selectMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-pine-900"
          />
        )}
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pine-900 text-acid">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <Link
              href={`/admin/engagement/knowledge/sectors/${sector.id}`}
              className="text-sm font-semibold text-pine-900 transition-colors hover:text-pine-700"
            >
              {sector.name}
            </Link>
            <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {confirmDelete ? (
                <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
              ) : (
                <>
                  <IconButton onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton danger onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton href={`/admin/engagement/knowledge/sectors/${sector.id}`}>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </IconButton>
                </>
              )}
            </div>
          </div>
          {sector.description ? <p className="line-clamp-2 text-sm leading-6 text-muted">{sector.description}</p> : null}
          {sector.common_admin_pressures && sector.common_admin_pressures.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sector.common_admin_pressures.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-pine-900/10 bg-pine-50 px-2 py-0.5 text-[10px] font-semibold text-pine-800"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
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
      <div className="space-y-3 rounded-2xl border border-pine-900/20 bg-white p-5 shadow-sm">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Persona name
          <input
            value={draft.persona_name}
            onChange={(e) => setDraft((d) => ({ ...d, persona_name: e.target.value }))}
            className={`mt-1 ${INPUT}`}
          />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Typical role
          <input
            value={draft.typical_role}
            onChange={(e) => setDraft((d) => ({ ...d, typical_role: e.target.value }))}
            className={`mt-1 ${INPUT}`}
          />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Goals (one per line)
          <ListInput value={draft.goals} onChange={(v) => setDraft((d) => ({ ...d, goals: v }))} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Likely concerns (one per line)
          <ListInput value={draft.likely_concerns} onChange={(v) => setDraft((d) => ({ ...d, likely_concerns: v }))} />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Pressures (one per line)
          <ListInput value={draft.pressures} onChange={(v) => setDraft((d) => ({ ...d, pressures: v }))} />
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-pine-900/10 bg-white p-5 shadow-sm transition-all hover:border-pine-900/20 hover:shadow-card">
      <div className="flex items-start gap-3">
        {selectMode ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-pine-900"
          />
        ) : null}
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-900 text-sm font-bold text-acid">
          {persona.persona_name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-pine-900">{persona.persona_name}</p>
              {persona.typical_role ? <p className="mt-0.5 text-xs font-medium text-muted">{persona.typical_role}</p> : null}
            </div>
            <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {confirmDelete ? (
                <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
              ) : (
                <>
                  <IconButton onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton danger onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </>
              )}
            </div>
          </div>
          {persona.goals && persona.goals.length > 0 ? (
            <div className="mt-3 rounded-xl border border-pine-900/8 bg-pine-50/70 px-3 py-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-pine-700">Goals</p>
              <ul className="space-y-1">
                {persona.goals.slice(0, 3).map((g, i) => (
                  <li key={i} className="text-xs leading-5 text-ink">
                    <span className="mr-1.5 text-pine-600">·</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {persona.likely_concerns && persona.likely_concerns.length > 0 ? (
            <div className="mt-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Likely concerns</p>
              <ul className="space-y-0.5">
                {persona.likely_concerns.slice(0, 2).map((c, i) => (
                  <li key={i} className="text-xs leading-5 text-muted">
                    <span className="mr-1.5">·</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
      <div className="space-y-3 bg-white px-5 py-4">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Title
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className={`mt-1 ${INPUT}`}
          />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Category
          <select
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className={`mt-1 ${INPUT}`}
          >
            {PAIN_POINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Plain English definition
          <textarea
            rows={2}
            value={draft.plain_english_definition}
            onChange={(e) => setDraft((d) => ({ ...d, plain_english_definition: e.target.value }))}
            className={`mt-1 ${TEXTAREA}`}
          />
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group flex items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-pine-50/80">
      <div className="flex min-w-0 items-start gap-3">
        {selectMode ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-pine-900"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-pine-900 transition-colors group-hover:text-pine-800">{pp.title}</p>
          {pp.plain_english_definition ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">{pp.plain_english_definition}</p>
          ) : null}
        </div>
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
        ) : (
          <>
            <IconButton onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton danger onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton href={`/admin/engagement/pain-points/${pp.id}`}>
              <ArrowRight className="h-3.5 w-3.5" />
            </IconButton>
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
      <div className="space-y-3 bg-white px-5 py-4">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Prompt
          <textarea
            rows={3}
            value={draft.prompt}
            onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))}
            className={`mt-1 ${TEXTAREA}`}
          />
        </label>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Context tags
          <div className="mt-1">
            <TagsInput value={draft.context_tags} onChange={(v) => setDraft((d) => ({ ...d, context_tags: v }))} />
          </div>
        </label>
        <EditSaveRow saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group flex items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-pine-50/80">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {selectMode ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-pine-900"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6 text-ink">{prompt.prompt}</p>
          {prompt.context_tags && prompt.context_tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prompt.context_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-pine-900/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-pine-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <ConfirmDelete onConfirm={() => void del()} onCancel={() => setConfirmDelete(false)} saving={deleting} />
        ) : (
          <>
            <IconButton onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton danger onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
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
  const ActiveIcon = TAB_META[tab].icon;
  const itemCount =
    tab === "sectors"
      ? sectors.length
      : tab === "personas"
        ? personas.length
        : tab === "pain_points"
          ? painPoints.length
          : tab === "vat_prompts"
            ? vatPrompts.length
            : null;

  const renderNavButton = (key: Tab) => {
    const meta = TAB_META[key];
    const Icon = meta.icon;
    const active = tab === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => switchTab(key)}
        className={`group flex min-w-[7.5rem] flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all sm:min-w-0 ${
          active
            ? "bg-pine-900 text-paper shadow-sm"
            : "bg-white text-muted hover:bg-pine-50 hover:text-pine-900 border border-pine-900/8"
        }`}
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            active ? "bg-acid text-ink" : "bg-pine-50 text-pine-800 group-hover:bg-white"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className={`text-xs font-semibold leading-tight ${active ? "text-paper" : "text-pine-900"}`}>
          {meta.label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-full bg-white">
      {/* Hub chrome */}
      <div className="border-b border-pine-900/8 bg-white">
        <div className="px-4 pb-5 pt-6 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pine-900 text-acid">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pine-700">Client engagement</p>
                <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-pine-900">Knowledge Hub</h1>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                  Playbooks for outreach, scoping and delivery — organised so you can find the right language fast.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-acid px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-acid/90"
            >
              <Plus className="h-4 w-4" />
              Add entry
            </button>
          </div>

          {/* Grouped navigation */}
          <div className="mt-6 space-y-3">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Library</p>
              <div className="flex flex-wrap gap-2">{LIBRARY_TABS.map(renderNavButton)}</div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Sales tools</p>
              <div className="flex flex-wrap gap-2">{SALES_TABS.map(renderNavButton)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active section header + tools */}
      <div className="sticky top-0 z-20 border-b border-pine-900/8 bg-white/95 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-pine-900/10 bg-pine-50 text-pine-900">
              <ActiveIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-pine-900">{TAB_META[tab].title}</h2>
                {itemCount != null && !loading ? (
                  <span className="rounded-full bg-pine-900 px-2 py-0.5 text-[10px] font-bold text-paper">
                    {itemCount}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 max-w-2xl text-sm leading-6 text-muted">{TAB_META[tab].description}</p>
            </div>
          </div>

          {!(["pricing", "scripts", "objections"] as Tab[]).includes(tab) ? (
            <div className="flex flex-wrap items-center gap-2">
              {tab !== "vat_prompts" ? (
                <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      tab === "pain_points"
                        ? "Search pain points…"
                        : tab === "sectors"
                          ? "Search sectors…"
                          : "Search…"
                    }
                    className="w-full rounded-xl border border-pine-900/12 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-pine-900/40 focus:ring-2 focus:ring-pine-900/8"
                  />
                </div>
              ) : null}
              {tab === "pain_points" ? (
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
              ) : null}
              {tab === "vat_prompts" ? (
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-pine-900/10 bg-white p-1">
                  {(["value", "alignment", "trust"] as const).map((dim) => {
                    const on = dimension === dim;
                    return (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => setDimension(on ? "" : dim)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                          on
                            ? dim === "value"
                              ? "bg-pine-900 text-paper"
                              : dim === "alignment"
                                ? "bg-pine-700 text-paper"
                                : "bg-acid text-ink"
                            : "text-muted hover:bg-pine-50 hover:text-pine-900"
                        }`}
                      >
                        {dim}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {canSelect ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectMode((v) => !v);
                    setSelectedIds(new Set());
                    setConfirmBulkDelete(false);
                  }}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    selectMode
                      ? "border-pine-900 bg-pine-900 text-paper"
                      : "border-pine-900/12 bg-white text-muted hover:border-pine-900/25 hover:text-pine-900"
                  }`}
                >
                  {selectMode ? "Cancel select" : "Select"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 md:py-8">
        {selectMode && selectedIds.size > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold text-red-700">selected</span>
            {confirmBulkDelete ? (
              <>
                <span className="text-xs text-red-600">
                  Delete {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""}?
                </span>
                <button
                  type="button"
                  onClick={() => void deleteSelected()}
                  disabled={deletingSelected}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingSelected ? "Deleting…" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBulkDelete(false)}
                  className="text-xs font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" /> Delete selected
              </button>
            )}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-pine-900/8 bg-pine-50/80" />
            ))}
          </div>
        ) : (
          <>
            {tab === "sectors" &&
              (sectors.length === 0 ? (
                <EmptyState title="No sectors found" hint="Try another search, or add a sector with Add entry." />
              ) : (
                <>
                  {highlightIds.size > 0 ? (
                    <p className="mb-5 rounded-2xl border border-pine-900/15 bg-pine-900 px-4 py-3 text-sm text-paper">
                      <span className="mr-2 inline-block rounded bg-acid px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                        Match
                      </span>
                      Highlighted sectors may be relevant to this prospect based on their sector tags.
                    </p>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sectors.map((s) => (
                      <SectorCard
                        key={s.id}
                        sector={s}
                        selected={selectedIds.has(s.id)}
                        selectMode={selectMode}
                        onSelect={() => toggleSelect(s.id)}
                        onDeleted={reload}
                        onSaved={reload}
                        highlight={highlightIds.has(s.id)}
                      />
                    ))}
                  </div>
                </>
              ))}

            {tab === "personas" &&
              (personas.length === 0 ? (
                <EmptyState title="No personas found" hint="Add a persona to keep outreach specific." />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {personas.map((p) => (
                    <PersonaCard
                      key={p.id}
                      persona={p}
                      selected={selectedIds.has(p.id)}
                      selectMode={selectMode}
                      onSelect={() => toggleSelect(p.id)}
                      onDeleted={reload}
                      onSaved={reload}
                    />
                  ))}
                </div>
              ))}

            {tab === "pain_points" &&
              (painPoints.length === 0 ? (
                <EmptyState title="No pain points found" hint="Clear filters or add a new pain point." />
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    painPoints.reduce<Record<string, PainPoint[]>>((acc, pp) => {
                      (acc[pp.category] ??= []).push(pp);
                      return acc;
                    }, {}),
                  ).map(([cat, items]) => (
                    <section key={cat} className="overflow-hidden rounded-2xl border border-pine-900/10 bg-white shadow-sm">
                      <header className="flex items-center justify-between gap-3 border-b border-pine-900/8 bg-pine-900 px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-acid/90 text-ink">
                            <Target className="h-3.5 w-3.5" />
                          </span>
                          <h3 className="text-sm font-semibold text-paper">{cat}</h3>
                        </div>
                        <span className="rounded-full bg-white/12 px-2.5 py-0.5 text-[11px] font-bold text-paper">
                          {items.length}
                        </span>
                      </header>
                      <div className="divide-y divide-pine-900/6">
                        {items.map((pp) => (
                          <PainPointRow
                            key={pp.id}
                            pp={pp}
                            selected={selectedIds.has(pp.id)}
                            selectMode={selectMode}
                            onSelect={() => toggleSelect(pp.id)}
                            onDeleted={reload}
                            onSaved={reload}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ))}

            {tab === "vat_prompts" &&
              (vatPrompts.length === 0 ? (
                <EmptyState title="No prompts found" hint="Try another VAT dimension filter." />
              ) : (
                <div className="space-y-4">
                  {(["value", "alignment", "trust"] as const)
                    .filter((dim) => !dimension || dimension === dim)
                    .map((dim) => {
                      const dimPrompts = vatPrompts.filter((p) => p.dimension === dim);
                      if (dimPrompts.length === 0) return null;
                      const header =
                        dim === "value"
                          ? "bg-pine-900 text-paper"
                          : dim === "alignment"
                            ? "bg-pine-800 text-paper"
                            : "bg-acid text-ink";
                      return (
                        <section
                          key={dim}
                          className="overflow-hidden rounded-2xl border border-pine-900/10 bg-white shadow-sm"
                        >
                          <header className={`flex items-center justify-between px-5 py-3.5 ${header}`}>
                            <div className="flex items-center gap-2">
                              <Scale className="h-4 w-4 opacity-80" />
                              <p className="text-xs font-bold uppercase tracking-[0.12em]">
                                {dim}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                dim === "trust" ? "bg-ink/10 text-ink" : "bg-white/15 text-paper"
                              }`}
                            >
                              {dimPrompts.length}
                            </span>
                          </header>
                          <div className="divide-y divide-pine-900/6">
                            {dimPrompts.map((p) => (
                              <VatPromptRow
                                key={p.id}
                                prompt={p}
                                selected={selectedIds.has(p.id)}
                                selectMode={selectMode}
                                onSelect={() => toggleSelect(p.id)}
                                onDeleted={reload}
                                onSaved={reload}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                </div>
              ))}

            {tab === "pricing" ? <PricingBandsPanel /> : null}
            {tab === "scripts" ? <ScriptsBlocksPanel /> : null}
            {tab === "objections" ? <ObjectionsPanel /> : null}
          </>
        )}
      </div>

      <KnowledgeAddModal
        open={addModalOpen}
        defaultSection={tab as Tab}
        onClose={() => setAddModalOpen(false)}
        onSaved={(section) => {
          if (section === tab) reload();
        }}
      />
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-white px-8 py-16 text-sm text-muted">Loading knowledge hub…</div>}>
      <KnowledgePageInner />
    </Suspense>
  );
}
