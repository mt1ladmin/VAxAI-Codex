import type { Metadata } from "next";
import WorkWithVaxaiPage from "@/components/marketing/WorkWithVaxaiPage";

export const metadata: Metadata = {
  title: "Join the VAxAI VA Partner Network | Register Your Interest",
  description:
    "Register your interest in the VAxAI VA partner network. Clear admin backlogs, prepare for AI and automation, and deliver project work and monthly retainers.",
  openGraph: {
    title: "Join the VAxAI VA Partner Network | Register Your Interest",
    description:
      "Register your interest in joining the VAxAI VA partner network. Project work, retainers, and practical AI skills for admin professionals.",
  },
};

export default function Page() {
  return <WorkWithVaxaiPage />;
}
