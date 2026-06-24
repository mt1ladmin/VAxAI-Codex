"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ExternalLink,
  History,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  User,
  X,
} from "lucide-react";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { AttachedKnowledgePanel } from "@/components/admin/AttachedKnowledgePanel";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { ConvertToClientModal } from "@/components/admin/ConvertToClientModal";
import { ProspectResearchPanel } from "@/components/admin/ProspectResearchPanel";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { useStudioAccess } from "@/lib/studio-access-context";
import { buildProspectContextSummary } from "@/lib/ai/context-builders";
import {
  ADVANCE_ACTION_LABEL,
  ADVANCE_STATUS_HINT,
  PRE_SALES_STATUS,
  PROSPECT_WORKFLOW_PAGE_LABEL,
  canAdvanceToClientWork,
  journeyStageForQueueStatus,
} from "@/lib/engagement/journey";
import {
  CRM_HUB_TAB_IDS_PRE_CLIENT,
  CRM_HUB_TABS_PRE_CLIENT,
  type PreClientHubTab,
} from "@/lib/engagement/hub-tabs";
import { syncQueueFromSnapshot } from "@/lib/engagement/prospect-outreach/snapshot";
import { outreachFromQueueEntry } from "@/lib/engagement/prospect-outreach/queue-snapshot";
import { sectorGuidancePath } from "@/lib/engagement/sector-guidance";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import type { SectorProfile } from "@/lib/engagement/types";

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
  ProspectQueueEntry,
} from "@/lib/engagement/types";


function gmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

function ProspectDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entry, setEntry] = useState<ProspectQueueEntry | null>(null);
  const [linkedContact, setLinkedContact] = useState<EngagementContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    raw_contact_name: "",
    raw_email: "",
    raw_phone: "",
    raw_linkedin: "",
  });
  const [savingContact, setSavingContact] = useState(false);
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

  const [editingResearch, setEditingResearch] = useState(false);
  const [researchDraft, setResearchDraft] = useState<ProspectOutreachRecord | null>(null);
  const [savingResearch, setSavingResearch] = useState(false);
  const [sectors, setSectors] = useState<Pick<SectorProfile, "id" | "name">[]>([]);
  const hubTabs = CRM_HUB_TABS_PRE_CLIENT;
  const { isPlatformAdmin } = useStudioAccess();

  const outreachData = entry ? outreachFromQueueEntry(entry) : null;

  useEffect(() => {
    if (outreachData) setResearchDraft(outreachData);
    else setResearchDraft(null);
    setEditingResearch(false);
  }, [entry?.id, outreachData?.organisation_name]);

  useEffect(() => {
    void fetch("/api/admin/engagement/sectors?limit=50")
      .then((r) => r.json())
      .then((j: { data?: SectorProfile[] }) => {
        setSectors((j.data || []).map((s) => ({ id: s.id, name: s.name })));
      });
  }, []);

  const prospectLabel = entry?.organisation?.name ?? entry?.raw_org_name ?? entry?.raw_contact_name ?? null;
  useSetAIContext(
    entry && prospectLabel
      ? {
          type: "prospect",
          id: entry.id,
          label: prospectLabel,
          summary: buildProspectContextSummary(entry),
        }
      : null,
  );

  const saveResearch = async () => {
    if (!entry || !researchDraft) return;
    setSavingResearch(true);
    const fields = syncQueueFromSnapshot(researchDraft, { raw_notes: entry.raw_notes });
    const res = await fetch(`/api/admin/engagement/prospect-queue/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const j = await res.json();
    if (res.ok && j.data) {
      setEntry(j.data);
      setEditingResearch(false);
    }
    setSavingResearch(false);
  };

  const loadCrmData = useCallback(async (
    contactId?: string | null,
    organisationId?: string | null,
  ): Promise<EngagementOpportunity[]> => {
    setLoadingCrm(true);
    const oppQueries: Promise<Response>[] = [];
    if (contactId) {
      oppQueries.push(
        fetch(`/api/admin/engagement/opportunities?contact_id=${contactId}&limit=20`),
      );
    }
    if (organisationId) {
      oppQueries.push(
        fetch(`/api/admin/engagement/opportunities?organisation_id=${organisationId}&limit=20`),
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
  }, []);

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
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`);
    const j = await res.json() as { data: ProspectQueueEntry };
    if (j.data) {
      if (j.data.status === "Closed" && j.data.contact_id) {
        router.replace(`/admin/clients/${j.data.contact_id}?tab=submission`);
        setLoading(false);
        return;
      }
      setEntry(j.data);
      setContactForm({
        raw_contact_name: j.data.raw_contact_name || (j.data.contact ? `${j.data.contact.first_name} ${j.data.contact.last_name || ""}`.trim() : ""),
        raw_email: j.data.raw_email || j.data.contact?.professional_email || "",
        raw_phone: j.data.raw_phone || "",
        raw_linkedin: j.data.raw_linkedin || "",
      });
      if (j.data.contact_id) {
        const cRes = await fetch(`/api/admin/engagement/contacts/${j.data.contact_id}`);
        const cJ = await cRes.json() as { data?: EngagementContact };
        if (cJ.data) setLinkedContact(cJ.data);
      } else {
        setLinkedContact(null);
      }
      const opps = await loadCrmData(j.data.contact_id, j.data.organisation_id);
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

  const patchEntry = async (updates: Partial<ProspectQueueEntry>) => {
    const res = await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const j = await res.json() as { data?: ProspectQueueEntry; error?: string };
    if (!res.ok) {
      throw new Error(j.error || "Failed to save prospect");
    }
    if (j.data) setEntry(j.data);
    return j.data;
  };

  const bumpTimeline = () => setChatActivityKey((k) => k + 1);

  const updateStatus = async (status: string) => {
    if (!entry || status === entry.status) return;
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await patchEntry({ status, last_action_date: new Date().toISOString() });
      if (status === "Opportunity") {
        const opps = await loadCrmData(entry.contact_id, entry.organisation_id);
        await loadTasks(entry.contact_id, entry.organisation_id, opps);
      }
      bumpTimeline();
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveContact = async () => {
    setSavingContact(true);
    try {
      await patchEntry(contactForm);
      setEditingContact(false);
    } finally {
      setSavingContact(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim() || !entry) return;
    setSavingNote(true);
    await patchEntry({
      raw_notes: entry.raw_notes
        ? `${entry.raw_notes}\n\n[${new Date().toLocaleDateString("en-GB")}] ${noteText}`
        : noteText,
      last_action: noteText.slice(0, 80),
      last_action_date: new Date().toISOString(),
    });
    setNoteText("");
    setShowAddNote(false);
    setSavingNote(false);
    bumpTimeline();
  };

  const createTask = async () => {
    if (!taskForm.title.trim() || !entry) return;
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
        contact_id: entry.contact_id,
        organisation_id: entry.organisation_id,
        opportunity_id: opportunities[0]?.id ?? null,
      }),
    });
    if (res.ok) {
      setTaskForm(DEFAULT_TASK_FORM);
      setAddingTask(false);
      void loadTasks(entry.contact_id, entry.organisation_id, opportunities);
    }
    setSavingTask(false);
  };

  const markTaskDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    if (entry) {
      void loadTasks(entry.contact_id, entry.organisation_id, opportunities);
    }
    bumpTimeline();
  };

  const markTaskUndone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "todo" }),
    });
    if (entry) {
      void loadTasks(entry.contact_id, entry.organisation_id, opportunities);
    }
  };

  if (loading) return <HubDetailSkeleton />;
  if (!entry) return <div className="p-8 text-sm text-[#6f6b62]">Prospect not found.</div>;

  const orgName = entry.organisation?.name || entry.raw_org_name || "Unknown organisation";
  const contactName = entry.contact
    ? `${entry.contact.first_name} ${entry.contact.last_name || ""}`.trim()
    : entry.raw_contact_name || null;
  const email = entry.contact?.professional_email || entry.raw_email;
  const notesCount = countNotes(entry.raw_notes);
  const linkedNextActions = collectLinkedNextActions({ queue: entry, opportunities });
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
          sourceType="queue"
          sourceId={entry.id}
          sourceStatus={entry.status}
          sourceLabel={orgName}
          contactName={contactName || orgName}
          contactEmail={email || ""}
          contactPhone={entry.raw_phone}
          supportType={entry.raw_industry || entry.organisation?.industry || PROSPECT_WORKFLOW_PAGE_LABEL}
          existingContactId={entry.contact_id}
          existingOrgId={entry.organisation_id}
        />
      )}

      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
              <h2 className="text-base font-semibold text-[#111111]">Edit contact details</h2>
              <button type="button" onClick={() => setEditingContact(false)} className="text-[#6f6b62] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { key: "raw_contact_name" as const, label: "Name" },
                { key: "raw_email" as const, label: "Email", type: "email" },
                { key: "raw_phone" as const, label: "Phone", type: "tel" },
                { key: "raw_linkedin" as const, label: "LinkedIn", type: "url" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-[#6f6b62]">{label}</label>
                  <input
                    type={type || "text"}
                    value={contactForm[key]}
                    onChange={(e) => setContactForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-[#111111]/15 px-4 py-2.5 text-sm outline-none focus:border-[#063b32]"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
              <button type="button" onClick={() => setEditingContact(false)} className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveContact()}
                disabled={savingContact}
                className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <RecordBackNav
        href="/admin/engagement/prospect-queue"
        backLabel={PROSPECT_WORKFLOW_PAGE_LABEL}
        title={orgName}
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
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact &amp; prospect details</p>
              <button type="button" onClick={() => setEditingContact(true)} className="text-xs text-[#063b32] hover:underline">
                Edit
              </button>
            </div>
            <div>
              <p className="text-[10px] text-[#6f6b62]">Organisation</p>
              <p className="text-sm font-semibold text-[#111111]">{orgName}</p>
            </div>
            {contactName && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Contact</p>
                <p className="text-sm font-semibold text-[#111111]">{contactName}</p>
              </div>
            )}
            {email && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Email</p>
                <a href={gmailComposeUrl(email)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </a>
              </div>
            )}
            {entry.raw_phone && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Phone</p>
                <a href={`tel:${entry.raw_phone}`} className="flex items-center gap-1.5 text-sm text-[#111111]">
                  <Phone className="h-3.5 w-3.5" /> {entry.raw_phone}
                </a>
              </div>
            )}
            {entry.raw_website && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Website</p>
                <a
                  href={entry.raw_website.startsWith("http") ? entry.raw_website : `https://${entry.raw_website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#063b32] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {entry.raw_website}
                </a>
              </div>
            )}
            {entry.raw_linkedin && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">LinkedIn</p>
                <a
                  href={entry.raw_linkedin.startsWith("http") ? entry.raw_linkedin : `https://${entry.raw_linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#063b32] hover:underline"
                >
                  View profile
                </a>
              </div>
            )}
            {(entry.raw_industry || entry.organisation?.industry) && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Industry</p>
                <p className="text-sm text-[#111111]">{entry.raw_industry || entry.organisation?.industry}</p>
              </div>
            )}
            {entry.raw_location && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Location</p>
                <p className="text-sm text-[#111111]">{entry.raw_location}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-[#6f6b62]">Added</p>
              <p className="flex items-center gap-1.5 text-sm text-[#111111]">
                <Calendar className="h-3.5 w-3.5 text-[#6f6b62]" />
                {new Date(entry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {(entry.duplicate_warning || entry.previous_contact_warning) && (
              <div className="space-y-2 pt-1">
                {entry.duplicate_warning && (
                  <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-orange-700">Possible duplicate</p>
                      <p className="text-xs text-orange-600 mt-0.5">{entry.duplicate_warning}</p>
                    </div>
                  </div>
                )}
                {entry.previous_contact_warning && (
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <History className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">Previous contact</p>
                      <p className="text-xs text-blue-600 mt-0.5">{entry.previous_contact_warning}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-3">Status</p>
            <StatusSelect value={entry.status} onChange={(status) => void updateStatus(status)} loading={updatingStatus} />
            {statusError && (
              <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{statusError}</p>
            )}
          </div>

          {isPlatformAdmin && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client record</p>
              {(linkedContact || entry.contact) && (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
                    <User className="h-4 w-4 text-[#063b32]" />
                    {linkedContact
                      ? `${linkedContact.first_name} ${linkedContact.last_name || ""}`
                      : contactName}
                  </p>
                  {(linkedContact?.organisation || entry.organisation) && (
                    <p className="flex items-center gap-2 text-xs text-[#6f6b62]">
                      <Building2 className="h-3.5 w-3.5" />
                      {linkedContact?.organisation?.name || entry.organisation?.name}
                    </p>
                  )}
                </div>
              )}
              {clientOpportunity && entry.contact_id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-[#063b32]/8 px-3 py-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#063b32]" />
                    <span className="text-xs font-semibold text-[#063b32]">{clientOpportunity.stage}</span>
                  </div>
                  <Link
                    href={`/admin/clients/${entry.contact_id}`}
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
                    onClick={() => canAdvanceToClientWork(entry.status) && setShowConvertModal(true)}
                    disabled={!canAdvanceToClientWork(entry.status)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#063b32]/30 bg-[#063b32]/5 px-4 py-3 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#063b32]/5"
                  >
                    <Briefcase className="h-4 w-4" />
                    {ADVANCE_ACTION_LABEL}
                  </button>
                  {!canAdvanceToClientWork(entry.status) && (
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
                currentStage={journeyStageForQueueStatus(entry.status)}
                status={entry.status}
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

              {researchDraft && (
                <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                      Outreach research
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {researchDraft.sector_tags.length > 0 && (
                        <Link
                          href={sectorGuidancePath(researchDraft.sector_tags, sectors)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#063b32] hover:bg-[#f7f4ea]"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Sector guidance
                        </Link>
                      )}
                      {editingResearch ? (
                        <>
                          <button
                            type="button"
                            disabled={savingResearch}
                            onClick={() => void saveResearch()}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {savingResearch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setResearchDraft(outreachData); setEditingResearch(false); }}
                            className="rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingResearch(true)}
                          className="text-xs font-semibold text-[#063b32] hover:underline"
                        >
                          Edit research
                        </button>
                      )}
                    </div>
                  </div>
                  <ProspectResearchPanel
                    data={researchDraft}
                    editable={editingResearch}
                    onChange={setResearchDraft}
                    compact
                  />
                </div>
              )}

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-1">Last activity</p>
                {entry.last_action ? (
                  <>
                    <p className="text-sm text-[#111111]">{entry.last_action}</p>
                    {entry.last_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">{new Date(entry.last_action_date).toLocaleString("en-GB")}</p>
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
                entityLabel={orgName}
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
                onSaveLinkedNextAction={handleSaveLinkedNextAction}
                onCompleteLinkedNextAction={handleCompleteLinkedNextAction}
                showDone={showDone}
                setShowDone={setShowDone}
              />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Activity timeline</p>
                <p className="mt-1 text-sm text-[#6f6b62]/80">
                  Status changes, notes, tasks, and VAxAI conversations in one chronological feed.
                </p>
              </div>
              <ActivityTimeline
                queueId={id}
                contactId={entry.contact_id ?? undefined}
                chatContextType="prospect"
                chatContextId={id}
                refreshKey={chatActivityKey}
                seedEvents={[
                  {
                    title: "Prospect added to queue",
                    detail: orgName,
                    created_at: entry.created_at,
                  },
                ]}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <AttachedKnowledgePanel queueId={id} />
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
              {entry.raw_notes ? (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <CollapsibleNote content={entry.raw_notes} />
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

export default function ProspectDetailPage() {
  return (
    <Suspense fallback={<HubDetailSkeleton />}>
      <ProspectDetailContent />
    </Suspense>
  );
}