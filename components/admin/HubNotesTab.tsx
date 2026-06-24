"use client";

import { useState } from "react";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { parseNoteEntries, serializeNoteEntries, type NoteEntry } from "@/lib/engagement/parse-notes";

type Props = {
  notes: string | null;
  showAddNote: boolean;
  onHideAddNote: () => void;
  noteText: string;
  onNoteTextChange: (value: string) => void;
  saving: boolean;
  onSave: () => void;
  onReplaceNotes?: (notes: string) => Promise<void>;
  placeholder?: string;
  header?: React.ReactNode;
};

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none";

export function HubNotesTab({
  notes,
  showAddNote,
  onHideAddNote,
  noteText,
  onNoteTextChange,
  saving,
  onSave,
  onReplaceNotes,
  placeholder = "Add a note…",
  header,
}: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const entries = parseNoteEntries(notes);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditDraft(entries[index]?.body ?? "");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditDraft("");
  };

  const saveEdit = async (index: number) => {
    if (!onReplaceNotes) return;
    const nextEntries = [...entries];
    const entry = nextEntries[index];
    if (!entry) return;
    nextEntries[index] = { ...entry, body: editDraft.trim() };
    setSavingEdit(true);
    try {
      await onReplaceNotes(serializeNoteEntries(nextEntries));
      setEditingIndex(null);
      setEditDraft("");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      {header}

      {showAddNote && (
        <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-4 space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={inputClass}
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

      {entries.length > 0 ? (
        <ul className="space-y-3">
          {entries.map((entry, index) => (
            <li key={`${entry.header}-${index}`} className="rounded-xl border border-[#111111]/10 bg-white p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-[#6f6b62]">{entry.header || "Note"}</p>
                {editingIndex !== index && onReplaceNotes ? (
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                ) : null}
              </div>
              {editingIndex === index ? (
                <div className="space-y-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={4}
                    className={inputClass}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit(index)}
                      disabled={savingEdit || !editDraft.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                    >
                      {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{entry.body}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !showAddNote && (
          <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-10 text-center">
            <p className="text-sm text-[#6f6b62]">No notes yet.</p>
          </div>
        )
      )}
    </>
  );
}