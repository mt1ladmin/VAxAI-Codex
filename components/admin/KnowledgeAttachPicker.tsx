"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, Loader2, Save } from "lucide-react";
import {
  fetchKnowledgeAttachments,
  type KnowledgeLinkIds,
} from "@/lib/engagement/knowledge-links";

type Option = { id: string; label: string };

type ParentIds = {
  outreachId?: string;
  contactId?: string;
  enquiryId?: string;
};

function saveParent(ids: ParentIds) {
  if (ids.contactId) return { contact_id: ids.contactId };
  if (ids.enquiryId) return { enquiry_id: ids.enquiryId };
  if (ids.outreachId) return { outreach_id: ids.outreachId };
  return null;
}

async function loadAttachments(ids: ParentIds) {
  if (ids.contactId) {
    const contact = await fetchKnowledgeAttachments({ contactId: ids.contactId });
    if (contact) return contact;
  }
  if (ids.enquiryId) {
    const enquiry = await fetchKnowledgeAttachments({ enquiryId: ids.enquiryId });
    if (enquiry) return enquiry;
  }
  if (ids.outreachId) {
    return fetchKnowledgeAttachments({ outreachId: ids.outreachId });
  }
  return null;
}

export function KnowledgeAttachPicker({
  outreachId,
  contactId,
  enquiryId,
  onSaved,
}: ParentIds & {
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Option[]>([]);
  const [personas, setPersonas] = useState<Option[]>([]);
  const [painPoints, setPainPoints] = useState<Option[]>([]);
  const [selected, setSelected] = useState<KnowledgeLinkIds>({
    sector_ids: [],
    persona_ids: [],
    pain_point_ids: [],
  });

  const parentKey = `${outreachId ?? ""}:${contactId ?? ""}:${enquiryId ?? ""}`;

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/engagement/sectors?limit=100").then((r) => r.json()),
      fetch("/api/admin/engagement/personas?limit=100").then((r) => r.json()),
      fetch("/api/admin/engagement/pain-points?limit=100").then((r) => r.json()),
      loadAttachments({ outreachId, contactId, enquiryId }),
    ]).then(([sJson, pJson, ppJson, existing]) => {
      setSectors((sJson.data ?? []).map((s: { id: string; name: string }) => ({ id: s.id, label: s.name })));
      setPersonas((pJson.data ?? []).map((p: { id: string; persona_name: string }) => ({ id: p.id, label: p.persona_name })));
      setPainPoints((ppJson.data ?? []).map((p: { id: string; title: string }) => ({ id: p.id, label: p.title })));
      if (existing) {
        setSelected({
          sector_ids: existing.sector_ids,
          persona_ids: existing.persona_ids,
          pain_point_ids: existing.pain_point_ids,
        });
      }
    });
  }, [parentKey, outreachId, contactId, enquiryId]);

  const toggle = (key: keyof KnowledgeLinkIds, id: string) => {
    setSelected((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
      };
    });
  };

  const save = async () => {
    const parent = saveParent({ outreachId, contactId, enquiryId });
    if (!parent) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/engagement/knowledge-attachments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parent, ...selected }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Failed to save attachments");
        return;
      }
      onSaved?.();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#111111]/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-[#063b32]"
      >
        <BookOpen className="h-4 w-4" />
        Attach sector / persona / pain point guidance
      </button>
      {open && (
        <div className="space-y-2 border-t border-[#111111]/10 px-4 py-3 text-xs">
          <PickerGroup
            title="Sectors"
            options={sectors}
            selected={selected.sector_ids}
            defaultExpanded={selected.sector_ids.length > 0}
            onToggle={(id) => toggle("sector_ids", id)}
          />
          <PickerGroup
            title="Personas"
            options={personas}
            selected={selected.persona_ids}
            defaultExpanded={selected.persona_ids.length > 0}
            onToggle={(id) => toggle("persona_ids", id)}
          />
          <PickerGroup
            title="Pain points"
            options={painPoints}
            selected={selected.pain_point_ids}
            defaultExpanded={selected.pain_point_ids.length > 0}
            onToggle={(id) => toggle("pain_point_ids", id)}
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="mt-1 flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save attachments
          </button>
        </div>
      )}
    </div>
  );
}

function PickerGroup({
  title,
  options,
  selected,
  defaultExpanded = false,
  onToggle,
}: {
  title: string;
  options: Option[];
  selected: string[];
  defaultExpanded?: boolean;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  if (!options.length) return null;

  const selectedLabels = options.filter((o) => selected.includes(o.id)).map((o) => o.label);

  return (
    <div className="overflow-hidden rounded-lg border border-[#111111]/10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 bg-white px-3 py-2.5 text-left transition-colors hover:bg-[#f7f4ea]/25"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">{title}</span>
            {selected.length > 0 && (
              <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#063b32]">
                {selected.length}
              </span>
            )}
          </div>
          {!expanded && selectedLabels.length > 0 && (
            <p className="mt-0.5 truncate text-[11px] text-[#111111]">{selectedLabels.join(", ")}</p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto border-t border-[#111111]/10 bg-[#faf9f5] px-3 py-2">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onToggle(o.id)}
              className={`rounded-full px-2 py-0.5 ${
                selected.includes(o.id)
                  ? "bg-[#063b32] text-white"
                  : "border border-[#111111]/15 bg-white text-[#6f6b62]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}