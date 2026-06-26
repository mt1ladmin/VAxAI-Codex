"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Building2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  X,
} from "lucide-react";

import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { OpportunityPreviewCard } from "@/components/admin/OpportunityPreviewCard";
import { OpportunityStageSelect } from "@/components/admin/OpportunityStageSelect";
import { JourneyStagePills } from "@/components/admin/JourneyStageBanner";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { subscribeNotesSaved } from "@/lib/engagement/activity-events";
import { buildClientContextSummary } from "@/lib/ai/context-builders";
import { CLIENT_SERVICE_STAGES, isClientServiceStage } from "@/lib/engagement/client-stages";
import { CRM_HUB_TABS, type CrmHubTab } from "@/lib/engagement/hub-tabs";
import type { HubTabItem } from "@/components/admin/HubTabNav";
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
import { KnowledgeAttachPicker } from "@/components/admin/KnowledgeAttachPicker";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { HubTabNav } from "@/components/admin/HubTabNav";
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
import { OPPORTUNITY_STAGES } from "@/lib/engagement/types";
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
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { activeTeamMemberOptions } from "@/lib/engagement/team-members";
import { FINDER_ENGAGEMENT_STATUSES, type FinderEngagementStatus } from "@/lib/engagement/engagement-status";

type ClientTab = CrmHubTab;

