"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EditableFieldCard } from "@/components/admin/EditableFieldCard";
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
};

function linesFromItems(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}

function itemsFromLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function EditableTextField({
  label,
  value,
  field,
  onSaveField,
  rows = 4,
  placeholder,
  multiline = true,
  flat,
}: {
  label: string;
  value: string;
  field: string;
  onSaveField: (field: string, value: SaveFieldValue) => Promise<void>;
  rows?: number;
  placeholder?: string;
  multiline?: boolean;
  flat?: boolean;
}) {
  return (
    <EditableFieldCard
      label={label}
      value={value}
      rows={rows}
      multiline={multiline}
      placeholder={placeholder}
      flat={flat}
      onSave={(next) => onSaveField(field, next)}
    />
  );
}

function EditableListField({
  label,
  items,
  field,
  onSaveField,
  placeholder,
  flat,
}: {
  label: string;
  items: string[] | undefined;
  field: string;
  onSaveField: (field: string, value: SaveFieldValue) => Promise<void>;
  placeholder?: string;
  flat?: boolean;
}) {
  return (
    <EditableFieldCard
      label={label}
      value={linesFromItems(items)}
      rows={5}
      placeholder={placeholder ?? "One item per line"}
      flat={flat}
      onSave={(next) => onSaveField(field, itemsFromLines(next))}
    />
  );
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
    data.need_rationale?.trim() ||
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

function EvidenceAndAssessment({
  data,
  editable,
  onSaveField,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onSaveField?: (field: string, value: SaveFieldValue) => Promise<void>;
}) {
  if (editable && onSaveField) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Evidence and assessment</p>
        <EditableTextField label="Evidence summary" value={data.evidence_summary || ""} field="evidence_summary" onSaveField={onSaveField} rows={5} flat />
        <EditableTextField label="Need rationale" value={data.need_rationale || ""} field="need_rationale" onSaveField={onSaveField} rows={5} flat />
        <EditableTextField label="Complexity" value={data.complexity_rationale || ""} field="complexity_rationale" onSaveField={onSaveField} flat />
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableTextField label="Admin capacity" value={data.admin_capacity || ""} field="admin_capacity" onSaveField={onSaveField} multiline={false} flat />
          <EditableTextField label="AI / automation use" value={data.ai_automation_use || ""} field="ai_automation_use" onSaveField={onSaveField} multiline={false} flat />
          <EditableTextField label="Data sensitivity" value={data.data_sensitivity || ""} field="data_sensitivity" onSaveField={onSaveField} multiline={false} flat />
          <EditableTextField label="Systems landscape" value={data.systems_landscape || ""} field="systems_landscape" onSaveField={onSaveField} rows={4} flat />
        </div>
      </div>
    );
  }

  return (
    <CollapsibleSection title="Evidence and assessment" defaultOpen>
      <>
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
      </>
    </CollapsibleSection>
  );
}

