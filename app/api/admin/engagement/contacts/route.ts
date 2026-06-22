import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const org = searchParams.get("organisation_id") || "";
  const suppressed = searchParams.get("suppressed");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("engagement_contacts")
    .select(
      `*, organisation:organisation_id(id, name, industry)`,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,professional_email.ilike.%${q}%,role.ilike.%${q}%`);
  if (org) query = query.eq("organisation_id", org);
  if (suppressed !== null) query = query.eq("is_suppressed", suppressed === "true");

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  // Check suppression list
  if (body.professional_email) {
    const { data: suppressed } = await supabase
      .from("engagement_suppression_list")
      .select("id")
      .eq("email", body.professional_email)
      .maybeSingle();
    if (suppressed) {
      body.is_suppressed = true;
      body.suppression_reason = "Found on suppression list";
    }
  }

  const { data, error } = await supabase
    .from("engagement_contacts")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
