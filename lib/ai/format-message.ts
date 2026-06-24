/** Lightweight plain-text display — strips markdown artifacts without a renderer dependency. */

export function formatAssistantText(raw: string): string {
  return raw
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]{3,}\s*$/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .trim();
}

export function assistantParagraphs(raw: string): string[] {
  const text = formatAssistantText(raw);
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}