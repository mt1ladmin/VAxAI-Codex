"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Building2, Plus, TrendingUp } from "lucide-react";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity } from "@/lib/engagement/types";

const ACTIVE_STAGES = OPPORTUNITY_STAGES.filter(
  (s) => !["Won", "Onboarding", "Active client", "Lost", "Not suitable"].includes(s)
);
const CLOSED_WON = ["Won", "Onboarding", "Active client"];
const CLOSED_LOST = ["Lost", "Not suitable"];

export default function PipelinePage() {
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/engagement/opportunities?limit=200");
    const json = await res.json() as { data: EngagementOpportunity[] };
    setOpps(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const byStage = (stage: string) => opps.filter((o) => o.stage === stage);

  const totalValue = opps
    .filter((o) => !CLOSED_LOST.includes(o.stage))
    .reduce((sum, o) => sum + (o.indicative_value_high ?? o.indicative_value_low ?? 0), 0);

  const wonCount = opps.filter((o) => CLOSED_WON.includes(o.stage)).length;
  const activeCount = opps.filter((o) => ACTIVE_STAGES.includes(o.stage)).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111111]">Pipeline</h1>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-[#111111]/15 overflow-hidden">
              {(["kanban", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    view === v ? "bg-[#063b32] text-white" : "bg-white text-[#6f6b62] hover:text-[#111111]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Link
              href="/admin/engagement/pipeline/opportunities/new"
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> New opportunity
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-xs text-[#6f6b62]">Active</p>
            <p className="text-lg font-semibold text-[#111111]">{activeCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#6f6b62]">Won / clients</p>
            <p className="text-lg font-semibold text-[#111111]">{wonCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#6f6b62]">Pipeline value</p>
            <p className="text-lg font-semibold text-[#111111]">
              {totalValue > 0 ? `£${totalValue.toLocaleString()}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>
      ) : view === "kanban" ? (
        <div className="overflow-x-auto">
          <div className="flex gap-4 p-6 min-w-max">
            {ACTIVE_STAGES.map((stage) => {
              const items = byStage(stage);
              return (
                <div key={stage} className="w-64 shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[stage] || "bg-gray-100 text-gray-600"}`}>
                      {stage}
                    </span>
                    <span className="text-xs text-[#6f6b62]">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((opp) => (
                      <Link
                        key={opp.id}
                        href={`/admin/engagement/pipeline/opportunities/${opp.id}`}
                        className="block rounded-xl border border-[#111111]/10 bg-white p-3.5 hover:border-[#063b32]/30 hover:shadow-sm transition-all"
                      >
                        <p className="text-sm font-semibold text-[#111111] leading-snug">{opp.title}</p>
                        {opp.organisation && (
                          <p className="mt-1 text-xs text-[#6f6b62]">{opp.organisation.name}</p>
                        )}
                        {(opp.indicative_value_low || opp.indicative_value_high) && (
                          <p className="mt-2 text-xs font-semibold text-[#063b32]">
                            £{(opp.indicative_value_low ?? 0).toLocaleString()}
                            {opp.indicative_value_high ? ` – £${opp.indicative_value_high.toLocaleString()}` : ""}
                          </p>
                        )}
                        {opp.next_action && (
                          <p className="mt-1.5 text-[10px] text-[#6f6b62] line-clamp-2 border-t border-[#111111]/8 pt-1.5">
                            {opp.next_action}
                          </p>
                        )}
                      </Link>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[#111111]/15 py-6 text-center text-xs text-[#6f6b62]">
                        None
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Won / clients column */}
            <div className="w-64 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[#063b32]/10 text-[#063b32] px-2.5 py-0.5 text-[10px] font-semibold">Won / Clients</span>
                <span className="text-xs text-[#6f6b62]">{opps.filter((o) => CLOSED_WON.includes(o.stage)).length}</span>
              </div>
              <div className="space-y-2">
                {opps.filter((o) => CLOSED_WON.includes(o.stage)).map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/admin/engagement/pipeline/opportunities/${opp.id}`}
                    className="block rounded-xl border border-[#111111]/10 bg-white p-3.5 hover:border-[#063b32]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#063b32]" />
                      <div>
                        <p className="text-sm font-semibold text-[#111111] leading-snug">{opp.title}</p>
                        {opp.organisation && <p className="mt-0.5 text-xs text-[#6f6b62]">{opp.organisation.name}</p>}
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage]}`}>
                          {opp.stage}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List view */
        <div className="px-8 py-6">
          <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_180px_140px_120px_40px] bg-[#f7f4ea] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
              <span>Opportunity</span>
              <span>Stage</span>
              <span>Value</span>
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
                    className="grid grid-cols-[1fr_180px_140px_120px_40px] items-center px-5 py-3.5 hover:bg-[#f7f4ea] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">
                        {opp.title}
                      </p>
                      {opp.organisation && (
                        <p className="text-xs text-[#6f6b62]">{opp.organisation.name}</p>
                      )}
                    </div>
                    <span className={`justify-self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>
                      {opp.stage}
                    </span>
                    <span className="text-sm text-[#111111]">
                      {opp.indicative_value_low || opp.indicative_value_high
                        ? `£${(opp.indicative_value_low ?? 0).toLocaleString()}${opp.indicative_value_high ? `–${opp.indicative_value_high.toLocaleString()}` : ""}`
                        : "—"}
                    </span>
                    <span className="text-xs text-[#6f6b62] line-clamp-1 pr-2">{opp.next_action ?? "—"}</span>
                    <ArrowRight className="h-4 w-4 text-[#6f6b62] group-hover:text-[#063b32] transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
