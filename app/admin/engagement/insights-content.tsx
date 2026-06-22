"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import {
  computePipelineStats,
  formatOpportunityValue,
  isOpenOpportunity,
  openOpportunitiesValue,
  opportunityPartyLabel,
  startOfDay,
} from "@/lib/engagement/pipeline-filters";
import { STAGE_COLORS, type EngagementOpportunity, type EngagementTask } from "@/lib/engagement/types";

type FollowUpItem = {
  id: string;
  kind: "task" | "opportunity";
  title: string;
  subtitle: string | null;
  dueDate: string | null;
  href: string;
  overdue: boolean;
};

function InsightListCard({
  title,
  count,
  meta,
  seeAllHref,
  children,
}: {
  title: string;
  count: number;
  meta?: string;
  seeAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-[#f7f4ea]">
        <div>
          <h2 className="text-sm font-semibold text-[#111111]">
            {title} ({count})
          </h2>
          {meta && <p className="mt-0.5 text-xs text-[#6f6b62]">{meta}</p>}
        </div>
        <Link href={seeAllHref} className="text-xs font-semibold text-[#063b32] hover:underline shrink-0">
          See all
        </Link>
      </div>
      {children}
    </div>
  );
}

export function InsightsContent() {
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [oppsRes, tasksRes] = await Promise.all([
      fetch("/api/admin/engagement/opportunities?limit=500"),
      fetch("/api/admin/engagement/tasks?status=todo&limit=200"),
    ]);
    const [oppsData, tasksData] = await Promise.all([
      oppsRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      tasksRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setOpps(oppsData.data || []);
    setTasks(tasksData.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => computePipelineStats(opps), [opps]);
  const openOpps = useMemo(() => opps.filter(isOpenOpportunity), [opps]);
  const openOppsTotalValue = useMemo(() => openOpportunitiesValue(opps), [opps]);

  const followUps = useMemo(() => {
    const today = startOfDay(new Date());
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    const items: FollowUpItem[] = [];

    for (const t of tasks) {
      if (!t.due_date) continue;
      const due = startOfDay(new Date(t.due_date));
      if (due > in7) continue;
      items.push({
        id: `task-${t.id}`,
        kind: "task",
        title: t.title,
        subtitle: t.organisation?.name ?? (t.contact ? `${t.contact.first_name} ${t.contact.last_name ?? ""}`.trim() : null),
        dueDate: t.due_date,
        href: t.opportunity_id
          ? `/admin/engagement/pipeline/opportunities/${t.opportunity_id}`
          : "/admin/engagement/pipeline/tasks",
        overdue: due < today,
      });
    }

    for (const o of openOpps) {
      if (!o.next_action?.trim() || !o.expected_decision_date) continue;
      const due = startOfDay(new Date(o.expected_decision_date));
      if (due > in7) continue;
      items.push({
        id: `opp-${o.id}`,
        kind: "opportunity",
        title: o.next_action,
        subtitle: o.title,
        dueDate: o.expected_decision_date,
        href: `/admin/engagement/pipeline/opportunities/${o.id}`,
        overdue: due < today,
      });
    }

    return items.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, openOpps]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>;
  }

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Opportunities", value: stats.totalCount, href: "/admin/engagement/pipeline?tab=opportunities" },
          { label: "Won / clients", value: stats.wonCount, href: "/admin/engagement/pipeline?tab=opportunities" },
          {
            label: "Pipeline value",
            value: stats.pipelineValue ? `£${stats.pipelineValue.toLocaleString()}` : "—",
            href: "/admin/engagement/pipeline?tab=opportunities",
          },
          { label: "Open tasks", value: tasks.length, href: "/admin/engagement/pipeline/tasks" },
        ].map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-[#111111]/10 bg-white p-5 hover:border-[#063b32]/30 hover:shadow-sm transition-all"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#111111]">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InsightListCard title="Open tasks" count={tasks.length} seeAllHref="/admin/engagement/pipeline/tasks">
          {tasks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#6f6b62]">No open tasks.</div>
          ) : (
            <div className="divide-y divide-[#111111]/5">
              {tasks.slice(0, 8).map((t) => (
                <Link
                  key={t.id}
                  href={t.opportunity_id ? `/admin/engagement/pipeline/opportunities/${t.opportunity_id}` : "/admin/engagement/pipeline/tasks"}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[#f7f4ea]/50 transition-colors"
                >
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-gray-300"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111111] truncate">{t.title}</p>
                    <p className="text-xs text-[#6f6b62] truncate">
                      {t.opportunity?.title
                        ? t.opportunity.title
                        : t.organisation?.name ?? (t.contact ? `${t.contact.first_name} ${t.contact.last_name ?? ""}`.trim() : null)}
                    </p>
                  </div>
                  {t.due_date && (
                    <span className="text-xs text-[#6f6b62] shrink-0">
                      {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </InsightListCard>

        <InsightListCard
          title="Open opportunities"
          count={openOpps.length}
          meta={openOppsTotalValue ? `£${openOppsTotalValue.toLocaleString()} total value` : undefined}
          seeAllHref="/admin/engagement/pipeline?tab=opportunities"
        >
          {openOpps.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#6f6b62]">No open opportunities.</div>
          ) : (
            <div className="divide-y divide-[#111111]/5">
              {openOpps.slice(0, 8).map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/engagement/pipeline/opportunities/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[#f7f4ea]/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{o.title}</p>
                    <p className="text-xs text-[#6f6b62] truncate">{opportunityPartyLabel(o)}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#063b32] shrink-0 tabular-nums">
                    {formatOpportunityValue(o) ?? "—"}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[o.stage] || "bg-gray-100 text-gray-600"}`}
                  >
                    {o.stage}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </InsightListCard>
      </div>

      <InsightListCard title="Follow-ups" count={followUps.length} seeAllHref="/admin/engagement/pipeline/tasks">
        {followUps.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#6f6b62]">No follow-ups due in the next 7 days.</div>
        ) : (
          <div className="divide-y divide-[#111111]/5">
            {followUps.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#f7f4ea]/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.kind === "task" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.kind === "task" ? "Task" : "Opportunity"}
                    </span>
                    {item.overdue && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#111111] truncate">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-[#6f6b62] truncate">{item.subtitle}</p>}
                </div>
                {item.dueDate && (
                  <span
                    className={`shrink-0 flex items-center gap-1 text-xs ${item.overdue ? "text-red-600 font-semibold" : "text-[#6f6b62]"}`}
                  >
                    <Calendar className="h-3 w-3" />
                    {new Date(item.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </InsightListCard>
    </div>
  );
}