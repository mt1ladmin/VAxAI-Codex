import { redirect } from "next/navigation";
import { PROSPECT_QUEUE_PATH } from "@/lib/engagement/journey";

/** Legacy route — unified Prospect Queue */
export default function LegacyClientsListPage() {
  redirect(PROSPECT_QUEUE_PATH);
}