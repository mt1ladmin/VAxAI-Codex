import { redirect } from "next/navigation";

/** Intermediary prospect queue stage removed — redirect to Prospect Finder. */
export default function LegacyProspectQueuePage() {
  redirect("/admin/engagement/prospect-outreach");
}