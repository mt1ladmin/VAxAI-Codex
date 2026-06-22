"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, CheckSquare, Plus, X } from "lucide-react";
import { type EngagementTask } from "@/lib/engagement/types";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-gray-300",
};

const STATUS_BADGE: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-400 line-through",
};

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

export default function TasksPage() {
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("");
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "medium", due_date: "", notes: "", task_type: "follow_up" });
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    params.set("limit", "100");
    const res = await fetch(`/api/admin/engagement/tasks?${params}`);
    const json = await res.json() as { data: EngagementTask[] };
    setTasks(json.data || []);
    setLoading(false);
  }, [status, priority]);

  useEffect(() => { load(); }, [load]);

  const markDone = async (taskId: string) => {
    await fetch(`/api/admin/engagement/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    load();
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
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setSaveError(j.error ?? "Failed to save task.");
      setSaving(false);
      return;
    }
    setForm({ title: "", priority: "medium", due_date: "", notes: "", task_type: "follow_up" });
    setAdding(false);
    setSaving(false);
    load();
  };

  const grouped = tasks.reduce<Record<string, EngagementTask[]>>((acc, t) => {
    const key = t.due_date
      ? new Date(t.due_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
      : "No due date";
    (acc[key] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Pipeline</p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[#111111]">Tasks</h1>
          <button
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] transition-colors"
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Cancel" : "Add task"}
          </button>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* Add task form */}
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
                  onKeyDown={(e) => e.key === "Enter" && saveTask()}
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
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional context…"
                  className={inputClass}
                />
              </div>
            </div>
            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={saveTask}
                disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60 transition-colors"
              >
                <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save task"}
              </button>
              <button onClick={() => setAdding(false)} className="text-sm text-[#6f6b62] hover:text-[#111111]">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="flex rounded-lg border border-[#111111]/15 overflow-hidden">
            {[
              { val: "todo", label: "To do" },
              { val: "in_progress", label: "In progress" },
              { val: "", label: "All" },
              { val: "done", label: "Done" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setStatus(val)}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                  status === val ? "bg-[#063b32] text-white" : "bg-white text-[#6f6b62] hover:text-[#111111]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#063b32]">
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <CheckSquare className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm text-[#6f6b62]">No tasks found.</p>
            <button
              onClick={() => setAdding(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> Add first task
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{dateLabel}</p>
                <div className="rounded-xl border border-[#111111]/10 overflow-hidden divide-y divide-[#111111]/5">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                      <button
                        onClick={() => markDone(t.id)}
                        disabled={t.status === "done"}
                        className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                          t.status === "done"
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-[#111111]/20 hover:border-[#063b32]"
                        }`}
                      >
                        {t.status === "done" && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority] || "bg-gray-300"}`} />

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${t.status === "done" ? "text-[#6f6b62] line-through" : "text-[#111111]"}`}>
                          {t.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {t.task_type && (
                            <span className="text-[10px] text-[#6f6b62]">{t.task_type.replace("_", " ")}</span>
                          )}
                          {t.organisation && (
                            <Link href={`/admin/engagement/pipeline/organisations/${t.organisation.id}`} className="text-[10px] text-[#063b32] hover:underline">
                              · {t.organisation.name}
                            </Link>
                          )}
                          {t.contact && (
                            <span className="text-[10px] text-[#6f6b62]">
                              · {t.contact.first_name} {t.contact.last_name}
                            </span>
                          )}
                          {t.notes && (
                            <span className="text-[10px] text-[#6f6b62] truncate">· {t.notes}</span>
                          )}
                        </div>
                      </div>

                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${STATUS_BADGE[t.status] || "bg-gray-100 text-gray-600"}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
