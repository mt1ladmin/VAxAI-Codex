"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { isClientServiceStage } from "@/lib/engagement/client-stages";
import { OpportunitySourceBadge } from "@/components/admin/OpportunitySourceBadge";
import {
  NEXT_ACTION_FILTER_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  TASK_FILTER_OPTIONS,
  computePipelineStats,
  formatOpportunityValue,
  matchesNextActionFilter,
  matchesSourceFilter,
  matchesTaskFilter,
  opportunityPartyLabel,
  type NextActionFilter,
  type SourceFilter,
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
  sourceFilter,
  onStageFilterChange,
  onTaskFilterChange,
  onNextActionFilterChange,
  onSourceFilterChange,
  showMetrics = true,
  showHeader = false,
}: {
  opps: EngagementOpportunity[];
  tasks: EngagementTask[];
  loading: boolean;
  stageFilter: string;
  taskFilter: TaskFilter;
  nextActionFilter: NextActionFilter;
  sourceFilter: SourceFilter;
  onStageFilterChange: (value: string) => void;
  onTaskFilterChange: (value: TaskFilter) => void;
  onNextActionFilterChange: (value: NextActionFilter) => void;
  onSourceFilterChange: (value: SourceFilter) => void;
  showMetrics?: boolean;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const stats = useMemo(() => computePipelineStats(opps), [opps]);
  const showStageColumn = !stageFilter;
  const tableCols = showStageColumn
    ? "grid grid-cols-[minmax(150px,1.3fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(80px,0.6fr)_minmax(90px,0.7fr)_minmax(90px,0.7fr)_48px_minmax(140px,1.1fr)] gap-3 items-center"
    : "grid grid-cols-[minmax(150px,1.3fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(80px,0.6fr)_minmax(90px,0.7fr)_48px_minmax(140px,1.1fr)] gap-3 items-center";

  const filteredOpps = useMemo(() => {
    return opps
      .filter(
        (o) =>
          matchesTaskFilter(o.id, taskFilter, tasks) &&
          matchesNextActionFilter(o, nextActionFilter) &&
          matchesSourceFilter(o, sourceFilter) &&
          (stageFilter === "" || o.stage === stageFilter),
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [opps, tasks, taskFilter, nextActionFilter, sourceFilter, stageFilter]);

  const openTaskCount = (oppId: string) =>
    tasks.filter((t) => t.opportunity_id === oppId && t.status !== "done").length;

  return (
    <div>
      {showHeader && (
        <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
          <div className="flex items-center justify-end">
            <Link
              href="/admin/engagement/pipeline/opportunities/new"
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> New opportunity
            </Link>
          </div>
        </div>
      )}

      <div className={`px-8 ${showHeader ? "py-6" : "pt-4 pb-6"}`}>
        {showMetrics && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/40 px-5 py-4">
            <div className="flex flex-wrap items-center gap-4">
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
            {!showHeader && (
              <Link
                href="/admin/engagement/pipeline/opportunities/new"
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
              >
                <Plus className="h-4 w-4" /> New opportunity
              </Link>
            )}
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
          <select value={sourceFilter} onChange={(e) => onSourceFilterChange(e.target.value as SourceFilter)} className={selectClass}>
            {SOURCE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
                    Link to an enquiry or queue item
                  </Link>
                </>
              ) : (
                "No opportunities match your filters."
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#111111]/10 bg-white shadow-sm">
            <div
              className={`${tableCols} min-w-[900px] bg-[#ebe8df] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]`}
            >
              <span>Opportunity</span>
              <span>Contact / org</span>
              <span>Source</span>
              <span>Client</span>
              {showStageColumn && <span>Stage</span>}
              <span>Value</span>
              <span>Tasks</span>
              <span>Next action</span>
            </div>
            <div className="divide-y divide-[#111111]/5">
              {filteredOpps.map((opp) => {
                const value = formatOpportunityValue(opp);
                const tasksOpen = openTaskCount(opp.id);
                return (
                  <div
                    key={opp.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`);
                    }}
                    className={`${tableCols} min-w-[900px] px-5 py-3.5 cursor-pointer hover:bg-[#f7f4ea]/60 transition-colors`}
                  >
                    <span className="text-sm font-semibold text-[#111111] line-clamp-2">{opp.title}</span>
                    <span className="text-xs text-[#6f6b62] line-clamp-2">{opportunityPartyLabel(opp)}</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      {opp.enquiry_id || opp.queue_id ? (
                        <OpportunitySourceBadge opportunity={opp} compact />
                      ) : (
                        <span className="text-xs text-amber-700">Unlinked</span>
                      )}
                    </span>
                    <span onClick={(e) => e.stopPropagation()}>
                      {isClientServiceStage(opp.stage) && opp.primary_contact_id ? (
                        <Link
                          href={`/admin/clients/${opp.primary_contact_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#063b32] hover:underline"
                        >
                          <Users className="h-3 w-3" />
                          Client
                        </Link>
                      ) : (
                        <span className="text-xs text-[#6f6b62]/50">—</span>
                      )}
                    </span>
                    {showStageColumn && (
                      <span>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}
                        >
                          {opp.stage}
                        </span>
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[#063b32] tabular-nums whitespace-nowrap" title={value ?? undefined}>{value ?? "—"}</span>
                    <span className="text-xs text-[#6f6b62] tabular-nums text-center">{tasksOpen || "—"}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-[#111111] line-clamp-2" title={opp.next_action ?? undefined}>{opp.next_action ?? "—"}</p>
                      {opp.expected_decision_date && (
                        <p className="mt-0.5 text-[10px] text-[#6f6b62]">
                          By {new Date(opp.expected_decision_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}