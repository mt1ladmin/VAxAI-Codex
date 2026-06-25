"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Send } from "lucide-react";
import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { HubTabNav } from "@/components/admin/HubTabNav";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { JourneyStagePills } from "@/components/admin/JourneyStageBanner";

import { KnowledgeAttachPicker } from "@/components/admin/KnowledgeAttachPicker";
import { MoveToProspectQueueModal } from "@/components/admin/MoveToProspectQueueModal";
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
import {
  MOVE_TO_PROSPECT_QUEUE_LABEL,
  PROSPECT_FINDER_LABEL,
  prospectQueueDetailPath,
} from "@/lib/engagement/journey";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { activeTeamMemberOptions } from "@/lib/engagement/team-members";
import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import { CRM_HUB_TABS, type CrmHubTab } from "@/lib/engagement/hub-tabs";
import type { EngagementTask } from "@/lib/engagement/types";

function ProspectFinderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [chatActivityKey, setChatActivityKey] = useState(0);

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

  useEffect(() => {
    if (!loading && record?.in_prospect_queue && record.pipeline_contact_id) {
      router.replace(prospectQueueDetailPath(record.pipeline_contact_id));
    }
  }, [loading, record, router]);

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
      setRecord(json.data);
      setReviewNotes(json.data.review_notes || "");
    }
    return json.data;
  };

  const saveOutreachFields = async (fields: Record<string, string | string[]>) => {
    await patchWorkflow({ overrides: fields });
    setChatActivityKey((k) => k + 1);
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

  if (loading && !record) return <HubDetailSkeleton />;
  if (!record) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const memberOptions = activeTeamMemberOptions(teamMembers);
  const notesCount = countNotes(reviewNotes);


  const hubQuickActions = (
    <HubQuickActions
      onAddNote={() => openTab("notes", { addNote: true })}
      onAddTask={() => openTab("tasks", { addTask: true })}
    />
  );

  return (
    <div className="min-h-screen bg-white">
      <MoveToProspectQueueModal
        open={showMoveModal}
        prospect={record}
        teamMembers={teamMembers}
        onClose={() => setShowMoveModal(false)}
        onMoved={({ contact_id }) => {
          router.push(prospectQueueDetailPath(contact_id));
        }}
      />

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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Summary</p>
            <ProspectProfileHeader data={record} />
            <ProspectOrganisationCard data={record} />
            <ProspectDecisionMakerCard data={record} />
            <JourneyStagePills currentStage="finder" />
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Assignment</p>
            <select
              value={record.assigned_team_member_id || ""}
              onChange={(e) => {
                const assignedId = e.target.value || null;
                const assignedName =
                  memberOptions.find((opt) => opt.value === assignedId)?.label ?? null;
                setRecord((prev) =>
                  prev
                    ? {
                        ...prev,
                        assigned_team_member_id: assignedId,
                        assigned_team_member_name: assignedName,
                      }
                    : prev,
                );
                void patchWorkflow({ assigned_team_member_id: assignedId });
              }}
              className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm appearance-none outline-none focus:border-[#063b32]"
            >
              <option value="">Unassigned</option>
              {memberOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div>
              <p className="mb-1 text-[10px] text-[#6f6b62]">Engagement status</p>
              <select
                value={record.engagement_status}
                onChange={(e) => {
                  const status = e.target.value as FinderEngagementStatus;
                  setRecord((prev) => (prev ? { ...prev, engagement_status: status } : prev));
                  void patchWorkflow({ engagement_status: status });
                }}
                disabled={record.in_prospect_queue}
                className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm appearance-none outline-none focus:border-[#063b32] disabled:cursor-not-allowed disabled:bg-[#f7f4ea]/20"
              >
                {FINDER_ENGAGEMENT_STATUSES.filter((s) => s !== "In prospect queue" || record.in_prospect_queue).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Pipeline</p>
            {record.engagement_status === "Opportunity identified" ? (
              <button
                type="button"
                onClick={() => setShowMoveModal(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
              >
                <Send className="h-4 w-4" /> {MOVE_TO_PROSPECT_QUEUE_LABEL}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-[#063b32]/25 bg-[#063b32]/5 px-4 py-2.5 text-sm font-semibold text-[#063b32]/70"
                >
                  <Send className="h-4 w-4" /> {MOVE_TO_PROSPECT_QUEUE_LABEL}
                </button>
                <p className="text-xs text-[#6f6b62]">
                  Set engagement status to <span className="font-semibold text-[#111111]">Opportunity identified</span> first.
                </p>
              </div>
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

              <Link
                href={`/admin/engagement/knowledge?tab=sectors&tags=${encodeURIComponent(record.sector_tags.join(","))}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#063b32] hover:underline"
              >
                <BookOpen className="h-4 w-4" /> Sector guidance
              </Link>
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
                header={<KnowledgeAttachPicker outreachId={record.id} />}
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