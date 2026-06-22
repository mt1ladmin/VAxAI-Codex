"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Calendar,
  GripVertical,
  LayoutGrid,
  List,
  Plus,
  User,
} from "lucide-react";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity } from "@/lib/engagement/types";
import { InsightsContent } from "../insights-content";

type Tab = "insights" | "pipeline";

const ACTIVE_STAGES = OPPORTUNITY_STAGES.filter(
  (s) => !["Won", "Onboarding", "Active client", "Lost", "Not suitable"].includes(s),
);
const CLOSED_WON = ["Won", "Onboarding", "Active client"];
const CLOSED_OTHER = ["Lost", "Not suitable", "Paused", "Nurture"];

const STAGE_ACCENT: Record<string, string> = {
  Identified: "bg-gray-400",
  Researching: "bg-blue-500",
  "Ready to contact": "bg-indigo-500",
  Contacted: "bg-violet-500",
  "Response received": "bg-purple-500",
  "Discovery booked": "bg-amber-500",
  "Discovery completed": "bg-yellow-500",
  "Workflow review proposed": "bg-orange-500",
  "Proposal sent": "bg-cyan-500",
  "Decision pending": "bg-teal-500",
  Won: "bg-[#063b32]",
  Onboarding: "bg-emerald-500",
  "Active client": "bg-green-500",
  Nurture: "bg-sky-500",
  Paused: "bg-slate-400",
  Lost: "bg-red-400",
  "Not suitable": "bg-gray-400",
};

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

function contactLabel(opp: EngagementOpportunity): string | null {
  if (!opp.primary_contact) return null;
  return `${opp.primary_contact.first_name} ${opp.primary_contact.last_name ?? ""}`.trim();
}

