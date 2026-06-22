"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import type { KnowledgeDraft } from "@/lib/engagement/types";

// ----------------------------------------------------------------
// Reject modal
// ----------------------------------------------------------------
function RejectModal({
  draft,
  onClose,
  onRejected,
}: {
  draft: KnowledgeDraft;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReject = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/knowledge-drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected", reviewer_notes: notes }),
    });
    setSaving(false);
    onRejected();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Reject draft</h2>
          <button onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-[#6f6b62]">
            You are rejecting: <span className="font-semibold text-[#111111]">{draft.title}</span>
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">
              Reason for rejection (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Duplicate of an existing pain point, too narrow, not accurate…"
              className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none"
            />
          </div>
        </div>
        <div className="border-t border-[#111111]/10 px-6 py-4 flex gap-3">
          <button
            onClick={handleReject}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {saving ? "Rejecting…" : "Reject draft"}
          </button>
          <button onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// List item → can expand to show full draft
// ----------------------------------------------------------------
function DraftCard({
  draft,
  onStatusChange,
}: {
  draft: KnowledgeDraft;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [full, setFull] = useState<KnowledgeDraft | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleExpand = async () => {
    if (!expanded && !full) {
      setLoadingFull(true);
      const res = await fetch(`/api/admin/engagement/knowledge-drafts/${draft.id}`);
      const j = await res.json() as { data: KnowledgeDraft };
      setFull(j.data);
      setLoadingFull(false);
    }
    setExpanded((v) => !v);
  };

  const handleApprove = async () => {
    setApproving(true);
    await fetch(`/api/admin/engagement/knowledge-drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved", reviewed_at: new Date().toISOString() }),
    });
    setApproving(false);
    onStatusChange();
  };

  const displayData = full || draft;

  const ArrayField = ({ label, items }: { label: string; items: string[] | null | undefined }) => {
    if (!items?.length) return null;
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">{label}</p>
        <ul className="space-y-0.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-[#111111] pl-3 border-l-2 border-[#063b32]/20">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {showRejectModal && (
        <RejectModal
          draft={draft}
          onClose={() => setShowRejectModal(false)}
          onRejected={onStatusChange}
        />
      )}
      <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
        {/* Card header */}
        <div
          className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-[#f7f4ea]/50 transition-colors"
          onClick={handleExpand}
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100">
            <Bot className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[#111111]">{draft.title}</p>
              {draft.category && (
                <span className="rounded-full bg-[#063b32]/10 px-2 py-0.5 text-[10px] font-semibold text-[#063b32]">
                  {draft.category}
                </span>
              )}
            </div>
            {draft.source_phrase && (
              <p className="mt-0.5 text-xs text-[#6f6b62]">
                Source: &ldquo;{draft.source_phrase}&rdquo;
              </p>
            )}
            <p className="mt-0.5 text-[10px] text-[#6f6b62]">
              {new Date(draft.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleApprove(); }}
              disabled={approving}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Approve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowRejectModal(true); }}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <XCircle className="h-3 w-3" /> Reject
            </button>
            <div className="ml-1">
              {expanded ? <ChevronUp className="h-4 w-4 text-[#6f6b62]" /> : <ChevronDown className="h-4 w-4 text-[#6f6b62]" />}
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-[#111111]/10 px-5 py-5 bg-[#f7f4ea]/30">
            {loadingFull ? (
              <div className="flex items-center gap-2 text-sm text-[#6f6b62] py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading full draft…
              </div>
            ) : (
              <div className="space-y-4">
                {displayData.plain_english_definition && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Plain English definition</p>
                    <p className="text-sm text-[#111111]">{displayData.plain_english_definition}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ArrayField label="Things they say" items={displayData.what_person_says} />
                  <ArrayField label="What this means" items={displayData.what_this_means} />
                  <ArrayField label="What not to assume" items={displayData.what_not_assume} />
                  <ArrayField label="Common root causes" items={displayData.common_root_causes} />
                  <ArrayField label="Natural questions" items={displayData.natural_questions} />
                  <ArrayField label="Possible automation" items={displayData.possible_automation} />
                  <ArrayField label="Possible AI" items={displayData.possible_ai} />
                  <ArrayField label="VA responsibilities" items={displayData.human_va_responsibilities} />
                  <ArrayField label="Recommendation pathways" items={displayData.recommendation_pathways} />
                  <ArrayField label="Tags" items={displayData.tags} />
                </div>
                {draft.reviewer_notes && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-xs font-semibold text-amber-700 mb-0.5">Reviewer notes</p>
                    <p className="text-sm text-amber-800">{draft.reviewer_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ----------------------------------------------------------------
// Main page
// ----------------------------------------------------------------
export default function KnowledgeReviewPage() {
  const [drafts, setDrafts] = useState<KnowledgeDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending_review");

  const statusOptions = [
    { value: "pending_review", label: "Pending review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "merged", label: "Merged" },
  ];

  const fetchDrafts = async (status: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/knowledge-drafts?status=${encodeURIComponent(status)}&limit=50`);
    const j = await res.json() as { data: KnowledgeDraft[] };
    setDrafts(j.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts(statusFilter);
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-0.5 text-2xl font-semibold text-[#111111]">Knowledge Review</h1>
        <p className="mt-1 text-sm text-[#6f6b62]">Review AI-generated draft pain points before they enter the knowledge library.</p>
      </div>

      <div className="px-8 py-6 max-w-4xl space-y-6">
        {/* AI disclaimer banner */}
        <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-violet-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-violet-800">These are AI-generated drafts — review carefully</p>
            <p className="mt-0.5 text-xs text-violet-700">
              Claude created these pain point drafts based on call phrases and context. They may be inaccurate, incomplete, or duplicate existing entries.
              Always review and verify before approving. Approving a draft does not automatically add it to the live knowledge library — that requires a manual step.
            </p>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                statusFilter === opt.value
                  ? "bg-[#063b32] text-white"
                  : "border border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32]/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Draft list */}
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[#6f6b62]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading drafts…
          </div>
        ) : drafts.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/40 py-16 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-[#6f6b62]/30 mb-2" />
            <p className="text-sm text-[#6f6b62]">
              {statusFilter === "pending_review"
                ? "No drafts awaiting review."
                : `No drafts with status "${statusOptions.find(o => o.value === statusFilter)?.label}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onStatusChange={() => fetchDrafts(statusFilter)}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-[#6f6b62]">{drafts.length} draft{drafts.length !== 1 ? "s" : ""} shown.</p>
      </div>
    </div>
  );
}
