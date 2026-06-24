"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, Save } from "lucide-react";
import {
  fetchKnowledgeAttachments,
  type KnowledgeLinkIds,
} from "@/lib/engagement/knowledge-links";

type Option = { id: string; label: string };

export function KnowledgeAttachPicker({
  outreachId,
  onSaved,
}: {
  outreachId: string;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sectors, setSectors] = useState<Option[]>([]);
  const [personas, setPersonas] = useState<Option[]>([]);
  const [painPoints, setPainPoints] = useState<Option[]>([]);
  const [selected, setSelected] = useState<KnowledgeLinkIds>({
    sector_ids: [],
    persona_ids: [],
    pain_point_ids: [],
  });

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/engagement/sectors?limit=100").then((r) => r.json()),
      fetch("/api/admin/engagement/personas?limit=100").then((r) => r.json()),
      fetch("/api/admin/engagement/pain-points?limit=100").then((r) => r.json()),
      fetchKnowledgeAttachments({ outreachId }),
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
  }, [outreachId]);

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
    setSaving(true);
    try {
      await fetch("/api/admin/engagement/knowledge-attachments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outreach_id: outreachId, ...selected }),
      });
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
        <div className="space-y-3 border-t border-[#111111]/10 px-4 py-3 text-xs">
          <PickerGroup title="Sectors" options={sectors} selected={selected.sector_ids} onToggle={(id) => toggle("sector_ids", id)} />
          <PickerGroup title="Personas" options={personas} selected={selected.persona_ids} onToggle={(id) => toggle("persona_ids", id)} />
          <PickerGroup title="Pain points" options={painPoints} selected={selected.pain_point_ids} onToggle={(id) => toggle("pain_point_ids", id)} />
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white"
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
  onToggle,
}: {
  title: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (!options.length) return null;
  return (
    <div>
      <p className="mb-1 font-semibold uppercase tracking-wider text-[#6f6b62]">{title}</p>
      <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={`rounded-full px-2 py-0.5 ${
              selected.includes(o.id)
                ? "bg-[#063b32] text-white"
                : "border border-[#111111]/15 text-[#6f6b62]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}