function VaxaiSupportContent({
  data,
  editable,
  onSaveField,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onSaveField?: (field: string, value: SaveFieldValue) => Promise<void>;
}) {
  if (editable && onSaveField) {
    return (
      <div className="space-y-3">
        <EditableListField label="Best-fit VAxAI support" items={data.vaxai_direct_support} field="vaxai_direct_support" onSaveField={onSaveField} flat />
        <EditableListField label="Partial VAxAI role" items={data.vaxai_partial_support} field="vaxai_partial_support" onSaveField={onSaveField} flat />
        <EditableListField label="Specialist / partner may be needed" items={data.partner_support} field="partner_support" onSaveField={onSaveField} flat />
        <EditableTextField label="Capability boundaries" value={data.capability_boundaries || ""} field="capability_boundaries" onSaveField={onSaveField} flat />
        <EditableTextField label="Build vs improve" value={data.bespoke_build_note || ""} field="bespoke_build_note" onSaveField={onSaveField} flat />
      </div>
    );
  }

  return (
    <>
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
}

function VaxaiSupportAndBoundaries({
  data,
  flat = false,
  editable,
  onSaveField,
}: {
  data: ProspectOutreachRecord;
  flat?: boolean;
  editable?: boolean;
  onSaveField?: (field: string, value: SaveFieldValue) => Promise<void>;
}) {
  if (flat || editable) {
    return (
      <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
        <VaxaiSupportContent data={data} editable={editable} onSaveField={onSaveField} />
      </div>
    );
  }

  return (
    <CollapsibleSection title="VAxAI support and boundaries" defaultOpen>
      <VaxaiSupportContent data={data} editable={editable} onSaveField={onSaveField} />
    </CollapsibleSection>
  );
}

function RecommendedEngagement({
  data,
  editable,
  onSaveField,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onSaveField?: (field: string, value: SaveFieldValue) => Promise<void>;
}) {
  if (editable && onSaveField) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Engagement guide</p>
        <EditableTextField label="Engagement guide" value={data.engagement_approach || ""} field="engagement_approach" onSaveField={onSaveField} rows={18} placeholder="Meeting prep, discovery hooks, recommended entry point, and conversation guidance…" flat />
        <EditableTextField label="Recommended engagement" value={data.recommended_engagement || ""} field="recommended_engagement" onSaveField={onSaveField} rows={6} flat />
        <EditableTextField label="Accessibility note" value={data.accessibility_considerations || ""} field="accessibility_considerations" onSaveField={onSaveField} rows={4} flat />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Recommended engagement</p>
      <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">
        {data.recommended_engagement || "—"}
      </p>
      {data.accessibility_considerations && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Accessibility note</p>
          <p className="mt-1 text-sm text-amber-900">{data.accessibility_considerations}</p>
        </div>
      )}
    </div>
  );
}

function StillToConfirm({
  data,
  editable,
  onSaveField,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onSaveField?: (field: string, value: SaveFieldValue) => Promise<void>;
}) {
  if (editable && onSaveField) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-white p-5 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Still to confirm</p>
        <EditableListField label="Open questions" items={data.open_questions} field="open_questions" onSaveField={onSaveField} placeholder="One question per line" flat />
      </div>
    );
  }

  if (!(data.open_questions?.length ?? 0)) return null;
  return (
    <CollapsibleSection title="Still to confirm">
      <ul className="list-disc space-y-1 pl-5 text-sm text-[#111111]">
        {data.open_questions!.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

export function ServiceFitPanel({ data, compact, mode, editable, onSaveField }: Props) {
  const resolvedMode: ServiceFitMode = mode ?? (compact ? "overview" : "full");
  const showSummary = resolvedMode === "overview" || resolvedMode === "full";
  const showEvidence = resolvedMode === "research" || resolvedMode === "full";
  const showSupport = resolvedMode === "support" || resolvedMode === "full";
  const showRecommended = resolvedMode === "recommended_engagement" || resolvedMode === "full";
  const showOpenQuestions = resolvedMode === "research" || resolvedMode === "full";

  if (resolvedMode === "overview" && !data.service_fit_summary && !data.likely_need) {
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
          </div>
          <p className="mt-2 text-sm font-medium text-[#111111]">
            {data.service_fit_summary || data.likely_need}
          </p>
          {resolvedMode === "full" && data.likely_need && data.likely_need !== data.service_fit_summary && (
            <p className="mt-2 text-sm text-[#6f6b62]">{data.likely_need}</p>
          )}
        </div>
      )}

      {showEvidence && (
        <EvidenceAndAssessment data={data} editable={editable} onSaveField={onSaveField} />
      )}
      {showSupport && (
        <VaxaiSupportAndBoundaries
          data={data}
          flat={resolvedMode === "support"}
          editable={editable}
          onSaveField={onSaveField}
        />
      )}
      {showRecommended && (
        <RecommendedEngagement data={data} editable={editable} onSaveField={onSaveField} />
      )}
      {showOpenQuestions && (
        <StillToConfirm data={data} editable={editable} onSaveField={onSaveField} />
      )}
    </div>
  );
}