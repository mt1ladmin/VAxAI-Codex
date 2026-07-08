import ServiceLandingPage from "@/components/marketing/ServiceLandingPage";
import { getAudiencePage } from "@/lib/seo/audience-pages";
import { servicePageJsonLd } from "@/lib/seo/schema";
import { notFound } from "next/navigation";

export default function AudiencePageShell({ slug }: { slug: string }) {
  const page = getAudiencePage(slug);
  if (!page) notFound();

  const jsonLd = servicePageJsonLd({
    path: `/${page.slug}`,
    name: page.title,
    description: page.metaDescription,
    serviceType: page.serviceType,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServiceLandingPage page={page} />
    </>
  );
}
