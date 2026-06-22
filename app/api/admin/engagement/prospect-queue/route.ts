import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const status = searchParams.get("status");
  const batchId = searchParams.get("batch_id");

  let query = supabase
    .from("prospect_queue")
    .select(`
      *,
      organisation:organisation_id(id, name, industry),
      contact:contact_id(id, first_name, last_name, professional_email)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (batchId) query = query.eq("import_batch_id", batchId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("prospect_queue")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = createServiceClient();
  const { ids } = await req.json() as { ids?: string[] };
  if (!ids?.length) return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  const { error } = await supabase.from("prospect_queue").delete().in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
