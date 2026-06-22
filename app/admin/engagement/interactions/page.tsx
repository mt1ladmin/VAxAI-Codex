import { redirect } from "next/navigation";

export default function InteractionsPage() {
  redirect("/admin/engagement/live-call?tab=call_records");
}