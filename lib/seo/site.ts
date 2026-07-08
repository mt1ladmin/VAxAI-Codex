const DEFAULT_SITE_URL = "https://www.vaxai.co.uk";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return DEFAULT_SITE_URL;
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const siteConfig = {
  name: "VAxAI",
  defaultTitle: "VAxAI | Admin support with AI, automation and human VA oversight",
  defaultDescription:
    "VAxAI helps small businesses, charities and busy teams manage repetitive admin with virtual assistance, AI and automation.",
  locale: "en_GB",
  language: "en-GB",
  email: "hello@mt1l.com",
  parentOrganization: {
    name: "MT1L",
    url: "https://www.mt1l.com",
  },
} as const;