"use client";

import Link from "next/link";
import { CheckCircle, Loader2, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MOVE_TO_PROSPECT_QUEUE_LABEL, prospectQueueDetailPath } from "@/lib/engagement/journey";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { activeTeamMemberOptions } from "@/lib/engagement/team-members";

type Props = {
  open: boolean;
  prospect: ProspectFinderListItem | null;
  teamMembers: StudioTeamMember[];
  onClose: () => void;
  onMoved: (result: { opportunity_id: string; contact_id: string }) => void;
};

export function MoveToProspectQueueModal({
  open,
  prospect,
  teamMembers,
  onClose,
  onMoved,
}: Props) {
  const [opportunityDescription, setOpportunityDescription] = useState("");
  const [assignedId, setAssignedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [movedResult, setMovedResult] = useState<{ contact_id: string; opportunity_id: string } | null>(null);

  useEffect(() => {
    if (open && prospect) {
      setOpportunityDescription(prospect.opportunity_description || "");
      setAssignedId(prospect.assigned_team_member_id || "");
      setError("");
      setMovedResult(null);
    }
  }, [open, prospect]);

  if (!open || !prospect) return null;

  const options = activeTeamMemberOptions(teamMembers);
  const canSubmit =
    opportunityDescription.trim().length > 0 &&
    assignedId &&
    prospect.engagement_status === "Opportunity identified";

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/engagement/prospect-outreach/move-to-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outreach_id: prospect.id,
          opportunity_description: opportunityDescription.trim(),
          assigned_team_member_id: assignedId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to move to Prospect Queue");
      setMovedResult({
        contact_id: json.data.contact_id,
        opportunity_id: json.data.opportunity_id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to move to Prospect Queue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{MOVE_TO_PROSPECT_QUEUE_LABEL}</h2>
            <p className="text-xs text-[#6f6b62]">{prospect.organisation_name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-6 py-5">
          {movedResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <CheckCircle className="h-5 w-5 shrink-0" />
                Moved to Prospect Queue at <span className="font-semibold">Identified</span>.
              </div>
              <p className="text-sm font-semibold text-[#111111]">Suggested next steps</p>
              <ul className="space-y-2 text-sm text-[#6f6b62]">
                <li>• Set the first next action on the queue record</li>
                <li>• Create an outreach or discovery task with a due date</li>
                <li>• Attach sector / persona knowledge if not already linked</li>
              </ul>
            </div>
          ) : null}
          {!movedResult && prospect.engagement_status !== "Opportunity identified" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
              Set engagement status to <span className="font-semibold">Opportunity identified</span> before moving to Prospect Queue.
            </div>
          )}

          {!movedResult && (
            <>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                  Identified opportunity <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={opportunityDescription}
                  onChange={(e) => setOpportunityDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the opportunity clearly — what the organisation needs and why we should pursue it."
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                  Responsible team member <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignedId}
                  onChange={(e) => setAssignedId(e.target.value)}
                  className="w-full rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm appearance-none outline-none focus:border-[#063b32]"
                >
                  <option value="">Select team member</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
          >
            {movedResult ? "Close" : "Cancel"}
          </button>
          {movedResult ? (
            <Link
              href={prospectQueueDetailPath(movedResult.contact_id, "tasks")}
              onClick={() => {
                onMoved(movedResult);
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              Open queue record
            </Link>
          ) : (
            <button
              type="button"
              disabled={submitting || !canSubmit}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {MOVE_TO_PROSPECT_QUEUE_LABEL}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}