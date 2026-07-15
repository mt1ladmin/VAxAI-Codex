"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Calendar, Check, ChevronDown, Loader2, Plus, Save, Target, Trash2 } from "lucide-react";
import type { LinkedNextAction } from "@/lib/engagement/linked-next-actions";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import type { EngagementTask } from "@/lib/engagement/types";
import { DEFAULT_TASK_FORM, PRIORITY_DOT, STATUS_BADGE } from "@/lib/engagement/task-ui";

const TASK_TYPE_LABEL: Record<string, string> = {
  follow_up: "Follow-up",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  admin: "Admin",
  research: "Research",
  other: "Other",
};

const TASK_TYPE_BADGE: Record<string, string> = {
  follow_up: "bg-acid/50 text-ink",
  call: "bg-pine-100 text-pine-800",
  email: "bg-pine-900/10 text-pine-900",
  meeting: "bg-pine-50 text-pine-900 border border-pine-900/12",
  admin: "bg-white text-muted border border-pine-900/12",
  research: "bg-pine-100 text-pine-800",
  other: "bg-white text-muted border border-pine-900/12",
};

const fieldClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#122428] appearance-none";

function FormSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
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
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-left text-sm text-[#111111] outline-none transition-colors hover:border-[#122428]/40"
      >
        <span className={selected ? "text-[#111111]" : "text-[#5F686A]"}>
          {selected?.label || placeholder || "Select…"}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#5F686A] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full min-w-[10rem] overflow-hidden rounded-lg border border-[#111111]/15 bg-white shadow-lg">
          {placeholder && (
            <button
              type="button"
              onClick={() => { setOpen(false); onChange(""); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-pine-50 ${!value ? "font-semibold text-[#122428]" : "text-[#5F686A]"}`}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setOpen(false); onChange(opt.value); }}
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-pine-50 ${value === opt.value ? "bg-[#122428]/5 font-semibold text-[#122428]" : "text-[#111111]"}`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-[#122428]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type TaskForm = typeof DEFAULT_TASK_FORM;

type HubTasksTabProps = {
  entityLabel: string;
  openTasks: EngagementTask[];
  doneTasks: EngagementTask[];
  linkedNextActions?: LinkedNextAction[];
  tasksOnly?: boolean;
  viewAllTasksHref?: string;
  teamMembers?: StudioTeamMember[];
  addingTask: boolean;
  setAddingTask: (value: boolean) => void;
  taskForm: TaskForm;
  setTaskForm: React.Dispatch<React.SetStateAction<TaskForm>>;
  savingTask: boolean;
  onCreateTask: () => void;
  onMarkDone: (taskId: string) => void;
  onMarkUndone?: (taskId: string) => void;
  onUpdateTask?: (
    taskId: string,
    payload: { title: string; due_date: string | null; notes: string | null },
  ) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  onSaveLinkedNextAction?: (item: LinkedNextAction, payload: { title: string; dueDate: string | null }) => Promise<void>;
  onCompleteLinkedNextAction?: (item: LinkedNextAction) => Promise<void>;
  showDone: boolean;
  setShowDone: (value: boolean) => void;
};

function sortByCreatedDesc<T extends { created_at?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  );
}

export function HubTasksTab({
  entityLabel,
  openTasks,
  doneTasks,
  linkedNextActions = [],
  tasksOnly = false,
  viewAllTasksHref,
  teamMembers = [],
  addingTask,
  setAddingTask,
  taskForm,
  setTaskForm,
  savingTask,
  onCreateTask,
  onMarkDone,
  onMarkUndone,
  onUpdateTask,
  onDeleteTask,
  onSaveLinkedNextAction,
  onCompleteLinkedNextAction,
  showDone,
  setShowDone,
}: HubTasksTabProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingLinked, setSavingLinked] = useState(false);
  const [completingKey, setCompletingKey] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [savingTaskEdit, setSavingTaskEdit] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const visibleLinked = tasksOnly ? [] : linkedNextActions;
  const sortedLinked = [...visibleLinked];
  const sortedOpen = sortByCreatedDesc(openTasks);
  const hasOpenWork = sortedOpen.length > 0 || sortedLinked.length > 0;

  const startEditLinked = (item: LinkedNextAction) => {
    setEditingKey(item.key);
    setEditTitle(item.title);
    setEditDue(item.dueDate ?? "");
  };

  const saveLinkedEdit = async (item: LinkedNextAction) => {
    if (!onSaveLinkedNextAction || !editTitle.trim()) return;
    setSavingLinked(true);
    try {
      await onSaveLinkedNextAction(item, { title: editTitle.trim(), dueDate: editDue || null });
      setEditingKey(null);
    } finally {
      setSavingLinked(false);
    }
  };

  const startEditTask = (task: EngagementTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDue(task.due_date ?? "");
    setEditNotes(task.notes ?? "");
  };

  const saveTaskEdit = async (task: EngagementTask) => {
    if (!onUpdateTask || !editTitle.trim()) return;
    setSavingTaskEdit(true);
    try {
      await onUpdateTask(task.id, {
        title: editTitle.trim(),
        due_date: editDue || null,
        notes: editNotes.trim() || null,
      });
      setEditingTaskId(null);
    } finally {
      setSavingTaskEdit(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!onDeleteTask) return;
    setDeletingTaskId(taskId);
    try {
      await onDeleteTask(taskId);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const completeLinked = async (item: LinkedNextAction) => {
    if (!onCompleteLinkedNextAction) return;
    setCompletingKey(item.key);
    try {
      await onCompleteLinkedNextAction(item);
    } finally {
      setCompletingKey(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5F686A]">
          Tasks — {entityLabel}
        </p>
        <button
          type="button"
          onClick={() => setAddingTask(!addingTask)}
          className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1B343A]"
        >
          <Plus className="h-3.5 w-3.5" /> New task
        </button>
      </div>

      {addingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAddingTask(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <p className="text-sm font-semibold text-[#111111]">New task — {entityLabel}</p>
              <button type="button" onClick={() => setAddingTask(false)} className="grid h-7 w-7 place-items-center rounded-md text-[#5F686A] hover:bg-pine-50">
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <input
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title…"
                className={fieldClass}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <FormSelect
                  value={taskForm.priority}
                  onChange={(v) => setTaskForm((f) => ({ ...f, priority: v }))}
                  options={[
                    { value: "high", label: "High priority" },
                    { value: "medium", label: "Medium priority" },
                    { value: "low", label: "Low priority" },
                  ]}
                />
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm((f) => ({ ...f, due_date: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              {teamMembers.length > 0 && (
                <FormSelect
                  value={taskForm.assigned_team_member_id}
                  onChange={(v) => setTaskForm((f) => ({ ...f, assigned_team_member_id: v }))}
                  placeholder="Assign to…"
                  options={teamMembers.map((m) => ({ value: m.id, label: m.display_name }))}
                />
              )}
              <textarea
                value={taskForm.notes}
                onChange={(e) => setTaskForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Notes (optional)…"
                rows={2}
                className={`${fieldClass} resize-none`}
              />
            </div>
            <div className="flex gap-2 border-t border-[#111111]/10 px-5 py-4">
              <button
                type="button"
                onClick={() => void onCreateTask()}
                disabled={savingTask || !taskForm.title.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50"
              >
                {savingTask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save task
              </button>
              <button
                type="button"
                onClick={() => setAddingTask(false)}
                className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-xs font-semibold text-[#5F686A] hover:bg-pine-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasOpenWork && !addingTask ? (
        <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
          <p className="text-sm text-[#5F686A]">No open tasks.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedLinked.map((item) => {
            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();
            const isEditing = editingKey === item.key;
            return (
              <div
                key={item.key}
                className="rounded-xl border border-sky-200/80 bg-sky-50/30 px-4 py-3"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={fieldClass}
                    />
                    <input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className={fieldClass}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveLinkedEdit(item)}
                        disabled={savingLinked || !editTitle.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingLinked ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="rounded-lg border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#5F686A]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void completeLinked(item)}
                      disabled={completingKey === item.key}
                      className="grid h-4 w-4 shrink-0 place-items-center rounded border border-sky-300 bg-white hover:border-[#122428] hover:bg-[#122428]/5 disabled:opacity-50"
                      title="Mark done"
                    />
                    <Target className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111111]">{item.title}</p>
                      <p className="text-[10px] text-sky-700/80 truncate">{item.sourceLabel}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                      Next action
                    </span>
                    {item.dueDate && (
                      <span
                        className={`shrink-0 flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-[#5F686A]"}`}
                      >
                        <Calendar className="h-3 w-3" />
                        {new Date(item.dueDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                    {onSaveLinkedNextAction && (
                      <button
                        type="button"
                        onClick={() => startEditLinked(item)}
                        className="text-[10px] font-semibold text-[#122428] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {sortedOpen.map((t) => {
            const isOverdue =
              t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
            const isEditing = editingTaskId === t.id;
            return (
              <div
                key={t.id}
                className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={fieldClass}
                    />
                    <input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className={fieldClass}
                    />
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes (optional)…"
                      rows={2}
                      className={`${fieldClass} resize-none`}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveTaskEdit(t)}
                        disabled={savingTaskEdit || !editTitle.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingTaskEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="rounded-lg border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#5F686A]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void onMarkDone(t.id)}
                      className="grid h-4 w-4 shrink-0 place-items-center rounded border border-[#111111]/25 bg-white hover:border-[#122428] hover:bg-[#122428]/5"
                      title="Mark done"
                    />
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority] ?? "bg-gray-300"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111111]">{t.title}</p>
                      {t.notes && <p className="text-xs text-[#5F686A] truncate">{t.notes}</p>}
                    </div>
                    {t.assignee?.display_name && (
                      <span className="shrink-0 rounded-full border border-[#111111]/10 bg-white px-2 py-0.5 text-[10px] font-medium text-[#5F686A]">
                        {t.assignee.display_name}
                      </span>
                    )}
                    {t.due_date && (
                      <span
                        className={`shrink-0 flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-[#5F686A]"}`}
                      >
                        <Calendar className="h-3 w-3" />
                        {new Date(t.due_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                    {onUpdateTask && (
                      <button
                        type="button"
                        onClick={() => startEditTask(t)}
                        className="shrink-0 text-[10px] font-semibold text-[#122428] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {onDeleteTask && (
                      <button
                        type="button"
                        onClick={() => void deleteTask(t.id)}
                        disabled={deletingTaskId === t.id}
                        className="shrink-0 text-[10px] font-semibold text-red-600 hover:underline disabled:opacity-50"
                        title="Delete task"
                      >
                        {deletingTaskId === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5F686A] hover:text-[#111111]"
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
                  className="flex items-center gap-3 rounded-xl border border-[#111111]/8 bg-white px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onMarkUndone?.(t.id)}
                    disabled={!onMarkUndone}
                    title={onMarkUndone ? "Mark as not done" : undefined}
                    className="grid h-4 w-4 shrink-0 place-items-center rounded border border-pine-900/20 bg-acid/40 hover:bg-acid/60 disabled:cursor-default"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                  </button>
                  <span className="flex-1 text-sm text-[#5F686A] line-through">{t.title}</span>
                  {onMarkUndone && (
                    <button
                      type="button"
                      onClick={() => void onMarkUndone(t.id)}
                      className="shrink-0 text-[10px] font-semibold text-[#122428] hover:underline"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewAllTasksHref && (
        <div className="pt-1">
          <Link href={viewAllTasksHref} className="text-xs font-semibold text-[#122428] hover:underline">
            View all tasks
          </Link>
        </div>
      )}
    </>
  );
}
