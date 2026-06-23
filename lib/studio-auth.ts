import { createSessionClient } from "@/lib/supabase";
import {
  isMemberApiAllowed,
  isPlatformAdmin,
  type StudioMembership,
  type StudioRole,
} from "@/lib/studio-access";

export async function getStudioMembership(userId: string): Promise<StudioMembership | null> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("studio_members")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.role) return null;

  return {
    userId: data.user_id as string,
    role: data.role as StudioRole,
  };
}

export async function requireStudioSession(): Promise<
  | { ok: true; userId: string; role: StudioRole }
  | { ok: false; status: number; error: string }
> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const membership = await getStudioMembership(user.id);
  if (!membership) {
    return { ok: false, status: 403, error: "No studio access" };
  }

  return { ok: true, userId: user.id, role: membership.role };
}

export async function requirePlatformAdmin(): Promise<
  | { ok: true; userId: string; role: StudioRole }
  | { ok: false; status: number; error: string }
> {
  const session = await requireStudioSession();
  if (!session.ok) return session;
  if (!isPlatformAdmin(session.role)) {
    return { ok: false, status: 403, error: "Platform admin required" };
  }
  return session;
}

export function assertMemberApiAccess(
  role: StudioRole,
  pathname: string,
  method: string,
): { ok: true } | { ok: false; status: number; error: string } {
  if (isPlatformAdmin(role)) return { ok: true };
  if (isMemberApiAllowed(pathname, method)) return { ok: true };
  return { ok: false, status: 403, error: "Forbidden" };
}