import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active_only") !== "false";

  let query = supabase
    .from("studio_team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("display_name", { ascending: true });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const display_name = (body.display_name as string | undefined)?.trim();
  if (!display_name) {
    return NextResponse.json({ error: "display_name required" }, { status: 400 });
  }

  const { data: maxRow } = await supabase
    .from("studio_team_members")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("studio_team_members")
    .insert({
      display_name,
      user_email: body.user_email?.trim() || null,
      is_active: body.is_active !== false,
      sort_order: (maxRow?.sort_order ?? 0) + 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}