const CLIENT_TABS: HubTabItem[] = [
  { id: "overview", label: "Overview", editable: false },
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
  const [editingContact, setEditingContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ first_name: "", last_name: "", role: "", professional_email: "", phone: "" });

  // Notes
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [editingHandoffNote, setEditingHandoffNote] = useState(false);
  const [handoffNoteForm, setHandoffNoteForm] = useState("");
  const [savingHandoffNote, setSavingHandoffNote] = useState(false);
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

    const opps = oData.data || [];
    let enquiry: EnquiryArchive | null = eData.data?.[0] || null;
    const outreachId = opps.find((o) => o.outreach_id)?.outreach_id ?? null;

    // Fetch enquiry detail + outreach record in parallel so all state is set in one batch,
    // preventing an intermediate render where outreachRecord is null but contact is set —
    // which caused the contact edit card to flash visible then disappear.
    const [enquiryDetailRes, outreachDetailRes] = await Promise.all([
      enquiry?.id
        ? fetch(`/api/admin/enquiries/${enquiry.id}`).then(async (r) =>
            r.ok ? (r.json() as Promise<{ data?: EnquiryArchive }>) : null
          )
        : Promise.resolve(null),
      outreachId
        ? fetch(`/api/admin/engagement/prospect-outreach/${outreachId}`).then((r) =>
            r.json() as Promise<{ data?: ProspectFinderListItem }>
          )
        : Promise.resolve(null),
    ]);

    if (enquiryDetailRes?.data) enquiry = enquiryDetailRes.data;

    setTeamMembers(tmData.data || []);
    setContact(cData.data);
    setOpportunities(opps);
    setLinkedEnquiry(enquiry);
    setOutreachRecord(outreachDetailRes?.data || null);

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

  const startContactEdit = () => {
    if (!contact) return;
    setContactForm({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      role: contact.role || "",
      professional_email: contact.professional_email || "",
      phone: contact.phone || "",
    });
    setEditingContact(true);
  };

  const saveContactEdits = async () => {
    if (!contact) return;
    setSavingContact(true);
    const res = await fetch(`/api/admin/engagement/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: contactForm.first_name.trim(),
        last_name: contactForm.last_name.trim() || null,
        role: contactForm.role.trim() || null,
        professional_email: contactForm.professional_email.trim() || null,
        phone: contactForm.phone.trim() || null,
      }),
    });
    if (res.ok) {
      const j = await res.json() as { data: EngagementContact };
      setContact(j.data);
      setEditingContact(false);
    }
    setSavingContact(false);
  };

  const handleOpportunityUpdated = (updated: EngagementOpportunity) => {
    setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const updateOpportunityStage = async (oppId: string, stage: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp || stage === opp.stage) return;
    setUpdatingStage(true);
    try {
      const res = await fetch(`/api/admin/engagement/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const j = await res.json() as { data?: EngagementOpportunity };
      if (j.data) handleOpportunityUpdated(j.data);
    } finally {
      setUpdatingStage(false);
    }
  };

  const stageOptionsFor = (opp: EngagementOpportunity) => {
    const clientContext = isClientServiceStage(opp.stage);
    if (clientContext) {
      return CLIENT_SERVICE_STAGES;
    }
    return OPPORTUNITY_STAGES.filter((s) => !isClientServiceStage(s));
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
  const handoffNote =
    primaryOpp?.desired_outcomes?.trim() ||
    outreachRecord?.opportunity_description?.trim() ||
    null;

  const saveOutreachFields = async (fields: Record<string, string | string[]>) => {
    if (!outreachRecord) return;
    const res = await fetch("/api/admin/engagement/prospect-outreach", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outreach_id: outreachRecord.id,
        overrides: fields,
      }),
    });
    if (res.ok) {
      const json = await res.json() as { data?: ProspectFinderListItem };
      if (json.data) setOutreachRecord(json.data);
      setChatActivityKey((k) => k + 1);
    }
  };

  const patchOutreachWorkflow = async (payload: Record<string, unknown>) => {
    if (!outreachRecord) return;
    const res = await fetch("/api/admin/engagement/prospect-outreach", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreach_id: outreachRecord.id, ...payload }),
    });
    if (res.ok) {
      const json = await res.json() as { data?: ProspectFinderListItem };
      if (json.data) setOutreachRecord(json.data);
    }
  };

  const saveHandoffNote = async () => {
    setSavingHandoffNote(true);
    try {
      if (outreachRecord) {
        await patchOutreachWorkflow({ opportunity_description: handoffNoteForm.trim() });
      } else if (primaryOpp) {
        const res = await fetch(`/api/admin/engagement/opportunities/${primaryOpp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ desired_outcomes: handoffNoteForm.trim() }),
        });
        if (res.ok) {
          const j = await res.json() as { data?: EngagementOpportunity };
          if (j.data) handleOpportunityUpdated(j.data);
        }
      }
      setEditingHandoffNote(false);
    } finally {
      setSavingHandoffNote(false);
    }
  };

  const replaceNotes = async (notes: string) => {
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/engagement/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        const j = await res.json() as { data: EngagementContact };
        setContact(j.data);
      }
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
    await loadTasks(id, contact?.organisation_id, opportunities);
    setChatActivityKey((k) => k + 1);
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, { method: "DELETE" });
    await loadTasks(id, contact?.organisation_id, opportunities);
  };

  const openTab = (
    tab: ClientTab,
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
        href={PROSPECT_QUEUE_PATH}
        backLabel="Prospect Queue"
        title={fullName}
        actions={hubQuickActions}
      />

      <HubTabNav
        tabs={CLIENT_TABS}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as ClientTab)}
        badge={(tabId) => {
          if (tabId === "tasks" && openWorkCount > 0) {
            return (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                {openWorkCount}
              </span>
            );
          }
          if (tabId === "notes" && notesCount > 0) {
            return (
              <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">
                {notesCount}
              </span>
            );
          }
          if (tabId === "research" && outreachRecord && hasResearchAssessmentContent(outreachRecord)) {
            return <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">✓</span>;
          }
          if (tabId === "vaxai_support" && outreachRecord && hasVaxaiSupportContent(outreachRecord)) {
            return <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">✓</span>;
          }
          if (
            tabId === "engagement_guide" &&
            (outreachRecord?.engagement_approach ||
              (outreachRecord && hasRecommendedEngagementContent(outreachRecord)) ||
              primaryOpp?.recommended_pathway)
          ) {
            return <span className="rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">✓</span>;
          }
          return null;
        }}
      />

      {/* Body */}
      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left sidebar ── */}
        <div className="space-y-4">
          {outreachRecord && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Summary</p>
              <ProspectProfileHeader data={outreachRecord} />
              <ProspectOrganisationCard data={outreachRecord} />
              <ProspectDecisionMakerCard data={outreachRecord} />
              <JourneyStagePills currentStage="queue" />
            </div>
          )}

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            {editingContact ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Edit contact</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#6f6b62] mb-0.5">First name</label>
                    <input value={contactForm.first_name} onChange={(e) => setContactForm((f) => ({ ...f, first_name: e.target.value }))} className="w-full rounded-lg border border-[#111111]/15 px-2.5 py-1.5 text-sm outline-none focus:border-[#063b32]" autoFocus />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6f6b62] mb-0.5">Last name</label>
                    <input value={contactForm.last_name} onChange={(e) => setContactForm((f) => ({ ...f, last_name: e.target.value }))} className="w-full rounded-lg border border-[#111111]/15 px-2.5 py-1.5 text-sm outline-none focus:border-[#063b32]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-0.5">Role</label>
                  <input value={contactForm.role} onChange={(e) => setContactForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded-lg border border-[#111111]/15 px-2.5 py-1.5 text-sm outline-none focus:border-[#063b32]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-0.5">Email</label>
                  <input type="email" value={contactForm.professional_email} onChange={(e) => setContactForm((f) => ({ ...f, professional_email: e.target.value }))} className="w-full rounded-lg border border-[#111111]/15 px-2.5 py-1.5 text-sm outline-none focus:border-[#063b32]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-0.5">Phone</label>
                  <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-[#111111]/15 px-2.5 py-1.5 text-sm outline-none focus:border-[#063b32]" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => void saveContactEdits()} disabled={savingContact} className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                    {savingContact ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                  <button type="button" onClick={() => setEditingContact(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#063b32] text-base font-bold text-[#f5f274]">
                      {initials || <Briefcase className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111]">{fullName}</p>
                      {contact.role && <p className="text-xs text-[#6f6b62]">{contact.role}</p>}
                    </div>
                  </div>
                  <button type="button" onClick={startContactEdit} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline shrink-0">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
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
              </>
            )}
          </div>

          {outreachRecord && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Assignment</p>
              <select
                value={outreachRecord.assigned_team_member_id || ""}
                onChange={(e) => {
                  const assignedId = e.target.value || null;
                  const opts = activeTeamMemberOptions(teamMembers);
                  const assignedName = opts.find((o) => o.value === assignedId)?.label ?? null;
                  setOutreachRecord((prev) => prev ? { ...prev, assigned_team_member_id: assignedId, assigned_team_member_name: assignedName } : prev);
                  void patchOutreachWorkflow({ assigned_team_member_id: assignedId });
                }}
                className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm text-[#111111] appearance-none outline-none focus:border-[#063b32]"
              >
                <option value="">Unassigned</option>
                {activeTeamMemberOptions(teamMembers).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div>
                <p className="mb-1 text-[10px] text-[#6f6b62]">Engagement status</p>
                <select
                  value={outreachRecord.engagement_status}
                  onChange={(e) => {
                    const status = e.target.value as FinderEngagementStatus;
                    setOutreachRecord((prev) => prev ? { ...prev, engagement_status: status } : prev);
                    void patchOutreachWorkflow({ engagement_status: status });
                  }}
                  className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm text-[#111111] appearance-none outline-none focus:border-[#063b32]"
                >
                  {FINDER_ENGAGEMENT_STATUSES.filter((s) => s !== "In prospect queue").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {primaryOpp && (
            <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">
                  {queueStageLabel(primaryOpp.stage)}
                </p>
                <OpportunityStageSelect
                  value={primaryOpp.stage}
                  stages={stageOptionsFor(primaryOpp)}
                  onChange={(stage) => void updateOpportunityStage(primaryOpp.id, stage)}
                  loading={updatingStage}
                  dropUp
                />
              </div>
              <p className="text-xs text-[#6f6b62] leading-relaxed">{queueStageHint(primaryOpp.stage)}</p>
            </div>
          )}

        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* OVERVIEW TAB */}
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
                  value={openWorkCount}
                  label="Tasks"
                  onClick={() => openTab("tasks")}
                />
              </div>

              {outreachRecord && (
                <div className="space-y-4">
                  <ServiceFitPanel data={outreachRecord} mode="overview" editable onSaveFields={saveOutreachFields} />
                  {(handoffNote || outreachRecord) && (
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                          Move to queue note
                        </p>
                        {!editingHandoffNote && (outreachRecord || primaryOpp) && (
                          <button
                            type="button"
                            onClick={() => { setHandoffNoteForm(handoffNote ?? ""); setEditingHandoffNote(true); }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline"
                          >
                            <Pencil className="h-3 w-3" /> {handoffNote ? "Edit" : "Add"}
                          </button>
                        )}
                      </div>
                      {editingHandoffNote ? (
                        <>
                          <textarea
                            value={handoffNoteForm}
                            onChange={(e) => setHandoffNoteForm(e.target.value)}
                            rows={5}
                            autoFocus
                            className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#063b32] resize-y leading-relaxed"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => void saveHandoffNote()}
                              disabled={savingHandoffNote}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                            >
                              {savingHandoffNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                            </button>
                            <button type="button" onClick={() => setEditingHandoffNote(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-amber-50">
                              <X className="h-3.5 w-3.5" /> Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">
                          {handoffNote ?? <span className="text-[#6f6b62]">No move-to-queue note yet.</span>}
                        </p>
                      )}
                    </div>
                  )}
                  <ProspectTagList data={outreachRecord} />
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
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
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
                <ServiceFitPanel
                  data={outreachRecord}
                  mode="research"
                  editable
                  onSaveFields={saveOutreachFields}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
                <p className="text-sm text-[#6f6b62]">No Prospect Finder research linked to this record yet.</p>
              </div>
            )
          )}

          {/* VAXAI SUPPORT TAB */}
          {activeTab === "vaxai_support" && (
            outreachRecord ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">VAxAI support and boundaries</p>
                <ServiceFitPanel
                  data={outreachRecord}
                  mode="support"
                  editable
                  onSaveFields={saveOutreachFields}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
                <p className="text-sm text-[#6f6b62]">No Prospect Finder research linked to this record yet.</p>
              </div>
            )
          )}

          {/* ENGAGEMENT GUIDE TAB */}
          {activeTab === "engagement_guide" && (
            outreachRecord ? (
              <div className="space-y-4">
                <ServiceFitPanel
                  data={outreachRecord}
                  mode="recommended_engagement"
                  editable
                  onSaveFields={saveOutreachFields}
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
              {linkedEnquiry?.admin_notes && (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">Notes from original enquiry</p>
                  <CollapsibleNote content={linkedEnquiry.admin_notes} />
                </div>
              )}
              <HubNotesTab
                notes={contact.notes}
                showAddNote={showAddNote}
                onHideAddNote={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                onShowAddNote={() => setShowAddNote(true)}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                saving={savingNote}
                onSave={saveNote}
                onReplaceNotes={replaceNotes}
                placeholder="Add a note about this client…"
                header={
                  <KnowledgeAttachPicker
                    contactId={id}
                    outreachId={outreachRecord?.id}
                    onSaved={() => setChatActivityKey((k) => k + 1)}
                  />
                }
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
