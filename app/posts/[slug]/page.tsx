import { notFound } from "next/navigation";
import { Metadata } from "next";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";
import { createPostMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { Linkedin } from "lucide-react";
import ReadingProgress from "@/components/posts/ReadingProgress";
import PostContactForm from "@/components/posts/PostContactForm";
import ShareButton from "@/components/posts/ShareButton";
import PostTags from "@/components/posts/PostTags";
import BackButton from "@/components/posts/BackButton";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import { sanitizeHtml } from "@/lib/security/sanitize-html";

// Render on every request so studio edits (updated cover images, body and
// other published content) appear immediately instead of being frozen at
// build time.
export const dynamic = "force-dynamic";

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  body_html: string | null;
  cover_image_url: string | null;
  content_type: string | null;
  tags: string[] | null;
  author_id: string | null;
  published_at: string | null;
};

type Author = {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
};

async function getPost(slug: string): Promise<Post | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // If this post was scheduled and its time has passed, go live before lookup
  try {
    const { publishDueScheduledPosts } = await import("@/lib/posts/publish-due");
    await publishDueScheduledPosts(db, { limit: 20 });
  } catch {
    /* non-fatal */
  }

  const { data } = await db
    .from("posts")
    .select("id,title,slug,description,body_html,cover_image_url,content_type,tags,author_id,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data ?? null;
}

async function getAuthor(id: string): Promise<Author | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await db.from("authors").select("id,name,avatar_url,bio,linkedin_url").eq("id", id).single();
  return data ?? null;
}

async function getRelatedPosts(currentId: string, tags: string[]): Promise<Post[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !tags.length) return [];
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await db
    .from("posts")
    .select("id,title,slug,cover_image_url,content_type,published_at,description")
    .eq("status", "published")
    .neq("id", currentId)
    .overlaps("tags", tags)
    .limit(4);
  return (data ?? []) as Post[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return createPostMetadata({
    title: post.title,
    description: post.description,
    slug: post.slug,
    coverImageUrl: post.cover_image_url,
    publishedAt: post.published_at,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [author, related] = await Promise.all([
    post.author_id ? getAuthor(post.author_id) : null,
    getRelatedPosts(post.id, post.tags ?? []),
  ]);

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const postUrl = absoluteUrl(`/posts/${post.slug}`);

  return (
    <div className="min-h-screen bg-white">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        slug={post.slug}
        coverImageUrl={post.cover_image_url}
        publishedAt={post.published_at}
        authorName={author?.name}
      />
      {/* Sticky site nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:px-8">
        <SiteNav variant="light" />
      </header>

      {/* Reading progress — measured against article body only */}
      <ReadingProgress contentId="post-body" />

      <article>
        {/* Back button */}
        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
          <BackButton fallbackHref="/insights" label="Back to Insights" />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">

            {/* ── Main column ── */}
            <div className="min-w-0">


              {/* Content type badge */}
              {post.content_type && (
                <span className="mb-3 inline-block rounded-full bg-[#122428]/8 px-3 py-1 text-xs font-semibold text-[#122428]">
                  {post.content_type}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                {post.title}
              </h1>

              {/* Standfirst */}
              {post.description && (
                <p className="mt-4 text-lg leading-8 text-gray-500">{post.description}</p>
              )}

              {/* Share row — author on left, share button on right */}
              <div className="mt-6 flex items-center justify-between border-b border-t border-gray-100 py-3">
                {author ? (
                  <div className="flex items-center gap-2.5">
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt={author.name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-gray-100" />
                    ) : (
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#122428] text-xs font-bold text-[#D8FC2E]">
                        {author.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900">{author.name}</p>
                        {author.linkedin_url && (
                          <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer"
                            className="text-gray-300 hover:text-[#0077b5]" aria-label="LinkedIn">
                            <Linkedin className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {publishedDate && <p className="text-xs text-gray-400">{publishedDate}</p>}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">{publishedDate ?? ""}</span>
                )}
                <ShareButton url={postUrl} title={post.title} />
              </div>

              {/* ── Article body — this element is tracked for reading progress ── */}
              <div id="post-body" className="mt-8">
                {post.body_html ? (
                  <div
                    className="prose-vaxai"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body_html) }}
                  />
                ) : (
                  <p className="text-gray-400 italic">No content yet.</p>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <PostTags tags={post.tags} />
              )}

              {/* Mobile-only Get in touch (hidden on lg where sidebar shows it) */}
              <div className="mt-12 rounded-3xl border border-[#122428]/10 bg-[#F5F8F8]/60 p-6 lg:hidden">
                <h2 className="mb-1 text-xl font-bold text-gray-900">Get in touch</h2>
                <p className="mb-5 text-sm leading-6 text-gray-500">
                  Have a question about this post or want to explore working together? Your enquiry will be linked to this content.
                </p>
                <PostContactForm postId={post.id} postTitle={post.title} />
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-[76px] space-y-8">
                {/* You might also like */}
                {related.length > 0 && (
                  <div>
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      You might also like
                    </p>
                    <div className="space-y-5">
                      {related.map((r) => (
                        <a key={r.id} href={`/posts/${r.slug}`} className="group block">
                          {r.cover_image_url && (
                            <img
                              src={r.cover_image_url}
                              alt={r.title}
                              className="mb-2 h-32 w-full rounded-xl object-cover"
                            />
                          )}
                          {r.content_type && (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#122428]">
                              {r.content_type}
                            </p>
                          )}
                          <p className="text-sm font-semibold leading-5 text-gray-800 group-hover:text-[#122428]">
                            {r.title}
                          </p>
                          {r.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-400">{r.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Get in touch — sidebar (desktop) */}
                <div className="rounded-2xl border border-[#122428]/10 bg-[#F5F8F8]/60 p-5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Work with us</p>
                  <h3 className="mb-2 text-sm font-bold text-gray-900">Get in touch</h3>
                  <p className="mb-4 text-xs leading-5 text-gray-500">
                    Have a question or want to explore working together? Your enquiry will be linked to this post.
                  </p>
                  <PostContactForm postId={post.id} postTitle={post.title} />
                </div>

                {/* Back to insights */}
                <div>
                  <a href="/insights"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122428] hover:underline">
                    ← All insights
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <SiteFooter />
      <SimplifiedModeToggle />
    </div>
  );
}
