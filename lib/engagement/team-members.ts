export type StudioTeamMember = {
  id: string;
  created_at: string;
  updated_at: string;
  display_name: string;
  user_email: string | null;
  is_active: boolean;
  sort_order: number;
};

export function activeTeamMemberOptions(members: StudioTeamMember[]) {
  return members
    .filter((m) => m.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.display_name.localeCompare(b.display_name))
    .map((m) => ({ value: m.id, label: m.display_name }));
}

export function teamMemberLabel(
  members: StudioTeamMember[],
  id: string | null | undefined,
): string | null {
  if (!id) return null;
  const match = members.find((m) => m.id === id);
  return match?.display_name ?? null;
}

export function teamMemberForUserEmail(
  members: StudioTeamMember[],
  userEmail: string | null | undefined,
): StudioTeamMember | null {
  if (!userEmail) return null;
  const normalized = userEmail.trim().toLowerCase();
  return (
    members.find((m) => m.user_email?.trim().toLowerCase() === normalized) ??
    members.find((m) => m.display_name.trim().toLowerCase() === normalized.split("@")[0]) ??
    null
  );
}