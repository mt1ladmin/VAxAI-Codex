import { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import ContentGrid from "@/components/posts/ContentGrid";

export const metadata: Metadata = {
  title: "Content | VAxAI",
  description: "Insights, guides and resources from the VAxAI team on admin, automation and working smarter.",
};

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

export default async function ContentPage() {
  const [posts, authors] = await Promise.all([getPosts(), getAuthors()]);

  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags ?? []))).sort();
  const allTypes = Array.from(new Set(posts.map((p) => p.content_type).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:px-8">
        <SiteNav variant="light" />
      </header>

      {/* Hero strip */}
      <div className="border-b border-gray-100 bg-[#063b32] px-4 py-14 text-center md:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5f274]/80">Content library</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Insights &amp; resources</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/60">
          Practical thinking on admin, automation, AI tools and working smarter — from the VAxAI team.
        </p>
      </div>

      {/* Filterable grid — client component */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <ContentGrid posts={posts} authorMap={authorMap} allTags={allTags} allTypes={allTypes} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-10 text-center text-xs text-gray-400 sm:px-8">
        <a href="/" className="hover:text-gray-600">← Back to VAxAI</a>
      </footer>
    </div>
  );
}
