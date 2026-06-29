"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Pencil, UserCheck } from "lucide-react";
import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { HubTabNav } from "@/components/admin/HubTabNav";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import {
  ProspectDecisionMakerCard,
  ProspectOrganisationCard,
  ProspectProfileHeader,
  ProspectTagList,
} from "@/components/admin/ProspectResearchPanel";
import {
  hasRecommendedEngagementContent,
  hasResearchAssessmentContent,
  hasVaxaiSupportContent,
  ServiceFitPanel,
} from "@/components/admin/ServiceFitPanel";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { appendSimpleNote } from "@/lib/engagement/append-note";
import { subscribeNotesSaved } from "@/lib/engagement/activity-events";
import { countNotes } from "@/lib/engagement/note-count";
import { buildOutreachContextSummary } from "@/lib/ai/context-builders";
import { FINDER_ENGAGEMENT_STATUSES, type FinderEngagementStatus } from "@/lib/engagement/engagement-status";
import { PROSPECT_FINDER_LABEL } from "@/lib/engagement/journey";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { activeTeamMemberOptions } from "@/lib/engagement/team-members";
import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import { CRM_HUB_TABS, type CrmHubTab } from "@/lib/engagement/hub-tabs";
import type { EngagementTask } from "@/lib/engagement/types";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";

function NextActionField({ value, onSave }: { value: string | null; onSave: (val: string | null) => Promise<void> }) {
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = draft !== (value ?? "");
  return (
    <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder="Add a next action note…"
        className="w-full resize-none rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
      />
      <p className="text-[10px] text-[#6f6b62]">Saving will overwrite the previous next action note.</p>
      {dirty && (
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(draft.trim() || null);
            setSaving(false);
          }}
          className="rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save next action"}
        </button>
      )}
    </div>
  );
}

function AssignmentDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#111111]/15 bg-white px-3 py-2.5 text-left text-sm outline-none transition-colors hover:border-[#063b32]/40"
      >
        <span className={selected?.value ? "text-[#111111]" : "text-[#6f6b62]"}>
          {selected?.label || "Unassigned"}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value || "__unassigned"}
              type="button"
              onClick={() => { setOpen(false); onChange(opt.value); }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${
                value === opt.value ? "bg-[#063b32]/5 font-semibold text-[#063b32]" : "text-[#111111]"
              }`}
            >
              <span className="flex-1">{opt.label}</span>
              {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-[#063b32]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProspectFinderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const backQs = searchParams.get("back");
  const backHref = `/admin/engagement/prospect-outreach${backQs ? `?${backQs}` : ""}`;

  const [record, setRecord] = useState<ProspectFinderListItem | null>(null);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CrmHubTab>("overview");
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientNote, setClientNote] = useState("");
  const [savingClient, setSavingClient] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [chatActivityKey, setChatActivityKey] = useState(0);
  const [dmEditing, setDmEditing] = useState(false);
  const [dmSaving, setDmSaving] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [summaryEditing, setSummaryEditing] = useState(false);
  const [summarySaving, setSummarySaving] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const res = await fetch(`/api/admin/engagement/prospect-outreach/${id}`);
    const json = await res.json();
    if (json.data) {
      setRecord(json.data);
      setReviewNotes(json.data.review_notes || "");
      setTasks(json.tasks || []);
      setTeamMembers(json.team_members || []);
    }
    if (!opts?.silent) setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(
    () =>
      subscribeNotesSaved((detail) => {
        if (detail.contextType === "outreach" && detail.contextId === id) void load({ silent: true });
      }),
    [id, load],
  );

  useSetAIContext(
    record
      ? {
          type: "outreach",
          id: record.id,
          label: record.organisation_name,
          summary: buildOutreachContextSummary(record, reviewNotes),
        }
      : null,
  );

  const patchWorkflow = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/engagement/prospect-outreach", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreach_id: id, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to save");
    if (json.data) {
      setRecord((prev) => prev ? { ...prev, ...json.data } as ProspectFinderListItem : json.data);
      setReviewNotes(json.data.review_notes || "");
    }
    return json.data;
  };

  const saveOutreachFields = async (fields: Record<string, string | string[]>) => {
    await patchWorkflow({ overrides: fields });
    setChatActivityKey((k) => k + 1);
  };

  const saveDm = async () => {
    if (!record) return;
    setDmSaving(true);
    try {
      await saveOutreachFields({
        decision_maker_name: record.decision_maker_name ?? "",
        decision_maker_role: record.decision_maker_role ?? "",
        email: record.email ?? "",
        phone: record.phone ?? "",
      });
      setDmEditing(false);
    } finally {
      setDmSaving(false);
    }
  };

  const saveSummary = async () => {
    if (!record) return;
    setSummarySaving(true);
    try {
      await saveOutreachFields({
        organisation_name: record.organisation_name ?? "",
        organisation_type: record.organisation_type ?? "",
        location: record.location ?? "",
        region: record.region ?? "",
        website: record.website ?? "",
        employees: record.employees?.toString() ?? "",
        annual_revenue_gbp: record.annual_revenue_gbp?.toString() ?? "",
        revenue_basis: record.revenue_basis ?? "",
      });
      setSummaryEditing(false);
    } finally {
      setSummarySaving(false);
    }
  };

  const replaceNotes = async (notes: string) => {
    setSaving(true);
    try {
      await patchWorkflow({ review_notes: notes });
    } finally {
      setSaving(false);
    }
  };

  const updateTask = async (
    taskId: string,
    payload: { title: string; due_date: string | null; notes: string | null },
  ) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load({ silent: true });
    setChatActivityKey((k) => k + 1);
  };

  const openTab = (
    tab: CrmHubTab,
    opts?: { addNote?: boolean; addTask?: boolean },
  ) => {
    setActiveTab(tab);
    if (opts?.addNote) setShowAddNote(true);
    if (opts?.addTask) setAddingTask(true);
  };

  const saveNote = async () => {
    if (!noteText.trim() || !record) return;
    setSaving(true);
    const next = appendSimpleNote(record.review_notes, noteText);
    await patchWorkflow({ review_notes: next });
    setNoteText("");
    setShowAddNote(false);
    setSaving(false);
    setChatActivityKey((k) => k + 1);
  };

  const createTask = async () => {
    if (!taskForm.title.trim()) return;
    setSavingTask(true);
    const res = await fetch("/api/admin/engagement/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskForm.title.trim(),
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        notes: taskForm.notes.trim() || null,
        task_type: taskForm.task_type,
        status: "todo",
        outreach_id: id,
        assigned_team_member_id: taskForm.assigned_team_member_id || null,
        opportunity_id: record?.opportunity_id ?? null,
        contact_id: record?.pipeline_contact_id ?? null,
      }),
    });
    if (res.ok) {
      setTaskForm(DEFAULT_TASK_FORM);
      setAddingTask(false);
      await load({ silent: true });
      setChatActivityKey((k) => k + 1);
    }
    setSavingTask(false);
  };

  const markTaskDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    setShowDone(true);
    await load({ silent: true });
  };

  const markTaskUndone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "todo" }),
    });
    await load({ silent: true });
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, { method: "DELETE" });
    await load({ silent: true });
  };

  const logAsClient = async () => {
    if (!clientNote.trim()) return;
    setSavingClient(true);
    try {
      await patchWorkflow({ is_client: true, client_note: clientNote.trim() });
      setShowClientModal(false);
      setClientNote("");
    } finally {
      setSavingClient(false);
    }
  };

  if (loading && !record) return <HubDetailSkeleton />;
  if (!record) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const memberOptions = activeTeamMemberOptions(teamMembers);
  const notesCount = countNotes(reviewNotes);
  // Most recently created open follow-up task (tasks arrive ordered by due_date; resort by created_at)
  const latestFollowUpTask = [...openTasks]
    .filter((t) => t.task_type === "follow_up")
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0] ?? null;


  const hubQuickActions = (
    <HubQuickActions
      onAddNote={() => openTab("notes", { addNote: true })}
      onAddTask={() => openTab("tasks", { addTask: true })}
    />
  );

  return (
    <div className="min-h-screen bg-white">
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowClientModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                <UserCheck className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111111]">Log as new client</h3>
                <p className="text-xs text-[#6f6b62]">{record.organisation_name}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6f6b62]">Services being provided *</label>
              <textarea
                value={clientNote}
                onChange={(e) => setClientNote(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Describe the services VAxAI is providing to this client…"
                className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowClientModal(false)}
                className="flex-1 rounded-xl border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                Cancel
              </button>
              <button type="button" onClick={() => void logAsClient()} disabled={savingClient || !clientNote.trim()}
                className="flex-1 rounded-xl bg-purple-700 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50">
                {savingClient ? "Saving…" : "Log as client"}
              </button>
            </div>
          </div>
        </div>
      )}

      <RecordBackNav
        href={backHref}
        backLabel={PROSPECT_FINDER_LABEL}
        title={record.organisation_name}
        actions={hubQuickActions}
      />

      <HubTabNav
        tabs={CRM_HUB_TABS}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as CrmHubTab)}
        badge={(tabId) => {
          if (tabId === "tasks" && openTasks.length > 0) {
            return (
              <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">
                {openTasks.length}
              </span>
            );
          }
          if (tabId === "research" && hasResearchAssessmentContent(record)) {
            return <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">✓</span>;
          }
          if (tabId === "vaxai_support" && hasVaxaiSupportContent(record)) {
            return <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">✓</span>;
          }
          if (
            tabId === "engagement_guide" &&
            (hasRecommendedEngagementContent(record) || record.engagement_approach)
          ) {
            return <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">✓</span>;
          }
          if (tabId === "notes" && notesCount > 0) {
            return (
              <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">
                {notesCount}
              </span>
            );
          }
          return null;
        }}
      />

      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Summary</p>
              {summaryEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setSummaryEditing(false); void load({ silent: true }); }}
                    className="text-xs text-[#6f6b62] hover:text-[#111111]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveSummary()}
                    disabled={summarySaving}
                    className="text-xs font-semibold text-[#063b32] hover:underline disabled:opacity-50"
                  >
                    {summarySaving ? "Saving…" : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSummaryEditing(true)}
                  className="flex items-center gap-1 text-xs text-[#6f6b62] hover:text-[#063b32]"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              )}
            </div>
            <ProspectProfileHeader
              data={record}
              editable={summaryEditing}
              onChange={(partial) => setRecord((prev) => prev ? { ...prev, ...partial } as ProspectFinderListItem : prev)}
            />
            <ProspectOrganisationCard
              data={record}
              editable={summaryEditing}
              onChange={(partial) => setRecord((prev) => prev ? { ...prev, ...partial } as ProspectFinderListItem : prev)}
            />
            <ProspectDecisionMakerCard
              data={record}
              editable={dmEditing}
              onChange={(partial: Partial<ProspectOutreachRecord>) => setRecord((prev) => prev ? { ...prev, ...partial } as ProspectFinderListItem : prev)}
              headerAction={
                dmEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setDmEditing(false); void load({ silent: true }); }}
                      className="text-xs text-[#6f6b62] hover:text-[#111111]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveDm()}
                      disabled={dmSaving}
                      className="text-xs font-semibold text-[#063b32] hover:underline disabled:opacity-50"
                    >
                      {dmSaving ? "Saving…" : "Save"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDmEditing(true)}
                    className="flex items-center gap-1 text-xs text-[#6f6b62] hover:text-[#063b32]"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )
              }
            />
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Assignment</p>
            <AssignmentDropdown
              value={record.assigned_team_member_id || ""}
              options={[{ value: "", label: "Unassigned" }, ...memberOptions]}
              onChange={(assignedId) => {
                const id = assignedId || null;
                const assignedName = memberOptions.find((opt) => opt.value === id)?.label ?? null;
                setRecord((prev) =>
                  prev ? { ...prev, assigned_team_member_id: id, assigned_team_member_name: assignedName } : prev,
                );
                void patchWorkflow({ assigned_team_member_id: id });
              }}
            />
            <div className="relative">
              <p className="mb-1 text-[10px] text-[#6f6b62]">Engagement status</p>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#111111]/15 bg-white px-3 py-2.5 text-left text-sm outline-none transition-colors hover:border-[#063b32]/40"
              >
                <span className="text-[#111111]">{record.engagement_status || "Select status"}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {statusDropdownOpen && (
                <div className="absolute z-30 mt-1 w-full min-w-[14rem] overflow-hidden rounded-xl border border-[#111111]/15 bg-white shadow-lg">
                  {FINDER_ENGAGEMENT_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatusDropdownOpen(false);
                        if (s !== record.engagement_status) {
                          setRecord((prev) => (prev ? { ...prev, engagement_status: s } : prev));
                          void patchWorkflow({ engagement_status: s });
                        }
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${
                        record.engagement_status === s ? "bg-[#063b32]/5 font-semibold text-[#063b32]" : "text-[#111111]"
                      }`}
                    >
                      <span className="flex-1">{s}</span>
                      {record.engagement_status === s && <Check className="h-3.5 w-3.5 shrink-0 text-[#063b32]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <NextActionField
            value={record.next_action ?? null}
            onSave={async (val) => {
              await patchWorkflow({ next_action: val });
            }}
          />

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            {record.is_client ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">Now a client</span>
                </div>
                {record.client_note && (
                  <p className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-sm text-[#111111]">{record.client_note}</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client</p>
                <button
                  type="button"
                  onClick={() => setShowClientModal(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
                >
                  <UserCheck className="h-4 w-4" /> Log as new client
                </button>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <HubMetricCard
                  value={notesCount}
                  label="Notes"
                  tone="notes"
                  onClick={() => openTab("notes")}
                />
                <HubMetricCard
                  value={openTasks.length}
                  label="Tasks"
                  onClick={() => openTab("tasks")}
                />
              </div>

              <div className="space-y-4">
                <ServiceFitPanel data={record} mode="overview" editable onSaveFields={saveOutreachFields} />
                <ProspectTagList data={record} />
              </div>

            </>
          )}

          {activeTab === "research" && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Research assessment</p>
              <ServiceFitPanel
                data={record}
                mode="research"
                editable
                onSaveFields={saveOutreachFields}
              />
            </div>
          )}

          {activeTab === "vaxai_support" && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">VAxAI support and boundaries</p>
              <ServiceFitPanel
                data={record}
                mode="support"
                editable
                onSaveFields={saveOutreachFields}
              />
            </div>
          )}

          {activeTab === "engagement_guide" && (
            <div className="space-y-4">
              <ServiceFitPanel
                data={record}
                mode="recommended_engagement"
                editable
                onSaveFields={saveOutreachFields}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <HubNotesTab
                notes={reviewNotes || null}
                showAddNote={showAddNote}
                onHideAddNote={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                onShowAddNote={() => setShowAddNote(true)}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                saving={saving}
                onSave={saveNote}
                onReplaceNotes={replaceNotes}
                placeholder="Reviewer notes, call outcomes, and handoff context…"
              />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              <HubTasksTab
                entityLabel={record.organisation_name}
                openTasks={openTasks}
                doneTasks={doneTasks}
                tasksOnly
                viewAllTasksHref="/admin/engagement/pipeline"
                teamMembers={teamMembers}
                addingTask={addingTask}
                setAddingTask={setAddingTask}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                savingTask={savingTask}
                onCreateTask={() => void createTask()}
                onMarkDone={(taskId) => void markTaskDone(taskId)}
                onMarkUndone={(taskId) => void markTaskUndone(taskId)}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                showDone={showDone}
                setShowDone={setShowDone}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ProspectFinderDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProspectFinderDetailContent />
    </Suspense>
  );
}