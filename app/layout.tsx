import type { Metadata } from "next";
import CookieConsent from "@/components/CookieConsent";
import NewsletterPopup from "@/components/NewsletterPopup";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "VAxAI | Admin support with AI, automation and human VA oversight",
  description:
    "VAxAI helps small businesses, charities and busy teams manage repetitive admin with virtual assistance, AI and automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <CookieConsent />
        <NewsletterPopup />
        {process.env.NODE_ENV === "production" && <AnalyticsConsent />}
      </body>
    </html>
  );
}
