"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TasksListSkeleton } from "@/components/admin/HubDetailSkeleton";
import { useUserEmail } from "@/lib/user-email-context";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { useStudioAccessOptional } from "@/lib/studio-access-context";
import { Check, CheckSquare, Loader2, Pencil, Plus, Save, X } from "lucide-react";
import {
  DUE_DATE_FILTER_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  matchesDueDateFilter,
  matchesTaskSourceFilter,
  type DueDateFilter,
  type SourceFilter,
} from "@/lib/engagement/pipeline-filters";
import type { EngagementTask } from "@/lib/engagement/types";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-gray-300",
};

const BOARD_COLUMNS = [
  { id: "todo", label: "To do", color: "bg-gray-100 text-gray-700" },
  { id: "in_progress", label: "In progress", color: "bg-blue-100 text-blue-700" },
  { id: "done", label: "Done", color: "bg-emerald-100 text-emerald-700" },
] as const;

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm appearance-none outline-none focus:border-[#063b32] transition-colors";

const selectClass =
  "rounded-lg border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#111111] outline-none focus:border-[#063b32] appearance-none";

function taskRecordHref(task: EngagementTask, allowClientLinks: boolean): string | null {
  const enquiryId = task.enquiry_id ?? task.opportunity?.enquiry_id;
  if (enquiryId) return `/admin/enquiries/${enquiryId}`;
  const outreachId = task.outreach_id ?? task.opportunity?.outreach_id;
  if (outreachId) return `/admin/engagement/prospect-outreach/${outreachId}`;
  return null;
}

function taskRecordLabel(task: EngagementTask): string {
  if (task.opportunity?.title) return task.opportunity.title;
  if (task.contact) return `${task.contact.first_name} ${task.contact.last_name ?? ""}`.trim();
  if (task.organisation?.name) return task.organisation.name;
  return "View record";
}

function TaskBoardCard({
  task,
  onToggleStatus,
  onDragStart,
  onEdit,
  allowClientLinks,
}: {
  task: EngagementTask;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDragStart: (taskId: string) => void;
  onEdit: (task: EngagementTask) => void;
  allowClientLinks: boolean;
}) {
  const recordHref = taskRecordHref(task, allowClientLinks);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="cursor-grab rounded-lg border border-[#111111]/10 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => void onToggleStatus(task.id, task.status)}
          title={task.status === "done" ? "Mark as not done" : "Mark done"}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center ${
            task.status === "done" ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-600" : "border-[#111111]/20 hover:border-[#063b32]"
          }`}
        >
          {task.status === "done" && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex-1 min-w-0 text-left"
        >
          <p className={`text-sm font-semibold leading-snug ${task.status === "done" ? "text-[#6f6b62] line-through" : "text-[#111111]"}`}>
            {task.title}
          </p>
          {task.due_date && (
            <p className="mt-1 text-[10px] text-[#6f6b62]">
              {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          )}
          {recordHref && (
            <Link
              href={recordHref}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 block text-[10px] font-semibold text-[#063b32] hover:underline truncate"
            >
              {taskRecordLabel(task)}
            </Link>
          )}
        </button>
        <div className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || "bg-gray-300"}`} />
      </div>
    </div>
  );
}

