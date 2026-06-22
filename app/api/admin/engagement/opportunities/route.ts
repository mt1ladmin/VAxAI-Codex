import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const stage = searchParams.get("stage") || "";
  const org = searchParams.get("organisation_id") || "";
  const contact = searchParams.get("contact_id") || "";
  const enquiry = searchParams.get("enquiry_id") || "";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("engagement_opportunities")
    .select(
      `*, organisation:organisation_id(id, name), primary_contact:primary_contact_id(id, first_name, last_name)`,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) query = query.ilike("title", `%${q}%`);
  if (stage) query = query.eq("stage", stage);
  if (org) query = query.eq("organisation_id", org);
  if (contact) query = query.eq("primary_contact_id", contact);
  if (enquiry) query = query.eq("enquiry_id", enquiry);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_opportunities")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
