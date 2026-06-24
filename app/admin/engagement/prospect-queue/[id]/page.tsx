"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { JourneySummaryButton } from "@/components/admin/JourneySummaryButton";
import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { OpportunityPreviewCard } from "@/components/admin/OpportunityPreviewCard";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { subscribeNotesSaved } from "@/lib/engagement/activity-events";
import { buildClientContextSummary } from "@/lib/ai/context-builders";
import { isClientServiceStage } from "@/lib/engagement/client-stages";
import { CRM_HUB_TABS, type CrmHubTab } from "@/lib/engagement/hub-tabs";
import { emailComposeUrl } from "@/lib/engagement/email-links";
import { queueStageHint, queueStageLabel } from "@/lib/engagement/queue-stage-hints";
import { PROSPECT_QUEUE_PATH } from "@/lib/engagement/journey";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import {
  clearLinkedNextAction,
  collectLinkedNextActions,
  countOpenWorkItems,
  patchLinkedNextAction,
} from "@/lib/engagement/linked-next-actions";
import { fetchHubTasks } from "@/lib/engagement/load-hub-tasks";
import { AttachedKnowledgePanel } from "@/components/admin/AttachedKnowledgePanel";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { appendSimpleNote } from "@/lib/engagement/append-note";
import { countNotes } from "@/lib/engagement/note-count";

import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import type {
  EngagementContact,
  EngagementOpportunity,
  EngagementTask,
  Persona,
  SectorProfile,
} from "@/lib/engagement/types";
import { STAGE_COLORS } from "@/lib/engagement/types";
import {
  ProspectDecisionMakerCard,
  ProspectOrganisationCard,
  ProspectProfileHeader,
  ProspectResearchEvidenceCard,
  ProspectTagList,
} from "@/components/admin/ProspectResearchPanel";
import { ServiceFitPanel } from "@/components/admin/ServiceFitPanel";
import type { StudioTeamMember } from "@/lib/engagement/team-members";

type ClientTab = CrmHubTab | "submission";

const CLIENT_TABS: Array<{ id: ClientTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "submission", label: "Source" },
  ...CRM_HUB_TABS.filter((t) => t.id !== "overview"),
];

const VALID_TABS = new Set<string>(CLIENT_TABS.map((t) => t.id));

type EnquiryArchive = {
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
  sector_snapshot: SectorProfile | null;
  persona_snapshot: Persona | null;
  posts?: { id: string; title: string; slug: string } | null;
};

function formatValue(low: number | null, high: number | null) {
  if (!low && !high) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
  if (low && high && low !== high) return `${fmt(low)} – ${fmt(high)}`;
  if (low) return fmt(low);
  if (high) return fmt(high);
  return null;
}

function ClientDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [contact, setContact] = useState<EngagementContact | null>(null);
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [openTasks, setOpenTasks] = useState<EngagementTask[]>([]);
  const [doneTasks, setDoneTasks] = useState<EngagementTask[]>([]);
  const [linkedEnquiry, setLinkedEnquiry] = useState<EnquiryArchive | null>(null);
  const [outreachRecord, setOutreachRecord] = useState<ProspectFinderListItem | null>(null);
  const [chatActivityKey, setChatActivityKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ClientTab>("overview");

  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // Notes
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [handoffNoteOpen, setHandoffNoteOpen] = useState(false);

  // AI context — set once contact data is loaded
  const contactFullName = contact ? `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}` : null;
  useSetAIContext(
    contact && contactFullName
      ? {
          type: "client",
          id: contact.id,
          label: contactFullName,
          summary: buildClientContextSummary(contact, opportunities, null),
        }
      : null,
  );

  const loadTasks = useCallback(
    async (
      contactId: string,
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

  const loadData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const [cRes, oRes, eRes, tmRes] = await Promise.all([
      fetch(`/api/admin/engagement/contacts/${id}`),
      fetch(`/api/admin/engagement/opportunities?contact_id=${id}&limit=30`),
      fetch(`/api/admin/enquiries?contact_id=${id}&include_closed=true`),
      fetch("/api/admin/engagement/team-members"),
    ]);
    const [cData, oData, eData, tmData] = await Promise.all([
      cRes.json() as Promise<{ data: EngagementContact }>,
      oRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      eRes.json() as Promise<{ data: EnquiryArchive[] }>,
      tmRes.json() as Promise<{ data: StudioTeamMember[] }>,
    ]);
    setTeamMembers(tmData.data || []);
    setContact(cData.data);
    const opps = oData.data || [];
    setOpportunities(opps);

    let enquiry: EnquiryArchive | null = eData.data?.[0] || null;
    if (enquiry?.id) {
      const eDetailRes = await fetch(`/api/admin/enquiries/${enquiry.id}`);
      if (eDetailRes.ok) {
        const eDetail = await eDetailRes.json() as { data?: EnquiryArchive };
        if (eDetail.data) enquiry = eDetail.data;
      }
    }
    setLinkedEnquiry(enquiry);

    const outreachId = opps.find((o) => o.outreach_id)?.outreach_id ?? null;
    if (outreachId) {
      const oRes = await fetch(`/api/admin/engagement/prospect-outreach/${outreachId}`);
      const oData = await oRes.json() as { data?: ProspectFinderListItem };
      setOutreachRecord(oData.data || null);
    } else {
      setOutreachRecord(null);
    }

    await loadTasks(id, cData.data.organisation_id, opps);
    if (!opts?.silent) setLoading(false);
  }, [id, loadTasks]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(
    () =>
      subscribeNotesSaved((detail) => {
        if (detail.contextType === "client" && detail.contextId === id) {
          void loadData({ silent: true });
        }
      }),
    [id, loadData],
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    const normalizedTab = tab === "opportunities" || tab === "client_work" ? "overview" : tab;
    if (normalizedTab && VALID_TABS.has(normalizedTab)) {
      setActiveTab(normalizedTab as ClientTab);
    }
  }, [searchParams]);

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
        contact_id: id,
        organisation_id: contact?.organisation_id ?? null,
        opportunity_id: opportunities[0]?.id ?? null,
        assigned_team_member_id: taskForm.assigned_team_member_id || null,
      }),
    });
    if (res.ok) {
      setTaskForm(DEFAULT_TASK_FORM);
      setAddingTask(false);
      void loadTasks(id, contact?.organisation_id, opportunities);
    }
    setSavingTask(false);
  };

  const markTaskDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    void loadTasks(id, contact?.organisation_id, opportunities);
    setChatActivityKey((k) => k + 1);
  };

  const markTaskUndone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "todo" }),
    });
    void loadTasks(id, contact?.organisation_id, opportunities);
  };

  const saveNote = async () => {
    if (!noteText.trim() || !contact) return;
    setSavingNote(true);
    const combined = appendSimpleNote(contact.notes, noteText);
    const res = await fetch(`/api/admin/engagement/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: combined }),
    });
    if (res.ok) {
      const j = await res.json() as { data: EngagementContact };
      setContact(j.data);
      setNoteText("");
      setShowAddNote(false);
    }
    setSavingNote(false);
  };

  const updateOpportunityNextAction = async (nextAction: string | null) => {
    const opp = opportunities[0];
    if (!opp) return;
    const res = await fetch(`/api/admin/engagement/opportunities/${opp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next_action: nextAction }),
    });
    if (res.ok) {
      const j = await res.json() as { data: EngagementOpportunity };
      handleOpportunityUpdated(j.data);
    }
  };

  const handleOpportunityUpdated = (updated: EngagementOpportunity) => {
    setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  if (loading && !contact) return <HubDetailSkeleton />;
  if (!contact) return <div className="p-8 text-sm text-[#6f6b62]">Client not found.</div>;

  const fullName = `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`;
  const initials = `${contact.first_name[0] ?? ""}${contact.last_name?.[0] ?? ""}`.toUpperCase();

  const primaryOpp = opportunities[0] ?? null;
  const deliveryOpp = opportunities.find((o) => isClientServiceStage(o.stage)) ?? null;
  const notesCount = countNotes(contact.notes);
  const linkedNextActions = collectLinkedNextActions({
    enquiry: linkedEnquiry,
    queue: null,
    opportunities,
  });
  const openWorkCount = countOpenWorkItems(openTasks, linkedNextActions);

  const handleSaveLinkedNextAction = async (
    item: (typeof linkedNextActions)[number],
    payload: { title: string; dueDate: string | null },
  ) => {
    await patchLinkedNextAction(item, payload);
    await loadData({ silent: true });
    setChatActivityKey((k) => k + 1);
  };

  const handleCompleteLinkedNextAction = async (item: (typeof linkedNextActions)[number]) => {
    await clearLinkedNextAction(item);
    await loadData({ silent: true });
    setChatActivityKey((k) => k + 1);
  };
  const lastActivity = linkedEnquiry?.last_action || null;
  const lastActivityDate =
    linkedEnquiry?.last_action_date ||
    primaryOpp?.updated_at ||
    null;
  const handoffNote =
    primaryOpp?.desired_outcomes?.trim() ||
    outreachRecord?.opportunity_description?.trim() ||
    null;
  return (
    <div className="min-h-screen bg-white">
      <RecordBackNav
        href={PROSPECT_QUEUE_PATH}
        backLabel="Prospect Queue"
        title={fullName}
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

      {/* Tabs */}
      <div className="border-b border-[#111111]/10 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {CLIENT_TABS.map((tab) => (
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
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                  {openWorkCount}
                </span>
              )}
              {tab.id === "research" && outreachRecord && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">✓</span>
              )}
              {tab.id === "engagement_guide" && (outreachRecord?.engagement_approach || primaryOpp?.recommended_pathway) && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">✓</span>
              )}
              {tab.id === "submission" && (linkedEnquiry || outreachRecord) && (
                <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">1</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left sidebar ── */}
        <div className="space-y-4">
          {outreachRecord ? (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Summary</p>
              <ProspectProfileHeader data={outreachRecord} />
              <ProspectOrganisationCard data={outreachRecord} />
              <ProspectDecisionMakerCard data={outreachRecord} />
            </div>
          ) : (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#063b32] text-base font-bold text-[#f5f274]">
                  {initials || <Briefcase className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold text-[#111111]">{fullName}</p>
                  {contact.role && <p className="text-xs text-[#6f6b62]">{contact.role}</p>}
                </div>
              </div>
              {contact.professional_email && (
                <a href={emailComposeUrl(contact.professional_email)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#063b32] hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {contact.professional_email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-sm text-[#063b32] hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              )}
              {contact.organisation && (
                <p className="flex items-center gap-1 text-sm text-[#111111]">
                  <Building2 className="h-3.5 w-3.5 text-[#063b32]" />
                  {(contact.organisation as { id: string; name: string }).name}
                </p>
              )}
            </div>
          )}

          {primaryOpp && (
            <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">
                    {queueStageLabel(primaryOpp.stage)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#111111]">{primaryOpp.stage}</p>
                  <p className="mt-1 text-xs text-[#6f6b62] leading-relaxed">
                    {queueStageHint(primaryOpp.stage)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    STAGE_COLORS[primaryOpp.stage] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {primaryOpp.stage}
                </span>
              </div>

              {handoffNote && (
                <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setHandoffNoteOpen((v) => !v)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                      Move to queue note
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#6f6b62] transition-transform ${handoffNoteOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {handoffNoteOpen && (
                    <div className="border-t border-[#111111]/10 px-4 py-3">
                      <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{handoffNote}</p>
                    </div>
                  )}
                </div>
              )}

              <OpportunityPreviewCard
                opportunity={primaryOpp}
                editable
                clientContext={isClientServiceStage(primaryOpp.stage)}
                defaultExpanded={false}
                dropUpStageSelect
                onUpdated={handleOpportunityUpdated}
                openTaskCount={openTasks.length}
              />
            </div>
          )}

          {linkedEnquiry && (
            <button
              type="button"
              onClick={() => setActiveTab("submission")}
              className="w-full rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50 transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Source</p>
              <p className="mt-1 text-sm font-semibold text-[#111111]">Website enquiry</p>
              <p className="text-xs text-[#063b32] mt-0.5">View submission details →</p>
            </button>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <JourneyStageBanner
                currentStage="queue"
                opportunityStage={primaryOpp?.stage}
              />

              {outreachRecord && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client journey</p>
                  <ServiceFitPanel data={outreachRecord} mode="overview" />
                  <ProspectTagList data={outreachRecord} />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <HubMetricCard
                  value={openWorkCount}
                  label="Open tasks"
                  onClick={() => setActiveTab("tasks")}
                />
                <HubMetricCard
                  value={notesCount}
                  label="Notes"
                  onClick={() => setActiveTab("notes")}
                />
              </div>

              <JourneySummaryButton
                contactId={id}
                onSaved={() => {
                  void loadData({ silent: true });
                  setChatActivityKey((k) => k + 1);
                }}
              />

              {primaryOpp && (
                <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
                  <input
                    value={primaryOpp.next_action || ""}
                    onChange={(e) =>
                      setOpportunities((prev) =>
                        prev.map((o, i) => (i === 0 ? { ...o, next_action: e.target.value } : o)),
                      )
                    }
                    onBlur={() => void updateOpportunityNextAction(primaryOpp.next_action)}
                    placeholder="Most important next step for this engagement"
                    className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
              )}

              {deliveryOpp && deliveryOpp.id !== primaryOpp?.id && (
                <OpportunityPreviewCard
                  opportunity={deliveryOpp}
                  editable
                  clientContext
                  defaultExpanded
                  onUpdated={handleOpportunityUpdated}
                />
              )}

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-1">Last activity</p>
                {lastActivity ? (
                  <>
                    <p className="text-sm text-[#111111]">{lastActivity}</p>
                    {lastActivityDate && (
                      <p className="mt-1 text-xs text-[#6f6b62]">
                        {new Date(lastActivityDate).toLocaleString("en-GB")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#6f6b62]/50">No activity recorded yet.</p>
                )}
              </div>
            </>
          )}

          {/* ORIGINAL SUBMISSION TAB */}
          {activeTab === "submission" && (
            <>
              {!linkedEnquiry && !outreachRecord ? (
                <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
                  <p className="text-sm text-[#6f6b62]">No original submission linked to this client.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {linkedEnquiry && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                        <MessageSquare className="h-4 w-4 text-blue-700" />
                        <span className="text-sm font-semibold text-[#111111]">Website enquiry</span>
                        <span className="ml-auto text-xs text-[#6f6b62]">Archived on conversion</span>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact at submission</p>
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Name</p>
                            <p className="text-sm font-semibold text-[#111111]">{linkedEnquiry.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Email</p>
                            <p className="text-sm text-[#111111]">{linkedEnquiry.email}</p>
                          </div>
                          {linkedEnquiry.telephone && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Telephone</p>
                              <p className="text-sm text-[#111111]">{linkedEnquiry.telephone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Received</p>
                            <p className="text-sm text-[#111111]">
                              {new Date(linkedEnquiry.created_at).toLocaleString("en-GB")}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Submission details</p>
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Query type</p>
                            <span className="mt-0.5 inline-block rounded-full bg-[#f5f274]/80 px-2.5 py-0.5 text-xs font-semibold text-[#111111]">
                              {linkedEnquiry.support_type}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Preferred contact</p>
                            <p className="text-sm text-[#111111]">{linkedEnquiry.preferred_contact}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Description</p>
                            <CollapsibleNote content={linkedEnquiry.details} textClassName="text-sm text-[#6f6b62] leading-relaxed" />
                          </div>
                          {(linkedEnquiry.posts?.title || linkedEnquiry.connected_post_title) && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Related post</p>
                              {linkedEnquiry.connected_post_id ? (
                                <Link href={`/admin/posts/${linkedEnquiry.connected_post_id}`} className="flex items-center gap-1 text-sm text-[#063b32] hover:underline">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  {linkedEnquiry.posts?.title || linkedEnquiry.connected_post_title}
                                </Link>
                              ) : (
                                <p className="text-sm text-[#111111]">{linkedEnquiry.connected_post_title}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {linkedEnquiry.admin_notes && (
                        <div className="rounded-xl border border-[#111111]/10 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">Admin notes from enquiry</p>
                          <CollapsibleNote content={linkedEnquiry.admin_notes} />
                        </div>
                      )}
                    </>
                  )}
                  {outreachRecord && !linkedEnquiry && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-amber-700" />
                        <span className="text-sm font-semibold text-[#111111]">Moved from Prospect Finder</span>
                      </div>
                      <p className="text-sm text-[#6f6b62]">
                        Research, client journey, and engagement guide from Prospect Finder are retained on this record.
                        {handoffNote ? " The move-to-queue note is in the pipeline panel on the left." : ""}
                      </p>
                      {handoffNote && (
                        <div className="rounded-lg border border-amber-200/80 bg-white/80 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                            Move to queue note
                          </p>
                          <p className="mt-1 text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{handoffNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-[#063b32]" />
                    <p className="text-sm text-[#111111]">
                      This submission was converted to a client record. All enquiry and queue history lives on this page.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <HubTasksTab
                entityLabel={contact.first_name}
                openTasks={openTasks}
                doneTasks={doneTasks}
                linkedNextActions={linkedNextActions}
                viewAllTasksHref="/admin/engagement/pipeline"
                teamMembers={teamMembers}
                addingTask={addingTask}
                setAddingTask={setAddingTask}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                savingTask={savingTask}
                onCreateTask={createTask}
                onMarkDone={markTaskDone}
                onMarkUndone={markTaskUndone}
                onSaveLinkedNextAction={handleSaveLinkedNextAction}
                onCompleteLinkedNextAction={handleCompleteLinkedNextAction}
                showDone={showDone}
                setShowDone={setShowDone}
              />
            </div>
          )}

          {/* RESEARCH TAB */}
          {activeTab === "research" && (
            outreachRecord ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Research assessment</p>
                <ServiceFitPanel data={outreachRecord} mode="research" />
                <ProspectResearchEvidenceCard data={outreachRecord} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
                <p className="text-sm text-[#6f6b62]">No Prospect Finder research linked to this record yet.</p>
              </div>
            )
          )}

          {/* ENGAGEMENT GUIDE TAB */}
          {activeTab === "engagement_guide" && (
            outreachRecord?.engagement_approach || primaryOpp?.recommended_pathway ? (
              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Engagement guide</p>
                <CollapsibleNote
                  content={outreachRecord?.engagement_approach || primaryOpp?.recommended_pathway || ""}
                  textClassName="text-sm text-[#111111] leading-relaxed"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
                <p className="text-sm text-[#6f6b62]">No engagement guide linked to this record yet.</p>
              </div>
            )
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <HubNotesTab
                title="Client notes"
                notes={contact.notes}
                showAddNote={showAddNote}
                onShowAddNote={() => setShowAddNote(true)}
                onHideAddNote={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                saving={savingNote}
                onSave={saveNote}
                placeholder="Add a note about this client…"
                header={<AttachedKnowledgePanel contactId={id} refreshKey={chatActivityKey} />}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={null}>
      <ClientDetailContent />
    </Suspense>
  );
}
