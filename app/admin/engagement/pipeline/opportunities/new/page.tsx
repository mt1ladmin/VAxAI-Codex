"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { OPPORTUNITY_STAGES } from "@/lib/engagement/types";

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

function NewOpportunityForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("org") ?? "";

  const [form, setForm] = useState({
    title: "",
    organisation_id: orgId,
    stage: "Identified" as string,
    desired_outcomes: "",
    recommended_pathway: "",
    indicative_value_low: "",
    indicative_value_high: "",
    probability: "",
    next_action: "",
    expected_decision_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.title.trim()) { setError("Opportunity title is required."); return; }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      indicative_value_low: form.indicative_value_low ? parseFloat(form.indicative_value_low) : null,
      indicative_value_high: form.indicative_value_high ? parseFloat(form.indicative_value_high) : null,
      probability: form.probability ? parseInt(form.probability) : null,
      organisation_id: form.organisation_id || null,
    };
    const res = await fetch("/api/admin/engagement/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setError(j.error ?? "Failed to save.");
      setSaving(false);
      return;
    }
    const j = await res.json() as { data: { id: string } };
    router.push(`/admin/engagement/pipeline/opportunities/${j.data.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      {error && <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Title <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Greenways Trust — workflow review" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Stage</label>
          <select value={form.stage} onChange={(e) => set("stage", e.target.value)} className={inputClass}>
            {OPPORTUNITY_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Desired outcomes</label>
          <textarea rows={3} value={form.desired_outcomes} onChange={(e) => set("desired_outcomes", e.target.value)} placeholder="What does the prospect want to achieve?" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Value low (£)</label>
            <input type="number" value={form.indicative_value_low} onChange={(e) => set("indicative_value_low", e.target.value)} placeholder="e.g. 1500" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Value high (£)</label>
            <input type="number" value={form.indicative_value_high} onChange={(e) => set("indicative_value_high", e.target.value)} placeholder="e.g. 3000" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Probability (%)</label>
            <input type="number" min="0" max="100" value={form.probability} onChange={(e) => set("probability", e.target.value)} placeholder="e.g. 50" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Expected decision date</label>
            <input type="date" value={form.expected_decision_date} onChange={(e) => set("expected_decision_date", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Next action</label>
          <input type="text" value={form.next_action} onChange={(e) => set("next_action", e.target.value)} placeholder="e.g. Send discovery questions" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Notes</label>
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Additional context…" className={inputClass} />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-[#063b32] py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60">
          {saving ? "Saving…" : "Save opportunity"}
        </button>
        <Link href="/admin/engagement/pipeline?tab=pipeline" className="rounded-lg border border-[#111111]/15 px-5 py-2.5 text-sm font-semibold text-[#6f6b62] hover:text-[#111111]">
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default function NewOpportunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline?tab=pipeline" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Pipeline
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">New opportunity</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Track a prospect through your engagement pipeline.</p>
      </div>
      <Suspense fallback={<div className="p-8 text-sm text-[#6f6b62]">Loading…</div>}>
        <NewOpportunityForm />
      </Suspense>
    </div>
  );
}
