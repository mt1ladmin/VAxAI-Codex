"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Pencil, Plus, Save, X } from "lucide-react";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { COMPLEXITY_COLORS } from "@/lib/engagement/prospect-outreach/types";

type ServiceFitMode = "overview" | "research" | "support" | "recommended_engagement" | "full";

type SaveFieldValue = string | string[];

type Props = {
  data: ProspectOutreachRecord;
  /** @deprecated Prefer `mode` — when true, shows summary only. */
  compact?: boolean;
  mode?: ServiceFitMode;
  editable?: boolean;
  onSaveField?: (field: string, value: SaveFieldValue) => Promise<void>;
  onSaveFields?: (fields: Record<string, SaveFieldValue>) => Promise<void>;
};

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]";

function linesFromItems(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}

function itemsFromLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition-colors hover:bg-[#f7f4ea]/25"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-[#6f6b62]" /> : <ChevronRight className="h-4 w-4 text-[#6f6b62]" />}
      </button>
      {open && <div className="space-y-3 p-4">{children}</div>}
    </div>
  );
}

function TagList({ items, tone }: { items: string[]; tone?: "primary" | "muted" }) {
  if (!items.length) return <p className="text-sm text-[#6f6b62]">—</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-lg px-3 py-2 text-sm ${
            tone === "muted" ? "border border-[#111111]/10 text-[#6f6b62]" : "bg-[#063b32]/5 text-[#063b32]"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionEditButtons({
  saving,
  onSave,
  onCancel,
}: {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save all
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
      >
        <X className="h-3.5 w-3.5" /> Cancel
      </button>
    </div>
  );
}

export function hasVaxaiSupportContent(data: ProspectOutreachRecord): boolean {
  return !!(
    (data.vaxai_direct_support?.length ?? 0) > 0 ||
    (data.vaxai_partial_support?.length ?? 0) > 0 ||
    (data.partner_support?.length ?? 0) > 0 ||
    data.capability_boundaries?.trim() ||
    data.bespoke_build_note?.trim()
  );
}

export function hasResearchAssessmentContent(data: ProspectOutreachRecord): boolean {
  return !!(
    data.evidence_summary?.trim() ||
    data.complexity_rationale?.trim() ||
    data.admin_capacity?.trim() ||
    data.ai_automation_use?.trim() ||
    data.data_sensitivity?.trim() ||
    data.systems_landscape?.trim() ||
    (data.open_questions?.length ?? 0) > 0
  );
}

export function hasRecommendedEngagementContent(data: ProspectOutreachRecord): boolean {
  return !!(
    data.recommended_engagement?.trim() ||
    data.accessibility_considerations?.trim()
  );
}

// ── Research Assessment ────────────────────────────────────────────────────────

function EvidenceAndAssessment({
  data,
  editable,
  onSaveFields,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onSaveFields?: (fields: Record<string, SaveFieldValue>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    evidence_summary: data.evidence_summary || "",
    need_rationale: data.need_rationale || "",
    complexity_rationale: data.complexity_rationale || "",
    admin_capacity: data.admin_capacity || "",
    ai_automation_use: data.ai_automation_use || "",
    data_sensitivity: data.data_sensitivity || "",
    systems_landscape: data.systems_landscape || "",
    open_questions: linesFromItems(data.open_questions),
  });

  const hasContent = hasResearchAssessmentContent(data);

  const startEdit = () => {
    setForm({
      evidence_summary: data.evidence_summary || "",
      need_rationale: data.need_rationale || "",
      complexity_rationale: data.complexity_rationale || "",
      admin_capacity: data.admin_capacity || "",
      ai_automation_use: data.ai_automation_use || "",
      data_sensitivity: data.data_sensitivity || "",
      systems_landscape: data.systems_landscape || "",
      open_questions: linesFromItems(data.open_questions),
    });
    setEditing(true);
  };

  const save = async () => {
    if (!onSaveFields) return;
    setSaving(true);
    try {
      await onSaveFields({
        evidence_summary: form.evidence_summary.trim(),
        need_rationale: form.need_rationale.trim(),
        complexity_rationale: form.complexity_rationale.trim(),
        admin_capacity: form.admin_capacity.trim(),
        ai_automation_use: form.ai_automation_use.trim(),
        data_sensitivity: form.data_sensitivity.trim(),
        systems_landscape: form.systems_landscape.trim(),
        open_questions: itemsFromLines(form.open_questions),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing && editable && onSaveFields) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Research Assessment</p>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Evidence summary</label>
          <textarea value={form.evidence_summary} onChange={(e) => setForm((f) => ({ ...f, evidence_summary: e.target.value }))} rows={5} className={`${inputClass} resize-y leading-relaxed`} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Need rationale</label>
          <textarea value={form.need_rationale} onChange={(e) => setForm((f) => ({ ...f, need_rationale: e.target.value }))} rows={4} className={`${inputClass} resize-y leading-relaxed`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Complexity rationale</label>
          <textarea value={form.complexity_rationale} onChange={(e) => setForm((f) => ({ ...f, complexity_rationale: e.target.value }))} rows={3} className={`${inputClass} resize-y`} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Admin capacity</label>
            <input type="text" value={form.admin_capacity} onChange={(e) => setForm((f) => ({ ...f, admin_capacity: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">AI / automation use</label>
            <input type="text" value={form.ai_automation_use} onChange={(e) => setForm((f) => ({ ...f, ai_automation_use: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Data sensitivity</label>
            <input type="text" value={form.data_sensitivity} onChange={(e) => setForm((f) => ({ ...f, data_sensitivity: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Systems landscape</label>
            <textarea value={form.systems_landscape} onChange={(e) => setForm((f) => ({ ...f, systems_landscape: e.target.value }))} rows={3} className={`${inputClass} resize-y`} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Open questions <span className="normal-case font-normal">(one per line)</span></label>
          <textarea value={form.open_questions} onChange={(e) => setForm((f) => ({ ...f, open_questions: e.target.value }))} rows={4} placeholder="One question per line" className={`${inputClass} resize-y`} />
        </div>
        <SectionEditButtons saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  if (!hasContent && editable && onSaveFields) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Research Assessment</p>
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <p className="mt-2 text-sm text-[#6f6b62]">No research assessment added yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Research Assessment</p>
        {editable && onSaveFields && (
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Evidence</p>
        <p className="mt-1 text-sm text-[#111111] whitespace-pre-wrap">
          {data.evidence_summary || data.need_rationale || "—"}
        </p>
      </div>
      {data.complexity_rationale && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Complexity</p>
          <p className="mt-1 text-sm text-[#111111]">{data.complexity_rationale}</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.admin_capacity && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Admin capacity</p>
            <p className="mt-1 text-sm">{data.admin_capacity}</p>
          </div>
        )}
        {data.ai_automation_use && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">AI / automation use</p>
            <p className="mt-1 text-sm">{data.ai_automation_use}</p>
          </div>
        )}
        {data.data_sensitivity && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Data sensitivity</p>
            <p className="mt-1 text-sm">{data.data_sensitivity}</p>
          </div>
        )}
        {data.systems_landscape && (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Systems landscape</p>
            <p className="mt-1 text-sm">{data.systems_landscape}</p>
          </div>
        )}
      </div>
      {(data.open_questions?.length ?? 0) > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Open questions</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#111111]">
            {data.open_questions!.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── VAxAI Support ──────────────────────────────────────────────────────────────

function VaxaiSupportAndBoundaries({
  data,
  flat = false,
  editable,
  onSaveFields,
}: {
  data: ProspectOutreachRecord;
  flat?: boolean;
  editable?: boolean;
  onSaveFields?: (fields: Record<string, SaveFieldValue>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vaxai_direct_support: linesFromItems(data.vaxai_direct_support),
    vaxai_partial_support: linesFromItems(data.vaxai_partial_support),
    partner_support: linesFromItems(data.partner_support),
    capability_boundaries: data.capability_boundaries || "",
    bespoke_build_note: data.bespoke_build_note || "",
  });

  const hasContent = hasVaxaiSupportContent(data);

  const startEdit = () => {
    setForm({
      vaxai_direct_support: linesFromItems(data.vaxai_direct_support),
      vaxai_partial_support: linesFromItems(data.vaxai_partial_support),
      partner_support: linesFromItems(data.partner_support),
      capability_boundaries: data.capability_boundaries || "",
      bespoke_build_note: data.bespoke_build_note || "",
    });
    setEditing(true);
  };

  const save = async () => {
    if (!onSaveFields) return;
    setSaving(true);
    try {
      await onSaveFields({
        vaxai_direct_support: itemsFromLines(form.vaxai_direct_support),
        vaxai_partial_support: itemsFromLines(form.vaxai_partial_support),
        partner_support: itemsFromLines(form.partner_support),
        capability_boundaries: form.capability_boundaries.trim(),
        bespoke_build_note: form.bespoke_build_note.trim(),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing && editable && onSaveFields) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">VAxAI Support</p>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Best-fit VAxAI support <span className="normal-case font-normal">(one per line)</span></label>
          <textarea value={form.vaxai_direct_support} onChange={(e) => setForm((f) => ({ ...f, vaxai_direct_support: e.target.value }))} rows={5} placeholder="One item per line" className={`${inputClass} resize-y`} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Partial VAxAI role <span className="normal-case font-normal">(one per line)</span></label>
          <textarea value={form.vaxai_partial_support} onChange={(e) => setForm((f) => ({ ...f, vaxai_partial_support: e.target.value }))} rows={4} placeholder="One item per line" className={`${inputClass} resize-y`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Specialist / partner may be needed <span className="normal-case font-normal">(one per line)</span></label>
          <textarea value={form.partner_support} onChange={(e) => setForm((f) => ({ ...f, partner_support: e.target.value }))} rows={3} placeholder="One item per line" className={`${inputClass} resize-y`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Capability boundaries</label>
          <textarea value={form.capability_boundaries} onChange={(e) => setForm((f) => ({ ...f, capability_boundaries: e.target.value }))} rows={4} className={`${inputClass} resize-y`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Build vs improve</label>
          <textarea value={form.bespoke_build_note} onChange={(e) => setForm((f) => ({ ...f, bespoke_build_note: e.target.value }))} rows={3} className={`${inputClass} resize-y`} />
        </div>
        <SectionEditButtons saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  if (!hasContent && editable && onSaveFields) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">VAxAI Support</p>
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <p className="mt-2 text-sm text-[#6f6b62]">No VAxAI support assessment added yet.</p>
      </div>
    );
  }

  const viewContent = (
    <>
      {editable && onSaveFields && (
        <div className="flex justify-end">
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        </div>
      )}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Best-fit VAxAI support</p>
        <TagList items={data.vaxai_direct_support || []} />
      </div>
      {(data.vaxai_partial_support?.length ?? 0) > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Partial VAxAI role</p>
          <TagList items={data.vaxai_partial_support || []} tone="muted" />
        </div>
      )}
      {(data.partner_support?.length ?? 0) > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Specialist / partner may be needed</p>
          <TagList items={data.partner_support || []} tone="muted" />
        </div>
      )}
      {data.capability_boundaries && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Capability boundaries</p>
          <p className="mt-1 text-sm text-[#111111]">{data.capability_boundaries}</p>
        </div>
      )}
      {data.bespoke_build_note && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Build vs improve</p>
          <p className="mt-1 text-sm text-[#111111]">{data.bespoke_build_note}</p>
        </div>
      )}
    </>
  );

  if (flat || editable) {
    return (
      <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
        {viewContent}
      </div>
    );
  }

  return (
    <CollapsibleSection title="VAxAI support and boundaries" defaultOpen>
      {viewContent}
    </CollapsibleSection>
  );
}

// ── Engagement Guide ───────────────────────────────────────────────────────────

function RecommendedEngagement({
  data,
  editable,
  onSaveFields,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onSaveFields?: (fields: Record<string, SaveFieldValue>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    engagement_approach: data.engagement_approach || "",
    recommended_engagement: data.recommended_engagement || "",
    accessibility_considerations: data.accessibility_considerations || "",
  });

  const hasContent = hasRecommendedEngagementContent(data) || !!data.engagement_approach?.trim();

  const startEdit = () => {
    setForm({
      engagement_approach: data.engagement_approach || "",
      recommended_engagement: data.recommended_engagement || "",
      accessibility_considerations: data.accessibility_considerations || "",
    });
    setEditing(true);
  };

  const save = async () => {
    if (!onSaveFields) return;
    setSaving(true);
    try {
      await onSaveFields({
        engagement_approach: form.engagement_approach.trim(),
        recommended_engagement: form.recommended_engagement.trim(),
        accessibility_considerations: form.accessibility_considerations.trim(),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing && editable && onSaveFields) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Engagement Guide</p>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Recommended engagement</label>
          <textarea value={form.recommended_engagement} onChange={(e) => setForm((f) => ({ ...f, recommended_engagement: e.target.value }))} rows={6} placeholder="Short recommendation on next steps and engagement approach…" className={`${inputClass} resize-y`} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Engagement guide</label>
          <textarea value={form.engagement_approach} onChange={(e) => setForm((f) => ({ ...f, engagement_approach: e.target.value }))} rows={18} placeholder="Meeting prep, discovery hooks, recommended entry point, and conversation guidance…" className={`${inputClass} resize-y leading-relaxed`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Accessibility note</label>
          <textarea value={form.accessibility_considerations} onChange={(e) => setForm((f) => ({ ...f, accessibility_considerations: e.target.value }))} rows={4} className={`${inputClass} resize-y`} />
        </div>
        <SectionEditButtons saving={saving} onSave={() => void save()} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  if (!hasContent && editable && onSaveFields) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Engagement Guide</p>
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <p className="mt-2 text-sm text-[#6f6b62]">No engagement guide added yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Engagement Guide</p>
        {editable && onSaveFields && (
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
      {data.recommended_engagement && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Recommended engagement</p>
          <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{data.recommended_engagement}</p>
        </div>
      )}
      {data.engagement_approach && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Engagement guide</p>
          <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{data.engagement_approach}</p>
        </div>
      )}
      {!data.engagement_approach && !data.recommended_engagement && (
        <p className="text-sm text-[#6f6b62]">—</p>
      )}
      {data.accessibility_considerations && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Accessibility note</p>
          <p className="mt-1 text-sm text-amber-900">{data.accessibility_considerations}</p>
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function ServiceFitPanel({ data, compact, mode, editable, onSaveField, onSaveFields }: Props) {
  const resolvedMode: ServiceFitMode = mode ?? (compact ? "overview" : "full");
  const showSummary = resolvedMode === "overview" || resolvedMode === "full";
  const showEvidence = resolvedMode === "research" || resolvedMode === "full";
  const showSupport = resolvedMode === "support" || resolvedMode === "full";
  const showRecommended = resolvedMode === "recommended_engagement" || resolvedMode === "full";

  // Resolve batch save function — prefer onSaveFields; fall back to per-field calls
  const batchSave = onSaveFields ?? (
    onSaveField
      ? async (fields: Record<string, SaveFieldValue>) => {
          for (const [field, value] of Object.entries(fields)) {
            await onSaveField(field, value);
          }
        }
      : undefined
  );

  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryForm, setSummaryForm] = useState({
    service_fit_summary: data.service_fit_summary || "",
    likely_need: data.likely_need || "",
    complexity_level: data.complexity_level || "",
    engagement_basis: data.engagement_basis || "",
  });
  const [savingSummary, setSavingSummary] = useState(false);

  const startSummaryEdit = () => {
    setSummaryForm({
      service_fit_summary: data.service_fit_summary || "",
      likely_need: data.likely_need || "",
      complexity_level: data.complexity_level || "",
      engagement_basis: data.engagement_basis || "",
    });
    setEditingSummary(true);
  };

  const saveSummary = async () => {
    if (!batchSave) return;
    setSavingSummary(true);
    try {
      await batchSave({
        service_fit_summary: summaryForm.service_fit_summary.trim(),
        likely_need: summaryForm.likely_need.trim(),
        complexity_level: summaryForm.complexity_level.trim(),
        engagement_basis: summaryForm.engagement_basis.trim(),
      });
      setEditingSummary(false);
    } finally {
      setSavingSummary(false);
    }
  };

  if (resolvedMode === "overview" && !data.service_fit_summary && !data.likely_need && !editable) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-4 text-sm text-[#6f6b62]">
        Service-fit assessment not yet available for this record.
      </div>
    );
  }

  if (resolvedMode === "research" && !editable && !hasResearchAssessmentContent(data)) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-4 text-sm text-[#6f6b62]">
        Detailed research assessment not yet available for this record.
      </div>
    );
  }

  if (resolvedMode === "support" && !editable && !hasVaxaiSupportContent(data)) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-4 text-sm text-[#6f6b62]">
        VAxAI support and boundaries not yet available for this record.
      </div>
    );
  }

  if (resolvedMode === "recommended_engagement" && !editable && !hasRecommendedEngagementContent(data)) {
    return (
      <div className="rounded-xl border border-dashed border-[#111111]/15 p-4 text-sm text-[#6f6b62]">
        Recommended engagement not yet available for this record.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSummary && (
        <div className="rounded-xl border border-[#063b32]/15 bg-[#063b32]/5 p-4">
          {editingSummary ? (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#063b32]">Service fit</p>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Service fit summary</label>
                <textarea
                  value={summaryForm.service_fit_summary}
                  onChange={(e) => setSummaryForm((f) => ({ ...f, service_fit_summary: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Likely need</label>
                <textarea
                  value={summaryForm.likely_need}
                  onChange={(e) => setSummaryForm((f) => ({ ...f, likely_need: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Complexity level</label>
                  <input
                    value={summaryForm.complexity_level}
                    onChange={(e) => setSummaryForm((f) => ({ ...f, complexity_level: e.target.value }))}
                    placeholder="e.g. low, medium, high"
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Engagement basis</label>
                  <input
                    value={summaryForm.engagement_basis}
                    onChange={(e) => setSummaryForm((f) => ({ ...f, engagement_basis: e.target.value }))}
                    placeholder="e.g. retainer, project"
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void saveSummary()}
                  disabled={savingSummary}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                >
                  {savingSummary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSummary(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-white/50"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#063b32]">Service fit</p>
                {data.complexity_level && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      COMPLEXITY_COLORS[data.complexity_level] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {data.complexity_level} complexity
                  </span>
                )}
                {data.engagement_basis && data.engagement_basis !== "unknown" && (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62] capitalize">
                    {data.engagement_basis.replace("_", " ")} support
                  </span>
                )}
                {data.bespoke_build_fit === false && (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#063b32]">
                    Improve existing first
                  </span>
                )}
                {editable && batchSave && (
                  <button
                    type="button"
                    onClick={startSummaryEdit}
                    className="ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-[#111111]">
                {data.service_fit_summary || data.likely_need}
              </p>
              {resolvedMode === "full" && data.likely_need && data.likely_need !== data.service_fit_summary && (
                <p className="mt-2 text-sm text-[#6f6b62]">{data.likely_need}</p>
              )}
            </>
          )}
        </div>
      )}

      {showEvidence && (
        <EvidenceAndAssessment data={data} editable={editable} onSaveFields={batchSave} />
      )}
      {showSupport && (
        <VaxaiSupportAndBoundaries
          data={data}
          flat={resolvedMode === "support"}
          editable={editable}
          onSaveFields={batchSave}
        />
      )}
      {showRecommended && (
        <RecommendedEngagement data={data} editable={editable} onSaveFields={batchSave} />
      )}
    </div>
  );
}
