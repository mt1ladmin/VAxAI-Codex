"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OpportunitiesListView } from "@/components/admin/OpportunitiesListView";
import { type NextActionFilter, type TaskFilter } from "@/lib/engagement/pipeline-filters";
import type { EngagementOpportunity, EngagementTask } from "@/lib/engagement/types";

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [nextActionFilter, setNextActionFilter] = useState<NextActionFilter>("all");

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 px-8 py-3">
        <Link
          href="/admin/engagement/pipeline?tab=insights"
          className="inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Opportunities tracker
        </Link>
      </div>
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
    </div>
  );
}