"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, ExternalLink, Pencil, Target } from "lucide-react";
import { EditOpportunityModal } from "@/components/admin/EditOpportunityModal";
import { OpportunityStageSelect } from "@/components/admin/OpportunityStageSelect";
import { CLIENT_SERVICE_STAGES, isClientServiceStage } from "@/lib/engagement/client-stages";
import { OPPORTUNITY_STAGES, STAGE_COLORS, type EngagementOpportunity } from "@/lib/engagement/types";

function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string | number | null | undefined;
  multiline?: boolean;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
      <p className={`mt-0.5 text-sm text-[#111111] ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}>
        {value}
      </p>
    </div>
  );
}

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
}: {
  opportunity: EngagementOpportunity;
  defaultExpanded?: boolean;
  hidePipelineLink?: boolean;
  editable?: boolean;
  clientContext?: boolean;
  onUpdated?: (updated: EngagementOpportunity) => void;
}) {
  const [opportunity, setOpportunity] = useState(initialOpportunity);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    setOpportunity(initialOpportunity);
  }, [initialOpportunity]);

  const stageColor = STAGE_COLORS[opportunity.stage] || "bg-gray-100 text-gray-600";
  const contactName = opportunity.primary_contact
    ? `${opportunity.primary_contact.first_name} ${opportunity.primary_contact.last_name ?? ""}`.trim()
    : null;
  const valueLabel =
    opportunity.indicative_value_low || opportunity.indicative_value_high
      ? `£${(opportunity.indicative_value_low ?? 0).toLocaleString()} – £${(opportunity.indicative_value_high ?? 0).toLocaleString()}`
      : null;
  const stages = stageOptionsFor(opportunity, clientContext);

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
    <>
      <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left hover:opacity-80"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111111]">{opportunity.title}</p>
              {opportunity.next_action && (
                <p className="mt-0.5 text-xs text-[#6f6b62] line-clamp-1">Next: {opportunity.next_action}</p>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${expanded ? "rotate-180" : ""}`}
            />
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

        {expanded && (
          <div className="border-t border-[#111111]/10 bg-[#f7f4ea]/30 px-4 py-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Organisation" value={opportunity.organisation?.name} />
              <DetailField label="Primary contact" value={contactName} />
              <DetailField label="Indicative value" value={valueLabel} />
              <DetailField
                label="Probability"
                value={opportunity.probability != null ? `${opportunity.probability}%` : null}
              />
              <DetailField
                label="Expected decision"
                value={
                  opportunity.expected_decision_date
                    ? new Date(opportunity.expected_decision_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : null
                }
              />
              <DetailField label="Owner" value={opportunity.owner_email} />
              <DetailField label="Recommended pathway" value={opportunity.recommended_pathway} />
              <DetailField label="Loss / pause reason" value={opportunity.loss_pause_reason} />
            </div>

            <DetailField label="Desired outcomes" value={opportunity.desired_outcomes} multiline />
            <DetailField label="Notes" value={opportunity.notes} multiline />

            {opportunity.next_action && (
              <div className="rounded-lg border border-[#111111]/10 bg-white px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                  <Target className="h-3 w-3" /> Next action
                </p>
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

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="text-[#6f6b62]">
                Updated {new Date(opportunity.updated_at).toLocaleDateString("en-GB")}
              </span>
              {!hidePipelineLink && (
                <Link
                  href={`/admin/engagement/pipeline/opportunities/${opportunity.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#063b32] hover:underline"
                >
                  Open in pipeline <ExternalLink className="h-3 w-3" />
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