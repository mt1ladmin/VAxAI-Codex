"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function BulkArchiveProspectsModal({ open, count, onClose, onConfirm }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const canConfirm = confirmText.trim().toUpperCase() === "ARCHIVE";

  const submit = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      setConfirmText("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-semibold text-[#111111]">Archive {count} prospect(s)</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-[#6f6b62]">
            Records will be removed from Prospect Finder lists. This does not delete Prospect Queue engagements already created.
          </p>
          <p className="text-sm text-[#111111]">
            Type <span className="font-mono font-semibold">ARCHIVE</span> to confirm.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            placeholder="ARCHIVE"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm || submitting}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Archive {count}
          </button>
        </div>
      </div>
    </div>
  );
}