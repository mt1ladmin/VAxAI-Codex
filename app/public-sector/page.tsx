import AudiencePageShell from "@/components/marketing/AudiencePageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getAudiencePage } from "@/lib/seo/audience-pages";

const SLUG = "public-sector";
const page = getAudiencePage(SLUG)!;

export const metadata = createPageMetadata({
  title: `${page.metaTitle} | VAxAI`,
  description: page.metaDescription,
  path: `/${SLUG}`,
});

export default function PublicSectorPage() {
  return <AudiencePageShell slug={SLUG} />;
}
