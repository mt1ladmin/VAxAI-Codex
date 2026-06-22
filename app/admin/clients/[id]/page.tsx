"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Target,
  X,
} from "lucide-react";
import { InteractionList } from "@/components/admin/InteractionList";
import type { EngagementContact, EngagementInteraction, EngagementOpportunity, EngagementTask } from "@/lib/engagement/types";
import { STAGE_COLORS } from "@/lib/engagement/types";

type ClientTab = "overview" | "tasks" | "calls" | "opportunities" | "notes";

const CLIENT_TABS: Array<{ id: ClientTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "calls", label: "Calls" },
  { id: "opportunities", label: "Opportunities" },
  { id: "notes", label: "Notes" },
];

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

function gmailUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<EngagementContact | null>(null);
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [opportunities, setOpportunities] = useState<EngagementOpportunity[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [doneTasks, setDoneTasks] = useState<EngagementTask[]>([]);
  const [linkedEnquiry, setLinkedEnquiry] = useState<{ id: string; name: string; support_type: string } | null>(null);
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

  // Opportunity creation
  const [creatingOpp, setCreatingOpp] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cRes, iRes, oRes, eRes, tRes, tdRes] = await Promise.all([
      fetch(`/api/admin/engagement/contacts/${id}`),
      fetch(`/api/admin/engagement/interactions?contact_id=${id}&limit=50`),
      fetch(`/api/admin/engagement/opportunities?contact_id=${id}&limit=30`),
      fetch(`/api/admin/enquiries?contact_id=${id}`),
      fetch(`/api/admin/engagement/tasks?contact_id=${id}&limit=100`),
      fetch(`/api/admin/engagement/tasks?contact_id=${id}&status=done&limit=50`),
    ]);
    const [cData, iData, oData, eData, tData, tdData] = await Promise.all([
      cRes.json() as Promise<{ data: EngagementContact }>,
      iRes.json() as Promise<{ data: EngagementInteraction[] }>,
      oRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      eRes.json() as Promise<{ data: Array<{ id: string; name: string; support_type: string }> }>,
      tRes.json() as Promise<{ data: EngagementTask[] }>,
      tdRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setContact(cData.data);
    setInteractions(iData.data || []);
    setOpportunities(oData.data || []);
    setLinkedEnquiry(eData.data?.[0] || null);
    setTasks(tData.data || []);
    setDoneTasks(tdData.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  const createOpportunity = async () => {
    if (!contact) return;
    setCreatingOpp(true);
    const res = await fetch("/api/admin/engagement/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""} — New opportunity`,
        primary_contact_id: id,
        organisation_id: contact.organisation_id ?? null,
        stage: "Won",
      }),
    });
    if (res.ok) {
      const j = await res.json() as { data: EngagementOpportunity };
      setOpportunities((prev) => [j.data, ...prev]);
      setActiveTab("opportunities");
    }
    setCreatingOpp(false);
  };

  if (loading) return <div className="p-8 text-sm text-[#6f6b62]">Loading…</div>;
  if (!contact) return <div className="p-8 text-sm text-[#6f6b62]">Client not found.</div>;

  const fullName = `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`;
  const initials = `${contact.first_name[0] ?? ""}${contact.last_name?.[0] ?? ""}`.toUpperCase();

  const clientOpps = opportunities.filter((o) =>
    ["Won", "Onboarding", "Active client"].includes(o.stage)
  );
  const primaryOpp = clientOpps[0] ?? null;
  const openTasks = tasks.filter((t) => t.status !== "done");

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
              {tab.id === "opportunities" && opportunities.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                  {opportunities.length}
                </span>
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

          {/* Primary service card */}
          {primaryOpp && (
            <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">
                  Current service
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[primaryOpp.stage] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {primaryOpp.stage}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">{primaryOpp.title}</p>
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
              <Link
                href={`/admin/engagement/pipeline/opportunities/${primaryOpp.id}`}
                className="text-xs text-[#063b32] hover:underline"
              >
                Open full record →
              </Link>
            </div>
          )}

          {/* Linked enquiry */}
          {linkedEnquiry && (
            <div className="rounded-xl border border-[#111111]/10 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Original enquiry
              </p>
              <Link
                href={`/admin/enquiries/${linkedEnquiry.id}`}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 hover:bg-blue-100 text-sm font-semibold text-[#111111]"
              >
                {linkedEnquiry.name}
                <span className="ml-auto text-xs text-[#6f6b62]">{linkedEnquiry.support_type}</span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                {contact.professional_email && (
                  <a
                    href={gmailUrl(contact.professional_email)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]"
                  >
                    <Mail className="h-4 w-4" /> Send email
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                  >
                    <Phone className="h-4 w-4" /> Call
                  </a>
                )}
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
                  onClick={() => void createOpportunity()}
                  disabled={creatingOpp}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                  {creatingOpp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4" />
                  )}
                  New opportunity
                </button>
              </div>

              {/* Stats */}
              <div className="grid gap-3 sm:grid-cols-3">
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
                  <p className="text-xs font-semibold text-[#6f6b62]">Service records</p>
                </button>
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
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                  Call & interaction history
                </p>
                {contact.phone && (
                  <a
                    href={`/admin/engagement/live-call?contact=${id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                  >
                    <Phone className="h-3.5 w-3.5" /> Start call
                  </a>
                )}
              </div>
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
                  onClick={() => void createOpportunity()}
                  disabled={creatingOpp}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                  {creatingOpp ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Target className="h-3.5 w-3.5" />
                  )}
                  New opportunity
                </button>
              </div>

              {opportunities.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
                  <Target className="mx-auto mb-2 h-8 w-8 text-[#6f6b62]/30" />
                  <p className="text-sm text-[#6f6b62]">No service records yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {opportunities.map((opp) => {
                    const value = formatValue(opp.indicative_value_low, opp.indicative_value_high);
                    return (
                      <Link
                        key={opp.id}
                        href={`/admin/engagement/pipeline/opportunities/${opp.id}`}
                        className="flex items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/40 transition-colors group"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-50">
                          <Target className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#111111]">{opp.title}</p>
                              {value && (
                                <p className="text-sm font-semibold text-[#063b32]">{value}</p>
                              )}
                              {opp.desired_outcomes && (
                                <p className="mt-1 text-sm text-[#6f6b62] line-clamp-2">
                                  {opp.desired_outcomes}
                                </p>
                              )}
                              {opp.recommended_pathway && (
                                <p className="mt-1 text-xs text-[#6f6b62]">
                                  <span className="font-semibold">Pathway:</span> {opp.recommended_pathway}
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {opp.stage}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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
    </div>
  );
}
