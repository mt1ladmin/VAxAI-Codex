import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase";
import { defaultAdminHome } from "@/lib/studio-access";
import { getStudioMembership } from "@/lib/studio-auth";

export default async function AdminHome() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const membership = await getStudioMembership(user.id);
  if (!membership) {
    redirect("/admin/forbidden");
  }

  redirect(defaultAdminHome(membership.role));
}
