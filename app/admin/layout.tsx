import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createSessionClient } = await import("@/lib/supabase");
      const supabase = await createSessionClient();
      const { data: { user } } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
    }
  } catch {}
  return <AdminShell userEmail={userEmail}>{children}</AdminShell>;
}
