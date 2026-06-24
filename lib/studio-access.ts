export type StudioRole = "platform_admin" | "member";

export type StudioMembership = {
  userId: string;
  role: StudioRole;
};

/** Page routes a studio member (non–platform-admin) may access */
const MEMBER_PAGE_PREFIXES = [
  "/admin/enquiries",
  "/admin/calendar",
  "/admin/posts",
  "/admin/authors",
  "/admin/engagement/knowledge",
  "/admin/engagement/prospect-queue",
  "/admin/engagement/prospect-outreach",
  "/admin/engagement/pipeline",
] as const;

/** API routes a studio member may call */
const MEMBER_API_PREFIXES = [
  "/api/admin/enquiries",
  "/api/admin/engagement/work-today",
  "/api/admin/posts",
  "/api/admin/authors",
  "/api/admin/social-posts",
  "/api/admin/upload",
  "/api/admin/engagement/team-members",
  "/api/admin/engagement/sectors",
  "/api/admin/engagement/personas",
  "/api/admin/engagement/pain-points",
  "/api/admin/engagement/vat-prompts",
  "/api/admin/engagement/opportunities",
  "/api/admin/engagement/tasks",
  "/api/admin/engagement/contacts",
  "/api/admin/engagement/prospect-queue",
  "/api/admin/engagement/prospect-outreach",
  "/api/admin/engagement/prospect-finder",
  "/api/admin/engagement/knowledge-attachments",
  "/api/admin/engagement/ai",
  "/api/admin/engagement/activity-log",
] as const;

/** Knowledge browse APIs — members may only read */
const MEMBER_READ_ONLY_API_PREFIXES = [
  "/api/admin/engagement/sectors",
  "/api/admin/engagement/personas",
  "/api/admin/engagement/pain-points",
  "/api/admin/engagement/vat-prompts",
  "/api/admin/engagement/contacts",
] as const;

const MEMBER_PAGE_EXACT = new Set(["/admin/forbidden", "/admin/engagement"]);

const PAIN_POINT_DETAIL = /^\/admin\/engagement\/pain-points\/[^/]+/;

export function isPlatformAdmin(role: StudioRole | null | undefined): boolean {
  return role === "platform_admin";
}

export function isMemberPathAllowed(pathname: string): boolean {
  if (MEMBER_PAGE_EXACT.has(pathname)) return true;
  if (pathname === "/admin" || pathname === "/admin/") return true;

  if (MEMBER_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }

  if (PAIN_POINT_DETAIL.test(pathname)) return true;

  return false;
}

export function isMemberApiAllowed(pathname: string, method: string): boolean {
  const allowed = MEMBER_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!allowed) return false;

  const readOnly = MEMBER_READ_ONLY_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (readOnly && method !== "GET" && method !== "HEAD") return false;

  return true;
}

export function defaultAdminHome(_role: StudioRole): string {
  return "/admin/engagement";
}

/** When a member hits a platform-admin-only page, send them back safely. */
export function resolveMemberDeniedRedirect(
  blockedPathname: string,
  role: StudioRole,
  referer: string | null,
  origin: string,
): string {
  if (referer) {
    try {
      const ref = new URL(referer);
      if (
        ref.origin === origin &&
        ref.pathname !== blockedPathname &&
        isMemberPathAllowed(ref.pathname)
      ) {
        return `${ref.pathname}${ref.search}`;
      }
    } catch {
      /* ignore malformed referer */
    }
  }
  return defaultAdminHome(role);
}