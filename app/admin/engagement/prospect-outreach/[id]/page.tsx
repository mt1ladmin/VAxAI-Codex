"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  Save,
  Send,
  User,
} from "lucide-react";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { KnowledgeAttachPicker } from "@/components/admin/KnowledgeAttachPicker";
import { MoveToProspectQueueModal } from "@/components/admin/MoveToProspectQueueModal";
import { ProspectResearchPanel } from "@/components/admin/ProspectResearchPanel";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { subscribeNotesSaved } from "@/lib/engagement/activity-events";
import { buildOutreachContextSummary } from "@/lib/ai/context-builders";
import { FINDER_ENGAGEMENT_STATUSES } from "@/lib/engagement/engagement-status";
import {
  MOVE_TO_PROSPECT_QUEUE_LABEL,
  PROSPECT_FINDER_LABEL,
  PROSPECT_QUEUE_LABEL,
  prospectQueueDetailPath,
} from "@/lib/engagement/journey";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { activeTeamMemberOptions } from "@/lib/engagement/team-members";
import { emailComposeUrl } from "@/lib/engagement/email-links";
import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import type { EngagementTask } from "@/lib/engagement/types";

type Tab = "overview" | "research" | "notes" | "tasks" | "activity";
const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  research: "Research",
  notes: "Notes",
  tasks: "Tasks & next actions",
  activity: "Activity",
};

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
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingResearch, setEditingResearch] = useState(false);
  const [researchDraft, setResearchDraft] = useState<ProspectFinderListItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [chatActivityKey, setChatActivityKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/prospect-outreach/${id}`);
    const json = await res.json();
    if (json.data) {
      setRecord(json.data);
      setResearchDraft(json.data);
      setReviewNotes(json.data.review_notes || "");
      setTasks(json.tasks || []);
      setTeamMembers(json.team_members || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(
    () =>
      subscribeNotesSaved((detail) => {
        if (detail.contextType === "outreach" && detail.contextId === id) void load();
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
    await load();
    return json.data;
  };

  const saveResearch = async () => {
    if (!researchDraft) return;
    setSaving(true);
    try {
      const { review_notes: _rn, assigned_team_member_id: _a, engagement_status: _e, ...overrides } = researchDraft;
      await patchWorkflow({ overrides, review_notes: reviewNotes });
      setEditingResearch(false);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim() || !record) return;
    setSaving(true);
    const next = record.review_notes
      ? `${record.review_notes}\n\n[${new Date().toLocaleDateString("en-GB")}] ${noteText}`
      : noteText;
    await patchWorkflow({ review_notes: next });
    setNoteText("");
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
      await load();
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
    await load();
  };

  if (loading) return <HubDetailSkeleton />;
  if (!record) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const memberOptions = activeTeamMemberOptions(teamMembers);

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

      <RecordBackNav href={backHref} backLabel={PROSPECT_FINDER_LABEL} title={record.organisation_name} />

      <div className="border-b border-[#111111]/10 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {(Object.entries(TAB_LABELS) as [Tab, string][]).map(([tabId, label]) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === tabId ? "border-[#063b32] text-[#063b32]" : "border-transparent text-[#6f6b62]"
              }`}
            >
              {label}
              {tabId === "tasks" && openTasks.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">{openTasks.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Summary</p>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Sector · Location</p>
              <p className="text-sm text-[#111111]">{record.sector_label} · {record.location}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Fit</p>
              <p className="text-sm text-[#111111]">Need {record.need_score} · {record.priority_label}</p>
            </div>
            {record.email && (
              <a href={emailComposeUrl(record.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
                <Mail className="h-3.5 w-3.5" /> {record.email}
              </a>
            )}
            {record.phone && (
              <a href={`tel:${record.phone}`} className="flex items-center gap-1.5 text-sm text-[#111111]">
                <Phone className="h-3.5 w-3.5" /> {record.phone}
              </a>
            )}
            {record.website && (
              <a href={record.website.startsWith("http") ? record.website : `https://${record.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Website
              </a>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Assignment</p>
            <select
              value={record.assigned_team_member_id || ""}
              onChange={(e) => void patchWorkflow({ assigned_team_member_id: e.target.value || null })}
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
                onChange={(e) => void patchWorkflow({ engagement_status: e.target.value })}
                disabled={record.in_prospect_queue}
                className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] disabled:opacity-60"
              >
                {FINDER_ENGAGEMENT_STATUSES.filter((s) => s !== "In prospect queue" || record.in_prospect_queue).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Pipeline</p>
            {record.in_prospect_queue && record.pipeline_contact_id ? (
              <Link href={prospectQueueDetailPath(record.pipeline_contact_id)} className="text-sm font-semibold text-[#063b32] hover:underline">
                View in {PROSPECT_QUEUE_LABEL}
              </Link>
            ) : record.engagement_status === "Opportunity identified" ? (
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
                  className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#063b32] px-4 py-2.5 text-sm font-semibold text-white opacity-50"
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
              <JourneyStageBanner
                currentStage="finder"
                hint="Assign an owner, update engagement status, and open research before moving genuine opportunities to Prospect Queue."
              />
              <KnowledgeAttachPicker outreachId={record.id} />
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
              <ProspectResearchPanel
                data={editingResearch && researchDraft ? researchDraft : record}
                editable={editingResearch}
                compact
                onChange={(next) => setResearchDraft({ ...record, ...next })}
              />
              {record.engagement_approach && !editingResearch && (
                <div className="rounded-xl border border-[#111111]/10 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Engagement guide</p>
                  <CollapsibleNote content={record.engagement_approach} textClassName="text-sm text-[#111111] leading-relaxed" />
                </div>
              )}
              <div className="flex gap-2">
                {editingResearch ? (
                  <>
                    <button type="button" disabled={saving} onClick={() => void saveResearch()} className="inline-flex items-center gap-2 rounded-full bg-[#063b32] px-4 py-2 text-sm font-semibold text-white">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save research
                    </button>
                    <button type="button" onClick={() => { setResearchDraft(record); setEditingResearch(false); }} className="rounded-full border border-[#111111]/15 px-4 py-2 text-sm">Cancel</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setEditingResearch(true)} className="rounded-full border border-[#111111]/15 px-4 py-2 text-sm">Edit research</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              {reviewNotes ? (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <CollapsibleNote content={reviewNotes} />
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]">No notes yet.</p>
              )}
              <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-4 space-y-3">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="Add a note…" className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm resize-y" />
                <button type="button" disabled={saving || !noteText.trim()} onClick={() => void saveNote()} className="text-sm font-semibold text-[#063b32] hover:underline">Add note</button>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#111111]/10 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-2">Next action</p>
                <input
                  value={record.next_action || ""}
                  onChange={(e) => setRecord((r) => r ? { ...r, next_action: e.target.value } : r)}
                  onBlur={() => void patchWorkflow({ next_action: record.next_action || null })}
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  placeholder="Most relevant next step for this prospect"
                />
              </div>
              {addingTask && (
                <div className="rounded-xl border border-[#111111]/10 p-4 space-y-3">
                  <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm" />
                  <select value={taskForm.assigned_team_member_id} onChange={(e) => setTaskForm((f) => ({ ...f, assigned_team_member_id: e.target.value }))} className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm">
                    <option value="">Assign to…</option>
                    {memberOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm((f) => ({ ...f, due_date: e.target.value }))} className="rounded-xl border border-[#111111]/15 px-3 py-2 text-sm" />
                  <button type="button" disabled={savingTask} onClick={() => void createTask()} className="rounded-full bg-[#063b32] px-4 py-2 text-sm font-semibold text-white">Create task</button>
                </div>
              )}
              <HubTasksTab
                entityLabel={record.organisation_name}
                openTasks={openTasks}
                doneTasks={doneTasks}
                addingTask={addingTask}
                setAddingTask={setAddingTask}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                savingTask={savingTask}
                onCreateTask={() => void createTask()}
                onMarkDone={(taskId) => void markTaskDone(taskId)}
                showDone={showDone}
                setShowDone={setShowDone}
              />
            </div>
          )}

          {activeTab === "activity" && (
            <ActivityTimeline outreachId={record.id} refreshKey={chatActivityKey} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProspectFinderDetailPage() {
  return (
    <Suspense fallback={<HubDetailSkeleton />}>
      <ProspectFinderDetailContent />
    </Suspense>
  );
}