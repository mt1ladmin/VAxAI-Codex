/** Open Gmail compose for outreach (team default). Falls back to mailto. */
export function emailComposeUrl(
  email: string,
  opts?: { subject?: string; useGmail?: boolean },
): string {
  const trimmed = email.trim();
  if (!trimmed) return "#";
  const useGmail = opts?.useGmail !== false;
  if (useGmail) {
    const params = new URLSearchParams({ view: "cm", fs: "1", to: trimmed });
    if (opts?.subject) params.set("su", opts.subject);
    return `https://mail.google.com/mail/?${params.toString()}`;
  }
  const mailto = `mailto:${encodeURIComponent(trimmed)}`;
  if (opts?.subject) return `${mailto}?subject=${encodeURIComponent(opts.subject)}`;
  return mailto;
}