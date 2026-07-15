import type { Metadata } from "next";
import WorkWithVaxaiPage from "@/components/marketing/WorkWithVaxaiPage";

export const metadata: Metadata = {
  title: "Work with VAxAI | Become a Freelance Virtual Assistant",
  description:
    "Partner with VAxAI as a UK-based freelance virtual assistant. Help organisations clear admin backlogs, prepare for AI and automation, and deliver reliable ongoing support.",
  openGraph: {
    title: "Work with VAxAI | Become a Freelance Virtual Assistant",
    description:
      "Apply to partner with VAxAI as a UK freelance VA. Project work, retainers, and practical AI upskilling for admin professionals.",
  },
};

export default function Page() {
  return <WorkWithVaxaiPage />;
}
