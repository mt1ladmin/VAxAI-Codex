"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";
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

export default function TasksPage() {
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("");
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Tasks</h1>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="mb-5 flex gap-3">
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
                            <span className="text-[10px] text-[#6f6b62]">{t.task_type}</span>
                          )}
                          {t.organisation && (
                            <Link href={`/admin/engagement/pipeline/organisations/${t.organisation.id}`} className="text-[10px] text-[#063b32] hover:underline">
                              {t.organisation.name}
                            </Link>
                          )}
                          {t.contact && (
                            <span className="text-[10px] text-[#6f6b62]">
                              · {t.contact.first_name} {t.contact.last_name}
                            </span>
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
