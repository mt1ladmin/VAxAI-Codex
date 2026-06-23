"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { CLIENT_SERVICE_STAGES, isClientServiceStage } from "@/lib/engagement/client-stages";
import { OpportunityStageSelect } from "@/components/admin/OpportunityStageSelect";
import { OPPORTUNITY_STAGES, type EngagementOpportunity } from "@/lib/engagement/types";

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

type FormState = {
  title: string;
  stage: string;
  desired_outcomes: string;
  recommended_pathway: string;
  indicative_value_low: string;
  indicative_value_high: string;
  probability: string;
  next_action: string;
  expected_decision_date: string;
  notes: string;
};

function toForm(opp: EngagementOpportunity): FormState {
  return {
    title: opp.title ?? "",
    stage: opp.stage ?? "Identified",
    desired_outcomes: opp.desired_outcomes ?? "",
    recommended_pathway: opp.recommended_pathway ?? "",
    indicative_value_low: opp.indicative_value_low != null ? String(opp.indicative_value_low) : "",
    indicative_value_high: opp.indicative_value_high != null ? String(opp.indicative_value_high) : "",
    probability: opp.probability != null ? String(opp.probability) : "",
    next_action: opp.next_action ?? "",
    expected_decision_date: opp.expected_decision_date?.split("T")[0] ?? "",
    notes: opp.notes ?? "",
  };
}

function stageOptionsFor(opp: EngagementOpportunity, clientContext: boolean): readonly string[] {
  if (clientContext || isClientServiceStage(opp.stage)) {
    return CLIENT_SERVICE_STAGES;
  }
  return OPPORTUNITY_STAGES.filter((s) => !isClientServiceStage(s));
}

export function EditOpportunityModal({
  open,
  opportunity,
  onClose,
  onSaved,
  clientContext = false,
}: {
  open: boolean;
  opportunity: EngagementOpportunity | null;
  onClose: () => void;
  onSaved: (updated: EngagementOpportunity) => void;
  clientContext?: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => (opportunity ? toForm(opportunity) : toForm({} as EngagementOpportunity)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !opportunity) return;
    setForm(toForm(opportunity));
    setError("");
  }, [open, opportunity]);

  if (!open || !opportunity) return null;

  const stages = stageOptionsFor(opportunity, clientContext);
  const set = (key: keyof FormState, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/engagement/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          stage: form.stage,
          desired_outcomes: form.desired_outcomes.trim() || null,
          recommended_pathway: form.recommended_pathway.trim() || null,
          indicative_value_low: form.indicative_value_low ? parseFloat(form.indicative_value_low) : null,
          indicative_value_high: form.indicative_value_high ? parseFloat(form.indicative_value_high) : null,
          probability: form.probability ? parseInt(form.probability, 10) : null,
          next_action: form.next_action.trim() || null,
          expected_decision_date: form.expected_decision_date || null,
          notes: form.notes.trim() || null,
        }),
      });
      const j = await res.json() as { data?: EngagementOpportunity; error?: string };
      if (!res.ok || !j.data) {
        setError(j.error ?? "Failed to save opportunity.");
        return;
      }
      onSaved(j.data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Edit opportunity</h2>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Stage</label>
            <OpportunityStageSelect
              value={form.stage}
              stages={stages}
              onChange={(stage) => set("stage", stage)}
              className="inline-block"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Desired outcomes</label>
            <textarea
              rows={3}
              value={form.desired_outcomes}
              onChange={(e) => set("desired_outcomes", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Recommended pathway</label>
            <input
              type="text"
              value={form.recommended_pathway}
              onChange={(e) => set("recommended_pathway", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Value low (£)</label>
              <input type="number" value={form.indicative_value_low} onChange={(e) => set("indicative_value_low", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Value high (£)</label>
              <input type="number" value={form.indicative_value_high} onChange={(e) => set("indicative_value_high", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Probability (%)</label>
              <input type="number" min="0" max="100" value={form.probability} onChange={(e) => set("probability", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Next action</label>
              <input type="text" value={form.next_action} onChange={(e) => set("next_action", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Expected decision</label>
              <input type="date" value={form.expected_decision_date} onChange={(e) => set("expected_decision_date", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}