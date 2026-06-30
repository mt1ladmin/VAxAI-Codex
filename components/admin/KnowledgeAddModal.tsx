"use client";

import { useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { PAIN_POINT_CATEGORIES } from "@/lib/engagement/types";

type Section = "sectors" | "personas" | "pain_points" | "vat_prompts" | "pricing" | "scripts" | "objections";

const SECTION_LABELS: Record<Section, string> = {
  sectors: "Sector",
  personas: "Persona",
  pain_points: "Pain Point",
  vat_prompts: "VAT Prompt",
  pricing: "Pricing Band",
  scripts: "Script / Block",
  objections: "Objection",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">{label}</span>
      {children}
    </label>
  );
}

const INPUT = "w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#063b32]";
const TEXTAREA = `${INPUT} resize-none`;

function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  };

  return (
    <div className="rounded-lg border border-[#111111]/15 p-2 focus-within:border-[#063b32]">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[11px] font-semibold text-[#6f6b62]">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <input
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder={placeholder ?? "Type and press Enter"}
        className="w-full text-sm outline-none bg-transparent text-[#111111] placeholder:text-[#6f6b62]"
      />
    </div>
  );
}

function ListInput({ value, onChange, placeholder, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; rows?: number }) {
  const text = value.join("\n");
  return (
    <textarea
      rows={rows}
      value={text}
      onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      placeholder={placeholder ?? "One item per line"}
      className={TEXTAREA}
    />
  );
}

// ── Per-section forms ──────────────────────────────────────────────────────

function SectorForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({
    name: "", description: "", common_operating_model: "", starting_language: "",
    audience_types: [] as string[],
    common_admin_pressures: [] as string[],
    typical_stakeholders: [] as string[],
    common_systems: [] as string[],
    questions_to_explore: [] as string[],
  });

  const save = async () => {
    if (!d.name.trim()) return;
    setSaving(true);
    await fetch("/api/admin/engagement/sectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, name: d.name.trim(), status: "approved" }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <Field label="Sector name *"><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={INPUT} placeholder="e.g. Health and Social Care" /></Field>
      <Field label="Description"><textarea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className={TEXTAREA} /></Field>
      <Field label="Audience types"><TagsInput value={d.audience_types} onChange={(v) => setD({ ...d, audience_types: v })} placeholder="e.g. Charities — press Enter" /></Field>
      <Field label="Common operating model"><textarea rows={2} value={d.common_operating_model} onChange={(e) => setD({ ...d, common_operating_model: e.target.value })} className={TEXTAREA} /></Field>
      <Field label="Common admin pressures (one per line)"><ListInput value={d.common_admin_pressures} onChange={(v) => setD({ ...d, common_admin_pressures: v })} /></Field>
      <Field label="Typical stakeholders"><TagsInput value={d.typical_stakeholders} onChange={(v) => setD({ ...d, typical_stakeholders: v })} /></Field>
      <Field label="Common systems and tools"><TagsInput value={d.common_systems} onChange={(v) => setD({ ...d, common_systems: v })} /></Field>
      <Field label="Starting language"><textarea rows={2} value={d.starting_language} onChange={(e) => setD({ ...d, starting_language: e.target.value })} className={TEXTAREA} placeholder="Language to use when opening a conversation…" /></Field>
      <Field label="Questions to explore (one per line)"><ListInput value={d.questions_to_explore} onChange={(v) => setD({ ...d, questions_to_explore: v })} /></Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.name.trim()} />
    </div>
  );
}

function PersonaForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({
    persona_name: "", typical_role: "",
    goals: [] as string[], pressures: [] as string[],
    likely_concerns: [] as string[], useful_questions: [] as string[],
  });

  const save = async () => {
    if (!d.persona_name.trim()) return;
    setSaving(true);
    await fetch("/api/admin/engagement/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, persona_name: d.persona_name.trim() }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <Field label="Persona name *"><input value={d.persona_name} onChange={(e) => setD({ ...d, persona_name: e.target.value })} className={INPUT} placeholder="e.g. Operations Manager" /></Field>
      <Field label="Typical role"><input value={d.typical_role} onChange={(e) => setD({ ...d, typical_role: e.target.value })} className={INPUT} placeholder="e.g. Mid-level, manages a small team" /></Field>
      <Field label="Goals (one per line)"><ListInput value={d.goals} onChange={(v) => setD({ ...d, goals: v })} /></Field>
      <Field label="Pressures (one per line)"><ListInput value={d.pressures} onChange={(v) => setD({ ...d, pressures: v })} /></Field>
      <Field label="Likely concerns (one per line)"><ListInput value={d.likely_concerns} onChange={(v) => setD({ ...d, likely_concerns: v })} /></Field>
      <Field label="Useful questions (one per line)"><ListInput value={d.useful_questions} onChange={(v) => setD({ ...d, useful_questions: v })} /></Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.persona_name.trim()} />
    </div>
  );
}

function PainPointForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({
    title: "", category: "", plain_english_definition: "",
    what_person_says: [] as string[], what_this_means: [] as string[],
  });

  const save = async () => {
    if (!d.title.trim() || !d.category) return;
    setSaving(true);
    await fetch("/api/admin/engagement/pain-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, title: d.title.trim() }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <Field label="Title *"><input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={INPUT} placeholder="e.g. Fragmented client records" /></Field>
      <Field label="Category *">
        <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} className={INPUT}>
          <option value="">Select a category</option>
          {PAIN_POINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Plain English definition"><textarea rows={2} value={d.plain_english_definition} onChange={(e) => setD({ ...d, plain_english_definition: e.target.value })} className={TEXTAREA} /></Field>
      <Field label="What the person says (one per line)"><ListInput value={d.what_person_says} onChange={(v) => setD({ ...d, what_person_says: v })} /></Field>
      <Field label="What this means (one per line)"><ListInput value={d.what_this_means} onChange={(v) => setD({ ...d, what_this_means: v })} /></Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.title.trim() || !d.category} />
    </div>
  );
}

function VatPromptForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({ dimension: "" as "" | "value" | "alignment" | "trust", prompt: "", context_tags: [] as string[] });

  const save = async () => {
    if (!d.prompt.trim() || !d.dimension) return;
    setSaving(true);
    await fetch("/api/admin/engagement/vat-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, prompt: d.prompt.trim(), status: "approved", sort_order: 99 }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <Field label="Dimension *">
        <div className="flex gap-2">
          {(["value", "alignment", "trust"] as const).map((dim) => (
            <button key={dim} type="button" onClick={() => setD({ ...d, dimension: dim })}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                d.dimension === dim
                  ? dim === "value" ? "bg-[#063b32] text-white" : dim === "alignment" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                  : "border border-[#111111]/15 text-[#6f6b62] hover:text-[#111111]"
              }`}>{dim}</button>
          ))}
        </div>
      </Field>
      <Field label="Prompt text *"><textarea rows={3} value={d.prompt} onChange={(e) => setD({ ...d, prompt: e.target.value })} className={TEXTAREA} placeholder="e.g. Will this meaningfully reduce admin pressure…" /></Field>
      <Field label="Context tags"><TagsInput value={d.context_tags} onChange={(v) => setD({ ...d, context_tags: v })} placeholder="e.g. admin, automation — press Enter" /></Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.prompt.trim() || !d.dimension} />
    </div>
  );
}

function ScriptForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({ title: "", channel: "email", block_type: "", tone: "", audience_type: "", content: "" });

  const save = async () => {
    if (!d.title.trim() || !d.content.trim()) return;
    setSaving(true);
    await fetch("/api/admin/engagement/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, title: d.title.trim(), content: d.content.trim(), status: "approved" }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <Field label="Title *"><input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={INPUT} placeholder="e.g. LinkedIn connection request" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Channel *">
          <select value={d.channel} onChange={(e) => setD({ ...d, channel: e.target.value })} className={INPUT}>
            {["email", "linkedin", "phone", "in-person", "general"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </Field>
        <Field label="Block type"><input value={d.block_type} onChange={(e) => setD({ ...d, block_type: e.target.value })} className={INPUT} placeholder="e.g. opener, follow-up" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tone"><input value={d.tone} onChange={(e) => setD({ ...d, tone: e.target.value })} className={INPUT} placeholder="e.g. warm, direct" /></Field>
        <Field label="Audience type"><input value={d.audience_type} onChange={(e) => setD({ ...d, audience_type: e.target.value })} className={INPUT} placeholder="e.g. Charity" /></Field>
      </div>
      <Field label="Content *"><textarea rows={6} value={d.content} onChange={(e) => setD({ ...d, content: e.target.value })} className={TEXTAREA} placeholder="Write the full script or message block here…" /></Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.title.trim() || !d.content.trim()} />
    </div>
  );
}

function ObjectionForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({ objection: "", response: "", category: "", tone: "" });

  const save = async () => {
    if (!d.objection.trim() || !d.response.trim()) return;
    setSaving(true);
    await fetch("/api/admin/engagement/objections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, objection: d.objection.trim(), response: d.response.trim(), status: "approved" }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} className={INPUT}>
            <option value="">None</option>
            {["Cost", "Trust", "Relevance", "Timing", "AI concerns", "Process", "General"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Tone"><input value={d.tone} onChange={(e) => setD({ ...d, tone: e.target.value })} className={INPUT} placeholder="e.g. empathetic" /></Field>
      </div>
      <Field label="Objection *">
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <textarea rows={2} value={d.objection} onChange={(e) => setD({ ...d, objection: e.target.value })} className="w-full bg-transparent text-sm italic text-[#111111] outline-none resize-none placeholder:text-amber-400" placeholder="What the prospect says…" />
        </div>
      </Field>
      <Field label="Response *">
        <div className="rounded-lg border border-[#063b32]/15 bg-[#063b32]/5 p-3">
          <textarea rows={3} value={d.response} onChange={(e) => setD({ ...d, response: e.target.value })} className="w-full bg-transparent text-sm text-[#111111] outline-none resize-none placeholder:text-[#063b32]/40" placeholder="Approved response…" />
        </div>
      </Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.objection.trim() || !d.response.trim()} />
    </div>
  );
}

function PricingForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({ name: "", category: "", unit: "", description: "", band_low: "", band_expected: "", band_high: "" });

  const save = async () => {
    if (!d.name.trim() || !d.category.trim()) return;
    setSaving(true);
    await fetch("/api/admin/engagement/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.name.trim(), category: d.category.trim(), unit: d.unit.trim(),
        description: d.description.trim() || null,
        band_low: d.band_low !== "" ? Number(d.band_low) : null,
        band_expected: d.band_expected !== "" ? Number(d.band_expected) : null,
        band_high: d.band_high !== "" ? Number(d.band_high) : null,
        status: "active",
      }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *"><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={INPUT} placeholder="e.g. VA Support — Starter" /></Field>
        <Field label="Category *"><input value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} className={INPUT} placeholder="e.g. VA Support" /></Field>
      </div>
      <Field label="Unit"><input value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} className={INPUT} placeholder="e.g. per month" /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Band low (£)"><input type="number" value={d.band_low} onChange={(e) => setD({ ...d, band_low: e.target.value })} className={INPUT} /></Field>
        <Field label="Expected (£)"><input type="number" value={d.band_expected} onChange={(e) => setD({ ...d, band_expected: e.target.value })} className={INPUT} /></Field>
        <Field label="Band high (£)"><input type="number" value={d.band_high} onChange={(e) => setD({ ...d, band_high: e.target.value })} className={INPUT} /></Field>
      </div>
      <Field label="Description"><textarea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className={TEXTAREA} /></Field>
      <Footer saving={saving} onSave={() => void save()} onClose={onClose} disabled={!d.name.trim() || !d.category.trim()} />
    </div>
  );
}

function Footer({ saving, onSave, onClose, disabled }: { saving: boolean; onSave: () => void; onClose: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#111111]/10 pt-4">
      <button type="button" onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
      <button type="button" onClick={onSave} disabled={saving || disabled} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        <Plus className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Add"}
      </button>
    </div>
  );
}

const FORM_MAP: Record<Section, React.ComponentType<{ onSave: () => void; onClose: () => void }>> = {
  sectors: SectorForm,
  personas: PersonaForm,
  pain_points: PainPointForm,
  vat_prompts: VatPromptForm,
  pricing: PricingForm,
  scripts: ScriptForm,
  objections: ObjectionForm,
};

export function KnowledgeAddModal({ open, defaultSection, onClose, onSaved }: {
  open: boolean;
  defaultSection?: Section;
  onClose: () => void;
  onSaved: (section: Section) => void;
}) {
  const [section, setSection] = useState<Section | "">(defaultSection ?? "");

  if (!open) return null;

  const FormComponent = section ? FORM_MAP[section] : null;

  const handleSaved = () => {
    const saved = section as Section;
    onSaved(saved);
    onClose();
    setSection("");
  };

  const handleClose = () => {
    onClose();
    setSection("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#063b32]">Knowledge Hub</p>
            <h2 className="text-lg font-semibold text-[#111111]">
              {section ? `Add ${SECTION_LABELS[section]}` : "What would you like to add?"}
            </h2>
          </div>
          <button type="button" onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-lg border border-[#111111]/15 text-[#6f6b62] hover:bg-[#f7f4ea]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Section picker */}
          {!section && (
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(SECTION_LABELS) as [Section, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className="rounded-xl border border-[#111111]/10 p-4 text-left transition-all hover:border-[#063b32]/40 hover:bg-[#f7f4ea]"
                >
                  <p className="font-semibold text-[#111111] text-sm">{label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Back button when form showing */}
          {section && (
            <div className="mb-4">
              <button type="button" onClick={() => setSection("")} className="text-xs font-semibold text-[#6f6b62] hover:text-[#063b32]">
                ← Change section
              </button>
            </div>
          )}

          {FormComponent && <FormComponent onSave={handleSaved} onClose={handleClose} />}
        </div>
      </div>
    </div>
  );
}
