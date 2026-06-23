"use client";

import { Loader2, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";

type ProspectPayload = ProspectOutreachRecord & { review_notes?: string | null };
import { ProspectResearchPanel } from "@/components/admin/ProspectResearchPanel";

type Props = {
  open: boolean;
  prospects: ProspectPayload[];
  onClose: () => void;
  onAdded: (queueIds: string[]) => void;
};

export function AddToProspectQueueModal({ open, prospects, onClose, onAdded }: Props) {
  const [drafts, setDrafts] = useState<ProspectPayload[]>(prospects);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDrafts(prospects);
      setActiveIndex(0);
      setError("");
    }
  }, [open, prospects]);

  if (!open) return null;

  const active = drafts[activeIndex];

  const updateDraft = (next: ProspectPayload) => {
    setDrafts((prev) => prev.map((p, i) => (i === activeIndex ? { ...next, review_notes: p.review_notes } : p)));
  };

  const updateReviewNotes = (notes: string) => {
    setDrafts((prev) => prev.map((p, i) => (i === activeIndex ? { ...p, review_notes: notes } : p)));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/engagement/prospect-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospects: drafts }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add to queue");
      onAdded((json.data || []).map((r: { id: string }) => r.id));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add to queue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">Add to Prospect Queue</h2>
            <p className="text-xs text-[#6f6b62]">
              Review and edit research before adding. {drafts.length} prospect{drafts.length === 1 ? "" : "s"} selected.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {drafts.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-[#111111]/10 px-6 py-2">
            {drafts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  i === activeIndex ? "bg-[#063b32] text-white" : "bg-[#f7f4ea] text-[#063b32]"
                }`}
              >
                {p.organisation_name}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto px-6 py-5">
          {active && (
            <>
              <ProspectResearchPanel data={active} editable onChange={updateDraft} />
              <div className="mt-4 rounded-xl border border-[#111111]/10 p-4 space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                  Reviewer notes for prospect queue
                </label>
                <textarea
                  value={active.review_notes || ""}
                  onChange={(e) => updateReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                  placeholder="Handoff notes — visible on the prospect queue as team notes"
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="px-6 pb-2 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Add to Prospect Queue
          </button>
        </div>
      </div>
    </div>
  );
}