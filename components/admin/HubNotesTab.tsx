"use client";

import { Loader2, Plus, Save, X } from "lucide-react";
import { CollapsibleNote } from "@/components/admin/CollapsibleNote";

type Props = {
  title: string;
  notes: string | null;
  showAddNote: boolean;
  onShowAddNote: () => void;
  onHideAddNote: () => void;
  noteText: string;
  onNoteTextChange: (value: string) => void;
  saving: boolean;
  onSave: () => void;
  placeholder?: string;
  header?: React.ReactNode;
};

export function HubNotesTab({
  title,
  notes,
  showAddNote,
  onShowAddNote,
  onHideAddNote,
  noteText,
  onNoteTextChange,
  saving,
  onSave,
  placeholder = "Add a note…",
  header,
}: Props) {
  return (
    <>
      {header}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">{title}</p>
        {!showAddNote && (
          <button
            type="button"
            onClick={onShowAddNote}
            className="flex items-center gap-1.5 text-xs text-[#063b32] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add note
          </button>
        )}
      </div>

      {showAddNote && (
        <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-4 space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving || !noteText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save note
            </button>
            <button
              type="button"
              onClick={onHideAddNote}
              className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {notes ? (
        <div className="rounded-xl border border-[#111111]/10 p-5">
          <CollapsibleNote content={notes} />
        </div>
      ) : (
        !showAddNote && (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
            <p className="text-sm text-[#6f6b62]">No notes yet. Add one above.</p>
          </div>
        )
      )}
    </>
  );
}