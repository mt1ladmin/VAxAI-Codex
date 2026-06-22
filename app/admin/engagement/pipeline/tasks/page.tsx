import { redirect } from "next/navigation";

export default function TasksRedirectPage() {
  redirect("/admin/engagement/pipeline?tab=tasks");
}