"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Check,
  CheckCircle,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { isClientServiceStage } from "@/lib/engagement/client-stages";
import {
  clearLinkedNextAction,
  collectLinkedNextActions,
  patchLinkedNextAction,
} from "@/lib/engagement/linked-next-actions";
import { opportunityReturnLabel, safeReturnTo } from "@/lib/engagement/opportunity-nav";
import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import { OpportunityCreatedFrom } from "@/components/admin/OpportunityCreatedFrom";
import { OpportunitySourceBadge } from "@/components/admin/OpportunitySourceBadge";
import {
  OPPORTUNITY_STAGES,
  STAGE_COLORS,
  type EngagementOpportunity,
  type EngagementTask,
} from "@/lib/engagement/types";

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]";

function OpportunityDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnHref = safeReturnTo(searchParams.get("returnTo"));
  const returnLabel = opportunityReturnLabel(
    searchParams.get("returnTo"),
    searchParams.get("returnLabel"),
  );
  const [opp, setOpp] = useState<EngagementOpportunity | null>(null);
  const [openTasks, setOpenTasks] = useState<EngagementTask[]>([]);
  const [doneTasks, setDoneTasks] = useState<EngagementTask[]>([]);
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
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [sourceContactName, setSourceContactName] = useState<string | null>(null);
  const [sourceOrgName, setSourceOrgName] = useState<string | null>(null);

  const headerBtn =
    "flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]";

  const load = useCallback(async () => {
    setLoading(true);
    const [oRes, tRes] = await Promise.all([
      fetch(`/api/admin/engagement/opportunities/${id}`),
      fetch(`/api/admin/engagement/tasks?opportunity_id=${id}&limit=20`),
    ]);
    const [oData, tData] = await Promise.all([
      oRes.json() as Promise<{ data: EngagementOpportunity }>,
      tRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setOpp(oData.data);
    setForm(oData.data);
    const allTasks = tData.data || [];
    setOpenTasks(allTasks.filter((t) => t.status !== "done"));
    setDoneTasks(allTasks.filter((t) => t.status === "done"));

    setSourceContactName(null);
    setSourceOrgName(null);
    if (oData.data?.enquiry_id) {
      const eRes = await fetch(`/api/admin/enquiries/${oData.data.enquiry_id}`);
      if (eRes.ok) {
        const eJson = (await eRes.json()) as { data?: { name?: string; organisation_id?: string | null } };
        setSourceContactName(eJson.data?.name?.trim() || null);
        setSourceOrgName(oData.data.organisation?.name ?? null);
      }
    } else if (oData.data?.queue_id) {
      const qRes = await fetch(`/api/admin/engagement/prospect-queue/${oData.data.queue_id}`);
      if (qRes.ok) {
        const qJson = (await qRes.json()) as {
          data?: {
            raw_contact_name?: string | null;
            raw_org_name?: string | null;
            contact?: { first_name: string; last_name?: string | null } | null;
            organisation?: { name: string } | null;
          };
        };
        const q = qJson.data;
        if (q) {
          const queueContact = q.contact
            ? `${q.contact.first_name} ${q.contact.last_name ?? ""}`.trim()
            : q.raw_contact_name?.trim() || null;
          setSourceContactName(queueContact);
          setSourceOrgName(q.organisation?.name ?? q.raw_org_name?.trim() ?? null);
        }
      }
    }

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

  const createTask = async () => {
    if (!taskForm.title.trim()) return;
    setSavingTask(true);
    await fetch("/api/admin/engagement/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskForm.title.trim(),
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        notes: taskForm.notes.trim() || null,
        task_type: taskForm.task_type,
        opportunity_id: id,
        organisation_id: opp?.organisation_id ?? null,
        primary_contact_id: opp?.primary_contact_id ?? null,
        status: "todo",
      }),
    });
    setTaskForm(DEFAULT_TASK_FORM);
    setAddingTask(false);
    setSavingTask(false);
    void load();
  };

  const markTaskDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    void load();
  };

  const saveNote = async () => {
    if (!noteText.trim() || !opp) return;
    setSavingNote(true);
    const stamped = `[${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}] ${noteText.trim()}`;
    const combined = opp.notes ? `${opp.notes}\n\n${stamped}` : stamped;
    await fetch(`/api/admin/engagement/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: combined }),
    });
    setNoteText("");
    setShowAddNote(false);
    setSavingNote(false);
    void load();
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
  const isClientStage = isClientServiceStage(opp.stage);
  const linkedNextActions = collectLinkedNextActions({ opportunities: [opp] });

  const handleSaveLinkedNextAction = async (
    item: (typeof linkedNextActions)[number],
    payload: { title: string; dueDate: string | null },
  ) => {
    await patchLinkedNextAction(item, payload);
    await load();
  };

  const handleCompleteLinkedNextAction = async (item: (typeof linkedNextActions)[number]) => {
    await clearLinkedNextAction(item);
    await load();
  };

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
          href={returnHref}
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {returnLabel}
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
              <OpportunitySourceBadge
                opportunity={opp}
                compact
                showNames
                contactName={sourceContactName}
                organisationName={sourceOrgName}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className={headerBtn}>
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddNote((v) => !v);
                setAddingTask(false);
              }}
              className={headerBtn}
            >
              {showAddNote ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddNote ? "Cancel note" : "Add note"}
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

          {(opp.enquiry_id || opp.queue_id) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Created from</p>
              <OpportunityCreatedFrom
                opportunity={opp}
                contactName={sourceContactName}
                organisationName={sourceOrgName}
              />
            </div>
          )}

          {isClientStage && opp.primary_contact_id && (
            <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-[#063b32]/8 px-3 py-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-[#063b32]" />
                <span className="text-xs font-semibold text-[#063b32]">Converted to client</span>
              </div>
              {(contactName || opp.organisation?.name) && (
                <div className="space-y-0.5">
                  {contactName && <p className="text-sm font-semibold text-[#111111]">{contactName}</p>}
                  {opp.organisation?.name && <p className="text-sm text-[#6f6b62]">{opp.organisation.name}</p>}
                </div>
              )}
              <Link
                href={`/admin/clients/${opp.primary_contact_id}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#063b32]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/5"
              >
                <Briefcase className="h-4 w-4" />
                View client record
              </Link>
            </div>
          )}

          {!isClientStage && (opp.organisation_id || opp.primary_contact_id) && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Linked contact</p>
              {contactName && <p className="text-sm text-[#111111]">{contactName}</p>}
              {opp.organisation?.name && <p className="text-sm text-[#6f6b62]">{opp.organisation.name}</p>}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <HubTasksTab
            entityLabel={opp.title}
            openTasks={openTasks}
            doneTasks={doneTasks}
            linkedNextActions={linkedNextActions}
            addingTask={addingTask}
            setAddingTask={setAddingTask}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            savingTask={savingTask}
            onCreateTask={createTask}
            onMarkDone={markTaskDone}
            onSaveLinkedNextAction={handleSaveLinkedNextAction}
            onCompleteLinkedNextAction={handleCompleteLinkedNextAction}
            showDone={showDone}
            setShowDone={setShowDone}
          />

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

          {opp.notes && (
            <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/20 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#111111]/10 bg-[#f7f4ea]/40">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                  Notes log
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-[#111111] whitespace-pre-wrap">{opp.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OpportunityDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#6f6b62]">Loading…</div>}>
      <OpportunityDetailContent />
    </Suspense>
  );
}