import HowWeHelpPage from "@/components/marketing/HowWeHelpPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "How We Help | Backlog Recovery, AI Readiness & Admin Support | VAxAI",
  description:
    "From clearing admin backlogs to preparing for AI and automation, VAxAI helps UK organisations organise information, improve processes and maintain the systems they rely on every day.",
  path: "/how-we-help",
});

export default function HowWeHelp() {
  return <HowWeHelpPage />;
}
