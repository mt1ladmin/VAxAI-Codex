import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("engagement_personas")
    .select("*")
    .eq("status", "approved")
    .order("persona_name")
    .limit(limit);

  if (q) query = query.or(`persona_name.ilike.%${q}%,typical_role.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_personas")
    .insert({
      ...body,
      status: "approved",
      evidence_status: body.evidence_status ?? "draft",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
