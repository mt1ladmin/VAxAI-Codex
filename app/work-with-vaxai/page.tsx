import type { Metadata } from "next";
import WorkWithVaxaiPage from "@/components/marketing/WorkWithVaxaiPage";

export const metadata: Metadata = {
  title: "Join VAxAI VA Network | Become a Freelance Virtual Assistant",
  description:
    "Partner with VAxAI as a UK-based freelance virtual assistant. Clear admin backlogs, prepare for AI and automation, and deliver project work and monthly retainers.",
  openGraph: {
    title: "Join VAxAI VA Network | Become a Freelance Virtual Assistant",
    description:
      "Apply to join the VAxAI freelance VA network. Project work, retainers, and practical AI skills for admin professionals.",
  },
};

export default function Page() {
  return <WorkWithVaxaiPage />;
}
