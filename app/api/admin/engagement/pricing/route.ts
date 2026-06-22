import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("engagement_pricing_rules")
    .select("*")
    .eq("status", "active")
    .order("category")
    .order("band_low");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_pricing_rules")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
