import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

type Props = { params: Promise<{ id: string }> };

/** Legacy queue detail — redirect to Finder or Prospect Queue record. */
export default async function LegacyProspectQueueDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("prospect_queue")
    .select("outreach_id, contact_id")
    .eq("id", id)
    .maybeSingle();

  if (data?.outreach_id) {
    redirect(`/admin/engagement/prospect-outreach/${data.outreach_id}`);
  }
  if (data?.contact_id) {
    redirect(`/admin/clients/${data.contact_id}`);
  }
  redirect("/admin/engagement/prospect-outreach");
}