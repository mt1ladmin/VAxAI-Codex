import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  defaultAdminHome,
  isMemberApiAllowed,
  isMemberPathAllowed,
  isPlatformAdmin,
  type StudioRole,
} from "@/lib/studio-access";

async function resolveStudioRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<StudioRole | null> {
  const { data } = await supabase
    .from("studio_members")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return (data?.role as StudioRole | undefined) ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin/logout")) {
    return response;
  }

  if (pathname.startsWith("/admin/login")) {
    if (user) {
      const role = await resolveStudioRole(supabase, user.id);
      const dest = role ? defaultAdminHome(role) : "/admin/forbidden";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  if (pathname.startsWith("/admin/forbidden")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/api/admin")) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await resolveStudioRole(supabase, user.id);
    if (!role) {
      return NextResponse.json({ error: "No studio access" }, { status: 403 });
    }

    if (!isPlatformAdmin(role) && !isMemberApiAllowed(pathname, request.method)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const role = await resolveStudioRole(supabase, user.id);
    if (!role) {
      return NextResponse.redirect(new URL("/admin/forbidden", request.url));
    }

    if (pathname === "/admin" || pathname === "/admin/") {
      return NextResponse.redirect(new URL(defaultAdminHome(role), request.url));
    }

    if (!isPlatformAdmin(role) && !isMemberPathAllowed(pathname)) {
      return NextResponse.redirect(new URL("/admin/forbidden", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};