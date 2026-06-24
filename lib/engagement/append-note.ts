/** Format a dated note entry for free-text notes fields. */
export function formatDatedNoteEntry(label: string, text: string): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `[${date}] ${label}\n${text.trim()}`;
}

/** Append a note entry to an existing notes field. */
export function appendNoteEntry(
  existing: string | null | undefined,
  entry: string,
): string {
  const trimmed = entry.trim();
  if (!trimmed) return existing?.trim() ?? "";
  return existing?.trim() ? `${existing.trim()}\n\n${trimmed}` : trimmed;
}

/** Copy a next-action update into the notes field as a dated entry. */
export function appendNextActionToNotes(
  existing: string | null | undefined,
  nextAction: string,
): string | null {
  const action = nextAction.trim();
  if (!action) return existing ?? null;
  return appendNoteEntry(existing, formatDatedNoteEntry("Next action", action));
}