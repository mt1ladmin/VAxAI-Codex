/** Shared input validation for public API routes. */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, "");
}

export function cleanText(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = stripControlChars(value).trim();
  if (!cleaned) return null;
  if (cleaned.length > maxLen) return cleaned.slice(0, maxLen);
  return cleaned;
}

export function isValidEmail(value: string): boolean {
  if (value.length > 254) return false;
  // Practical RFC5322-ish check — rejects spaces and requires domain + TLD
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

export function cleanEmail(value: unknown): string | null {
  const email = cleanText(value, 254);
  if (!email) return null;
  const normalized = email.toLowerCase();
  return isValidEmail(normalized) ? normalized : null;
}

export function cleanOptionalText(value: unknown, maxLen: number): string | null {
  if (value == null || value === "") return null;
  return cleanText(value, maxLen);
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function allowlist(value: unknown, allowed: readonly string[], fallback: string): string {
  if (typeof value !== "string") return fallback;
  return allowed.includes(value) ? value : fallback;
}

/** Constant-time string compare for secrets. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function bearerAuthorized(req: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return safeEqual(auth, expected);
}

export function maxBodyBytes(req: Request, max = 64_000): boolean {
  const len = req.headers.get("content-length");
  if (!len) return true;
  const n = Number(len);
  if (!Number.isFinite(n)) return false;
  return n <= max;
}
