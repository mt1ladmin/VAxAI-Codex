import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const channel = searchParams.get("channel") || "";
  const block_type = searchParams.get("block_type") || "";
  const tone = searchParams.get("tone") || "";

  let query = supabase
    .from("engagement_scripts")
    .select("*")
    .eq("status", "approved")
    .order("title");

  if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  if (channel) query = query.eq("channel", channel);
  if (block_type) query = query.eq("block_type", block_type);
  if (tone) query = query.eq("tone", tone);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_scripts")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
