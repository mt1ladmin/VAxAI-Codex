/**
 * Server-side HTML sanitiser for trusted CMS/TipTap content.
 * Strips scripts, event handlers, and dangerous URLs while keeping editorial markup.
 */

const BLOCKED_TAGS =
  /<\/?(?:script|iframe|object|embed|form|input|button|textarea|select|meta|link|base|style|svg|math|template|noscript)[^>]*>/gi;

const EVENT_ATTRS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_ATTR =
  /(\s(?:href|src|xlink:href|formaction|action)\s*=\s*)(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi;

const DANGEROUS_URL_ATTR_UNQUOTED =
  /(\s(?:href|src|xlink:href|formaction|action)\s*=\s*)(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]*/gi;

const SRCDOC = /\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html;
  // Remove null bytes
  out = out.replace(/\u0000/g, "");
  // Remove blocked tags (open and close)
  out = out.replace(BLOCKED_TAGS, "");
  // Remove event handler attributes
  out = out.replace(EVENT_ATTRS, "");
  // Neutralise dangerous URL schemes
  out = out.replace(DANGEROUS_URL_ATTR, '$1$2#$2');
  out = out.replace(DANGEROUS_URL_ATTR_UNQUOTED, "$1#");
  // Remove srcdoc
  out = out.replace(SRCDOC, "");
  // Collapse javascript: that may remain in style expressions is rare; strip expression()
  out = out.replace(/expression\s*\(/gi, "invalid(");
  return out;
}
