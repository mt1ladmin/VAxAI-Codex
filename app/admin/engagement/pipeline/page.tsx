"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OpportunitiesListView } from "@/components/admin/OpportunitiesListView";
import {
  type NextActionFilter,
  type TaskFilter,
} from "@/lib/engagement/pipeline-filters";
import type { EngagementOpportunity, EngagementTask } from "@/lib/engagement/types";
import { InsightsContent } from "../insights-content";

type Tab = "insights" | "opportunities";

function OpportunitiesTrackerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("insights");
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [nextActionFilter, setNextActionFilter] = useState<NextActionFilter>("all");

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "opportunities" || urlTab === "pipeline") setTab("opportunities");
    else setTab("insights");
  }, [searchParams]);

  const switchTab = (key: Tab) => {
    setTab(key);
    router.replace(
      key === "insights"
        ? "/admin/engagement/pipeline?tab=insights"
        : "/admin/engagement/pipeline?tab=opportunities",
    );
  };

  const load = useCallback(async () => {
    if (tab !== "opportunities") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [oppsRes, tasksRes] = await Promise.all([
      fetch("/api/admin/engagement/opportunities?limit=500"),
      fetch("/api/admin/engagement/tasks?limit=500"),
    ]);
    const [oppsJson, tasksJson] = await Promise.all([
      oppsRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      tasksRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setOpps(oppsJson.data || []);
    setTasks(tasksJson.data || []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 border-b border-[#111111]/10 bg-white px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-[#111111]">Opportunities tracker</span>
          <div className="ml-3 flex overflow-hidden rounded-lg border border-[#111111]/15">
            {([
              ["insights", "Insights"],
              ["opportunities", "Opportunities"],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                  tab === key ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "insights" && (
        <>
          <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Insights</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">An at-a-glance view of your opportunities and activity.</p>
          </div>
          <InsightsContent />
        </>
      )}

      {tab === "opportunities" && (
        <OpportunitiesListView
          opps={opps}
          tasks={tasks}
          loading={loading}
          stageFilter={stageFilter}
          taskFilter={taskFilter}
          nextActionFilter={nextActionFilter}
          onStageFilterChange={setStageFilter}
          onTaskFilterChange={setTaskFilter}
          onNextActionFilterChange={setNextActionFilter}
        />
      )}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white px-8 py-16 text-sm text-[#6f6b62]">Loading…</div>}>
      <OpportunitiesTrackerInner />
    </Suspense>
  );
}