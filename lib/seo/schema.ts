import { absoluteUrl, siteConfig } from "@/lib/seo/site";

export type ServicePageSchemaInput = {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  areasServed?: string[];
};

export function servicePageJsonLd(input: ServicePageSchemaInput) {
  const url = absoluteUrl(input.path);
  const siteUrl = absoluteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: input.name,
        description: input.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@type": "Thing", name: input.serviceType },
        inLanguage: siteConfig.language,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${url}#service`,
        name: input.name,
        url,
        description: input.description,
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteUrl,
        },
        serviceType: input.serviceType,
        areaServed: (input.areasServed ?? ["United Kingdom"]).map((name) => ({
          "@type": "Country",
          name,
        })),
      },
    ],
  };
}