import { redirect } from "next/navigation";
import { prospectQueueDetailPath } from "@/lib/engagement/journey";

type Props = { params: Promise<{ id: string }> };

/** Legacy Client Work detail — merged into Prospect Queue */
export default async function LegacyClientWorkDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(prospectQueueDetailPath(id));
}