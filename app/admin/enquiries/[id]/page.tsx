"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";
import { HubNotesTab } from "@/components/admin/HubNotesTab";
import { HubDetailSkeleton } from "@/components/admin/HubDetailSkeleton";
import { HubMetricCard } from "@/components/admin/HubMetricCard";
import { HubQuickActions } from "@/components/admin/HubQuickActions";
import { HubTabNav } from "@/components/admin/HubTabNav";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import { HubTasksTab } from "@/components/admin/HubTasksTab";

import { StatusSelect } from "@/components/admin/StatusSelect";
import { AppSelect } from "@/components/ui/AppSelect";
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
  assigned_team_member_id: string | null;
  is_client: boolean;
  client_note: string | null;
  posts?: { id: string; title: string; slug: string } | null;
  source: string | null;
  service_fit_summary: string | null;
  likely_need: string | null;
  complexity_level: string | null;
  engagement_basis: string | null;
};

const SUPPORT_TYPES_DETAIL = [
  "Assessment",
  "Assessment + Strategy & Implementation",
  "Assessment + Ongoing Support",
  "Access to Work",
  "General enquiry",
];

function ContactDetailsForm({ enquiry, onSave }: { enquiry: { name: string; email: string; telephone: string | null; support_type: string; details: string }; onSave: (fields: Record<string, string | null>) => Promise<void> }) {
  const [name, setName] = useState(enquiry.name);
  const [email, setEmail] = useState(enquiry.email);
  const [telephone, setTelephone] = useState(enquiry.telephone ?? "");
  const [supportType, setSupportType] = useState(enquiry.support_type);
  const [details, setDetails] = useState(enquiry.details);
  const [saving, setSaving] = useState(false);
  const dirty = name !== enquiry.name || email !== enquiry.email || telephone !== (enquiry.telephone ?? "") || supportType !== enquiry.support_type || details !== enquiry.details;
  const inputCls = "mt-0.5 w-full rounded-lg border border-[#111111]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#063b32]";
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[10px] text-[#6f6b62]">Name</p>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>
      <div>
        <p className="text-[10px] text-[#6f6b62]">Email</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </div>
      <div>
        <p className="text-[10px] text-[#6f6b62]">Telephone</p>
        <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="—" className={inputCls} />
      </div>
      <div>
        <p className="text-[10px] text-[#6f6b62]">Service interest</p>
        <AppSelect
          value={supportType}
          onChange={setSupportType}
          options={SUPPORT_TYPES_DETAIL.map((t) => ({ value: t, label: t }))}
          size="sm"
        />
      </div>
      <div>
        <p className="text-[10px] text-[#6f6b62]">Description</p>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
      </div>
      {dirty && (
        <button
          type="button"
          disabled={saving || !name.trim() || !email.trim()}
          onClick={async () => {
            setSaving(true);
            await onSave({ name: name.trim(), email: email.trim(), telephone: telephone.trim() || null, support_type: supportType, details });
            setSaving(false);
          }}
          className="rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save details"}
        </button>
      )}
    </div>
  );
}

function NextActionField({ value, onSave }: { value: string | null; onSave: (val: string | null) => Promise<void> }) {
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = draft !== (value ?? "");
  return (
    <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Next action</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder="Add a next action note…"
        className="w-full resize-none rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
      />
      <p className="text-[10px] text-[#6f6b62]">Saving will overwrite the previous next action note.</p>
      {dirty && (
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(draft.trim() || null);
            setSaving(false);
          }}
          className="rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save next action"}
        </button>
      )}
    </div>
  );
}

function AssignmentDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#111111]/15 bg-white px-3 py-2.5 text-left text-sm outline-none transition-colors hover:border-[#063b32]/40"
      >
        <span className={selected?.value ? "text-[#111111]" : "text-[#6f6b62]"}>{selected?.label || "Unassigned"}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setOpen(false); if (opt.value !== value) onChange(opt.value); }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${value === opt.value ? "bg-[#063b32]/5 font-semibold text-[#063b32]" : "text-[#111111]"}`}
            >
              <span className="flex-1">{opt.label}</span>
              {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-[#063b32]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientNote, setClientNote] = useState("");
  const [clientService, setClientService] = useState("");
  const [clientServiceOther, setClientServiceOther] = useState("");
  const [savingClient, setSavingClient] = useState(false);

  const [editingServiceFit, setEditingServiceFit] = useState(false);
  const [serviceFitForm, setServiceFitForm] = useState({ service_fit_summary: "", likely_need: "", complexity_level: "", engagement_basis: "" });
  const [savingServiceFit, setSavingServiceFit] = useState(false);
  const [serviceFitError, setServiceFitError] = useState<string | null>(null);

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
      // Always fetch tasks directly linked to this enquiry, plus any linked via
      // contact/organisation. fetchHubTasks doesn't query by enquiry_id so we
      // do that separately and merge.
      const [enquiryTasksRes, { open: hubOpen, done: hubDone }] = await Promise.all([
        fetch(`/api/admin/engagement/tasks?enquiry_id=${id}&limit=100`).then((r) => r.json() as Promise<{ data?: EngagementTask[] }>),
        fetchHubTasks({ contactId, organisationId, opportunities: opps }),
      ]);

      const openMap = new Map<string, EngagementTask>(hubOpen.map((t) => [t.id, t]));
      const doneMap = new Map<string, EngagementTask>(hubDone.map((t) => [t.id, t]));
      for (const t of enquiryTasksRes.data ?? []) {
        if (t.status === "done") doneMap.set(t.id, t);
        else openMap.set(t.id, t);
      }

      const byDue = (a: EngagementTask, b: EngagementTask) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      };

      setOpenTasks([...openMap.values()].sort(byDue));
      setDoneTasks([...doneMap.values()].sort(byDue));
    },
    [id],
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

  useEffect(() => {
    void fetch("/api/admin/engagement/team-members")
      .then((r) => r.json())
      .then((j: { data?: StudioTeamMember[] }) => { if (j.data) setTeamMembers(j.data); });
  }, []);

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
        enquiry_id: enquiry.id,
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
    setShowDone(true);
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

  const logAsClient = async () => {
    const service = clientService === "Other" ? clientServiceOther.trim() : clientService;
    if (!service || !enquiry) return;
    setSavingClient(true);
    try {
      const note = [service, clientNote.trim()].filter(Boolean).join("\n\n");
      await patchEnquiry({ is_client: true, client_note: note } as Partial<Enquiry>);
      setShowClientModal(false);
      setClientNote("");
      setClientService("");
      setClientServiceOther("");
    } finally {
      setSavingClient(false);
    }
  };

  if (loading && !enquiry) return <HubDetailSkeleton />;
  if (!enquiry) return <div className="p-8 text-sm text-[#6f6b62]">Enquiry not found.</div>;

  const postTitle = enquiry.connected_post_title || enquiry.posts?.title;
  const notesCount = countNotes(enquiry.admin_notes);
  const linkedNextActions = collectLinkedNextActions({ enquiry, opportunities });
  const latestFollowUpTask = [...openTasks]
    .filter((t) => t.task_type === "follow_up")
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0] ?? null;
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

  const memberOptions = teamMembers
    .filter((m) => m.is_active)
    .map((m) => ({ value: m.id, label: m.display_name }));

  return (
    <div className="min-h-screen bg-white">
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowClientModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                <UserCheck className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111111]">Log as new client</h3>
                <p className="text-xs text-[#6f6b62]">{enquiry.name}</p>
              </div>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6f6b62]">Service being provided *</label>
              <AppSelect
                value={clientService}
                onChange={setClientService}
                options={[
                  { value: "Assessment", label: "Assessment" },
                  { value: "Assessment + Strategy & Implementation", label: "Assessment + Strategy & Implementation" },
                  { value: "Assessment + Ongoing Support", label: "Assessment + Ongoing Support" },
                  { value: "Access to Work", label: "Access to Work" },
                  { value: "General enquiry", label: "General enquiry" },
                  { value: "Other", label: "Other (specify below)" },
                ]}
                placeholder="Select a service…"
                size="sm"
              />
            </div>
            {clientService === "Other" && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6f6b62]">Specify service</label>
                <input
                  type="text"
                  value={clientServiceOther}
                  onChange={(e) => setClientServiceOther(e.target.value)}
                  placeholder="Enter service name…"
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6f6b62]">Additional notes</label>
              <textarea
                value={clientNote}
                onChange={(e) => setClientNote(e.target.value)}
                rows={3}
                placeholder="Any additional notes…"
                className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowClientModal(false); setClientService(""); setClientServiceOther(""); setClientNote(""); }}
                className="flex-1 rounded-xl border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                Cancel
              </button>
              <button type="button" onClick={() => void logAsClient()} disabled={savingClient || !clientService || (clientService === "Other" && !clientServiceOther.trim())}
                className="flex-1 rounded-xl bg-purple-700 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50">
                {savingClient ? "Saving…" : "Log as client"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact details</p>
              {enquiry.source && (
                <span className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] font-medium text-[#6f6b62]">{enquiry.source}</span>
              )}
            </div>
            {enquiry.source === "Website enquiry" ? (
              <>
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
                <div className="border-t border-[#111111]/8 pt-3 space-y-3">
                  <div>
                    <p className="text-[10px] text-[#6f6b62]">Service interest</p>
                    <p className="text-sm text-[#111111]">{enquiry.support_type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6f6b62]">Description</p>
                    <CollapsibleNote content={enquiry.details} textClassName="text-sm text-[#6f6b62] leading-relaxed" />
                  </div>
                </div>
              </>
            ) : (
              <ContactDetailsForm enquiry={enquiry} onSave={async (fields) => { await patchEnquiry(fields as Partial<Enquiry>); }} />
            )}
            <div>
              <p className="text-[10px] text-[#6f6b62]">Received</p>
              <div className="flex items-center gap-2">
                <p className="flex items-center gap-1.5 text-sm text-[#111111]">
                  <Calendar className="h-3.5 w-3.5 text-[#6f6b62]" />
                  {new Date(enquiry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                {enquiry.source && (
                  <span className="rounded-full border border-[#111111]/10 px-2 py-0.5 text-[10px] font-medium text-[#6f6b62]">{enquiry.source}</span>
                )}
              </div>
            </div>
            <div className="border-t border-[#111111]/8 pt-3 space-y-3">
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

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Assignment</p>
            <AssignmentDropdown
              value={enquiry.assigned_team_member_id || ""}
              options={[{ value: "", label: "Unassigned" }, ...memberOptions]}
              onChange={(assignedId) => {
                void patchEnquiry({ assigned_team_member_id: assignedId || null } as Partial<Enquiry>);
              }}
            />
            <p className="text-[10px] text-[#6f6b62] mt-1">Engagement status</p>
            <StatusSelect value={enquiry.status} onChange={(status) => void updateStatus(status)} loading={updatingStatus} />
            {statusError && (
              <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{statusError}</p>
            )}
          </div>

          <NextActionField
            value={enquiry.next_action ?? null}
            onSave={async (val) => {
              await patchEnquiry({ next_action: val } as Partial<Enquiry>);
            }}
          />

          <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
            {enquiry.is_client ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">Now a client</span>
                </div>
                {enquiry.client_note && (
                  <p className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-sm text-[#111111]">{enquiry.client_note}</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Client</p>
                <button
                  type="button"
                  onClick={() => setShowClientModal(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
                >
                  <UserCheck className="h-4 w-4" /> Log as new client
                </button>
              </>
            )}
          </div>

        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
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

              {/* Service fit section */}
              <div className="rounded-xl border border-[#111111]/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Service fit</p>
                  {!editingServiceFit && (
                    <button
                      type="button"
                      onClick={() => {
                        setServiceFitForm({
                          service_fit_summary: enquiry.service_fit_summary ?? "",
                          likely_need: enquiry.likely_need ?? "",
                          complexity_level: enquiry.complexity_level ?? "",
                          engagement_basis: enquiry.engagement_basis ?? "",
                        });
                        setEditingServiceFit(true);
                      }}
                      className="text-[10px] font-semibold text-[#063b32] hover:underline"
                    >
                      {enquiry.service_fit_summary || enquiry.likely_need ? "Edit" : "+ Add"}
                    </button>
                  )}
                </div>

                {editingServiceFit ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Service fit summary</label>
                      <textarea
                        value={serviceFitForm.service_fit_summary}
                        onChange={(e) => setServiceFitForm((f) => ({ ...f, service_fit_summary: e.target.value }))}
                        rows={3}
                        className="w-full resize-y rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Likely need</label>
                      <textarea
                        value={serviceFitForm.likely_need}
                        onChange={(e) => setServiceFitForm((f) => ({ ...f, likely_need: e.target.value }))}
                        rows={3}
                        className="w-full resize-y rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Complexity level</label>
                        <input
                          value={serviceFitForm.complexity_level}
                          onChange={(e) => setServiceFitForm((f) => ({ ...f, complexity_level: e.target.value }))}
                          placeholder="e.g. Moderate"
                          className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Engagement basis</label>
                        <input
                          value={serviceFitForm.engagement_basis}
                          onChange={(e) => setServiceFitForm((f) => ({ ...f, engagement_basis: e.target.value }))}
                          placeholder="e.g. project, retainer"
                          className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                        />
                      </div>
                    </div>
                    {serviceFitError && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{serviceFitError}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={savingServiceFit}
                        onClick={async () => {
                          setSavingServiceFit(true);
                          setServiceFitError(null);
                          try {
                            await patchEnquiry({
                              service_fit_summary: serviceFitForm.service_fit_summary.trim() || null,
                              likely_need: serviceFitForm.likely_need.trim() || null,
                              complexity_level: serviceFitForm.complexity_level.trim() || null,
                              engagement_basis: serviceFitForm.engagement_basis.trim() || null,
                            } as Partial<Enquiry>);
                            setEditingServiceFit(false);
                          } catch (e) {
                            setServiceFitError(e instanceof Error ? e.message : "Save failed");
                          } finally {
                            setSavingServiceFit(false);
                          }
                        }}
                        className="rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                      >
                        {savingServiceFit ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingServiceFit(false); setServiceFitError(null); }}
                        className="rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : enquiry.service_fit_summary || enquiry.likely_need || enquiry.complexity_level || enquiry.engagement_basis ? (
                  <div className="overflow-hidden rounded-lg border border-[#063b32]/12">
                    {/* Complexity + engagement pill bar */}
                    {(enquiry.complexity_level || enquiry.engagement_basis) && (
                      <div className="flex flex-wrap gap-2 border-b border-[#063b32]/10 bg-[#063b32]/5 px-3 py-2.5">
                        {enquiry.complexity_level && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#063b32]/15 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#063b32]">
                            <span className="text-[#6f6b62] font-medium">Complexity</span>
                            <span className="h-2.5 w-px bg-[#063b32]/20" />
                            {enquiry.complexity_level}
                          </span>
                        )}
                        {enquiry.engagement_basis && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#063b32]/15 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#063b32] capitalize">
                            <span className="text-[#6f6b62] font-medium">Basis</span>
                            <span className="h-2.5 w-px bg-[#063b32]/20" />
                            {enquiry.engagement_basis.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Service fit summary */}
                    {enquiry.service_fit_summary && (
                      <div className={`px-4 py-3${enquiry.likely_need ? " border-b border-[#063b32]/8" : ""}`}>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Service fit summary</p>
                        <p className="text-sm leading-relaxed text-[#111111]">{enquiry.service_fit_summary}</p>
                      </div>
                    )}
                    {/* Likely need */}
                    {enquiry.likely_need && (
                      <div className="px-4 py-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Likely need</p>
                        <p className="text-sm leading-relaxed text-[#111111]">{enquiry.likely_need}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#6f6b62]">No service fit assessment yet.</p>
                )}
              </div>
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
                onShowAddNote={() => setShowAddNote(true)}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                saving={savingNote}
                onSave={saveNote}
                onReplaceNotes={replaceNotes}
                placeholder="What happened? What was discussed?"
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