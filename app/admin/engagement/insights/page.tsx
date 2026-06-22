import { redirect } from "next/navigation";

export default function InsightsPage() {
  redirect("/admin/engagement/pipeline?tab=insights");
}