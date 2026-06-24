import { redirect } from "next/navigation";
import { PROSPECT_QUEUE_PATH } from "@/lib/engagement/journey";

/** Legacy Client Work list — merged into Prospect Queue */
export default function LegacyClientWorkListPage() {
  redirect(PROSPECT_QUEUE_PATH);
}