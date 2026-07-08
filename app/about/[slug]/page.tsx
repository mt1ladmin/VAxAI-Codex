import { notFound } from "next/navigation";
import ExpertDetailPage from "@/components/marketing/ExpertDetailPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { experts, getExpert } from "@/lib/experts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const expert = getExpert(slug);
  if (!expert) return {};

  return createPageMetadata({
    title: `${expert.metaTitle} | VAxAI`,
    description: expert.metaDescription,
    path: `/about/${expert.slug}`,
  });
}

export default async function AboutExpertPage({ params }: PageProps) {
  const { slug } = await params;
  const expert = getExpert(slug);
  if (!expert) notFound();

  return <ExpertDetailPage expert={expert} />;
}