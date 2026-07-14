import type { MetadataRoute } from "next";
import { audiencePagePaths } from "@/lib/seo/audience-pages";
import { absoluteUrl } from "@/lib/seo/site";

async function getPublishedPostEntries(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data } = await db
    .from("posts")
    .select("slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (data ?? []).map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
    lastModified: post.published_at ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const audiencePages: MetadataRoute.Sitemap = audiencePagePaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/how-we-help"), changeFrequency: "monthly", priority: 0.9 },
    ...audiencePages,
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/insights"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/edi-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/ai-use-policy"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts = await getPublishedPostEntries();
  return [...staticPages, ...posts];
}