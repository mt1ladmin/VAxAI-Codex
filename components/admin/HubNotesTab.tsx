"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { parseNoteEntries, serializeNoteEntries } from "@/lib/engagement/parse-notes";

type Props = {
  notes: string | null;
  showAddNote: boolean;
  onHideAddNote: () => void;
  onShowAddNote?: () => void;
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

const PREVIEW_LINES = 2;

export function HubNotesTab({
  notes,
  showAddNote,
  onHideAddNote,
  onShowAddNote,
  noteText,
  onNoteTextChange,
  saving,
  onSave,
  onReplaceNotes,
  placeholder = "Add a note…",
  header,
}: Props) {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [editingInModal, setEditingInModal] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingNote, setDeletingNote] = useState(false);
  const entries = parseNoteEntries(notes);

  const closeModal = () => {
    setViewingIndex(null);
    setEditingInModal(false);
    setEditDraft("");
  };

  const openNote = (index: number) => {
    setViewingIndex(index);
    setEditingInModal(false);
    setEditDraft(entries[index]?.body ?? "");
  };

  const startEdit = () => {
    if (viewingIndex === null) return;
    setEditingInModal(true);
    setEditDraft(entries[viewingIndex]?.body ?? "");
  };

  const saveEdit = async () => {
    if (!onReplaceNotes || viewingIndex === null) return;
    const nextEntries = [...entries];
    const entry = nextEntries[viewingIndex];
    if (!entry) return;
    nextEntries[viewingIndex] = { ...entry, body: editDraft.trim() };
    setSavingEdit(true);
    try {
      await onReplaceNotes(serializeNoteEntries(nextEntries));
      setEditingInModal(false);
      closeModal();
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteNote = async () => {
    if (!onReplaceNotes || viewingIndex === null) return;
    const nextEntries = entries.filter((_, i) => i !== viewingIndex);
    setDeletingNote(true);
    try {
      await onReplaceNotes(serializeNoteEntries(nextEntries));
      closeModal();
    } finally {
      setDeletingNote(false);
    }
  };

  const viewingEntry = viewingIndex !== null ? entries[viewingIndex] : null;

  return (
    <>
      {header}

      {onShowAddNote && !showAddNote && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onShowAddNote}
            className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-3.5 w-3.5" /> New note
          </button>
        </div>
      )}

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
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li key={`${entry.header}-${index}`}>
              <button
                type="button"
                onClick={() => openNote(index)}
                className="w-full rounded-xl border border-[#111111]/10 bg-white p-4 text-left transition-colors hover:border-[#063b32]/25 hover:bg-[#f7f4ea]/20"
              >
                <p className="text-xs font-semibold text-[#6f6b62]">{entry.header || "Note"}</p>
                <p
                  className="mt-1 text-sm text-[#111111] leading-relaxed"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: PREVIEW_LINES,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {entry.body}
                </p>
              </button>
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

      {viewingEntry && viewingIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-[#111111]/10 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-[#111111]">{viewingEntry.header || "Note"}</p>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-lg p-1 text-[#6f6b62] hover:bg-[#f7f4ea]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              {editingInModal ? (
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={12}
                  className={inputClass}
                  autoFocus
                />
              ) : (
                <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">{viewingEntry.body}</p>
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {editingInModal ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void saveEdit()}
                        disabled={savingEdit || !editDraft.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                      >
                        {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInModal(false);
                          setEditDraft(viewingEntry.body);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : onReplaceNotes ? (
                    <button
                      type="button"
                      onClick={startEdit}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#063b32] hover:underline"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  ) : null}
                </div>
                {!editingInModal && onReplaceNotes && (
                  <button
                    type="button"
                    onClick={() => void deleteNote()}
                    disabled={deletingNote}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}