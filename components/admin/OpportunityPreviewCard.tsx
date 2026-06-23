"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, ExternalLink, Pencil, Target } from "lucide-react";
import { EditOpportunityModal } from "@/components/admin/EditOpportunityModal";
import { OpportunityStageSelect } from "@/components/admin/OpportunityStageSelect";
import { CLIENT_SERVICE_STAGES, isClientServiceStage } from "@/lib/engagement/client-stages";
import { opportunityDetailPath } from "@/lib/engagement/opportunity-nav";
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
  hidePipelineLink = false,
  editable = false,
  clientContext = false,
  onUpdated,
  returnTo,
  returnLabel,
  openTaskCount,
}: {
  opportunity: EngagementOpportunity;
  defaultExpanded?: boolean;
  hidePipelineLink?: boolean;
  editable?: boolean;
  clientContext?: boolean;
  onUpdated?: (updated: EngagementOpportunity) => void;
  /** When set, clicking the card opens the full opportunity page and back returns here. */
  returnTo?: string;
  returnLabel?: string;
  openTaskCount?: number;
}) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState(initialOpportunity);
  const [expanded, setExpanded] = useState(defaultExpanded && !returnTo);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    setOpportunity(initialOpportunity);
  }, [initialOpportunity]);

  const stageColor = STAGE_COLORS[opportunity.stage] || "bg-gray-100 text-gray-600";
  const stages = stageOptionsFor(opportunity, clientContext);
  const fullViewHref = opportunityDetailPath(opportunity.id, { returnTo, returnLabel });

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

  const openFullView = () => {
    if (returnTo) {
      router.push(fullViewHref);
      return;
    }
    setExpanded((v) => !v);
  };

  return (
    <>
      <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden transition-colors hover:border-[#063b32]/20">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={openFullView}
            className="flex min-w-0 flex-1 items-center gap-3 text-left group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32]">{opportunity.title}</p>
              {opportunity.next_action && (
                <p className="mt-0.5 text-xs text-[#6f6b62] line-clamp-1">
                  <Target className="mr-1 inline h-3 w-3" />
                  {opportunity.next_action}
                </p>
              )}
              {openTaskCount != null && openTaskCount > 0 && (
                <p className="mt-0.5 text-xs text-amber-700">{openTaskCount} open task{openTaskCount === 1 ? "" : "s"}</p>
              )}
            </div>
            {returnTo ? (
              <ChevronRight className="h-4 w-4 shrink-0 text-[#6f6b62] group-hover:text-[#063b32]" />
            ) : (
              <span className="text-[10px] text-[#6f6b62]">{expanded ? "Less" : "More"}</span>
            )}
          </button>

          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {editable ? (
              <OpportunityStageSelect
                value={opportunity.stage}
                stages={stages}
                onChange={(stage) => void updateStage(stage)}
                loading={updatingStage}
              />
            ) : (
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stageColor}`}>
                {opportunity.stage}
              </span>
            )}
            {editable && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32]/30 hover:text-[#063b32]"
                title="Edit opportunity"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {returnTo && (
          <div className="border-t border-[#111111]/8 px-4 py-2">
            <Link
              href={fullViewHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#063b32] hover:underline"
            >
              View full record — tasks, activity &amp; history
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        {expanded && !returnTo && (
          <div className="border-t border-[#111111]/10 bg-[#f7f4ea]/30 px-4 py-4 space-y-3">
            {opportunity.next_action && (
              <div className="rounded-lg border border-[#111111]/10 bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Next action</p>
                <p className="mt-1 text-sm text-[#111111]">{opportunity.next_action}</p>
                {opportunity.expected_decision_date && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#6f6b62]">
                    <Calendar className="h-3 w-3" />
                    By{" "}
                    {new Date(opportunity.expected_decision_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#6f6b62]">
                Updated {new Date(opportunity.updated_at).toLocaleDateString("en-GB")}
              </span>
              {!hidePipelineLink && (
                <Link
                  href={fullViewHref}
                  className="inline-flex items-center gap-1 font-semibold text-[#063b32] hover:underline"
                >
                  Open full record <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {editable && (
        <EditOpportunityModal
          open={showEditModal}
          opportunity={opportunity}
          onClose={() => setShowEditModal(false)}
          onSaved={handleUpdated}
          clientContext={clientContext}
        />
      )}
    </>
  );
}