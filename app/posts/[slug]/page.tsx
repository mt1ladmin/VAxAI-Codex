import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Linkedin, Share2 } from "lucide-react";
import ReadingProgress from "@/components/posts/ReadingProgress";
import PostContactForm from "@/components/posts/PostContactForm";
import ShareButton from "@/components/posts/ShareButton";

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
    .select("id,title,slug,cover_image_url,content_type,published_at")
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
  return {
    title: post.title,
    description: post.description ?? undefined,
    openGraph: post.cover_image_url ? { images: [post.cover_image_url] } : undefined,
  };
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

  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/posts/${post.slug}`;

  return (
    <>
      <ReadingProgress />

      <article className="min-h-screen bg-white">
        {/* Cover image */}
        {post.cover_image_url && (
          <div className="mx-auto max-w-5xl px-4 pt-10">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: "480px" }}
            />
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
            {/* Main content */}
            <div>
              {/* Meta */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {post.content_type && (
                  <span className="rounded-full bg-[#063b32]/10 px-3 py-1 text-xs font-semibold text-[#063b32]">
                    {post.content_type}
                  </span>
                )}
                {publishedDate && (
                  <span className="text-sm text-gray-400">{publishedDate}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold leading-tight text-gray-900">{post.title}</h1>

              {/* Description / standfirst */}
              {post.description && (
                <p className="mt-4 text-lg leading-8 text-gray-500">{post.description}</p>
              )}

              {/* Author + share row */}
              <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-t border-gray-100 py-4">
                {author && (
                  <div className="flex items-center gap-3">
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt={author.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#063b32] text-sm font-bold text-[#f5f274]">
                        {author.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{author.name}</p>
                      {author.bio && <p className="text-xs text-gray-400 line-clamp-1">{author.bio}</p>}
                    </div>
                    {author.linkedin_url && (
                      <a
                        href={author.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-gray-400 hover:text-[#0077b5]"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
                <div className="ml-auto">
                  <ShareButton url={postUrl} title={post.title} />
                </div>
              </div>

              {/* Body HTML */}
              {post.body_html && (
                <div
                  className="prose-vaxai mt-8"
                  dangerouslySetInnerHTML={{ __html: post.body_html }}
                />
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Contact form */}
              <div className="mt-16 rounded-2xl border border-gray-100 bg-gray-50 p-8">
                <h2 className="mb-1 text-xl font-bold text-gray-900">Get in touch</h2>
                <p className="mb-6 text-sm text-gray-500">
                  Have a question about this post or want to explore working together? Send us a message — your enquiry will be linked to this content.
                </p>
                <PostContactForm postId={post.id} postTitle={post.title} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:pt-2">
              {related.length > 0 && (
                <div>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">You might also like</p>
                  <div className="space-y-4">
                    {related.map((r) => (
                      <a key={r.id} href={`/posts/${r.slug}`} className="group flex gap-3">
                        {r.cover_image_url ? (
                          <img
                            src={r.cover_image_url}
                            alt={r.title}
                            className="h-16 w-20 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-20 shrink-0 rounded-lg bg-gray-100" />
                        )}
                        <div className="min-w-0">
                          {r.content_type && (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#063b32]">{r.content_type}</p>
                          )}
                          <p className="text-sm font-semibold leading-5 text-gray-800 group-hover:text-[#063b32] line-clamp-3">
                            {r.title}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>

    </>
  );
}
