"use client";

import { useEffect, useState } from "react";
import { OpportunityStageSelect } from "@/components/admin/OpportunityStageSelect";
import { CLIENT_SERVICE_STAGES, isClientServiceStage } from "@/lib/engagement/client-stages";
import { formatOpportunityValue } from "@/lib/engagement/pipeline-filters";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity } from "@/lib/engagement/types";

function stageOptionsFor(opp: EngagementOpportunity, clientContext: boolean): readonly string[] {
  if (clientContext || isClientServiceStage(opp.stage)) {
    return CLIENT_SERVICE_STAGES;
  }
  return OPPORTUNITY_STAGES.filter((s) => !isClientServiceStage(s));
}

export function OpportunityPreviewCard({
  opportunity: initialOpportunity,
  defaultExpanded = false,
  editable = false,
  clientContext = false,
  onUpdated,
  openTaskCount,
  dropUpStageSelect = false,
}: {
  opportunity: EngagementOpportunity;
  defaultExpanded?: boolean;
  editable?: boolean;
  clientContext?: boolean;
  onUpdated?: (updated: EngagementOpportunity) => void;
  openTaskCount?: number;
  dropUpStageSelect?: boolean;
}) {
  const [opportunity, setOpportunity] = useState(initialOpportunity);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    setOpportunity(initialOpportunity);
  }, [initialOpportunity]);

  const stageColor = STAGE_COLORS[opportunity.stage] || "bg-gray-100 text-gray-600";
  const stages = stageOptionsFor(opportunity, clientContext);
  const valueLabel = formatOpportunityValue(opportunity);

  const handleUpdated = (updated: EngagementOpportunity) => {
    setOpportunity(updated);
    onUpdated?.(updated);
  };

  const updateStage = async (stage: string) => {
    if (stage === opportunity.stage) return;
    setUpdatingStage(true);
    try {
      const res = await fetch(`/api/admin/engagement/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const j = await res.json() as { data?: EngagementOpportunity };
      if (j.data) handleUpdated(j.data);
    } finally {
      setUpdatingStage(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#111111]/10 bg-white overflow-visible transition-colors hover:border-[#063b32]/20">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32]">{opportunity.title}</p>
            {openTaskCount != null && openTaskCount > 0 && (
              <p className="mt-0.5 text-xs text-amber-700">{openTaskCount} open task{openTaskCount === 1 ? "" : "s"}</p>
            )}
          </div>
          <span className="text-[10px] text-[#6f6b62]">{expanded ? "Less" : "More"}</span>
        </button>

        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {editable ? (
            <OpportunityStageSelect
              value={opportunity.stage}
              stages={stages}
              onChange={(stage) => void updateStage(stage)}
              loading={updatingStage}
              dropUp={dropUpStageSelect}
            />
          ) : (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stageColor}`}>
              {opportunity.stage}
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#111111]/10 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[#6f6b62]">
              Updated {new Date(opportunity.updated_at).toLocaleDateString("en-GB")}
            </span>
          </div>

          {valueLabel && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Indicative value</p>
              <p className="mt-0.5 text-sm font-semibold text-[#063b32]">{valueLabel}</p>
            </div>
          )}

          {opportunity.desired_outcomes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Desired outcomes</p>
              <p className="mt-0.5 text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{opportunity.desired_outcomes}</p>
            </div>
          )}

          {opportunity.recommended_pathway && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Recommended pathway</p>
              <p className="mt-0.5 text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{opportunity.recommended_pathway}</p>
            </div>
          )}

          {opportunity.notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Notes</p>
              <p className="mt-0.5 text-sm text-[#6f6b62] whitespace-pre-wrap leading-relaxed">{opportunity.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}