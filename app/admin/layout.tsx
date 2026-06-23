import AdminShell from "@/components/admin/AdminShell";
import { StudioAccessProvider } from "@/lib/studio-access-context";
import { getStudioMembership } from "@/lib/studio-auth";
import type { StudioRole } from "@/lib/studio-access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;
  let studioRole: StudioRole | null = null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createSessionClient } = await import("@/lib/supabase");
      const supabase = await createSessionClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
      if (user) {
        const membership = await getStudioMembership(user.id);
        studioRole = membership?.role ?? null;
      }
    }
  } catch {}

  if (!studioRole) {
    return <AdminShell userEmail={userEmail}>{children}</AdminShell>;
  }

  return (
    <StudioAccessProvider role={studioRole}>
      <AdminShell userEmail={userEmail} studioRole={studioRole}>
        {children}
      </AdminShell>
    </StudioAccessProvider>
  );
}
