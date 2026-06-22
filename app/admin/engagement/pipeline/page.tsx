"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckSquare,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { OpportunitySourceBadge } from "@/components/admin/OpportunitySourceBadge";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity, type EngagementTask } from "@/lib/engagement/types";
import { InsightsContent } from "../insights-content";

type Tab = "insights" | "pipeline";

const ACTIVE_STAGES = OPPORTUNITY_STAGES.filter(
  (s) => !["Won", "Onboarding", "Active client", "Lost", "Not suitable"].includes(s),
);
const CLOSED_WON = ["Won", "Onboarding", "Active client"];
const CLOSED_OTHER = ["Lost", "Not suitable"];

type BoardColumn = {
  id: string;
  label: string;
  stages: string[];
  dropStage: string;
};

const BOARD_COLUMNS: BoardColumn[] = [
  ...ACTIVE_STAGES.map((s) => ({ id: s, label: s, stages: [s], dropStage: s })),
  { id: "won", label: "Won / Clients", stages: CLOSED_WON, dropStage: "Won" },
  { id: "closed", label: "Closed / Other", stages: CLOSED_OTHER, dropStage: "Lost" },
];

const FILTERABLE_STAGES = [...ACTIVE_STAGES, ...CLOSED_WON, ...CLOSED_OTHER];

function formatValue(opp: EngagementOpportunity): string | null {
  if (!opp.indicative_value_low && !opp.indicative_value_high) return null;
  const low = opp.indicative_value_low ?? 0;
  const high = opp.indicative_value_high;
  if (high && high !== low) return `£${low.toLocaleString()}–£${high.toLocaleString()}`;
  return `£${low.toLocaleString()}`;
}

function stageValue(items: EngagementOpportunity[]): number {
  return items.reduce((sum, o) => sum + (o.indicative_value_high ?? o.indicative_value_low ?? 0), 0);
}

function OppCard({
  opp,
  taskCount,
  draggedId,
  onDragStart,
  onDragEnd,
  onOpen,
}: {
  opp: EngagementOpportunity;
  taskCount: number;
  draggedId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onOpen: (id: string) => void;
}) {
  const value = formatValue(opp);
  const isDragging = draggedId === opp.id;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onClick={() => { if (!draggedId) onOpen(opp.id); }}
      onKeyDown={(e) => { if (e.key === "Enter" && !draggedId) onOpen(opp.id); }}
      className={`cursor-grab active:cursor-grabbing rounded-xl border border-[#111111]/10 bg-white p-3.5 hover:border-[#063b32]/30 hover:shadow-sm transition-all ${isDragging ? "opacity-50" : ""}`}
    >
      <p className="text-sm font-semibold text-[#111111] leading-snug line-clamp-2">{opp.title}</p>
      {(opp.enquiry_id || opp.queue_id) && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <OpportunitySourceBadge opportunity={opp} compact />
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#111111]/8 pt-2.5">
        <span className="inline-flex items-center gap-1 text-xs text-[#6f6b62]">
          <CheckSquare className="h-3.5 w-3.5 shrink-0" />
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </span>
        <span className="text-xs font-semibold text-[#063b32] tabular-nums">
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  items,
  taskCounts,
  draggedId,
  dragOverStage,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpen,
}: {
  column: BoardColumn;
  items: EngagementOpportunity[];
  taskCounts: Record<string, number>;
  draggedId: string | null;
  dragOverStage: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onOpen: (id: string) => void;
}) {
  const isOver = dragOverStage === column.dropStage;
  const total = stageValue(items);
  const stageBadge = column.stages.length === 1 ? column.stages[0] : null;

  return (
    <div
      className={`flex w-[272px] shrink-0 flex-col rounded-xl border border-[#111111]/10 bg-white overflow-hidden transition-shadow ${
        isOver ? "shadow-md ring-1 ring-[#063b32]/20" : ""
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="border-b border-[#111111]/10 bg-[#f7f4ea] px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {stageBadge ? (
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[stageBadge] || "bg-gray-100 text-gray-600"}`}>
                {column.label}
              </span>
            ) : (
              <h3 className="text-xs font-semibold text-[#111111] leading-snug">{column.label}</h3>
            )}
            {total > 0 && (
              <p className="mt-1 text-[10px] font-medium text-[#6f6b62]">
                £{total.toLocaleString()}
              </p>
            )}
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#6f6b62] tabular-nums shrink-0">
            {items.length}
          </span>
        </div>
      </div>

      <div
        className={`min-h-[96px] max-h-[calc(100vh-300px)] overflow-y-auto p-2 space-y-2 transition-colors ${
          isOver ? "bg-[#063b32]/5" : "bg-white"
        }`}
      >
        {items.map((opp) => (
          <OppCard
            key={opp.id}
            opp={opp}
            taskCount={taskCounts[opp.id] ?? 0}
            draggedId={draggedId}
            onDragStart={() => onDragStart(opp.id)}
            onDragEnd={onDragEnd}
            onOpen={onOpen}
          />
        ))}
        {items.length === 0 && (
          <div
            className={`flex min-h-[72px] items-center justify-center rounded-xl border border-dashed px-3 py-5 text-center text-[11px] transition-colors ${
              isOver ? "border-[#063b32]/30 text-[#063b32]" : "border-[#111111]/10 text-[#6f6b62]/50"
            }`}
          >
            {isOver ? "Drop here" : "Empty"}
          </div>
        )}
      </div>
    </div>
  );
}

