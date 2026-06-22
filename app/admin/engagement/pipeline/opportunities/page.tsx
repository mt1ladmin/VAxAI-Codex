"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, TrendingUp } from "lucide-react";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity } from "@/lib/engagement/types";

export default function OpportunitiesPage() {
  const [stage, setStage] = useState("");
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stage) params.set("stage", stage);
    params.set("limit", "200");
    const res = await fetch(`/api/admin/engagement/opportunities?${params}`);
    const json = await res.json() as { data: EngagementOpportunity[] };
    setOpps(json.data || []);
    setLoading(false);
  }, [stage]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Pipeline</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111111]">Opportunities</h1>
          <Link
            href="/admin/engagement/pipeline/opportunities/new"
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-4 w-4" /> New opportunity
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stage filter */}
        <div className="mb-5">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          >
            <option value="">All stages</option>
            {OPPORTUNITY_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : opps.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm font-semibold text-[#111111]">No opportunities found</p>
            <Link
              href="/admin/engagement/pipeline/opportunities/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> Add opportunity
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-[#6f6b62]">{opps.length} opportunit{opps.length !== 1 ? "ies" : "y"}</p>
            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_180px_160px_120px_40px] bg-[#f7f4ea] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                <span>Opportunity</span>
                <span>Stage</span>
                <span>Value</span>
                <span>Next action</span>
                <span />
              </div>
              <div className="divide-y divide-[#111111]/5">
                {opps.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/admin/engagement/pipeline/opportunities/${opp.id}`}
                    className="grid grid-cols-[1fr_180px_160px_120px_40px] items-center px-5 py-3.5 hover:bg-[#f7f4ea] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">{opp.title}</p>
                      {opp.organisation && <p className="text-xs text-[#6f6b62]">{opp.organisation.name}</p>}
                    </div>
                    <span className={`justify-self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>
                      {opp.stage}
                    </span>
                    <span className="text-sm text-[#111111]">
                      {opp.indicative_value_low || opp.indicative_value_high
                        ? `£${(opp.indicative_value_low ?? 0).toLocaleString()}–${(opp.indicative_value_high ?? 0).toLocaleString()}`
                        : "—"}
                    </span>
                    <span className="text-xs text-[#6f6b62] line-clamp-1 pr-2">{opp.next_action ?? "—"}</span>
                    <ArrowRight className="h-4 w-4 text-[#6f6b62] group-hover:text-[#063b32] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
