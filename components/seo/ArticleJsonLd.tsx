import { absoluteUrl, siteConfig } from "@/lib/seo/site";

type ArticleJsonLdProps = {
  title: string;
  description?: string | null;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  authorName?: string | null;
};

export default function ArticleJsonLd({
  title,
  description,
  slug,
  coverImageUrl,
  publishedAt,
  authorName,
}: ArticleJsonLdProps) {
  const url = absoluteUrl(`/posts/${slug}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description ?? siteConfig.defaultDescription,
    url,
    mainEntityOfPage: url,
    inLanguage: siteConfig.language,
    datePublished: publishedAt ?? undefined,
    image: coverImageUrl ? [coverImageUrl] : undefined,
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
        }
      : {
          "@type": "Organization",
          name: siteConfig.name,
          url: absoluteUrl(),
        },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl(),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}