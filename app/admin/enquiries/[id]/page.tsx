"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  User,
} from "lucide-react";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { AttachedKnowledgePanel } from "@/components/admin/AttachedKnowledgePanel";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { ConvertToClientModal } from "@/components/admin/ConvertToClientModal";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { useStudioAccess } from "@/lib/studio-access-context";
import { buildEnquiryContextSummary } from "@/lib/ai/context-builders";
import {
  CRM_HUB_TAB_IDS_PRE_CLIENT,
  CRM_HUB_TABS_PRE_CLIENT,
  type PreClientHubTab,
} from "@/lib/engagement/hub-tabs";
import {
  ADVANCE_ACTION_LABEL,
  ADVANCE_STATUS_HINT,
  PRE_SALES_STATUS,
  canAdvanceToClientWork,
  journeyStageForEnquiryStatus,
} from "@/lib/engagement/journey";

import {
  clearLinkedNextAction,
  collectLinkedNextActions,
  countOpenWorkItems,
  patchLinkedNextAction,
} from "@/lib/engagement/linked-next-actions";
import { fetchHubTasks } from "@/lib/engagement/load-hub-tasks";
import { countNotes } from "@/lib/engagement/note-count";

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

function gmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

function EnquiryDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [chatActivityKey, setChatActivityKey] = useState(0);
  const hubTabs = CRM_HUB_TABS_PRE_CLIENT;
  const { isPlatformAdmin } = useStudioAccess();

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
      if (j.data.status === "Closed" && j.data.contact_id) {
        router.replace(`/admin/clients/${j.data.contact_id}?tab=submission`);
        setLoading(false);
        return;
      }
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
  }, [id, loadCrmData, loadTasks, router]);

  useEffect(() => { void load(); }, [load]);

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
      admin_notes: enquiry.admin_notes
        ? `${enquiry.admin_notes}\n\n[${new Date().toLocaleDateString("en-GB")}] ${noteText}`
        : noteText,
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
  };

  if (loading) return <HubDetailSkeleton />;
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
  const clientOpportunity = opportunities.find((o) =>
    ["Won", "Onboarding planned", "Contract sent", "Invoices sent", "Onboarding in progress", "Onboarding", "Active client", "Paused"].includes(o.stage)
  ) ?? null;

  return (
    <div className="min-h-screen bg-white">
      {isPlatformAdmin && (
        <ConvertToClientModal
          open={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          onConverted={(contactId) => {
            setShowConvertModal(false);
            router.push(`/admin/clients/${contactId}`);
          }}
          sourceType="enquiry"
          sourceId={enquiry.id}
          sourceStatus={enquiry.status}
          sourceLabel={enquiry.name}
          contactName={enquiry.name}
          contactEmail={enquiry.email}
          contactPhone={enquiry.telephone}
          supportType={enquiry.support_type}
          existingContactId={enquiry.contact_id}
          existingOrgId={enquiry.organisation_id}
        />
      )}

      <RecordBackNav
        href="/admin/enquiries"
        backLabel="Website Enquiries"
        title={enquiry.name}
        actions={
          activeTab === "overview" ? (
            <HubQuickActions
              onAddNote={() => {
                setActiveTab("notes");
                setShowAddNote(true);
              }}
              onAddTask={() => {
                setActiveTab("tasks");
                setAddingTask(true);
              }}
            />
          ) : undefined
        }
      />

      <div className="border-b border-[#111111]/10 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {hubTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-[#063b32] text-[#063b32]"
                  : "border-transparent text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {tab.label}
              {tab.id === "tasks" && openWorkCount > 0 && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">{openWorkCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

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
              <a href={gmailComposeUrl(enquiry.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
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
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Submission</p>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Query type</p>
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

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Status</p>
            <StatusSelect value={enquiry.status} onChange={(status) => void updateStatus(status)} loading={updatingStatus} />
            {statusError && (
              <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{statusError}</p>
            )}
          </div>

          {isPlatformAdmin && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client record</p>
              {linkedContact && (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
                    <User className="h-4 w-4 text-[#063b32]" />
                    {linkedContact.first_name} {linkedContact.last_name || ""}
                  </p>
                  {linkedContact.organisation && (
                    <p className="flex items-center gap-2 text-xs text-[#6f6b62]">
                      <Building2 className="h-3.5 w-3.5" /> {linkedContact.organisation.name}
                    </p>
                  )}
                </div>
              )}
              {clientOpportunity ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-[#063b32]/8 px-3 py-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#063b32]" />
                    <span className="text-xs font-semibold text-[#063b32]">{clientOpportunity.stage}</span>
                  </div>
                  <Link
                    href={`/admin/clients/${linkedContact?.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#063b32]/20 px-4 py-2.5 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/5"
                  >
                    <Briefcase className="h-4 w-4" />
                    View client record
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => canAdvanceToClientWork(enquiry.status) && setShowConvertModal(true)}
                    disabled={!canAdvanceToClientWork(enquiry.status)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#063b32]/30 bg-[#063b32]/5 px-4 py-3 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#063b32]/5"
                  >
                    <Briefcase className="h-4 w-4" />
                    {ADVANCE_ACTION_LABEL}
                  </button>
                  {!canAdvanceToClientWork(enquiry.status) && (
                    <p className="text-xs text-[#6f6b62] leading-relaxed">
                      Set status to <span className="font-semibold">{PRE_SALES_STATUS}</span> first. {ADVANCE_STATUS_HINT}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeTab === "overview" && (
            <>
              <JourneyStageBanner
                currentStage={journeyStageForEnquiryStatus(enquiry.status)}
                status={enquiry.status}
                hint="Website enquiry — qualify the inbound need and respond."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <HubMetricCard
                  value={openWorkCount}
                  label="Open tasks & actions"
                  onClick={() => setActiveTab("tasks")}
                />
                <HubMetricCard
                  value={notesCount}
                  label="Notes"
                  onClick={() => setActiveTab("notes")}
                />
              </div>

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-1">Last activity</p>
                {enquiry.last_action ? (
                  <>
                    <p className="text-sm text-[#111111]">{enquiry.last_action}</p>
                    {enquiry.last_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">{new Date(enquiry.last_action_date).toLocaleString("en-GB")}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#6f6b62]/50">No activity recorded yet.</p>
                )}
              </div>
            </>
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
                onSaveLinkedNextAction={handleSaveLinkedNextAction}
                onCompleteLinkedNextAction={handleCompleteLinkedNextAction}
                showDone={showDone}
                setShowDone={setShowDone}
              />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Activity timeline</p>
              <ActivityTimeline
                enquiryId={id}
                contactId={enquiry.contact_id ?? undefined}
                chatContextType="enquiry"
                chatContextId={id}
                refreshKey={chatActivityKey}
                seedEvents={[
                  {
                    title: "Enquiry received",
                    detail: `${enquiry.support_type} — ${enquiry.details.slice(0, 200)}${enquiry.details.length > 200 ? "…" : ""}`,
                    created_at: enquiry.created_at,
                  },
                ]}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <AttachedKnowledgePanel enquiryId={id} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Notes &amp; admin log</p>
                <button
                  type="button"
                  onClick={() => setShowAddNote(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
                >
                  <Plus className="h-4 w-4" /> Add note
                </button>
              </div>
              {showAddNote && (
                <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
                  <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="What happened? What was discussed?" className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void saveNote()} disabled={savingNote || !noteText.trim()} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                      {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save note
                    </button>
                    <button type="button" onClick={() => { setShowAddNote(false); setNoteText(""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
                  </div>
                </div>
              )}
              {enquiry.admin_notes ? (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <CollapsibleNote content={enquiry.admin_notes} />
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]/60 py-8 text-center">No notes yet.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function EnquiryDetailPage() {
  return (
    <Suspense fallback={<HubDetailSkeleton />}>
      <EnquiryDetailContent />
    </Suspense>
  );
}