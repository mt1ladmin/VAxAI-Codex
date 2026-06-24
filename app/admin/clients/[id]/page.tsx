import { redirect } from "next/navigation";
import { prospectQueueDetailPath } from "@/lib/engagement/journey";

type Props = { params: Promise<{ id: string }> };

/** Legacy route — unified Prospect Queue detail */
export default async function LegacyClientDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(prospectQueueDetailPath(id));
}