export function TasksListView({
  embedded = true,
  showPageHeader = false,
}: {
  embedded?: boolean;
  showPageHeader?: boolean;
}) {
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "medium", due_date: "", notes: "", task_type: "follow_up", assigned_team_member_id: "" });
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const userEmail = useUserEmail();
  const [saveError, setSaveError] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<EngagementTask | null>(null);
  const [editForm, setEditForm] = useState({ title: "", due_date: "", notes: "", priority: "medium", status: "todo" });
  const [savingEdit, setSavingEdit] = useState(false);
  const studioAccess = useStudioAccessOptional();
  const allowClientLinks = true;

  const load = useCallback(async () => {
    if (!hasLoadedRef.current) setInitialLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "500");
    if (assigneeFilter) params.set("assigned_team_member_id", assigneeFilter);
    if (myTasksOnly) {
      params.set("my_tasks", "true");
      if (userEmail) params.set("user_email", userEmail);
    }
    const res = await fetch(`/api/admin/engagement/tasks?${params}`);
    const json = (await res.json()) as { data: EngagementTask[] };
    setTasks(json.data || []);
    hasLoadedRef.current = true;
    setInitialLoading(false);
  }, [assigneeFilter, myTasksOnly, userEmail]);

  useEffect(() => {
    void fetch("/api/admin/engagement/team-members")
      .then((r) => r.json())
      .then((j: { data?: StudioTeamMember[] }) => setTeamMembers(j.data || []));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTasks = useMemo(
    () => tasks.filter((t) => matchesDueDateFilter(t, dueDateFilter) && matchesTaskSourceFilter(t, sourceFilter)),
    [tasks, dueDateFilter, sourceFilter],
  );

  const boardGroups = useMemo(() => {
    const groups: Record<string, EngagementTask[]> = { todo: [], in_progress: [], done: [] };
    for (const t of filteredTasks) {
      const key = t.status in groups ? t.status : "todo";
      groups[key].push(t);
    }
    return groups;
  }, [filteredTasks]);

  const updateStatus = async (taskId: string, newStatus: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    void load();
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    await updateStatus(taskId, currentStatus === "done" ? "todo" : "done");
  };

  const handleDrop = async (columnId: string) => {
    if (!draggingId) return;
    const task = tasks.find((t) => t.id === draggingId);
    if (!task || task.status === columnId) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }
    await updateStatus(draggingId, columnId);
    setDraggingId(null);
    setDropTarget(null);
  };

  const saveTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError("");
    const res = await fetch("/api/admin/engagement/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        priority: form.priority,
        due_date: form.due_date || null,
        notes: form.notes.trim() || null,
        task_type: form.task_type,
        status: "todo",
        assigned_team_member_id: form.assigned_team_member_id || null,
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setSaveError(j.error ?? "Failed to save task.");
      setSaving(false);
      return;
    }
    setForm({ title: "", priority: "medium", due_date: "", notes: "", task_type: "follow_up", assigned_team_member_id: "" });
    setAdding(false);
    setSaving(false);
    void load();
  };

  const openEdit = (task: EngagementTask) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      due_date: task.due_date ?? "",
      notes: task.notes ?? "",
      priority: task.priority,
      status: task.status,
    });
  };

  const saveEdit = async () => {
    if (!editingTask || !editForm.title.trim()) return;
    setSavingEdit(true);
    try {
      await fetch(`/api/admin/engagement/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          due_date: editForm.due_date || null,
          notes: editForm.notes.trim() || null,
          priority: editForm.priority,
          status: editForm.status,
        }),
      });
      setEditingTask(null);
      void load();
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-white"}>
      {initialLoading ? (
        <div className="px-8 py-6">
          <TasksListSkeleton />
        </div>
      ) : (
        <>
      {showPageHeader && (
        <div className="border-b border-[#111111]/10 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#063b32]/10">
              <CheckSquare className="h-5 w-5 text-[#063b32]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#111111]">Tasks Tracker</h1>
              <p className="text-sm text-[#6f6b62]">
                Master task list across Prospect Finder and Website Enquiries
              </p>
            </div>
          </div>
        </div>
      )}
      <div className={`${embedded ? "" : "border-b border-[#111111]/10"} px-8 ${embedded ? "pt-6" : "py-6"}`}>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] transition-colors"
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Cancel" : "Add task"}
          </button>
        </div>
      </div>

      <div className="px-8 pb-6">
        {adding && (
          <div className="mb-6 rounded-xl border border-[#063b32]/20 bg-[#f7f4ea] p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-4">New task</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && void saveTask()}
                  placeholder="What needs to be done?"
                  autoFocus
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputClass}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Type</label>
                <select value={form.task_type} onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value }))} className={inputClass}>
                  <option value="follow_up">Follow-up</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="research">Research</option>
                  <option value="admin">Admin</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Due date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional context…" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Assignee</label>
                <select
                  value={form.assigned_team_member_id}
                  onChange={(e) => setForm((f) => ({ ...f, assigned_team_member_id: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.display_name}</option>
                  ))}
                </select>
              </div>
            </div>
            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void saveTask()}
                disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save task"}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="text-sm text-[#6f6b62] hover:text-[#111111]">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <select value={dueDateFilter} onChange={(e) => setDueDateFilter(e.target.value as DueDateFilter)} className={selectClass}>
            {DUE_DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => { setAssigneeFilter(e.target.value); setMyTasksOnly(false); }}
            className={selectClass}
          >
            <option value="">All assignees</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { setMyTasksOnly((v) => !v); setAssigneeFilter(""); }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              myTasksOnly ? "border-[#063b32] bg-[#063b32] text-white" : "border-[#111111]/15 text-[#6f6b62]"
            }`}
          >
            My tasks
          </button>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as SourceFilter)} className={selectClass}>
            {SOURCE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <CheckSquare className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm text-[#6f6b62]">{tasks.length === 0 ? "No tasks found." : "No tasks match your filters."}</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {BOARD_COLUMNS.map((col) => {
              const items = boardGroups[col.id] ?? [];
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(col.id); }}
                  onDragLeave={() => setDropTarget((prev) => (prev === col.id ? null : prev))}
                  onDrop={(e) => { e.preventDefault(); void handleDrop(col.id); }}
                  className={`flex min-w-[280px] flex-1 flex-col rounded-xl border overflow-hidden transition-colors ${
                    dropTarget === col.id ? "border-[#063b32]/40 bg-[#063b32]/5" : "border-[#111111]/10 bg-[#f7f4ea]/30"
                  }`}
                >
                  <div className="border-b border-[#111111]/10 bg-[#f7f4ea] px-3.5 py-3 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${col.color}`}>{col.label}</span>
                    <span className="text-[10px] font-bold text-[#6f6b62] tabular-nums">{items.length}</span>
                  </div>
                  <div className="min-h-[120px] max-h-[calc(100vh-320px)] overflow-y-auto p-2 space-y-2 scrollbar-subtle">
                    {items.map((t) => (
                      <TaskBoardCard key={t.id} task={t} onToggleStatus={toggleTaskStatus} onDragStart={setDraggingId} onEdit={openEdit} allowClientLinks={allowClientLinks} />
                    ))}
                    {items.length === 0 && (
                      <div className="flex min-h-[72px] items-center justify-center rounded-lg border border-dashed border-[#111111]/10 text-[11px] text-[#6f6b62]/50">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#6f6b62]" />
                <p className="text-sm font-semibold text-[#111111]">Edit task</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Due date</label>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Optional context…"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  disabled={savingEdit || !editForm.title.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60"
                >
                  {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingEdit ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm text-[#6f6b62] hover:bg-[#f7f4ea]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}