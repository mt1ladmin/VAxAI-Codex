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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
      images: coverImageUrl ? [{ url: coverImageUrl }] : undefined,
    },
    twitter: {
      card: coverImageUrl ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    },
  };
}