function StageFilterBar({
  selected,
  onToggle,
  onClear,
}: {
  selected: Set<string>;
  onToggle: (stage: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFiltering = selected.size > 0;

  return (
    <div className="border-b border-[#111111]/10 bg-white px-8 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6f6b62] shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Stage
        </div>
        <button
          type="button"
          onClick={onClear}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
            !isFiltering
              ? "bg-[#063b32] text-white"
              : "border border-[#111111]/15 text-[#6f6b62] hover:bg-[#f7f4ea]"
          }`}
        >
          All
        </button>
        {(expanded ? FILTERABLE_STAGES : FILTERABLE_STAGES.slice(0, 6)).map((stage) => {
          const active = selected.has(stage);
          return (
            <button
              key={stage}
              type="button"
              onClick={() => onToggle(stage)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-[#063b32] text-white"
                  : "border border-[#111111]/12 bg-white text-[#6f6b62] hover:border-[#063b32]/25 hover:text-[#111111]"
              }`}
            >
              {stage}
            </button>
          );
        })}
        {FILTERABLE_STAGES.length > 6 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-[#111111]/15 px-3 py-1 text-[11px] font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
          >
            {expanded ? "Fewer" : "More"}
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
        {isFiltering && (
          <span className="text-[11px] text-[#6f6b62]">
            {selected.size} selected
          </span>
        )}
      </div>
    </div>
  );
}

function PipelinePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("insights");
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "pipeline") setTab("pipeline");
    else setTab("insights");
  }, [searchParams]);

  const switchTab = (key: Tab) => {
    setTab(key);
    router.replace(key === "insights" ? "/admin/engagement/pipeline?tab=insights" : "/admin/engagement/pipeline?tab=pipeline");
  };

  const load = useCallback(async () => {
    if (tab !== "pipeline") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [oppsRes, tasksRes] = await Promise.all([
      fetch("/api/admin/engagement/opportunities?limit=200"),
      fetch("/api/admin/engagement/tasks?limit=500"),
    ]);
    const [oppsJson, tasksJson] = await Promise.all([
      oppsRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      tasksRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setOpps(oppsJson.data || []);
    const counts: Record<string, number> = {};
    for (const task of tasksJson.data || []) {
      if (task.opportunity_id) {
        counts[task.opportunity_id] = (counts[task.opportunity_id] ?? 0) + 1;
      }
    }
    setTaskCounts(counts);
    setLoading(false);
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  const toggleStageFilter = (stage: string) => {
    setStageFilter((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  const visibleColumns = useMemo(() => {
    const hasWon = opps.some((o) => CLOSED_WON.includes(o.stage));
    const hasClosed = opps.some((o) => CLOSED_OTHER.includes(o.stage));
    return BOARD_COLUMNS.filter((col) => {
      if (col.id === "won" && !hasWon) return false;
      if (col.id === "closed" && !hasClosed) return false;
      if (stageFilter.size === 0) return true;
      return col.stages.some((s) => stageFilter.has(s));
    });
  }, [opps, stageFilter]);

  const itemsForColumn = (col: BoardColumn) => {
    let items = opps.filter((o) => col.stages.includes(o.stage));
    if (stageFilter.size > 0) items = items.filter((o) => stageFilter.has(o.stage));
    return items;
  };

  const stats = useMemo(() => {
    const open = opps.filter((o) => !["Lost", "Not suitable", "Won", "Onboarding", "Active client"].includes(o.stage));
    const won = opps.filter((o) => CLOSED_WON.includes(o.stage));
    const pipelineValue = open.reduce((s, o) => s + (o.indicative_value_high ?? o.indicative_value_low ?? 0), 0);
    return { openCount: open.length, wonCount: won.length, pipelineValue };
  }, [opps]);

  const handleDrop = async (targetStage: string) => {
    if (!draggedId) return;
    const opp = opps.find((o) => o.id === draggedId);
    if (!opp || opp.stage === targetStage) { setDraggedId(null); setDragOverStage(null); return; }
    setOpps((prev) => prev.map((o) => o.id === draggedId ? { ...o, stage: targetStage as EngagementOpportunity["stage"] } : o));
    setDraggedId(null);
    setDragOverStage(null);
    await fetch(`/api/admin/engagement/opportunities/${draggedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: targetStage }),
    });
  };

  const columnHandlers = (stage: string) => ({
    onDragOver: (e: DragEvent) => { e.preventDefault(); setDragOverStage(stage); },
    onDragLeave: (e: DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStage(null); },
    onDrop: (e: DragEvent) => { e.preventDefault(); void handleDrop(stage); },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 border-b border-[#111111]/10 bg-white px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-[#111111]">Pipeline & CRM</span>
          <div className="ml-3 flex overflow-hidden rounded-lg border border-[#111111]/15">
            {([
              ["insights", "Insights"],
              ["pipeline", "Pipeline"],
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
            <p className="mt-0.5 text-sm text-[#6f6b62]">An at-a-glance view of your pipeline and activity.</p>
          </div>
          <InsightsContent />
        </>
      )}

      {tab === "pipeline" && (
        <div className="flex min-h-[calc(100vh-49px)] flex-col bg-[#f7f4ea]/40">
          <div className="border-b border-[#111111]/8 bg-white/90 px-8 py-3 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
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

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-[#111111]/15 overflow-hidden bg-white">
                  {([
                    ["kanban", "Board", LayoutGrid],
                    ["list", "List", List],
                  ] as const).map(([v, label, Icon]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                        view === v ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                <Link
                  href="/admin/engagement/pipeline/opportunities/new"
                  className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1a5c42]"
                >
                  <Plus className="h-4 w-4" /> New opportunity
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            view === "kanban" ? (
              <div className="flex flex-1 gap-3 overflow-hidden bg-white px-8 py-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-[272px] shrink-0 space-y-2">
                    <div className="h-14 rounded-xl border border-[#111111]/10 bg-[#f7f4ea] animate-pulse" />
                    <div className="h-[72px] rounded-xl border border-[#111111]/10 bg-white animate-pulse" />
                    <div className="h-[72px] rounded-xl border border-[#111111]/10 bg-white animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>
            )
          ) : view === "kanban" ? (
            <>
              <StageFilterBar
                selected={stageFilter}
                onToggle={toggleStageFilter}
                onClear={() => setStageFilter(new Set())}
              />
              <div className="flex-1 overflow-x-auto bg-white px-8 py-5">
                {visibleColumns.length === 0 ? (
                  <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
                    <p className="text-sm font-semibold text-[#111111]">No stages match your filter</p>
                    <button
                      type="button"
                      onClick={() => setStageFilter(new Set())}
                      className="mt-3 text-sm font-semibold text-[#063b32] hover:underline"
                    >
                      Clear filter
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 min-w-max pb-2 items-start">
                    {visibleColumns.map((col) => (
                      <KanbanColumn
                        key={col.id}
                        column={col}
                        items={itemsForColumn(col)}
                        taskCounts={taskCounts}
                        draggedId={draggedId}
                        dragOverStage={dragOverStage}
                        onDragStart={setDraggedId}
                        onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                        onOpen={(oppId) => router.push(`/admin/engagement/pipeline/opportunities/${oppId}`)}
                        {...columnHandlers(col.dropStage)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 px-8 py-5">
              <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden shadow-sm">
                <div className="grid grid-cols-[minmax(200px,1.5fr)_minmax(120px,1fr)_100px_120px_minmax(140px,1fr)_32px] gap-3 bg-[#ebe8df] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                  <span>Opportunity</span>
                  <span>Organisation</span>
                  <span>Value</span>
                  <span>Probability</span>
                  <span>Next action</span>
                  <span />
                </div>
                {opps.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#6f6b62]">
                    <Building2 className="mx-auto h-8 w-8 text-[#6f6b62]/30 mb-3" />
                    No opportunities yet.{" "}
                    <Link href="/admin/engagement/pipeline/opportunities/new" className="text-[#063b32] hover:underline">
                      Add one
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#111111]/5">
                    {opps.map((opp) => (
                      <div
                        key={opp.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`);
                        }}
                        className="grid grid-cols-[minmax(200px,1.5fr)_minmax(120px,1fr)_100px_120px_minmax(140px,1fr)_32px] gap-3 items-center px-5 py-3.5 hover:bg-[#f7f4ea]/60 transition-colors group cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors truncate">
                            {opp.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>
                              {opp.stage}
                            </span>
                            {(opp.enquiry_id || opp.queue_id) && (
                              <span onClick={(e) => e.stopPropagation()}>
                                <OpportunitySourceBadge opportunity={opp} compact />
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-[#6f6b62] truncate">
                          {opp.organisation?.name ?? "—"}
                        </span>
                        <span className="text-xs font-semibold text-[#063b32]">
                          {formatValue(opp) ?? "—"}
                        </span>
                        <span className="text-xs text-[#6f6b62]">
                          {opp.probability != null ? `${opp.probability}%` : "—"}
                        </span>
                        <span className="text-xs text-[#6f6b62] line-clamp-1">{opp.next_action ?? "—"}</span>
                        <ArrowRight className="h-4 w-4 text-[#6f6b62]/40 group-hover:text-[#063b32] transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white px-8 py-16 text-sm text-[#6f6b62]">Loading pipeline…</div>}>
      <PipelinePageInner />
    </Suspense>
  );
}