import { redirect } from "next/navigation";

export default function PipelineInteractionsRedirectPage() {
  redirect("/admin/engagement/pipeline");
}