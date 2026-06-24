"use client";

import { useState } from "react";
import { Loader2, Pencil, Save, X } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]";

type Props = {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  rows?: number;
  emptyText?: string;
  placeholder?: string;
};

export function EditableFieldCard({
  label,
  value,
  onSave,
  multiline = true,
  rows = 4,
  emptyText = "—",
  placeholder,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#111111]/10 bg-white p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">{label}</p>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline"
          >
            <Pencil className="h-3 w-3" />
            {value.trim() ? "Edit" : "Add"}
          </button>
        ) : null}
      </div>
      {editing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={rows}
              placeholder={placeholder}
              className={`${inputClass} resize-y leading-relaxed`}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className={inputClass}
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#111111] whitespace-pre-wrap">{value.trim() || emptyText}</p>
      )}
    </div>
  );
}