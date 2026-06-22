import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const dimension = searchParams.get("dimension") || "";
  const tags = searchParams.get("tags") || "";

  let query = supabase
    .from("engagement_vat_prompts")
    .select("*")
    .eq("status", "approved")
    .order("dimension")
    .order("sort_order");

  if (category) query = query.eq("category", category);
  if (dimension) query = query.eq("dimension", dimension as "value" | "alignment" | "trust");
  if (tags) {
    const tagArr = tags.split(",");
    query = query.overlaps("context_tags", tagArr);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_vat_prompts")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
