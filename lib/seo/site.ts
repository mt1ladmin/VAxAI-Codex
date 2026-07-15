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
  defaultTitle: "VAxAI | Reduce admin. Keep people in the loop.",
  defaultDescription:
    "VAxAI is MT1L's operational administration service for founders, SMEs, charities and public sector organisations. We clear admin backlogs, organise information, prepare for AI and automation, and provide ongoing admin support with people in the loop.",
  locale: "en_GB",
  language: "en-GB",
  email: "hello@mt1l.com",
  logoPath: "/vaxai-logo.png",
  iconPath: "/icon",
  parentOrganization: {
    name: "MT1L",
    url: "https://www.mt1l.com",
  },
  keywords: [
    "admin support",
    "virtual assistance",
    "backlog recovery",
    "AI readiness",
    "automation readiness",
    "SME admin support",
    "charity admin support",
    "public sector admin",
    "Access to Work",
    "UK admin support",
  ],
} as const;
