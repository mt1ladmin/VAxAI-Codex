import { buildPrepInsertPayload, rowToClient } from "@/lib/engagement/prospect-prep";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const { data, error } = await supabase
    .from("engagement_prospect_preps")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: (data || []).map(rowToClient),
  });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  const payload = buildPrepInsertPayload(
    {
      clientType: body.clientType || "",
      prepNotes: body.prepNotes || "",
      sector: body.sector || null,
      persona: body.persona || null,
      relevantPains: body.relevantPains || [],
      relevantVats: body.relevantVats || [],
      keywords: body.keywords || [],
    },
    body.name || "Prospect Prep",
  );

  const { data: duplicate, error: dupError } = await supabase
    .from("engagement_prospect_preps")
    .select("*")
    .eq("content_fingerprint", payload.content_fingerprint)
    .maybeSingle();

  if (dupError) return NextResponse.json({ error: dupError.message }, { status: 500 });
  if (duplicate) {
    return NextResponse.json(
      { error: "duplicate", data: rowToClient(duplicate) },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("engagement_prospect_preps")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data: rowToClient(data) }, { status: 201 });
}