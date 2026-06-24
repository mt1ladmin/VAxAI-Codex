"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Send } from "lucide-react";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubEditShortcuts, type HubEditShortcut } from "@/components/admin/HubEditShortcuts";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { HubSectionHeader } from "@/components/admin/HubSectionHeader";
import { HubTabNav } from "@/components/admin/HubTabNav";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { JourneySummaryButton } from "@/components/admin/JourneySummaryButton";
import { KnowledgeAttachPicker } from "@/components/admin/KnowledgeAttachPicker";
import { MoveToProspectQueueModal } from "@/components/admin/MoveToProspectQueueModal";
import {
  ProspectDecisionMakerCard,
  ProspectOrganisationCard,
  ProspectProfileHeader,
  ProspectResearchEvidenceCard,
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
  const [editingEngagementGuide, setEditingEngagementGuide] = useState(false);
  const [engagementGuideDraft, setEngagementGuideDraft] = useState("");
  const [editingResearchEvidence, setEditingResearchEvidence] = useState(false);
  const [researchEvidenceDraft, setResearchEvidenceDraft] = useState("");
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
      setEngagementGuideDraft(json.data.engagement_approach || "");
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
      if (json.data.engagement_approach !== undefined) {
        setEngagementGuideDraft(json.data.engagement_approach || "");
      }
    }
    return json.data;
  };

  const saveEngagementGuide = async () => {
    setSaving(true);
    try {
      await patchWorkflow({
        overrides: { engagement_approach: engagementGuideDraft.trim() },
      });
      setEditingEngagementGuide(false);
    } finally {
      setSaving(false);
    }
  };

  const saveResearchEvidence = async () => {
    setSaving(true);
    try {
      await patchWorkflow({
        overrides: { need_rationale: researchEvidenceDraft.trim() },
      });
      setEditingResearchEvidence(false);
    } finally {
      setSaving(false);
    }
  };

  const openTab = (
    tab: CrmHubTab,
    opts?: { addNote?: boolean; addTask?: boolean; editGuide?: boolean; editResearch?: boolean },
  ) => {
    setActiveTab(tab);
    if (opts?.addNote) setShowAddNote(true);
    if (opts?.addTask) setAddingTask(true);
    if (opts?.editGuide) {
      setEngagementGuideDraft(record?.engagement_approach || "");
      setEditingEngagementGuide(true);
    }
    if (opts?.editResearch) {
      setResearchEvidenceDraft(record?.need_rationale || "");
      setEditingResearchEvidence(true);
    }
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

  if (loading && !record) return <HubDetailSkeleton />;
  if (!record) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const memberOptions = activeTeamMemberOptions(teamMembers);
  const notesCount = countNotes(reviewNotes);

  const editShortcuts: HubEditShortcut[] = [
    {
      id: "research",
      label: "Research",
      description: "Assessment, evidence, and open questions from discovery.",
      actionLabel: "View research",
      hasContent: hasResearchAssessmentContent(record),
      onClick: () => openTab("research"),
    },
    {
      id: "vaxai_support",
      label: "VAxAI support",
      description: "What VAxAI can support directly, partially, or via partners.",
      actionLabel: "View support map",
      hasContent: hasVaxaiSupportContent(record),
      onClick: () => openTab("vaxai_support"),
    },
    {
      id: "engagement_guide",
      label: "Engagement guide",
      description: "Meeting prep, discovery hooks, and conversation guidance.",
      actionLabel: "Edit guide",
      hasContent: !!(hasRecommendedEngagementContent(record) || record.engagement_approach),
      onClick: () => openTab("engagement_guide", { editGuide: true }),
    },
    {
      id: "tasks",
      label: "Tasks",
      description: "Follow-ups, calls, and actions for this prospect.",
      actionLabel: "Add task",
      hasContent: openTasks.length > 0,
      onClick: () => openTab("tasks", { addTask: true }),
    },
    {
      id: "notes",
      label: "Notes",
      description: "Reviewer notes, call outcomes, and handoff context.",
      actionLabel: "Add note",
      hasContent: notesCount > 0,
      onClick: () => openTab("notes", { addNote: true }),
    },
  ];

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
              className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
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
                className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] disabled:cursor-not-allowed disabled:bg-[#f7f4ea]/20"
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
                  value={openTasks.length}
                  label="Open tasks"
                  onClick={() => openTab("tasks")}
                />
                <HubMetricCard
                  value={notesCount}
                  label="Notes"
                  tone="notes"
                  onClick={() => openTab("notes")}
                />
              </div>

              <JourneyStageBanner currentStage="finder" status={record.engagement_status} />

              <div className="space-y-4">
                <ServiceFitPanel data={record} mode="overview" />
                <ProspectTagList data={record} />
              </div>

              <JourneySummaryButton
                outreachId={record.id}
                contactId={record.pipeline_contact_id ?? undefined}
                notes={reviewNotes}
                onViewAllNotes={() => openTab("notes")}
                onSaved={() => {
                  void load({ silent: true });
                  setChatActivityKey((k) => k + 1);
                }}
              />

              <HubEditShortcuts shortcuts={editShortcuts} />

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
              <HubSectionHeader
                title="Research assessment"
                description="Review AI-generated fit analysis and update evidence notes for this prospect."
                action={
                  editingResearchEvidence
                    ? {
                        label: "Save evidence",
                        onClick: () => void saveResearchEvidence(),
                        loading: saving,
                      }
                    : {
                        label: "Edit evidence",
                        onClick: () => {
                          setResearchEvidenceDraft(record.need_rationale || "");
                          setEditingResearchEvidence(true);
                        },
                      }
                }
                secondaryAction={
                  editingResearchEvidence
                    ? {
                        label: "Cancel",
                        onClick: () => {
                          setResearchEvidenceDraft(record.need_rationale || "");
                          setEditingResearchEvidence(false);
                        },
                        variant: "secondary",
                      }
                    : undefined
                }
              />
              <ServiceFitPanel data={record} mode="research" />
              {editingResearchEvidence ? (
                <textarea
                  value={researchEvidenceDraft}
                  onChange={(e) => setResearchEvidenceDraft(e.target.value)}
                  rows={8}
                  placeholder="Summarise why this prospect needs support and what evidence backs the assessment…"
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#063b32] resize-y"
                />
              ) : (
                <ProspectResearchEvidenceCard data={record} />
              )}
            </div>
          )}

          {activeTab === "vaxai_support" && (
            <div className="space-y-4">
              <HubSectionHeader
                title="VAxAI support and boundaries"
                description="What VAxAI can support directly, partially, or through partners — sourced from research."
              />
              <ServiceFitPanel data={record} mode="support" />
            </div>
          )}

          {activeTab === "engagement_guide" && (
            <div className="space-y-4">
              <HubSectionHeader
                title="Engagement guide"
                description="Meeting prep, discovery hooks, and recommended conversation approach."
                action={
                  editingEngagementGuide
                    ? {
                        label: "Save guide",
                        onClick: () => void saveEngagementGuide(),
                        loading: saving,
                      }
                    : {
                        label: record.engagement_approach ? "Edit guide" : "Add guide",
                        onClick: () => {
                          setEngagementGuideDraft(record.engagement_approach || "");
                          setEditingEngagementGuide(true);
                        },
                      }
                }
                secondaryAction={
                  editingEngagementGuide
                    ? {
                        label: "Cancel",
                        onClick: () => {
                          setEngagementGuideDraft(record.engagement_approach || "");
                          setEditingEngagementGuide(false);
                        },
                        variant: "secondary",
                      }
                    : undefined
                }
              />
              {hasRecommendedEngagementContent(record) ? (
                <ServiceFitPanel data={record} mode="recommended_engagement" />
              ) : null}
              <div className="rounded-xl border border-[#111111]/10 p-5">
                {editingEngagementGuide ? (
                  <textarea
                    value={engagementGuideDraft}
                    onChange={(e) => setEngagementGuideDraft(e.target.value)}
                    rows={18}
                    placeholder="Meeting prep, discovery hooks, recommended entry point, and conversation guidance…"
                    className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#063b32] resize-y"
                  />
                ) : record.engagement_approach ? (
                  <CollapsibleNote content={record.engagement_approach} textClassName="text-sm text-[#111111] leading-relaxed" />
                ) : (
                  <p className="text-sm text-[#6f6b62]">No engagement guide yet. Use Edit guide above to add meeting prep and conversation guidance.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <HubSectionHeader
                title="Prospect notes"
                description="Reviewer notes, call outcomes, and handoff context."
                action={{
                  label: "Add note",
                  onClick: () => setShowAddNote(true),
                }}
              />
              <HubNotesTab
                title="Prospect notes"
                notes={reviewNotes || null}
                showAddNote={showAddNote}
                onShowAddNote={() => setShowAddNote(true)}
                onHideAddNote={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                saving={saving}
                onSave={saveNote}
                placeholder="Reviewer notes, call outcomes, and handoff context…"
                header={<KnowledgeAttachPicker outreachId={record.id} />}
              />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              <HubSectionHeader
                title="Tasks"
                description="Follow-ups, calls, and actions for this prospect."
                action={{
                  label: "New task",
                  onClick: () => setAddingTask(true),
                }}
              />
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