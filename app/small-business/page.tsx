import AudiencePageShell from "@/components/marketing/AudiencePageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getAudiencePage } from "@/lib/seo/audience-pages";

const SLUG = "small-business";
const page = getAudiencePage(SLUG)!;

export const metadata = createPageMetadata({
  title: `${page.metaTitle} | VAxAI`,
  description: page.metaDescription,
  path: `/${SLUG}`,
});

export default function SmallBusinessPage() {
  return <AudiencePageShell slug={SLUG} />;
}