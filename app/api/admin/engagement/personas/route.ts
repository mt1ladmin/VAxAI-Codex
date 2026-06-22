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
