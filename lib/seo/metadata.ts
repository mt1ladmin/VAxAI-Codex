import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo/site";

export function createRootMetadata(): Metadata {
  const siteUrl = absoluteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteConfig.defaultTitle,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.defaultDescription,
    applicationName: siteConfig.name,
    keywords: [...siteConfig.keywords],
    authors: [{ name: "VAxAI", url: siteUrl }],
    creator: "MT1L",
    publisher: "MT1L",
    category: "business",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icon", type: "image/png", sizes: "32x32" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
      shortcut: ["/icon"],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: siteConfig.defaultTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: "/",
    },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function createPostMetadata({
  title,
  description,
  slug,
  coverImageUrl,
  publishedAt,
}: {
  title: string;
  description?: string | null;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
}): Metadata {
  const path = `/posts/${slug}`;
  const url = absoluteUrl(path);
  const pageTitle = title;
  const pageDescription = description ?? siteConfig.defaultDescription;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: pageTitle,
      description: pageDescription,
      publishedTime: publishedAt ?? undefined,
      images: coverImageUrl
        ? [{ url: coverImageUrl }]
        : [{ url: "/opengraph-image", width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: coverImageUrl ? [coverImageUrl] : ["/opengraph-image"],
    },
  };
}
