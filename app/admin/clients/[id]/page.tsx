"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { ClientStatusSelect } from "@/components/admin/ClientStatusSelect";
import { CreateOpportunityModal } from "@/components/admin/CreateOpportunityModal";
import { InteractionList } from "@/components/admin/InteractionList";
import { OpportunityPreviewCard } from "@/components/admin/OpportunityPreviewCard";
import { PrepKnowledgeSummary } from "@/components/admin/PrepKnowledgeSummary";
import { isClientServiceStage } from "@/lib/engagement/client-stages";
import type { ProspectPrepClient } from "@/lib/engagement/prospect-prep";
import type {
  EngagementContact,
  EngagementInteraction,
  EngagementOpportunity,
  EngagementTask,
  Persona,
  ProspectQueueEntry,
  SectorProfile,
} from "@/lib/engagement/types";
import { STAGE_COLORS } from "@/lib/engagement/types";

type ClientTab =
  | "overview"
  | "submission"
  | "preps"
  | "opportunities"
  | "tasks"
  | "calls"
  | "notes"
  | "activity";

const CLIENT_TABS: Array<{ id: ClientTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "submission", label: "Original submission" },
  { id: "preps", label: "Preps" },
  { id: "opportunities", label: "Opportunities" },
  { id: "tasks", label: "Tasks" },
  { id: "calls", label: "Calls" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
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

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

const STATUS_BADGE: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
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
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [doneTasks, setDoneTasks] = useState<EngagementTask[]>([]);
  const [linkedEnquiry, setLinkedEnquiry] = useState<EnquiryArchive | null>(null);
  const [linkedQueue, setLinkedQueue] = useState<ProspectQueueEntry | null>(null);
  const [linkedPreps, setLinkedPreps] = useState<ProspectPrepClient[]>([]);
  const [expandedPrepCards, setExpandedPrepCards] = useState<Record<string, boolean>>({});
  const [expandedActivityOppId, setExpandedActivityOppId] = useState<string | null>(null);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [showCreateOppModal, setShowCreateOppModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ClientTab>("overview");

  // Task creation
  const [addingTask, setAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium", due_date: "", task_type: "follow_up", notes: "" });
  const [savingTask, setSavingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // Notes
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cRes, iRes, oRes, eRes, tRes, tdRes] = await Promise.all([
      fetch(`/api/admin/engagement/contacts/${id}`),
      fetch(`/api/admin/engagement/interactions?contact_id=${id}&limit=50`),
      fetch(`/api/admin/engagement/opportunities?contact_id=${id}&limit=30`),
      fetch(`/api/admin/enquiries?contact_id=${id}&include_closed=true`),
      fetch(`/api/admin/engagement/tasks?contact_id=${id}&limit=100`),
      fetch(`/api/admin/engagement/tasks?contact_id=${id}&status=done&limit=50`),
    ]);
    const [cData, iData, oData, eData, tData, tdData] = await Promise.all([
      cRes.json() as Promise<{ data: EngagementContact }>,
      iRes.json() as Promise<{ data: EngagementInteraction[] }>,
      oRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      eRes.json() as Promise<{ data: EnquiryArchive[] }>,
      tRes.json() as Promise<{ data: EngagementTask[] }>,
      tdRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setContact(cData.data);
    setInteractions(iData.data || []);
    setOpportunities(oData.data || []);
    const opps = oData.data || [];

    let enquiry: EnquiryArchive | null = eData.data?.[0] || null;
    if (enquiry?.id) {
      const eDetailRes = await fetch(`/api/admin/enquiries/${enquiry.id}`);
      if (eDetailRes.ok) {
        const eDetail = await eDetailRes.json() as { data?: EnquiryArchive };
        if (eDetail.data) enquiry = eDetail.data;
      }
    }
    setLinkedEnquiry(enquiry);

    const queueId = opps.find((o) => o.queue_id)?.queue_id ?? null;
    if (queueId) {
      const qRes = await fetch(`/api/admin/engagement/prospect-queue/${queueId}`);
      const qData = await qRes.json() as { data?: ProspectQueueEntry };
      setLinkedQueue(qData.data || null);
    } else {
      setLinkedQueue(null);
    }

    const prepQueries = [
      fetch(`/api/admin/engagement/prospect-preps?contact_id=${id}&limit=30`),
    ];
    if (enquiry?.id) prepQueries.push(fetch(`/api/admin/engagement/prospect-preps?enquiry_id=${enquiry.id}&limit=30`));
    if (queueId) prepQueries.push(fetch(`/api/admin/engagement/prospect-preps?queue_id=${queueId}&limit=30`));
    const prepResults = await Promise.all(prepQueries.map((q) => q.then((r) => r.json())));
    const prepMap = new Map<string, ProspectPrepClient>();
    for (const j of prepResults as Array<{ data?: ProspectPrepClient[] }>) {
      for (const p of j.data || []) prepMap.set(p.id, p);
    }
    setLinkedPreps([...prepMap.values()]);

    setTasks(tData.data || []);
    setDoneTasks(tdData.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.has(tab)) {
      setActiveTab(tab as ClientTab);
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
      }),
    });
    if (res.ok) {
      setTaskForm({ title: "", priority: "medium", due_date: "", task_type: "follow_up", notes: "" });
      setAddingTask(false);
      void loadData();
    }
    setSavingTask(false);
  };

  const markTaskDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    void loadData();
  };

  const saveNote = async () => {
    if (!noteText.trim() || !contact) return;
    setSavingNote(true);
    const combined = contact.notes
      ? `${contact.notes}\n\n[${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}] ${noteText.trim()}`
      : `[${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}] ${noteText.trim()}`;
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

  const updatePrimaryStage = async (stage: string) => {
    const clientOpp = opportunities.find((o) => isClientServiceStage(o.stage));
    if (!clientOpp) return;
    setUpdatingStage(true);
    const res = await fetch(`/api/admin/engagement/opportunities/${clientOpp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (res.ok) {
      const j = await res.json() as { data: EngagementOpportunity };
      setOpportunities((prev) => prev.map((o) => (o.id === j.data.id ? j.data : o)));
    }
    setUpdatingStage(false);
  };

  const handleOpportunityUpdated = (updated: EngagementOpportunity) => {
    setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const sourceOpp = opportunities.find((o) => o.enquiry_id || o.queue_id);

  const openCreateOpportunity = () => {
    if (!sourceOpp?.enquiry_id && !sourceOpp?.queue_id) {
      const go = window.confirm(
        "New opportunities must be linked to a website enquiry or prospect queue item.\n\nCreate one of those first, then add the opportunity from that page.\n\nOpen the new opportunity linker now?",
      );
      if (go) window.location.href = "/admin/engagement/pipeline/opportunities/new";
      return;
    }
    setShowCreateOppModal(true);
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!contact) return <div className="p-8 text-sm text-[#6f6b62]">Client not found.</div>;

  const fullName = `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`;
  const initials = `${contact.first_name[0] ?? ""}${contact.last_name?.[0] ?? ""}`.toUpperCase();

  const clientOpps = opportunities.filter((o) => isClientServiceStage(o.stage));
  const primaryOpp = clientOpps[0] ?? null;
  const openTasks = tasks.filter((t) => t.status !== "done");
  const createOppDefaults = contact && sourceOpp ? {
    title: `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""} — New opportunity`.slice(0, 120),
    stage: "Identified",
    primary_contact_id: id,
    organisation_id: contact.organisation_id ?? null,
    enquiry_id: sourceOpp.enquiry_id ?? null,
    queue_id: sourceOpp.queue_id ?? null,
  } : undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-3">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Clients
        </Link>
      </div>

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
              {tab.id === "tasks" && openTasks.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                  {openTasks.length}
                </span>
              )}
              {tab.id === "calls" && interactions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px]">
                  {interactions.length}
                </span>
              )}
              {tab.id === "preps" && linkedPreps.length > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-700">
                  {linkedPreps.length}
                </span>
              )}
              {tab.id === "opportunities" && opportunities.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                  {opportunities.length}
                </span>
              )}
              {tab.id === "submission" && (linkedEnquiry || linkedQueue) && (
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
          {/* Identity card */}
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
              <div>
                <p className="text-[10px] text-[#6f6b62]">Email</p>
                <a
                  href={`mailto:${contact.professional_email}`}
                  className="flex items-center gap-1 text-sm text-[#063b32] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" /> {contact.professional_email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Phone</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1 text-sm text-[#063b32] hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              </div>
            )}
            {contact.preferred_channel && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Preferred channel</p>
                <p className="text-sm text-[#111111]">{contact.preferred_channel}</p>
              </div>
            )}
            {contact.organisation && (
              <div>
                <p className="text-[10px] text-[#6f6b62]">Organisation</p>
                <p className="flex items-center gap-1 text-sm text-[#111111]">
                  <Building2 className="h-3.5 w-3.5 text-[#063b32]" />
                  {(contact.organisation as { id: string; name: string }).name}
                </p>
              </div>
            )}
          </div>

          {/* Client status */}
          {primaryOpp && (
            <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">
                Client status
              </p>
              <ClientStatusSelect
                value={primaryOpp.stage}
                onChange={(stage) => void updatePrimaryStage(stage)}
                disabled={updatingStage}
              />
              <p className="text-sm font-semibold text-[#111111]">{primaryOpp.title}</p>
            </div>
          )}

          {(linkedEnquiry || linkedQueue) && (
            <button
              type="button"
              onClick={() => setActiveTab("submission")}
              className="w-full rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50 transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Original submission</p>
              <p className="mt-1 text-sm font-semibold text-[#111111]">
                {linkedEnquiry ? "Website enquiry" : "Prospect queue"}
              </p>
              <p className="text-xs text-[#063b32] mt-0.5">View full submission →</p>
            </button>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab("tasks"); setAddingTask(true); }}
                  className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
                >
                  <Plus className="h-4 w-4" /> Add task
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("notes"); setShowAddNote(true); }}
                  className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
                >
                  <Plus className="h-4 w-4" /> Add note
                </button>
                <button
                  type="button"
                  onClick={openCreateOpportunity}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                >
                  <Target className="h-4 w-4" />
                  Create opportunity
                </button>
              </div>

              {primaryOpp?.next_action && (
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-800">
                    Follow-up / next action
                  </p>
                  <p className="mt-1 text-sm text-[#111111]">{primaryOpp.next_action}</p>
                  {primaryOpp.expected_decision_date && (
                    <p className="mt-1 text-xs text-[#6f6b62]">
                      By {new Date(primaryOpp.expected_decision_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              )}

              {primaryOpp && (
                <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">
                    Service record
                  </p>
                  <div>
                    <p className="text-base font-semibold text-[#111111]">{primaryOpp.title}</p>
                    {formatValue(primaryOpp.indicative_value_low, primaryOpp.indicative_value_high) && (
                      <p className="mt-1 text-sm font-semibold text-[#063b32]">
                        {formatValue(primaryOpp.indicative_value_low, primaryOpp.indicative_value_high)}
                      </p>
                    )}
                  </div>
                  {primaryOpp.desired_outcomes && (
                    <div>
                      <p className="text-[10px] text-[#6f6b62]">Desired outcomes</p>
                      <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{primaryOpp.desired_outcomes}</p>
                    </div>
                  )}
                  {primaryOpp.recommended_pathway && (
                    <div>
                      <p className="text-[10px] text-[#6f6b62]">Agreed pathway</p>
                      <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{primaryOpp.recommended_pathway}</p>
                    </div>
                  )}
                  {primaryOpp.notes && (
                    <div>
                      <p className="text-[10px] text-[#6f6b62]">Service notes</p>
                      <p className="text-sm text-[#6f6b62] whitespace-pre-wrap leading-relaxed">{primaryOpp.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid gap-3 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#111111]">{openTasks.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Open tasks</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("calls")}
                  className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#111111]">{interactions.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Call records</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("opportunities")}
                  className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#111111]">{opportunities.length}</p>
                  <p className="text-xs font-semibold text-[#6f6b62]">Opportunities</p>
                </button>
                {(linkedEnquiry || linkedQueue) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("submission")}
                    className="rounded-xl border border-[#111111]/10 p-4 text-left hover:bg-[#f7f4ea]/50 transition-colors"
                  >
                    <p className="text-2xl font-bold text-[#111111]">1</p>
                    <p className="text-xs font-semibold text-[#6f6b62]">Original submission</p>
                  </button>
                )}
              </div>

              {/* Recent tasks preview */}
              {openTasks.length > 0 && (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                      Open tasks
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tasks")}
                      className="text-xs text-[#063b32] hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {openTasks.slice(0, 4).map((t) => (
                      <div key={t.id} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void markTaskDone(t.id)}
                          className="grid h-4 w-4 shrink-0 place-items-center rounded border border-[#111111]/25 bg-white hover:border-[#063b32]"
                          title="Mark done"
                        />
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority] ?? "bg-gray-300"}`}
                        />
                        <span className="flex-1 text-sm text-[#111111]">{t.title}</span>
                        {t.due_date && (
                          <span className="shrink-0 flex items-center gap-1 text-xs text-[#6f6b62]">
                            <Calendar className="h-3 w-3" />
                            {new Date(t.due_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent calls preview */}
              {interactions.length > 0 && (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                      Recent calls
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("calls")}
                      className="text-xs text-[#063b32] hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <InteractionList interactions={interactions.slice(0, 3)} />
                </div>
              )}
            </>
          )}

          {/* ORIGINAL SUBMISSION TAB */}
          {activeTab === "submission" && (
            <>
              {!linkedEnquiry && !linkedQueue ? (
                <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
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
                            <p className="text-sm text-[#6f6b62] whitespace-pre-wrap leading-relaxed">{linkedEnquiry.details}</p>
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
                      {(linkedEnquiry.sector_snapshot || linkedEnquiry.persona_snapshot) && (
                        <div className="rounded-xl border border-[#111111]/10 p-5">
                          <PrepKnowledgeSummary
                            sector={linkedEnquiry.sector_snapshot}
                            persona={linkedEnquiry.persona_snapshot}
                            relevantPains={[]}
                          />
                        </div>
                      )}
                      {linkedEnquiry.admin_notes && (
                        <div className="rounded-xl border border-[#111111]/10 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62] mb-2">Admin notes from enquiry</p>
                          <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{linkedEnquiry.admin_notes}</p>
                        </div>
                      )}
                    </>
                  )}
                  {linkedQueue && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <Inbox className="h-4 w-4 text-amber-700" />
                        <span className="text-sm font-semibold text-[#111111]">Prospect queue</span>
                        <span className="ml-auto text-xs text-[#6f6b62]">Archived on conversion</span>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Organisation</p>
                          <p className="text-sm font-semibold text-[#111111]">
                            {linkedQueue.organisation?.name || linkedQueue.raw_org_name || "—"}
                          </p>
                          {linkedQueue.raw_industry && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Industry</p>
                              <p className="text-sm text-[#111111]">{linkedQueue.raw_industry}</p>
                            </div>
                          )}
                          {linkedQueue.raw_location && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Location</p>
                              <p className="text-sm text-[#111111]">{linkedQueue.raw_location}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] text-[#6f6b62]">Added to queue</p>
                            <p className="text-sm text-[#111111]">
                              {new Date(linkedQueue.created_at).toLocaleString("en-GB")}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact at submission</p>
                          {linkedQueue.raw_contact_name && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Name</p>
                              <p className="text-sm font-semibold text-[#111111]">{linkedQueue.raw_contact_name}</p>
                            </div>
                          )}
                          {linkedQueue.raw_email && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Email</p>
                              <p className="text-sm text-[#111111]">{linkedQueue.raw_email}</p>
                            </div>
                          )}
                          {linkedQueue.raw_phone && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Phone</p>
                              <p className="text-sm text-[#111111]">{linkedQueue.raw_phone}</p>
                            </div>
                          )}
                          {linkedQueue.raw_notes && (
                            <div>
                              <p className="text-[10px] text-[#6f6b62]">Notes</p>
                              <p className="text-sm text-[#6f6b62] whitespace-pre-wrap leading-relaxed">{linkedQueue.raw_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
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

          {/* PREPS TAB */}
          {activeTab === "preps" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Prospect preps from before conversion
              </p>
              {linkedPreps.length > 0 ? (
                <div className="space-y-2">
                  {linkedPreps.map((prep) => {
                    const expanded = !!expandedPrepCards[prep.id];
                    return (
                      <div key={prep.id} className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedPrepCards((prev) => ({ ...prev, [prep.id]: !prev[prep.id] }))}
                          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f7f4ea]/50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#111111]">{prep.name}</p>
                            {prep.sourceLabel && <p className="text-[10px] text-[#6f6b62]">{prep.sourceLabel}</p>}
                          </div>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        {expanded && (
                          <div className="border-t border-[#111111]/10 bg-[#f7f4ea]/30 px-4 py-3 space-y-2">
                            <PrepKnowledgeSummary
                              sector={prep.sector}
                              persona={prep.persona}
                              relevantPains={prep.relevantPains}
                              compact
                            />
                            {prep.prepNotes && <p className="text-sm text-[#6f6b62] whitespace-pre-wrap">{prep.prepNotes}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-[#6f6b62]/30" />
                  <p className="text-sm text-[#6f6b62]">No prospect preps linked to this client.</p>
                </div>
              )}
            </>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Activity timeline</p>
              <div className="space-y-3">
                {linkedEnquiry && (
                  <div className="flex gap-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/40 px-4 py-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#063b32]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Website enquiry received</p>
                      <p className="text-xs text-[#6f6b62]">{new Date(linkedEnquiry.created_at).toLocaleString("en-GB")}</p>
                      <p className="mt-1 text-sm text-[#6f6b62]">{linkedEnquiry.support_type} — {linkedEnquiry.details.slice(0, 120)}{linkedEnquiry.details.length > 120 ? "…" : ""}</p>
                    </div>
                  </div>
                )}
                {linkedQueue && !linkedEnquiry && (
                  <div className="flex gap-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/40 px-4 py-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#063b32]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Added to prospect queue</p>
                      <p className="text-xs text-[#6f6b62]">{new Date(linkedQueue.created_at).toLocaleString("en-GB")}</p>
                    </div>
                  </div>
                )}
                {(linkedEnquiry?.last_action?.includes("Converted") || linkedQueue?.last_action?.includes("Converted")) && (
                  <div className="flex gap-3 rounded-lg border border-[#063b32]/20 bg-[#063b32]/5 px-4 py-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#063b32]" />
                    <div>
                      <p className="text-sm font-semibold text-[#063b32]">Converted to client</p>
                      <p className="text-xs text-[#6f6b62]">
                        {new Date(linkedEnquiry?.last_action_date || linkedQueue?.last_action_date || primaryOpp?.created_at || "").toLocaleString("en-GB")}
                      </p>
                    </div>
                  </div>
                )}
                {interactions.map((i) => (
                  <div key={i.id} className="flex gap-3 rounded-lg border border-[#111111]/10 px-4 py-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111111] capitalize">Call — {i.interaction_type}</p>
                      <p className="text-xs text-[#6f6b62]">{new Date(i.interaction_date).toLocaleString("en-GB")}</p>
                      {i.summary && <p className="mt-1 text-sm text-[#6f6b62] line-clamp-2">{i.summary}</p>}
                    </div>
                  </div>
                ))}
                {linkedPreps.map((prep) => (
                  <div key={prep.id} className="flex gap-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/40 px-4 py-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Prospect prep linked</p>
                      <p className="text-sm text-[#111111]">{prep.name}</p>
                    </div>
                  </div>
                ))}
                {opportunities.map((opp) => (
                  <div key={opp.id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setExpandedActivityOppId((cur) => (cur === opp.id ? null : opp.id))}
                      className="flex w-full gap-3 rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-3 text-left hover:bg-amber-50"
                    >
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#111111]">Opportunity</p>
                        <p className="text-sm text-[#111111]">{opp.title}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] ?? "bg-gray-100 text-gray-600"}`}>{opp.stage}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${expandedActivityOppId === opp.id ? "rotate-180" : ""}`} />
                    </button>
                    {expandedActivityOppId === opp.id && (
                      <OpportunityPreviewCard opportunity={opp} defaultExpanded hidePipelineLink editable clientContext onUpdated={handleOpportunityUpdated} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                  Tasks for {contact.first_name}
                </p>
                <button
                  type="button"
                  onClick={() => setAddingTask((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                >
                  <Plus className="h-3.5 w-3.5" /> New task
                </button>
              </div>

              {addingTask && (
                <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-3">
                  <input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Task title…"
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                      className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    >
                      <option value="high">High priority</option>
                      <option value="medium">Medium priority</option>
                      <option value="low">Low priority</option>
                    </select>
                    <select
                      value={taskForm.task_type}
                      onChange={(e) => setTaskForm((f) => ({ ...f, task_type: e.target.value }))}
                      className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    >
                      <option value="follow_up">Follow-up</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="admin">Admin</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm((f) => ({ ...f, due_date: e.target.value }))}
                      className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    />
                  </div>
                  <textarea
                    value={taskForm.notes}
                    onChange={(e) => setTaskForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Notes (optional)…"
                    rows={2}
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void createTask()}
                      disabled={savingTask || !taskForm.title.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                    >
                      {savingTask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save task
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingTask(false)}
                      className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {openTasks.length === 0 && !addingTask ? (
                <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
                  <Check className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                  <p className="text-sm text-[#6f6b62]">No open tasks. All caught up!</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {openTasks.map((t) => {
                    const isOverdue =
                      t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 rounded-xl border border-[#111111]/10 bg-white px-4 py-3"
                      >
                        <button
                          type="button"
                          onClick={() => void markTaskDone(t.id)}
                          className="grid h-4 w-4 shrink-0 place-items-center rounded border border-[#111111]/25 bg-white hover:border-[#063b32] hover:bg-[#063b32]/5"
                          title="Mark done"
                        />
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority] ?? "bg-gray-300"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111111]">{t.title}</p>
                          {t.notes && (
                            <p className="text-xs text-[#6f6b62] truncate">{t.notes}</p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_BADGE[t.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                        {t.due_date && (
                          <span
                            className={`shrink-0 flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-[#6f6b62]"}`}
                          >
                            <Calendar className="h-3 w-3" />
                            {new Date(t.due_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Done tasks toggle */}
              {doneTasks.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDone((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#6f6b62] hover:text-[#111111]"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${showDone ? "rotate-180" : ""}`}
                    />
                    {showDone ? "Hide" : "Show"} {doneTasks.length} completed task
                    {doneTasks.length === 1 ? "" : "s"}
                  </button>
                  {showDone && (
                    <div className="mt-2 space-y-1.5">
                      {doneTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 rounded-xl border border-[#111111]/8 bg-[#f7f4ea]/50 px-4 py-3"
                        >
                          <div className="grid h-4 w-4 shrink-0 place-items-center rounded border border-emerald-300 bg-emerald-50">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="flex-1 text-sm text-[#6f6b62] line-through">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CALLS TAB */}
          {activeTab === "calls" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Call & interaction history
              </p>
              <InteractionList
                interactions={interactions}
                emptyMessage="No call records yet for this client."
              />
            </>
          )}

          {/* OPPORTUNITIES TAB */}
          {activeTab === "opportunities" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                  Service &amp; opportunity records
                </p>
                <button
                  type="button"
                  onClick={openCreateOpportunity}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                >
                  <Target className="h-3.5 w-3.5" />
                  Create opportunity
                </button>
              </div>

              {opportunities.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
                  <Target className="mx-auto mb-2 h-8 w-8 text-[#6f6b62]/30" />
                  <p className="text-sm text-[#6f6b62]">No opportunities yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {opportunities.map((opp) => (
                    <OpportunityPreviewCard key={opp.id} opportunity={opp} hidePipelineLink editable clientContext onUpdated={handleOpportunityUpdated} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                  Client notes
                </p>
                {!showAddNote && (
                  <button
                    type="button"
                    onClick={() => setShowAddNote(true)}
                    className="flex items-center gap-1.5 text-xs text-[#063b32] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add note
                  </button>
                )}
              </div>

              {showAddNote && (
                <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-4 space-y-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note about this client…"
                    rows={4}
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void saveNote()}
                      disabled={savingNote || !noteText.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                    >
                      {savingNote ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save note
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddNote(false); setNoteText(""); }}
                      className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {contact.notes ? (
                <div className="rounded-xl border border-[#111111]/10 p-5">
                  <p className="whitespace-pre-wrap text-sm text-[#111111] leading-relaxed">
                    {contact.notes}
                  </p>
                </div>
              ) : (
                !showAddNote && (
                  <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
                    <p className="text-sm text-[#6f6b62]">No notes yet. Add one above.</p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      <CreateOpportunityModal
        open={showCreateOppModal}
        onClose={() => setShowCreateOppModal(false)}
        onCreated={() => {
          setShowCreateOppModal(false);
          void loadData();
        }}
        defaults={createOppDefaults}
        contextLabel={fullName}
        pipelineOnly
      />
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#6f6b62]">Loading…</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}