function OppCard({
  opp,
  draggedId,
  onDragStart,
  onDragEnd,
  variant = "default",
}: {
  opp: EngagementOpportunity;
  draggedId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  variant?: "default" | "won";
}) {
  const value = formatValue(opp);
  const contact = contactLabel(opp);
  const isDragging = draggedId === opp.id;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group/card transition-all ${isDragging ? "opacity-40 scale-[0.98]" : ""}`}
    >
      <Link
        href={`/admin/engagement/pipeline/opportunities/${opp.id}`}
        className="block rounded-lg border border-[#111111]/8 bg-white p-3 shadow-sm hover:border-[#063b32]/25 hover:shadow-md transition-all"
        onClick={(e) => { if (draggedId) e.preventDefault(); }}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 shrink-0 mt-0.5 text-[#6f6b62]/25 group-hover/card:text-[#6f6b62]/50 cursor-grab active:cursor-grabbing" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111111] leading-snug line-clamp-2">{opp.title}</p>

            {opp.organisation && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-[#6f6b62]">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{opp.organisation.name}</span>
              </p>
            )}

            {contact && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[#6f6b62]">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{contact}</span>
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {value && (
                <span className="rounded-md bg-[#063b32]/8 px-2 py-0.5 text-[10px] font-semibold text-[#063b32]">
                  {value}
                </span>
              )}
              {opp.probability != null && (
                <span className="rounded-md bg-[#f7f4ea] px-2 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                  {opp.probability}%
                </span>
              )}
              {variant === "won" && (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage]}`}>
                  {opp.stage}
                </span>
              )}
            </div>

            {opp.next_action && (
              <div className="mt-2.5 rounded-md bg-[#f7f4ea]/80 px-2 py-1.5 border border-[#111111]/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Next</p>
                <p className="text-[11px] text-[#111111] line-clamp-2 leading-snug">{opp.next_action}</p>
                {opp.expected_decision_date && (
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#6f6b62]">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(opp.expected_decision_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function KanbanColumn({
  stage,
  label,
  items,
  draggedId,
  dragOverStage,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  accentClass,
}: {
  stage: string;
  label?: string;
  items: EngagementOpportunity[];
  draggedId: string | null;
  dragOverStage: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  accentClass?: string;
}) {
  const isOver = dragOverStage === stage;
  const total = stageValue(items);
  const displayLabel = label ?? stage;

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl transition-all ${
        isOver ? "ring-2 ring-[#063b32]/30 ring-offset-2" : ""
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="rounded-t-xl border border-b-0 border-[#111111]/10 bg-[#ebe8df] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accentClass ?? STAGE_ACCENT[stage] ?? "bg-gray-400"}`} />
          <h3 className="flex-1 text-xs font-semibold text-[#111111] leading-tight">{displayLabel}</h3>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#6f6b62] tabular-nums">
            {items.length}
          </span>
        </div>
        {total > 0 && (
          <p className="mt-1 pl-5 text-[10px] font-medium text-[#6f6b62]">
            £{total.toLocaleString()} pipeline
          </p>
        )}
      </div>

      <div
        className={`flex-1 min-h-[120px] max-h-[calc(100vh-240px)] overflow-y-auto rounded-b-xl border border-[#111111]/10 bg-[#f4f1e8]/70 px-2 py-2 space-y-2 transition-colors ${
          isOver ? "bg-[#063b32]/5" : ""
        }`}
      >
        {items.map((opp) => (
          <OppCard
            key={opp.id}
            opp={opp}
            draggedId={draggedId}
            onDragStart={() => onDragStart(opp.id)}
            onDragEnd={onDragEnd}
            variant={CLOSED_WON.includes(opp.stage) ? "won" : "default"}
          />
        ))}
        {items.length === 0 && (
          <div
            className={`flex min-h-[80px] items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center text-xs transition-colors ${
              isOver ? "border-[#063b32]/40 bg-[#063b32]/5 text-[#063b32]" : "border-[#111111]/12 text-[#6f6b62]/60"
            }`}
          >
            {isOver ? "Drop here" : "No cards"}
          </div>
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
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
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
    const res = await fetch("/api/admin/engagement/opportunities?limit=200");
    const json = await res.json() as { data: EngagementOpportunity[] };
    setOpps(json.data || []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  const byStage = (stage: string) => opps.filter((o) => o.stage === stage);

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
            <div className="flex flex-1 gap-4 overflow-hidden px-8 py-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-72 shrink-0 space-y-2">
                  <div className="h-14 rounded-xl bg-[#ebe8df] animate-pulse" />
                  <div className="h-24 rounded-lg bg-white/60 animate-pulse" />
                  <div className="h-24 rounded-lg bg-white/60 animate-pulse" />
                </div>
              ))}
            </div>
          ) : view === "kanban" ? (
            <div className="flex-1 overflow-x-auto px-8 py-5">
              <div className="flex gap-3 min-w-max pb-2 items-start">
                {ACTIVE_STAGES.map((stage) => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    items={byStage(stage)}
                    draggedId={draggedId}
                    dragOverStage={dragOverStage}
                    onDragStart={setDraggedId}
                    onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                    {...columnHandlers(stage)}
                  />
                ))}

                <KanbanColumn
                  stage="Won"
                  label="Won / Clients"
                  items={opps.filter((o) => CLOSED_WON.includes(o.stage))}
                  draggedId={draggedId}
                  dragOverStage={dragOverStage}
                  onDragStart={setDraggedId}
                  onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                  accentClass="bg-[#063b32]"
                  {...columnHandlers("Won")}
                />

                {CLOSED_OTHER.some((s) => byStage(s).length > 0) && (
                  <KanbanColumn
                    stage="Lost"
                    label="Closed / Other"
                    items={opps.filter((o) => CLOSED_OTHER.includes(o.stage))}
                    draggedId={draggedId}
                    dragOverStage={dragOverStage}
                    onDragStart={setDraggedId}
                    onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                    accentClass="bg-gray-400"
                    {...columnHandlers("Lost")}
                  />
                )}
              </div>
            </div>
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
                      <Link
                        key={opp.id}
                        href={`/admin/engagement/pipeline/opportunities/${opp.id}`}
                        className="grid grid-cols-[minmax(200px,1.5fr)_minmax(120px,1fr)_100px_120px_minmax(140px,1fr)_32px] gap-3 items-center px-5 py-3.5 hover:bg-[#f7f4ea]/60 transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors truncate">
                            {opp.title}
                          </p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>
                            {opp.stage}
                          </span>
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
                      </Link>
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