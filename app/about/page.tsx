import AboutPage from "@/components/marketing/AboutPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "About VAxAI | Human-Led Admin Support & AI Readiness",
  description:
    "VAxAI is the human preparation and support layer that makes AI and automation work in real organisations. Meet the people behind VAxAI and the thinking behind Prepare, Support, Maintain.",
  path: "/about",
});

export default function About() {
  return <AboutPage />;
}
