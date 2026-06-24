export type NoteEntry = {
  header: string;
  body: string;
};

const DATED_ENTRY_SPLIT = /\n\n(?=\[\d{1,2} [A-Za-z]{3,9} \d{4}\])/;

/** Split a free-text notes field into individual entries (newest first). */
export function parseNoteEntries(notes: string | null | undefined): NoteEntry[] {
  if (!notes?.trim()) return [];

  const parts = notes.trim().split(DATED_ENTRY_SPLIT);
  const entries = parts.map((part) => {
    const trimmed = part.trim();
    const lines = trimmed.split("\n");
    const header = lines[0] ?? "";
    const hasDatedHeader = /^\[\d{1,2} [A-Za-z]{3,9} \d{4}\]/.test(header);
    const body = hasDatedHeader ? lines.slice(1).join("\n").trim() : trimmed;
    return { header: hasDatedHeader ? header : "", body: hasDatedHeader ? body : trimmed };
  });

  return entries.reverse();
}

export function recentNoteEntries(
  notes: string | null | undefined,
  limit = 3,
): NoteEntry[] {
  return parseNoteEntries(notes).slice(0, limit);
}