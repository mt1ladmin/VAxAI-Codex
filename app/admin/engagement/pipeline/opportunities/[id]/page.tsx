"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, Phone, Plus, Save } from "lucide-react";
import {
  OPPORTUNITY_STAGES, STAGE_COLORS,
  type EngagementOpportunity, type EngagementInteraction, type EngagementTask,
} from "@/lib/engagement/types";

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<EngagementOpportunity | null>(null);
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<EngagementOpportunity & { indicative_value_low_s: string; indicative_value_high_s: string; probability_s: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [oRes, iRes, tRes] = await Promise.all([
      fetch(`/api/admin/engagement/opportunities/${id}`),
      fetch(`/api/admin/engagement/interactions?opportunity_id=${id}&limit=30`),
      fetch(`/api/admin/engagement/tasks?opportunity_id=${id}&limit=20`),
    ]);
    const [oData, iData, tData] = await Promise.all([
      oRes.json() as Promise<{ data: EngagementOpportunity }>,
      iRes.json() as Promise<{ data: EngagementInteraction[] }>,
      tRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setOpp(oData.data);
    setForm(oData.data);
    setInteractions(iData.data || []);
    setTasks(tData.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const saveEdit = async () => {
    setSaving(true);
    setSaveError("");
    const res = await fetch(`/api/admin/engagement/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setSaveError(j.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    const j = await res.json() as { data: EngagementOpportunity };
    setOpp(j.data);
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-sm text-[#6f6b62]">Loading…</div>;
  if (!opp) return <div className="p-12 text-center text-sm text-red-600">Opportunity not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline/opportunities" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Opportunities
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">{opp.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {opp.organisation && (
                <Link href={`/admin/engagement/pipeline/organisations/${opp.organisation.id}`} className="text-sm text-[#063b32] hover:underline">
                  {opp.organisation.name}
                </Link>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>{opp.stage}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {opp.organisation && (
              <Link href={`/admin/engagement/live-call?org=${opp.organisation.id}&opp=${id}`} className="flex items-center gap-2 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:border-[#063b32]">
                <Phone className="h-4 w-4" /> Call
              </Link>
            )}
            <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
              <Edit3 className="h-4 w-4" /> {editing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-6 space-y-6">
        {/* Details card */}
        <div className="rounded-xl border border-[#111111]/10 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-4">Details</h2>

          {editing ? (
            <div className="space-y-4">
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div>
                <label className="block text-xs text-[#6f6b62] mb-1">Title</label>
                <input type="text" value={(form.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#6f6b62] mb-1">Stage</label>
                <select value={(form.stage as string) ?? ""} onChange={(e) => set("stage", e.target.value)} className={inputClass}>
                  {OPPORTUNITY_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6f6b62] mb-1">Desired outcomes</label>
                <textarea rows={3} value={(form.desired_outcomes as string) ?? ""} onChange={(e) => set("desired_outcomes", e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#6f6b62] mb-1">Value low (£)</label>
                  <input type="number" value={form.indicative_value_low ?? ""} onChange={(e) => set("indicative_value_low", e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#6f6b62] mb-1">Value high (£)</label>
                  <input type="number" value={form.indicative_value_high ?? ""} onChange={(e) => set("indicative_value_high", e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#6f6b62] mb-1">Probability (%)</label>
                  <input type="number" min="0" max="100" value={form.probability ?? ""} onChange={(e) => set("probability", e.target.value ? parseInt(e.target.value) : null)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6f6b62] mb-1">Next action</label>
                  <input type="text" value={(form.next_action as string) ?? ""} onChange={(e) => set("next_action", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#6f6b62] mb-1">Expected decision</label>
                  <input type="date" value={(form.expected_decision_date as string) ?? ""} onChange={(e) => set("expected_decision_date", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6f6b62] mb-1">Notes</label>
                <textarea rows={3} value={(form.notes as string) ?? ""} onChange={(e) => set("notes", e.target.value)} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setForm(opp); }} className="text-sm text-[#6f6b62]">Discard</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ["Stage", opp.stage],
                ["Probability", opp.probability != null ? `${opp.probability}%` : null],
                ["Value", opp.indicative_value_low || opp.indicative_value_high ? `£${(opp.indicative_value_low ?? 0).toLocaleString()} – £${(opp.indicative_value_high ?? 0).toLocaleString()}` : null],
                ["Next action", opp.next_action],
                ["Decision by", opp.expected_decision_date ? new Date(opp.expected_decision_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null],
                ["Contact", opp.primary_contact ? `${opp.primary_contact.first_name} ${opp.primary_contact.last_name ?? ""}` : null],
              ].filter(([, val]) => val).map(([label, val]) => (
                <div key={label as string}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label as string}</dt>
                  <dd className="mt-0.5 text-sm text-[#111111]">{val as string}</dd>
                </div>
              ))}
              {opp.desired_outcomes && (
                <div className="col-span-full">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Desired outcomes</dt>
                  <dd className="mt-0.5 text-sm text-[#111111] whitespace-pre-wrap">{opp.desired_outcomes}</dd>
                </div>
              )}
              {opp.notes && (
                <div className="col-span-full">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Notes</dt>
                  <dd className="mt-0.5 text-sm text-[#111111] whitespace-pre-wrap">{opp.notes}</dd>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VAT observations */}
        <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#f7f4ea]">
            <h2 className="text-sm font-semibold text-[#111111]">VAT observations</h2>
            <p className="text-xs text-[#6f6b62]">Value · Alignment · Trust</p>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4">
            {(["value", "alignment", "trust"] as const).map((dim) => {
              const obs = (opp.vat_observations as Record<string, string>)?.[dim];
              return (
                <div key={dim} className={`rounded-lg p-4 ${dim === "value" ? "bg-[#063b32]/8" : dim === "alignment" ? "bg-blue-50" : "bg-amber-50"}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] mb-2 ${dim === "value" ? "text-[#063b32]" : dim === "alignment" ? "text-blue-700" : "text-amber-700"}`}>
                    {dim}
                  </p>
                  <p className="text-sm text-[#111111]">{obs || <span className="text-[#6f6b62] italic">No observations yet</span>}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactions */}
        <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#f7f4ea]">
            <h2 className="text-sm font-semibold text-[#111111]">Interactions ({interactions.length})</h2>
            <Link href={`/admin/engagement/live-call?opp=${id}`} className="flex items-center gap-1.5 text-xs font-semibold text-[#063b32] hover:underline">
              <Phone className="h-3.5 w-3.5" /> Start call
            </Link>
          </div>
          {interactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6f6b62]">No interactions yet.</div>
          ) : (
            <div className="divide-y divide-[#111111]/5">
              {interactions.map((i) => (
                <div key={i.id} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#111111] capitalize">{i.interaction_type}</span>
                    <span className="text-xs text-[#6f6b62]">{new Date(i.interaction_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {i.outcome && <span className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{i.outcome}</span>}
                  </div>
                  {i.summary && <p className="text-sm text-[#111111]">{i.summary}</p>}
                  {i.commitments && <p className="mt-1 text-xs text-[#6f6b62]">Commitments: {i.commitments}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#f7f4ea]">
            <h2 className="text-sm font-semibold text-[#111111]">Tasks ({tasks.length})</h2>
            <Plus className="h-4 w-4 text-[#6f6b62]" />
          </div>
          {tasks.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6f6b62]">No tasks.</div>
          ) : (
            <div className="divide-y divide-[#111111]/5">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-gray-300"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#111111]">{t.title}</p>
                    {t.due_date && <p className="text-xs text-[#6f6b62]">Due {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${t.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
