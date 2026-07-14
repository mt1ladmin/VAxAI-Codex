import SiteNav from "@/components/SiteNav";
import { createPageMetadata } from "@/lib/seo/metadata";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import ContentGrid from "@/components/posts/ContentGrid";

// Render on every request so studio edits (new posts, updated cover images,
// tags and other published content) appear immediately instead of being
// frozen at build time.
export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Insights | VAxAI",
  description:
    "Insights, guides and resources from VAxAI on admin foundations, backlogs, AI readiness and keeping the human in the loop.",
  path: "/insights",
});

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  content_type: string | null;
  tags: string[] | null;
  published_at: string | null;
  author_id: string | null;
};

type Author = { id: string; name: string; avatar_url: string | null };

async function getPosts(): Promise<Post[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await db
    .from("posts")
    .select("id,title,slug,description,cover_image_url,content_type,tags,published_at,author_id")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data ?? [];
}

async function getAuthors(): Promise<Author[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await db.from("authors").select("id,name,avatar_url");
  return data ?? [];
}

export default async function InsightsPage() {
  const [posts, authors] = await Promise.all([getPosts(), getAuthors()]);
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags ?? []))).sort();
  const allTypes = Array.from(new Set(posts.map((p) => p.content_type).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:px-8">
        <SiteNav variant="light" />
      </header>
      <div className="bg-[#122428] px-4 py-14 text-center md:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D8FC2E]/80">Insights</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Insights &amp; resources</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/60">
          Practical thinking on admin foundations, backlogs, AI readiness and keeping the human in the loop, from VAxAI.
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <ContentGrid posts={posts} authorMap={authorMap} allTags={allTags} allTypes={allTypes} />
      </div>
      <SiteFooter />
      <SimplifiedModeToggle />
    </div>
  );
}
