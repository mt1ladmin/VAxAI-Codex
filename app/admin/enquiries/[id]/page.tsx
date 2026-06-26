"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import { KnowledgeAttachPicker } from "@/components/admin/KnowledgeAttachPicker";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { HubTabNav } from "@/components/admin/HubTabNav";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { HubTasksTab } from "@/components/admin/HubTasksTab";

import { StatusSelect } from "@/components/admin/StatusSelect";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { subscribeNotesSaved } from "@/lib/engagement/activity-events";
import { buildEnquiryContextSummary } from "@/lib/ai/context-builders";
import {
  CRM_HUB_TAB_IDS_PRE_CLIENT,
  CRM_HUB_TABS_PRE_CLIENT,
  type PreClientHubTab,
} from "@/lib/engagement/hub-tabs";

import {
  clearLinkedNextAction,
  collectLinkedNextActions,
  countOpenWorkItems,
  patchLinkedNextAction,
} from "@/lib/engagement/linked-next-actions";
import { fetchHubTasks } from "@/lib/engagement/load-hub-tasks";
import { appendSimpleNote } from "@/lib/engagement/append-note";
import { countNotes } from "@/lib/engagement/note-count";

import { emailComposeUrl } from "@/lib/engagement/email-links";
import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import type {
  EngagementContact,
  EngagementOpportunity,
  EngagementTask,
} from "@/lib/engagement/types";


type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  support_type: string;
  preferred_contact: string;
  telephone: string | null;
  details: string;
  wants_discovery_call: boolean;
  status: string;
  connected_post_id: string | null;
  connected_post_title: string | null;
  next_action: string | null;
  next_action_date: string | null;
  admin_notes: string | null;
  last_action: string | null;
  last_action_date: string | null;
  contact_id: string | null;
  organisation_id: string | null;
  posts?: { id: string; title: string; slug: string } | null;
};

function EnquiryDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [linkedContact, setLinkedContact] = useState<EngagementContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<PreClientHubTab>("overview");
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [openTasks, setOpenTasks] = useState<EngagementTask[]>([]);
  const [doneTasks, setDoneTasks] = useState<EngagementTask[]>([]);
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const [chatActivityKey, setChatActivityKey] = useState(0);
  const hubTabs = CRM_HUB_TABS_PRE_CLIENT;

  useSetAIContext(
    enquiry
      ? {
          type: "enquiry",
          id: enquiry.id,
          label: enquiry.name,
          summary: buildEnquiryContextSummary(enquiry, opportunities),
        }
      : null,
  );

  const loadCrmData = useCallback(async (contactId?: string | null): Promise<EngagementOpportunity[]> => {
    setLoadingCrm(true);
    const oppQueries = [
      fetch(`/api/admin/engagement/opportunities?enquiry_id=${id}&limit=20`),
    ];
    if (contactId) {
      oppQueries.push(
        fetch(`/api/admin/engagement/opportunities?contact_id=${contactId}&limit=20`),
      );
    }
    const oppResults = await Promise.all(oppQueries.map((q) => q.then((r) => r.json())));
    const allOpps = new Map<string, EngagementOpportunity>();
    for (const j of oppResults as Array<{ data?: EngagementOpportunity[] }>) {
      for (const row of j.data || []) allOpps.set(row.id, row);
    }
    const sorted = [...allOpps.values()].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    setOpportunities(sorted);
    setLoadingCrm(false);
    return sorted;
  }, [id]);

  const loadTasks = useCallback(
    async (
      contactId?: string | null,
      organisationId?: string | null,
      opps?: EngagementOpportunity[],
    ) => {
      const { open, done } = await fetchHubTasks({
        contactId,
        organisationId,
        opportunities: opps,
      });
      setOpenTasks(open);
      setDoneTasks(done);
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries/${id}`);
    const j = await res.json() as { data: Enquiry };
    if (j.data) {
      setEnquiry(j.data);
      if (j.data.contact_id) {
        const cRes = await fetch(`/api/admin/engagement/contacts/${j.data.contact_id}`);
        const cJ = await cRes.json() as { data?: EngagementContact };
        if (cJ.data) setLinkedContact(cJ.data);
      } else {
        setLinkedContact(null);
      }
      const opps = await loadCrmData(j.data.contact_id);
      await loadTasks(j.data.contact_id, j.data.organisation_id, opps);
    }
    setLoading(false);
  }, [id, loadCrmData, loadTasks]);

  useEffect(() => { void load(); }, [load]);

  useEffect(
    () =>
      subscribeNotesSaved((detail) => {
        if (detail.contextType === "enquiry" && detail.contextId === id) {
          void load();
        }
      }),
    [id, load],
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    const normalizedTab = tab === "opportunities" || tab === "client_work" ? "overview" : tab;
    if (normalizedTab && CRM_HUB_TAB_IDS_PRE_CLIENT.has(normalizedTab)) {
      setActiveTab(normalizedTab as PreClientHubTab);
    }
  }, [searchParams]);

  const patchEnquiry = async (updates: Partial<Enquiry>) => {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const j = await res.json() as { data?: Enquiry; error?: string; hint?: string };
    if (!res.ok) {
      throw new Error(j.hint ? `${j.error}\n\n${j.hint}` : (j.error || "Failed to save enquiry"));
    }
    if (j.data) setEnquiry(j.data);
    return j.data;
  };

  const bumpTimeline = () => setChatActivityKey((k) => k + 1);

  const updateStatus = async (status: string) => {
    if (!enquiry || status === enquiry.status) return;
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await patchEnquiry({ status });
      if (status === "Opportunity") {
        await loadCrmData(enquiry.contact_id);
      }
      bumpTimeline();
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim() || !enquiry) return;
    setSavingNote(true);
    await patchEnquiry({
      admin_notes: appendSimpleNote(enquiry.admin_notes, noteText),
      last_action: noteText.slice(0, 80),
      last_action_date: new Date().toISOString(),
    } as Partial<Enquiry>);
    setNoteText("");
    setShowAddNote(false);
    setSavingNote(false);
    bumpTimeline();
  };

  const createTask = async () => {
    if (!taskForm.title.trim() || !enquiry) return;
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
        contact_id: enquiry.contact_id,
        organisation_id: enquiry.organisation_id,
        opportunity_id: opportunities[0]?.id ?? null,
      }),
    });
    if (res.ok) {
      setTaskForm(DEFAULT_TASK_FORM);
      setAddingTask(false);
      void loadTasks(enquiry.contact_id, enquiry.organisation_id, opportunities);
    }
    setSavingTask(false);
  };

  const markTaskDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    if (enquiry) {
      void loadTasks(enquiry.contact_id, enquiry.organisation_id, opportunities);
    }
    bumpTimeline();
  };

  const markTaskUndone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "todo" }),
    });
    if (enquiry) {
      void loadTasks(enquiry.contact_id, enquiry.organisation_id, opportunities);
    }
  };

  const replaceNotes = async (notes: string) => {
    setSavingNote(true);
    try {
      await patchEnquiry({ admin_notes: notes });
    } finally {
      setSavingNote(false);
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
    if (enquiry) {
      await loadTasks(enquiry.contact_id, enquiry.organisation_id, opportunities);
    }
    bumpTimeline();
  };

  if (loading && !enquiry) return <HubDetailSkeleton />;
  if (!enquiry) return <div className="p-8 text-sm text-[#6f6b62]">Enquiry not found.</div>;

  const postTitle = enquiry.connected_post_title || enquiry.posts?.title;
  const notesCount = countNotes(enquiry.admin_notes);
  const linkedNextActions = collectLinkedNextActions({ enquiry, opportunities });
  const openWorkCount = countOpenWorkItems(openTasks, linkedNextActions);

  const handleSaveLinkedNextAction = async (
    item: (typeof linkedNextActions)[number],
    payload: { title: string; dueDate: string | null },
  ) => {
    await patchLinkedNextAction(item, payload);
    await load();
    bumpTimeline();
  };

  const handleCompleteLinkedNextAction = async (item: (typeof linkedNextActions)[number]) => {
    await clearLinkedNextAction(item);
    await load();
    bumpTimeline();
  };
  const openTab = (
    tab: PreClientHubTab,
    opts?: { addNote?: boolean; addTask?: boolean },
  ) => {
    setActiveTab(tab);
    if (opts?.addNote) setShowAddNote(true);
    if (opts?.addTask) setAddingTask(true);
  };

  const hubQuickActions = (
    <HubQuickActions
      onAddNote={() => openTab("notes", { addNote: true })}
      onAddTask={() => openTab("tasks", { addTask: true })}
    />
  );

  return (
    <div className="min-h-screen bg-white">
      <RecordBackNav
        href="/admin/enquiries"
        backLabel="Website Enquiries"
        title={enquiry.name}
        actions={hubQuickActions}
      />

      <HubTabNav
        tabs={hubTabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as PreClientHubTab)}
        badge={(tabId) => {
          if (tabId === "tasks" && openWorkCount > 0) {
            return (
              <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">
                {openWorkCount}
              </span>
            );
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
          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact details</p>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Name</p>
              <p className="text-sm font-semibold text-[#111111]">{enquiry.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Email</p>
              <a href={emailComposeUrl(enquiry.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
                <Mail className="h-3.5 w-3.5" /> {enquiry.email}
              </a>
            </div>
            {enquiry.telephone && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Telephone</p>
                <a href={`tel:${enquiry.telephone}`} className="flex items-center gap-1.5 text-sm text-[#111111]">
                  <Phone className="h-3.5 w-3.5" /> {enquiry.telephone}
                </a>
              </div>
            )}
            <div>
              <p className="text-[10px] text-[#6f6b62]">Received</p>
              <p className="flex items-center gap-1.5 text-sm text-[#111111]">
                <Calendar className="h-3.5 w-3.5 text-[#6f6b62]" />
                {new Date(enquiry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="border-t border-[#111111]/8 pt-3 space-y-3">
              <div>
                <p className="text-[10px] text-[#6f6b62]">Service interest</p>
                <span className="mt-0.5 inline-block rounded-full bg-[#f5f274]/80 px-2.5 py-0.5 text-xs font-semibold text-[#111111]">{enquiry.support_type}</span>
              </div>
              <div>
                <p className="text-[10px] text-[#6f6b62]">Description</p>
                <CollapsibleNote content={enquiry.details} textClassName="text-sm text-[#6f6b62] leading-relaxed" />
              </div>
              {postTitle && (
                <div>
                  <p className="text-[10px] text-[#6f6b62]">Related post</p>
                  {enquiry.connected_post_id ? (
                    <Link href={`/admin/posts/${enquiry.connected_post_id}`} className="flex items-center gap-1 text-sm text-[#063b32] hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> {postTitle}
                    </Link>
                  ) : (
                    <p className="text-sm text-[#111111]">{postTitle}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Status</p>
            <StatusSelect value={enquiry.status} onChange={(status) => void updateStatus(status)} loading={updatingStatus} />
            {statusError && (
              <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{statusError}</p>
            )}
          </div>

        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeTab === "overview" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <HubMetricCard
                value={openWorkCount}
                label="Open tasks & actions"
                onClick={() => openTab("tasks")}
              />
              <HubMetricCard
                value={notesCount}
                label="Notes"
                onClick={() => openTab("notes")}
              />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              <HubTasksTab
                entityLabel={enquiry.name}
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
                onMarkUndone={markTaskUndone}
                onUpdateTask={updateTask}
                onSaveLinkedNextAction={handleSaveLinkedNextAction}
                onCompleteLinkedNextAction={handleCompleteLinkedNextAction}
                showDone={showDone}
                setShowDone={setShowDone}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <HubNotesTab
                notes={enquiry.admin_notes}
                showAddNote={showAddNote}
                onHideAddNote={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                saving={savingNote}
                onSave={saveNote}
                onReplaceNotes={replaceNotes}
                placeholder="What happened? What was discussed?"
                header={<KnowledgeAttachPicker enquiryId={id} onSaved={bumpTimeline} />}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function EnquiryDetailPage() {
  return (
    <Suspense fallback={null}>
      <EnquiryDetailContent />
    </Suspense>
  );
}