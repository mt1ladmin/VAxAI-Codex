"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Sparkles, X } from "lucide-react";

type ItemType = "persona" | "sector" | "pain_point";

const ENDPOINTS: Record<ItemType, string> = {
  persona: "/api/admin/engagement/personas",
  sector: "/api/admin/engagement/sectors",
  pain_point: "/api/admin/engagement/pain-points",
};

export function KnowledgeCreateModal({
  open,
  onClose,
  defaultType = "persona",
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  defaultType?: ItemType;
  onCreated?: () => void;
}) {
  const [itemType, setItemType] = useState<ItemType>(defaultType);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [aiBrief, setAiBrief] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  const [personaName, setPersonaName] = useState("");
  const [typicalRole, setTypicalRole] = useState("");
  const [goals, setGoals] = useState("");
  const [pressures, setPressures] = useState("");

  const [sectorName, setSectorName] = useState("");
  const [sectorDescription, setSectorDescription] = useState("");
  const [adminPressures, setAdminPressures] = useState("");

  const [ppCategory, setPpCategory] = useState("Operations");
  const [ppTitle, setPpTitle] = useState("");
  const [ppDefinition, setPpDefinition] = useState("");
  const [whatPersonSays, setWhatPersonSays] = useState("");

  useEffect(() => {
    if (open) {
      setItemType(defaultType);
      setError("");
      setMode("manual");
      setPreviewData(null);
      setAiBrief("");
    }
  }, [open, defaultType]);

  useEffect(() => {
    setPreviewData(null);
    setAiBrief("");
    setError("");
  }, [itemType, mode]);

  if (!open) return null;

  const parseLines = (text: string) =>
    text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const buildPayload = (generated?: Record<string, unknown>) => {
    if (generated) return generated;
    if (itemType === "persona") {
      return {
        persona_name: personaName.trim(),
        typical_role: typicalRole.trim() || null,
        goals: parseLines(goals),
        pressures: parseLines(pressures),
        status: "approved",
      };
    }
    if (itemType === "sector") {
      return {
        name: sectorName.trim(),
        description: sectorDescription.trim() || null,
        common_admin_pressures: parseLines(adminPressures),
        status: "approved",
      };
    }
    return {
      category: ppCategory.trim(),
      title: ppTitle.trim(),
      plain_english_definition: ppDefinition.trim() || null,
      what_person_says: parseLines(whatPersonSays),
      status: "approved",
    };
  };

  const generatePreview = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/engagement/knowledge-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_type: itemType, brief: aiBrief }),
      });
      const json = (await res.json()) as { data?: Record<string, unknown>; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "AI generation failed");
      setPreviewData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = previewData ? buildPayload(previewData) : buildPayload();
      const res = await fetch(ENDPOINTS[itemType], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      onCreated?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderPreviewValue = (value: unknown): ReactNode => {
    if (Array.isArray(value)) {
      return (
        <ul className="mt-1 space-y-0.5">
          {(value as string[]).map((item, i) => (
            <li key={i} className="text-sm text-[#111111] before:mr-1.5 before:content-['·'] before:text-[#6f6b62]">{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="mt-1 text-sm text-[#111111]">{String(value)}</p>;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Create knowledge item</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-[#f7f4ea]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex gap-2">
            {(["persona", "sector", "pain_point"] as ItemType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setItemType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                  itemType === t ? "bg-[#063b32] text-white" : "border border-[#111111]/15 text-[#6f6b62]"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setMode("manual")} className={`text-xs font-semibold ${mode === "manual" ? "text-[#063b32]" : "text-[#6f6b62]"}`}>
              Manual
            </button>
            <button type="button" onClick={() => setMode("ai")} className={`flex items-center gap-1 text-xs font-semibold ${mode === "ai" ? "text-[#063b32]" : "text-[#6f6b62]"}`}>
              <Sparkles className="h-3 w-3" /> AI-assisted
            </button>
          </div>

          {mode === "ai" && previewData ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-[#063b32]/20 bg-[#063b32]/5 px-3 py-2 text-xs font-semibold text-[#063b32]">
                Preview — review before saving
              </div>
              {Object.entries(previewData)
                .filter(([k]) => k !== "status")
                .map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  return (
                    <div key={key}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">{key.replace(/_/g, " ")}</p>
                      {renderPreviewValue(value)}
                    </div>
                  );
                })}
            </div>
          ) : mode === "ai" ? (
            <textarea
              value={aiBrief}
              onChange={(e) => setAiBrief(e.target.value)}
              rows={5}
              placeholder="Describe what to create — the AI will follow Knowledge Hub templates and you can review before saving."
              className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            />
          ) : itemType === "persona" ? (
            <>
              <input value={personaName} onChange={(e) => setPersonaName(e.target.value)} placeholder="Persona name *" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input value={typicalRole} onChange={(e) => setTypicalRole(e.target.value)} placeholder="Typical role" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Goals (one per line)" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <textarea value={pressures} onChange={(e) => setPressures(e.target.value)} placeholder="Pressures (one per line)" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </>
          ) : itemType === "sector" ? (
            <>
              <input value={sectorName} onChange={(e) => setSectorName(e.target.value)} placeholder="Sector name *" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <textarea value={sectorDescription} onChange={(e) => setSectorDescription(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <textarea value={adminPressures} onChange={(e) => setAdminPressures(e.target.value)} placeholder="Common admin pressures (one per line)" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </>
          ) : (
            <>
              <input value={ppCategory} onChange={(e) => setPpCategory(e.target.value)} placeholder="Category *" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input value={ppTitle} onChange={(e) => setPpTitle(e.target.value)} placeholder="Title *" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <textarea value={ppDefinition} onChange={(e) => setPpDefinition(e.target.value)} placeholder="Plain English definition" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <textarea value={whatPersonSays} onChange={(e) => setWhatPersonSays(e.target.value)} placeholder="What the person says (one per line)" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-4">
          {mode === "ai" && previewData ? (
            <>
              <button
                type="button"
                onClick={() => { setPreviewData(null); setError(""); }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Approve &amp; save
              </button>
            </>
          ) : mode === "ai" && !previewData ? (
            <>
              <button type="button" onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]">Cancel</button>
              <button
                type="button"
                onClick={() => void generatePreview()}
                disabled={generating || aiBrief.trim().length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate preview
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]">Cancel</button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save &amp; publish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}