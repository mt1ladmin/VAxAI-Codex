/** Count timestamped note entries in a free-text notes field. */
export function countNotes(notes: string | null | undefined): number {
  if (!notes?.trim()) return 0;
  const dated = notes.match(/\n\n\[\d{1,2} [A-Za-z]{3,9} \d{4}\]/g);
  if (dated) return dated.length + (notes.trim().startsWith("[") ? 0 : 1);
  return 1;
}