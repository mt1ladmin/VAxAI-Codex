"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity, type EngagementTask } from "@/lib/engagement/types";

type Stats = {
  totalOpps: number;
  openTasks: number;
  wonCount: number;
  pipelineValue: number;
};

export function InsightsContent() {
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
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
    const allOpps = oppsData.data || [];
    const allTasks = tasksData.data || [];
    setOpps(allOpps);
    setTasks(allTasks);

    const wonCount = allOpps.filter((o) => ["Won", "Onboarding", "Active client"].includes(o.stage)).length;
    const pipelineValue = allOpps
      .filter((o) => !["Lost", "Not suitable"].includes(o.stage))
      .reduce((sum, o) => sum + (o.indicative_value_high ?? o.indicative_value_low ?? 0), 0);

    setStats({
      totalOpps: allOpps.length,
      openTasks: allTasks.length,
      wonCount,
      pipelineValue,
    });
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const byStage = OPPORTUNITY_STAGES.map((stage) => ({
    stage,
    count: opps.filter((o) => o.stage === stage).length,
    value: opps.filter((o) => o.stage === stage).reduce((sum, o) => sum + (o.indicative_value_high ?? 0), 0),
  })).filter((s) => s.count > 0);

  const maxCount = Math.max(...byStage.map((s) => s.count), 1);

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>;
  }

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Opportunities", value: stats?.totalOpps ?? 0, href: "/admin/engagement/pipeline?tab=pipeline" },
          { label: "Won / clients", value: stats?.wonCount ?? 0, href: "/admin/engagement/pipeline?tab=pipeline" },
          { label: "Pipeline value", value: stats?.pipelineValue ? `£${stats.pipelineValue.toLocaleString()}` : "—", href: "/admin/engagement/pipeline?tab=pipeline" },
          { label: "Open tasks", value: stats?.openTasks ?? 0, href: "/admin/engagement/pipeline/tasks" },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href} className="rounded-xl border border-[#111111]/10 bg-white p-5 hover:border-[#063b32]/30 hover:shadow-sm transition-all">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#111111]">{value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-[#111111]/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#111111]">Pipeline by stage</h2>
          <Link href="/admin/engagement/pipeline?tab=pipeline" className="flex items-center gap-1 text-xs font-semibold text-[#063b32] hover:underline">
            <TrendingUp className="h-3.5 w-3.5" /> View pipeline
          </Link>
        </div>
        <div className="space-y-3">
          {byStage.map(({ stage, count, value }) => (
            <Link key={stage} href="/admin/engagement/pipeline?tab=pipeline" className="block group">
              <div className="flex items-center gap-3">
                <div className="w-36 shrink-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[stage] || "bg-gray-100 text-gray-600"}`}>
                    {stage}
                  </span>
                </div>
                <div className="flex-1 h-6 bg-[#f7f4ea] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#063b32]/20 group-hover:bg-[#063b32]/30 transition-colors rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? "2rem" : 0 }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-semibold text-[#111111]">{count}</span>
                {value > 0 && (
                  <span className="w-24 text-right text-xs text-[#6f6b62]">£{value.toLocaleString()}</span>
                )}
              </div>
            </Link>
          ))}
          {byStage.length === 0 && (
            <p className="text-sm text-[#6f6b62]">No opportunities yet.</p>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#f7f4ea]">
            <h2 className="text-sm font-semibold text-[#111111]">Open tasks ({tasks.length})</h2>
            <Link href="/admin/engagement/pipeline/tasks" className="text-xs font-semibold text-[#063b32] hover:underline">See all</Link>
          </div>
          <div className="divide-y divide-[#111111]/5">
            {tasks.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3">
                <div className={`h-2 w-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-gray-300"}`} />
                <div className="flex-1">
                  <p className="text-sm text-[#111111]">{t.title}</p>
                  {t.organisation && <p className="text-xs text-[#6f6b62]">{t.organisation.name}</p>}
                </div>
                {t.due_date && (
                  <span className="text-xs text-[#6f6b62] shrink-0">
                    {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}