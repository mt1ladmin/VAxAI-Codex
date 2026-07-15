"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

export function SaveSummaryModal({
  open,
  onClose,
  defaultTitle,
  defaultSummary,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  defaultTitle: string;
  defaultSummary: string;
  onConfirm: (title: string, summary: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [summary, setSummary] = useState(defaultSummary);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setSummary(defaultSummary);
      setError("");
    }
  }, [open, defaultTitle, defaultSummary]);

  if (!open) return null;

  const handleSave = async () => {
    if (!title.trim() || !summary.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onConfirm(title.trim(), summary.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save summary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">Save summary to notes</h2>
            <p className="mt-0.5 text-xs text-[#5F686A]">
              Review the AI summary, edit if needed, then confirm to save it to notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-[#5F686A] hover:bg-[#F5F8F8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#5F686A]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#122428]"
              placeholder="e.g. Prospect call prep summary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#5F686A]">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={10}
              className="w-full resize-y rounded-lg border border-[#111111]/15 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#122428] max-h-[50vh]"
              placeholder="AI-generated summary…"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#5F686A] hover:bg-[#F5F8F8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !title.trim() || !summary.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[#122428] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save to notes
          </button>
        </div>
      </div>
    </div>
  );
}