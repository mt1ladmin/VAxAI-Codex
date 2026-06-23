"use client";

import { useState } from "react";
import { Calendar, Check, ChevronDown, Loader2, Plus, Save, Target } from "lucide-react";
import type { LinkedNextAction } from "@/lib/engagement/linked-next-actions";
import type { EngagementTask } from "@/lib/engagement/types";
import { DEFAULT_TASK_FORM, PRIORITY_DOT, STATUS_BADGE } from "@/lib/engagement/task-ui";

type TaskForm = typeof DEFAULT_TASK_FORM;

type HubTasksTabProps = {
  entityLabel: string;
  openTasks: EngagementTask[];
  doneTasks: EngagementTask[];
  linkedNextActions?: LinkedNextAction[];
  addingTask: boolean;
  setAddingTask: (value: boolean) => void;
  taskForm: TaskForm;
  setTaskForm: React.Dispatch<React.SetStateAction<TaskForm>>;
  savingTask: boolean;
  onCreateTask: () => void;
  onMarkDone: (taskId: string) => void;
  onSaveLinkedNextAction?: (item: LinkedNextAction, payload: { title: string; dueDate: string | null }) => Promise<void>;
  onCompleteLinkedNextAction?: (item: LinkedNextAction) => Promise<void>;
  showDone: boolean;
  setShowDone: (value: boolean) => void;
};

function sortByDue<T extends { dueDate?: string | null; due_date?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDue = a.dueDate ?? a.due_date ?? null;
    const bDue = b.dueDate ?? b.due_date ?? null;
    if (!aDue && !bDue) return 0;
    if (!aDue) return 1;
    if (!bDue) return -1;
    return new Date(aDue).getTime() - new Date(bDue).getTime();
  });
}

export function HubTasksTab({
  entityLabel,
  openTasks,
  doneTasks,
  linkedNextActions = [],
  addingTask,
  setAddingTask,
  taskForm,
  setTaskForm,
  savingTask,
  onCreateTask,
  onMarkDone,
  onSaveLinkedNextAction,
  onCompleteLinkedNextAction,
  showDone,
  setShowDone,
}: HubTasksTabProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDue, setEditDue] = useState("");
  const [savingLinked, setSavingLinked] = useState(false);
  const [completingKey, setCompletingKey] = useState<string | null>(null);

  const sortedLinked = sortByDue(linkedNextActions);
  const sortedOpen = sortByDue(openTasks);
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
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
          Tasks &amp; next actions — {entityLabel}
        </p>
        <button
          type="button"
          onClick={() => setAddingTask(!addingTask)}
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
              onClick={() => void onCreateTask()}
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

      {!hasOpenWork && !addingTask ? (
        <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
          <p className="text-sm text-[#6f6b62]">No open tasks or next actions.</p>
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
                      className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    />
                    <input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveLinkedEdit(item)}
                        disabled={savingLinked || !editTitle.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingLinked ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62]"
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
                      className="grid h-4 w-4 shrink-0 place-items-center rounded border border-sky-300 bg-white hover:border-[#063b32] hover:bg-[#063b32]/5 disabled:opacity-50"
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
                        className={`shrink-0 flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-[#6f6b62]"}`}
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
                        className="text-[10px] font-semibold text-[#063b32] hover:underline shrink-0"
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
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-[#111111]/10 bg-white px-4 py-3"
              >
                <button
                  type="button"
                  onClick={() => void onMarkDone(t.id)}
                  className="grid h-4 w-4 shrink-0 place-items-center rounded border border-[#111111]/25 bg-white hover:border-[#063b32] hover:bg-[#063b32]/5"
                  title="Mark done"
                />
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[t.priority] ?? "bg-gray-300"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#111111]">{t.title}</p>
                  {t.notes && <p className="text-xs text-[#6f6b62] truncate">{t.notes}</p>}
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

      {doneTasks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowDone(!showDone)}
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
  );
}