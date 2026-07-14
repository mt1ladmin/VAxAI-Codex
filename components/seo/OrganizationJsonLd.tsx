import { absoluteUrl, siteConfig } from "@/lib/seo/site";

export default function OrganizationJsonLd() {
  const siteUrl = absoluteUrl();
  const organizationId = `${siteUrl}/#organization`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        description: siteConfig.defaultDescription,
        inLanguage: siteConfig.language,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "ProfessionalService",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteUrl,
        description: siteConfig.defaultDescription,
        email: siteConfig.email,
        areaServed: {
          "@type": "Country",
          name: "United Kingdom",
        },
        parentOrganization: {
          "@type": "Organization",
          name: siteConfig.parentOrganization.name,
          url: siteConfig.parentOrganization.url,
        },
        serviceType: [
          "Admin support",
          "Backlog recovery",
          "AI and automation readiness",
          "Virtual assistance",
          "Business process automation",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}