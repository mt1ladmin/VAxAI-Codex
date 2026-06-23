"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Target,
  User,
  X,
} from "lucide-react";
import { AIChatHistory } from "@/components/admin/AIAssistantWidget";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { ConvertToClientModal } from "@/components/admin/ConvertToClientModal";
import { CreateOpportunityModal } from "@/components/admin/CreateOpportunityModal";
import { HubTasksTab } from "@/components/admin/HubTasksTab";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { OpportunityPreviewCard } from "@/components/admin/OpportunityPreviewCard";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { buildEnquiryContextSummary } from "@/lib/ai/context-builders";
import { CRM_HUB_TAB_IDS, getCrmHubTabs, type CrmHubTab } from "@/lib/engagement/hub-tabs";
import { journeyStageForEnquiryStatus } from "@/lib/engagement/journey";
import { useStudioAccess } from "@/lib/studio-access-context";
import { fetchHubTasks } from "@/lib/engagement/load-hub-tasks";
import { countNotes } from "@/lib/engagement/note-count";
import { opportunityDetailPath } from "@/lib/engagement/opportunity-nav";
import { DEFAULT_TASK_FORM } from "@/lib/engagement/task-ui";
import type {
  EngagementContact,
  EngagementOpportunity,
  EngagementTask,
} from "@/lib/engagement/types";
import { STAGE_COLORS } from "@/lib/engagement/types";

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
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<CrmHubTab>("overview");
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [openTasks, setOpenTasks] = useState<EngagementTask[]>([]);
  const [doneTasks, setDoneTasks] = useState<EngagementTask[]>([]);
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [showCreateOppModal, setShowCreateOppModal] = useState(false);
  const [linkingOpp, setLinkingOpp] = useState(false);
  const [oppPickerOpen, setOppPickerOpen] = useState(false);
  const [oppPickerList, setOppPickerList] = useState<EngagementOpportunity[]>([]);
  const [oppPickerLoading, setOppPickerLoading] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [chatActivityKey, setChatActivityKey] = useState(0);
  const { canUseEnquiryAi } = useStudioAccess();
  const hubTabs = getCrmHubTabs(canUseEnquiryAi);

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
      setNextAction(j.data.next_action || "");
      setNextActionDate(j.data.next_action_date?.split("T")[0] || "");
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
    if (tab && CRM_HUB_TAB_IDS.has(tab)) {
      setActiveTab(tab as CrmHubTab);
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

  const refreshAfterChat = useCallback(() => {
    void load();
    bumpTimeline();
  }, [load]);

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

  const saveNextAction = async () => {
    setSavingAction(true);
    await patchEnquiry({
      next_action: nextAction,
      next_action_date: nextActionDate || null,
    } as Partial<Enquiry>);
    setEditingNextAction(false);
    setSavingAction(false);
    bumpTimeline();
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

  const handleOpportunityUpdated = (updated: EngagementOpportunity) => {
    setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleOpportunityCreated = (opp: EngagementOpportunity) => {
    const next = [opp, ...opportunities.filter((o) => o.id !== opp.id)];
    setOpportunities(next);
    setActiveTab("opportunities");
    if (enquiry) {
      void loadTasks(enquiry.contact_id, enquiry.organisation_id, next);
    }
  };

  const loadOppPicker = async () => {
    setOppPickerLoading(true);
    try {
      const res = await fetch("/api/admin/engagement/opportunities?limit=50");
      const j = await res.json() as { data?: EngagementOpportunity[] };
      setOppPickerList((j.data || []).filter((o) => o.enquiry_id !== id));
      setOppPickerOpen(true);
    } finally {
      setOppPickerLoading(false);
    }
  };

  const linkOpportunity = async (oppId: string) => {
    setLinkingOpp(true);
    try {
      const res = await fetch(`/api/admin/engagement/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry_id: id }),
      });
      const j = await res.json() as { data?: EngagementOpportunity };
      if (j.data) {
        const next = [j.data, ...opportunities.filter((o) => o.id !== j.data!.id)];
        setOpportunities(next);
        setOppPickerOpen(false);
        setActiveTab("opportunities");
        if (enquiry) {
          void loadTasks(enquiry.contact_id, enquiry.organisation_id, next);
        }
      }
    } finally {
      setLinkingOpp(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!enquiry) return <div className="p-8 text-sm text-[#6f6b62]">Enquiry not found.</div>;

  const postTitle = enquiry.connected_post_title || enquiry.posts?.title;
  const notesCount = countNotes(enquiry.admin_notes);
  const clientOpportunity = opportunities.find((o) =>
    ["Won", "Onboarding planned", "Contract sent", "Invoices sent", "Onboarding in progress", "Onboarding", "Active client", "Paused"].includes(o.stage)
  ) ?? null;

  return (
    <div className="min-h-screen bg-white">
      <ConvertToClientModal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConverted={(contactId) => {
          setShowConvertModal(false);
          router.push(`/admin/clients/${contactId}`);
        }}
        sourceType="enquiry"
        sourceId={enquiry.id}
        sourceLabel={enquiry.name}
        contactName={enquiry.name}
        contactEmail={enquiry.email}
        contactPhone={enquiry.telephone}
        supportType={enquiry.support_type}
        sourceDetails={enquiry.details}
        existingContactId={enquiry.contact_id}
        existingOrgId={enquiry.organisation_id}
      />

      <CreateOpportunityModal
        open={showCreateOppModal}
        onClose={() => setShowCreateOppModal(false)}
        onCreated={handleOpportunityCreated}
        contextLabel={`Website enquiry — ${enquiry.name}`}
        defaults={{
          title: `${enquiry.name} — ${enquiry.support_type}`.slice(0, 120),
          stage: "Identified",
          desired_outcomes: enquiry.details,
          notes: enquiry.details,
          next_action: enquiry.next_action ?? "",
          expected_decision_date: enquiry.next_action_date?.split("T")[0] ?? "",
          organisation_id: enquiry.organisation_id,
          primary_contact_id: enquiry.contact_id,
          enquiry_id: enquiry.id,
        }}
        pipelineOnly
      />

      <div className="border-b border-[#111111]/10 bg-white px-8 py-3">
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Website Enquiries
        </Link>
      </div>

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
              {tab.id === "tasks" && openTasks.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">{openTasks.length}</span>
              )}
              {tab.id === "opportunities" && opportunities.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">{opportunities.length}</span>
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
              <p className="mt-0.5 text-sm text-[#6f6b62] whitespace-pre-wrap leading-relaxed">{enquiry.details}</p>
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
              <button
                type="button"
                onClick={() => setShowConvertModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#063b32]/30 bg-[#063b32]/5 px-4 py-3 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/10"
              >
                <Briefcase className="h-4 w-4" />
                Convert to client
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeTab === "overview" && (
            <>
              <JourneyStageBanner
                currentStage={journeyStageForEnquiryStatus(enquiry.status)}
                status={enquiry.status}
                hint="Website enquiry — qualify the inbound need and respond."
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setActiveTab("tasks")} className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50">
                  <p className="text-2xl font-bold text-[#111111]">{openTasks.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Open tasks</p>
                </button>
                <button type="button" onClick={() => setActiveTab("opportunities")} className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50">
                  <p className="text-2xl font-bold text-[#111111]">{opportunities.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Opportunities</p>
                </button>
                <button type="button" onClick={() => setActiveTab("notes")} className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50">
                  <p className="text-2xl font-bold text-[#111111]">{notesCount}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Notes</p>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowCreateOppModal(true)} className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                  <Target className="h-4 w-4" /> Create opportunity
                </button>
                <button type="button" onClick={() => { setActiveTab("notes"); setShowAddNote(true); }} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                  <Plus className="h-4 w-4" /> Add note
                </button>
                <button type="button" onClick={() => { setActiveTab("tasks"); setAddingTask(true); }} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                  <Plus className="h-4 w-4" /> Add task
                </button>
              </div>

              <div className="rounded-xl border border-[#111111]/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
                  {!editingNextAction && (
                    <button type="button" onClick={() => setEditingNextAction(true)} className="text-xs text-[#063b32] hover:underline">
                      {enquiry.next_action ? "Edit" : "Add"}
                    </button>
                  )}
                </div>
                {editingNextAction ? (
                  <div className="space-y-2">
                    <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="What needs to happen next?" className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                    <input type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void saveNextAction()} disabled={savingAction} className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                        {savingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                      </button>
                      <button type="button" onClick={() => { setEditingNextAction(false); setNextAction(enquiry.next_action || ""); setNextActionDate(enquiry.next_action_date?.split("T")[0] || ""); }} className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
                    </div>
                  </div>
                ) : enquiry.next_action ? (
                  <div>
                    <p className="text-sm text-[#111111]">{enquiry.next_action}</p>
                    {enquiry.next_action_date && (
                      <p className="mt-1 text-xs text-[#6f6b62]">By {new Date(enquiry.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#6f6b62]/50">No next action set.</p>
                )}
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
                addingTask={addingTask}
                setAddingTask={setAddingTask}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                savingTask={savingTask}
                onCreateTask={createTask}
                onMarkDone={markTaskDone}
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

          {activeTab === "opportunities" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowCreateOppModal(true)} className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                  <Plus className="h-4 w-4" /> Create opportunity
                </button>
                <button type="button" onClick={() => void loadOppPicker()} disabled={oppPickerLoading} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea] disabled:opacity-50">
                  <Link2 className="h-4 w-4" /> Link existing
                </button>
              </div>

              {oppPickerOpen && (
                <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Link opportunity</p>
                    <button type="button" onClick={() => setOppPickerOpen(false)} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {oppPickerList.map((o) => (
                      <button key={o.id} type="button" onClick={() => void linkOpportunity(o.id)} disabled={linkingOpp} className="w-full rounded-lg border border-[#111111]/10 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea] disabled:opacity-40">
                        <span className="font-semibold text-[#111111]">{o.title}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[o.stage] || "bg-gray-100 text-gray-600"}`}>{o.stage}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {opportunities.length > 0 ? (
                <div className="space-y-2">
                  {opportunities.map((opp) => (
                    <OpportunityPreviewCard
                      key={opp.id}
                      opportunity={opp}
                      editable
                      onUpdated={handleOpportunityUpdated}
                      returnTo={`/admin/enquiries/${id}?tab=opportunities`}
                      returnLabel="Enquiry opportunities"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]/60 py-8 text-center">No opportunities linked yet.</p>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
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
                  <p className="text-sm text-[#111111] whitespace-pre-wrap">{enquiry.admin_notes}</p>
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]/60 py-8 text-center">No notes yet.</p>
              )}
            </div>
          )}

          {canUseEnquiryAi && activeTab === "chat" && (
            <div className="col-span-full">
              <AIChatHistory
                contextType="enquiry"
                contextId={enquiry.id}
                contextLabel={enquiry.name}
                contextSummary={buildEnquiryContextSummary(enquiry, opportunities)}
                allowModelUpgrade={false}
                onNotesSaved={refreshAfterChat}
                onActivityRecorded={() => bumpTimeline()}
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
    <Suspense fallback={<div className="p-8 text-sm text-[#6f6b62]">Loading…</div>}>
      <EnquiryDetailContent />
    </Suspense>
  );
}