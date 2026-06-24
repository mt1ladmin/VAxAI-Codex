"use client";

import { recentNoteEntries } from "@/lib/engagement/parse-notes";

type Props = {
  notes: string | null | undefined;
  onViewAll: () => void;
  limit?: number;
};

export function RecentNotesPreview({ notes, onViewAll, limit = 3 }: Props) {
  const entries = recentNoteEntries(notes, limit);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
        Recent notes
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-[#6f6b62]/50">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={`${entry.header}-${index}`}
              className="rounded-lg border border-[#111111]/8 bg-[#f7f4ea]/40 px-3 py-2"
            >
              {entry.header ? (
                <p className="text-xs font-semibold text-[#6f6b62]">{entry.header}</p>
              ) : null}
              <p className="mt-0.5 text-sm text-[#111111] whitespace-pre-wrap line-clamp-3">
                {entry.body}
              </p>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onViewAll}
        className="text-sm font-semibold text-[#063b32] hover:underline"
      >
        View all notes →
      </button>
    </div>
  );
}