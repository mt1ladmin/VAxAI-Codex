import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VAxAI | AI-powered admin support",
  description:
    "AI consultancy and virtual assistance for founders, consultants, charities and small teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
