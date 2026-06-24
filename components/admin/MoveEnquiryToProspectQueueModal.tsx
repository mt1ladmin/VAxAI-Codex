"use client";

import { Loader2, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MOVE_TO_PROSPECT_QUEUE_LABEL, PRE_SALES_STATUS } from "@/lib/engagement/journey";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { activeTeamMemberOptions } from "@/lib/engagement/team-members";

type Props = {
  open: boolean;
  enquiry: {
    id: string;
    name: string;
    support_type: string;
    details: string;
    status: string;
  } | null;
  teamMembers: StudioTeamMember[];
  onClose: () => void;
  onMoved: (result: { contact_id: string }) => void;
};

export function MoveEnquiryToProspectQueueModal({
  open,
  enquiry,
  teamMembers,
  onClose,
  onMoved,
}: Props) {
  const [opportunityDescription, setOpportunityDescription] = useState("");
  const [assignedId, setAssignedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && enquiry) {
      setOpportunityDescription(
        `${enquiry.support_type}: ${enquiry.details}`.slice(0, 500),
      );
      setAssignedId("");
      setError("");
    }
  }, [open, enquiry]);

  if (!open || !enquiry) return null;

  const options = activeTeamMemberOptions(teamMembers);
  const canSubmit =
    opportunityDescription.trim().length > 0 &&
    assignedId &&
    enquiry.status === PRE_SALES_STATUS;

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}/move-to-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_description: opportunityDescription.trim(),
          assigned_team_member_id: assignedId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to move to Prospect Queue");
      onMoved({ contact_id: json.data.contact_id });
      onClose();
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
            <p className="text-xs text-[#6f6b62]">{enquiry.name} — website enquiry</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-6 py-5">
          {enquiry.status !== PRE_SALES_STATUS && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
              Set enquiry status to <span className="font-semibold">{PRE_SALES_STATUS}</span> before moving to Prospect Queue.
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
              Identified opportunity <span className="text-red-500">*</span>
            </label>
            <textarea
              value={opportunityDescription}
              onChange={(e) => setOpportunityDescription(e.target.value)}
              rows={4}
              placeholder="Summarise the inbound need and why it is worth pursuing."
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
              className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">Select team member</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-[#6f6b62]">
            Creates a Prospect Queue record at <span className="font-semibold">Identified</span> — same as promoting from Prospect Finder.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {MOVE_TO_PROSPECT_QUEUE_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}