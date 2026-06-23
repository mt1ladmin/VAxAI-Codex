"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, ExternalLink, Target } from "lucide-react";
import type { EngagementOpportunity } from "@/lib/engagement/types";
import { STAGE_COLORS } from "@/lib/engagement/types";

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

export function OpportunityPreviewCard({
  opportunity,
  defaultExpanded = false,
  hidePipelineLink = false,
}: {
  opportunity: EngagementOpportunity;
  defaultExpanded?: boolean;
  /** Hide link to standalone opportunity detail (e.g. on client page). */
  hidePipelineLink?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const stageColor = STAGE_COLORS[opportunity.stage] || "bg-gray-100 text-gray-600";
  const contactName = opportunity.primary_contact
    ? `${opportunity.primary_contact.first_name} ${opportunity.primary_contact.last_name ?? ""}`.trim()
    : null;
  const valueLabel =
    opportunity.indicative_value_low || opportunity.indicative_value_high
      ? `£${(opportunity.indicative_value_low ?? 0).toLocaleString()} – £${(opportunity.indicative_value_high ?? 0).toLocaleString()}`
      : null;

  return (
    <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#f7f4ea]/50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#111111]">{opportunity.title}</p>
          {opportunity.next_action && (
            <p className="mt-0.5 text-xs text-[#6f6b62] line-clamp-1">Next: {opportunity.next_action}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stageColor}`}>
            {opportunity.stage}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#6f6b62] transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

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
  );
}