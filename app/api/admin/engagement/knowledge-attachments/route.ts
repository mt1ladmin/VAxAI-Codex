import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type AttachmentBody = {
  outreach_id?: string | null;
  enquiry_id?: string | null;
  contact_id?: string | null;
  sector_ids?: string[];
  persona_ids?: string[];
  pain_point_ids?: string[];
};

function parentFilter(body: AttachmentBody) {
  if (body.outreach_id) return { col: "outreach_id" as const, val: body.outreach_id };
  if (body.enquiry_id) return { col: "enquiry_id" as const, val: body.enquiry_id };
  if (body.contact_id) return { col: "contact_id" as const, val: body.contact_id };
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outreachId = searchParams.get("outreach_id");
  const enquiryId = searchParams.get("enquiry_id");
  const contactId = searchParams.get("contact_id");

  const parent =
    outreachId ? { col: "outreach_id" as const, val: outreachId }
    : enquiryId ? { col: "enquiry_id" as const, val: enquiryId }
    : contactId ? { col: "contact_id" as const, val: contactId }
    : null;

  if (!parent) {
    return NextResponse.json({ error: "outreach_id, enquiry_id, or contact_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("engagement_knowledge_attachments")
    .select("*")
    .eq(parent.col, parent.val)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? null });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as AttachmentBody;
  const parent = parentFilter(body);
  if (!parent) {
    return NextResponse.json({ error: "Exactly one parent id required" }, { status: 400 });
  }

  const payload = {
    sector_ids: body.sector_ids ?? [],
    persona_ids: body.persona_ids ?? [],
    pain_point_ids: body.pain_point_ids ?? [],
    updated_at: new Date().toISOString(),
    outreach_id: parent.col === "outreach_id" ? parent.val : null,
    enquiry_id: parent.col === "enquiry_id" ? parent.val : null,
    contact_id: parent.col === "contact_id" ? parent.val : null,
  };

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("engagement_knowledge_attachments")
    .select("id")
    .eq(parent.col, parent.val)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("engagement_knowledge_attachments")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from("engagement_knowledge_attachments")
    .insert({ ...payload, [parent.col]: parent.val })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}