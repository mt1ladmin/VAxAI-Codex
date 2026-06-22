"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Save,
  X,
} from "lucide-react";
import {
  OPPORTUNITY_STAGES,
  STAGE_COLORS,
  type EngagementOpportunity,
  type EngagementInteraction,
  type EngagementTask,
} from "@/lib/engagement/types";

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [opp, setOpp] = useState<EngagementOpportunity | null>(null);
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<
    Partial<
      EngagementOpportunity & {
        indicative_value_low_s: string;
        indicative_value_high_s: string;
        probability_s: string;
      }
    >
  >({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [updatingStage, setUpdatingStage] = useState(false);
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium", due_date: "" });
  const [savingTask, setSavingTask] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

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
    setNextAction(oData.data?.next_action || "");
    setNextActionDate(oData.data?.expected_decision_date?.split("T")[0] || "");
    setInteractions(iData.data || []);
    setTasks(tData.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

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
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setSaveError(j.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    const j = (await res.json()) as { data: EngagementOpportunity };
    setOpp(j.data);
    setNextAction(j.data.next_action || "");
    setNextActionDate(j.data.expected_decision_date?.split("T")[0] || "");
    setEditing(false);
    setSaving(false);
  };

  const updateStage = async (stage: string) => {
    if (!opp || opp.stage === stage) return;
    setUpdatingStage(true);
    const res = await fetch(`/api/admin/engagement/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    const j = (await res.json()) as { data: EngagementOpportunity };
    if (j.data) setOpp(j.data);
    setUpdatingStage(false);
  };

  const saveNextAction = async () => {
    setSavingAction(true);
    const res = await fetch(`/api/admin/engagement/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        next_action: nextAction,
        expected_decision_date: nextActionDate || null,
      }),
    });
    const j = (await res.json()) as { data: EngagementOpportunity };
    if (j.data) setOpp(j.data);
    setEditingNextAction(false);
    setSavingAction(false);
  };

  const saveTask = async () => {
    if (!taskForm.title.trim()) return;
    setSavingTask(true);
    await fetch("/api/admin/engagement/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskForm.title,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        opportunity_id: id,
        organisation_id: opp?.organisation_id ?? null,
        status: "todo",
        task_type: "follow_up",
      }),
    });
    setTaskForm({ title: "", priority: "medium", due_date: "" });
    setShowAddTask(false);
    setSavingTask(false);
    void load();
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await fetch("/api/admin/engagement/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interaction_type: "note",
        interaction_date: new Date().toISOString(),
        summary: noteText.trim(),
        opportunity_id: id,
        organisation_id: opp?.organisation_id ?? null,
        contact_id: opp?.primary_contact_id ?? null,
      }),
    });
    setNoteText("");
    setShowAddNote(false);
    setSavingNote(false);
    void load();
  };

  const toggleTaskDone = async (task: EngagementTask) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await fetch(`/api/admin/engagement/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    void load();
  };

  const goToLiveCall = () => {
    const params = new URLSearchParams();
    if (opp?.organisation_id) params.set("org", opp.organisation_id);
    if (opp?.primary_contact_id) params.set("contact", opp.primary_contact_id);
    if (opp?.enquiry_id) params.set("enquiry", opp.enquiry_id);
    params.set("opportunity", id);
    router.push(`/admin/engagement/live-call?${params}`);
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!opp) return <div className="p-8 text-sm text-red-600">Opportunity not found.</div>;

  const stageColor = STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600";
  const contactName = opp.primary_contact
    ? `${opp.primary_contact.first_name} ${opp.primary_contact.last_name ?? ""}`.trim()
    : null;
  const valueLabel =
    opp.indicative_value_low || opp.indicative_value_high
      ? `£${(opp.indicative_value_low ?? 0).toLocaleString()} – £${(opp.indicative_value_high ?? 0).toLocaleString()}`
      : null;

  return (
    <div className="min-h-screen bg-white">
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-[#111111]">Edit opportunity</h2>
              <button type="button" onClick={() => setEditing(false)} className="text-[#6f6b62] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Title</label>
                <input
                  type="text"
                  value={(form.title as string) ?? ""}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Desired outcomes</label>
                <textarea
                  rows={3}
                  value={(form.desired_outcomes as string) ?? ""}
                  onChange={(e) => set("desired_outcomes", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Value low (£)</label>
                  <input
                    type="number"
                    value={form.indicative_value_low ?? ""}
                    onChange={(e) =>
                      set("indicative_value_low", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Value high (£)</label>
                  <input
                    type="number"
                    value={form.indicative_value_high ?? ""}
                    onChange={(e) =>
                      set("indicative_value_high", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.probability ?? ""}
                    onChange={(e) => set("probability", e.target.value ? parseInt(e.target.value) : null)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Notes</label>
                <textarea
                  rows={3}
                  value={(form.notes as string) ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(opp);
                }}
                className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <Link
          href="/admin/engagement/pipeline?tab=pipeline"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Pipeline
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">{opp.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {opp.organisation && (
                <span className="text-sm text-[#111111]">{opp.organisation.name}</span>
              )}
              {contactName && <span className="text-sm text-[#6f6b62]">· {contactName}</span>}
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stageColor}`}>
                {opp.stage}
              </span>
              {opp.enquiry_id && (
                <Link
                  href={`/admin/enquiries/${opp.enquiry_id}`}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <MessageSquare className="h-3 w-3" /> Website enquiry
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={goToLiveCall}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Phone className="h-4 w-4" /> Start call
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Opportunity</p>
            {valueLabel && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Indicative value</p>
                <p className="text-sm font-semibold text-[#063b32]">{valueLabel}</p>
              </div>
            )}
            {opp.probability != null && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Probability</p>
                <p className="text-sm text-[#111111]">{opp.probability}%</p>
              </div>
            )}
            {opp.desired_outcomes && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Desired outcomes</p>
                <p className="text-sm text-[#111111] whitespace-pre-wrap">{opp.desired_outcomes}</p>
              </div>
            )}
            {opp.notes && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Notes</p>
                <p className="text-sm text-[#111111] whitespace-pre-wrap">{opp.notes}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Update stage</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {OPPORTUNITY_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void updateStage(s)}
                  disabled={updatingStage || opp.stage === s}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-left transition-colors ${
                    opp.stage === s
                      ? `${STAGE_COLORS[s] || "bg-gray-100 text-gray-600"} cursor-default`
                      : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  {opp.stage === s && <Check className="h-3.5 w-3.5 shrink-0" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {(opp.organisation_id || opp.primary_contact_id) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">CRM record</p>
              {opp.organisation_id && (
                <p className="text-sm text-[#111111]">Organisation linked</p>
              )}
              {opp.primary_contact_id && (
                <p className="text-sm text-[#111111]">Contact linked</p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#111111]/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
              {!editingNextAction && (
                <button
                  type="button"
                  onClick={() => setEditingNextAction(true)}
                  className="text-xs text-[#063b32] hover:underline"
                >
                  {opp.next_action ? "Edit" : "Add"}
                </button>
              )}
            </div>
            {editingNextAction ? (
              <div className="space-y-2">
                <input
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="What needs to happen next?"
                  className={inputClass}
                />
                <input
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void saveNextAction()}
                    disabled={savingAction}
                    className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                  >
                    {savingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNextAction(false);
                      setNextAction(opp.next_action || "");
                      setNextActionDate(opp.expected_decision_date?.split("T")[0] || "");
                    }}
                    className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : opp.next_action ? (
              <div>
                <p className="text-sm text-[#111111]">{opp.next_action}</p>
                {opp.expected_decision_date && (
                  <p className="mt-1 text-xs text-[#6f6b62]">
                    By{" "}
                    {new Date(opp.expected_decision_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6f6b62]/50">No next action set.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goToLiveCall}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              <Phone className="h-4 w-4" /> Start call assist
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddTask((v) => !v);
                setShowAddNote(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              {showAddTask ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddTask ? "Cancel" : "Add task"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddNote((v) => !v);
                setShowAddTask(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              {showAddNote ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddNote ? "Cancel" : "Add note"}
            </button>
          </div>

          {showAddTask && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">New task</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && void saveTask()}
                  placeholder="Task title…"
                  autoFocus
                  className="flex-1 min-w-48 rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                  className="rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm((f) => ({ ...f, due_date: e.target.value }))}
                  className="rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
                <button
                  type="button"
                  onClick={() => void saveTask()}
                  disabled={savingTask || !taskForm.title.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60"
                >
                  {savingTask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save task
                </button>
              </div>
            </div>
          )}

          {showAddNote && (
            <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Add note</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="What happened? What was discussed?"
                className="w-full resize-none rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void saveNote()}
                  disabled={savingNote || !noteText.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                >
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNote(false);
                    setNoteText("");
                  }}
                  className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#111111]/10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Tasks ({tasks.filter((t) => t.status !== "done").length} open)
              </p>
            </div>
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#6f6b62]">No tasks yet.</div>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => void toggleTaskDone(t)}
                      className={`h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        t.status === "done"
                          ? "border-[#063b32] bg-[#063b32] text-white"
                          : "border-[#111111]/20 hover:border-[#063b32]"
                      }`}
                    >
                      {t.status === "done" && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          t.status === "done" ? "text-[#6f6b62] line-through" : "text-[#111111]"
                        }`}
                      >
                        {t.title}
                      </p>
                      {t.due_date && (
                        <p className="text-xs text-[#6f6b62]">
                          Due {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        t.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#111111]/10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Interactions ({interactions.length})
              </p>
            </div>
            {interactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#6f6b62]">No interactions yet.</div>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {interactions.map((i) => (
                  <div key={i.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#111111] capitalize">{i.interaction_type}</span>
                      <span className="text-xs text-[#6f6b62]">
                        {new Date(i.interaction_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {i.outcome && (
                        <span className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                          {i.outcome}
                        </span>
                      )}
                    </div>
                    {i.summary && <p className="text-sm text-[#111111]">{i.summary}</p>}
                    {i.commitments && (
                      <p className="mt-1 text-xs text-[#6f6b62]">Commitments: {i.commitments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}