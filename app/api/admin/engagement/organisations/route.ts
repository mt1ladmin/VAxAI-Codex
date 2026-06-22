import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const industry = searchParams.get("industry") || "";
  const audience = searchParams.get("audience") || "";
  const size = searchParams.get("size") || "";
  const maturity = searchParams.get("maturity") || "";
  const status = searchParams.get("status") || "";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("engagement_organisations")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) query = query.or(`name.ilike.%${q}%,industry.ilike.%${q}%,town_city.ilike.%${q}%`);
  if (industry) query = query.eq("industry", industry);
  if (audience) query = query.eq("audience_type", audience);
  if (size) query = query.eq("size", size);
  if (maturity) query = query.eq("digital_maturity", maturity);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_organisations")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
