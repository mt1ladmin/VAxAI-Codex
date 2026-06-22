import { redirect } from "next/navigation";

export default function OpportunitiesRedirectPage() {
  redirect("/admin/engagement/pipeline?tab=pipeline");
}