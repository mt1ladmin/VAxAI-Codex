"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Building2, CheckSquare, Plus } from "lucide-react";
import { OpportunitySourceBadge } from "@/components/admin/OpportunitySourceBadge";
import {
  NEXT_ACTION_FILTER_OPTIONS,
  TASK_FILTER_OPTIONS,
  computePipelineStats,
  formatOpportunityValue,
  matchesNextActionFilter,
  matchesTaskFilter,
  type NextActionFilter,
  type TaskFilter,
} from "@/lib/engagement/pipeline-filters";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity, type EngagementTask } from "@/lib/engagement/types";

const selectClass =
  "rounded-lg border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#111111] outline-none focus:border-[#063b32]";

export function OpportunitiesListView({
  opps,
  tasks,
  loading,
  stageFilter,
  taskFilter,
  nextActionFilter,
  onStageFilterChange,
  onTaskFilterChange,
  onNextActionFilterChange,
  showMetrics = true,
  showHeader = true,
}: {
  opps: EngagementOpportunity[];
  tasks: EngagementTask[];
  loading: boolean;
  stageFilter: string;
  taskFilter: TaskFilter;
  nextActionFilter: NextActionFilter;
  onStageFilterChange: (value: string) => void;
  onTaskFilterChange: (value: TaskFilter) => void;
  onNextActionFilterChange: (value: NextActionFilter) => void;
  showMetrics?: boolean;
  showHeader?: boolean;
}) {
  const router = useRouter();

  const stats = useMemo(() => computePipelineStats(opps), [opps]);

  const filteredOpps = useMemo(() => {
    return opps
      .filter(
        (o) =>
          matchesTaskFilter(o.id, taskFilter, tasks) &&
          matchesNextActionFilter(o, nextActionFilter) &&
          (stageFilter === "" || o.stage === stageFilter),
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [opps, tasks, taskFilter, nextActionFilter, stageFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, EngagementOpportunity[]> = {};
    for (const opp of filteredOpps) {
      (groups[opp.stage] ??= []).push(opp);
    }
    return OPPORTUNITY_STAGES.filter((s) => groups[s]?.length).map((stage) => ({
      stage,
      items: groups[stage] ?? [],
    }));
  }, [filteredOpps]);

  return (
    <div>
      {showHeader && (
        <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Opportunities tracker</p>
          <div className="mt-1 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-[#111111]">Opportunities</h1>
            <Link
              href="/admin/engagement/pipeline/opportunities/new"
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> New opportunity
            </Link>
          </div>
        </div>
      )}

      <div className="px-8 py-6">
        {showMetrics && (
          <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/40 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Open</p>
              <p className="text-lg font-bold text-[#111111] tabular-nums">{stats.openCount}</p>
            </div>
            <div className="h-8 w-px bg-[#111111]/10" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Pipeline value</p>
              <p className="text-lg font-bold text-[#063b32] tabular-nums">
                {stats.pipelineValue ? `£${stats.pipelineValue.toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="h-8 w-px bg-[#111111]/10" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Won / clients</p>
              <p className="text-lg font-bold text-emerald-700 tabular-nums">{stats.wonCount}</p>
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap gap-3">
          <select value={stageFilter} onChange={(e) => onStageFilterChange(e.target.value)} className={selectClass}>
            <option value="">All stages</option>
            {OPPORTUNITY_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={taskFilter} onChange={(e) => onTaskFilterChange(e.target.value as TaskFilter)} className={selectClass}>
            {TASK_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={nextActionFilter}
            onChange={(e) => onNextActionFilterChange(e.target.value as NextActionFilter)}
            className={selectClass}
          >
            {NEXT_ACTION_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Next action: {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : filteredOpps.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <Building2 className="mx-auto h-8 w-8 text-[#6f6b62]/30 mb-3" />
            <p className="text-sm text-[#6f6b62]">
              {opps.length === 0 ? (
                <>
                  No opportunities yet.{" "}
                  <Link href="/admin/engagement/pipeline/opportunities/new" className="text-[#063b32] hover:underline">
                    Add one
                  </Link>
                </>
              ) : (
                "No opportunities match your filters."
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ stage, items }) => (
              <div key={stage}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[stage] || "bg-gray-100 text-gray-600"}`}
                  >
                    {stage}
                  </span>
                  <span className="text-xs text-[#6f6b62]">{items.length}</span>
                </div>
                <div className="rounded-xl border border-[#111111]/10 overflow-hidden divide-y divide-[#111111]/5">
                  {items.map((opp) => {
                    const value = formatOpportunityValue(opp);
                    const openTaskCount = tasks.filter(
                      (t) => t.opportunity_id === opp.id && t.status !== "done",
                    ).length;
                    return (
                      <div
                        key={opp.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`);
                        }}
                        className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left hover:bg-[#f7f4ea]/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111111] truncate">{opp.title}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            {opp.organisation?.name && (
                              <span className="text-[10px] text-[#6f6b62]">{opp.organisation.name}</span>
                            )}
                            {opp.primary_contact && (
                              <span className="text-[10px] text-[#6f6b62]">
                                · {opp.primary_contact.first_name} {opp.primary_contact.last_name ?? ""}
                              </span>
                            )}
                            {(opp.enquiry_id || opp.queue_id) && (
                              <span onClick={(e) => e.stopPropagation()}>
                                <OpportunitySourceBadge opportunity={opp} compact showNames />
                              </span>
                            )}
                          </div>
                          {opp.next_action && (
                            <p className="mt-1 text-[10px] text-[#6f6b62] line-clamp-1">Next: {opp.next_action}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right space-y-1">
                          {value && <p className="text-xs font-semibold text-[#063b32]">{value}</p>}
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#6f6b62]">
                            <CheckSquare className="h-3 w-3" />
                            {openTaskCount} open
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}