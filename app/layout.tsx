import CookieConsent from "@/components/CookieConsent";
import NewsletterPopup from "@/components/NewsletterPopup";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { createRootMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import "./globals.css";

export const metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.language}>
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
        {children}
        <CookieConsent />
        <NewsletterPopup />
        {process.env.NODE_ENV === "production" && <AnalyticsConsent />}
      </body>
    </html>
  );
}
