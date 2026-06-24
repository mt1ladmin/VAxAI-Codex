"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { RecentNotesPreview } from "@/components/admin/RecentNotesPreview";

type Props = {
  contactId?: string;
  outreachId?: string;
  notes?: string | null;
  onViewAllNotes?: () => void;
  onSaved?: () => void;
};

export function JourneySummaryButton({
  contactId,
  outreachId,
  notes,
  onViewAllNotes,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const savedMessage = outreachId && !contactId
    ? "Summary saved to prospect notes. Open the Notes tab to review."
    : "Summary saved to client notes. Open the Notes tab to review.";

  const generate = async () => {
    if (!contactId && !outreachId) return;
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/admin/ai/journey-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, outreachId }),
      });
      const j = (await res.json()) as { error?: string; data?: { saved: boolean } };
      if (!res.ok) throw new Error(j.error || "Failed to generate summary");
      setDone(true);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void generate()}
        disabled={loading || (!contactId && !outreachId)}
        className="flex items-center gap-1.5 rounded-lg border border-[#063b32]/25 bg-[#063b32]/5 px-4 py-2 text-sm font-semibold text-[#063b32] hover:bg-[#063b32]/10 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Generating journey summary…" : "Generate journey summary"}
      </button>
      {done && <p className="text-xs text-[#063b32]">{savedMessage}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {onViewAllNotes ? (
        <RecentNotesPreview notes={notes} onViewAll={onViewAllNotes} />
      ) : null}
    </div>
  );
}