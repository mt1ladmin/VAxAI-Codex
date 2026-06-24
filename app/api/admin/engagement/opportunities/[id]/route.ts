import { logActivity } from "@/lib/engagement/activity-log";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("engagement_opportunities")
    .select(`*, organisation:organisation_id(id, name), primary_contact:primary_contact_id(id, first_name, last_name)`)
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await req.json();

  const { data: before } = await supabase
    .from("engagement_opportunities")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("engagement_opportunities")
    .update(body)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (before && data) {
    if (body.stage && body.stage !== before.stage) {
      await logActivity(supabase, {
        event_type: "opportunity_stage",
        title: `Pipeline stage → ${body.stage}`,
        detail: before.stage ? `From ${before.stage}` : null,
        opportunity_id: id,
        enquiry_id: data.enquiry_id,
        outreach_id: data.outreach_id,
        contact_id: data.primary_contact_id,
        metadata: { from: before.stage, to: body.stage, stage: body.stage },
      });
    }

    if (body.enquiry_id && body.enquiry_id !== before.enquiry_id) {
      await logActivity(supabase, {
        event_type: "opportunity_linked",
        title: "Opportunity linked to enquiry",
        opportunity_id: id,
        enquiry_id: body.enquiry_id,
        contact_id: data.primary_contact_id,
      });
    }

    if (body.outreach_id && body.outreach_id !== before.outreach_id) {
      await logActivity(supabase, {
        event_type: "opportunity_linked",
        title: "Opportunity linked to Prospect Finder",
        opportunity_id: id,
        outreach_id: body.outreach_id,
        contact_id: data.primary_contact_id,
      });
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const { error } = await supabase.from("engagement_opportunities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
