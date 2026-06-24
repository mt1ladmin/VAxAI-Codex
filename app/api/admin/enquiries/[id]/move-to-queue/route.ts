import { logActivity } from "@/lib/engagement/activity-log";
import { PRE_SALES_STATUS } from "@/lib/engagement/journey";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: enquiryId } = await params;
  const body = (await req.json()) as {
    opportunity_description?: string;
    assigned_team_member_id?: string;
  };

  const opportunity_description = body.opportunity_description?.trim();
  const assigned_team_member_id = body.assigned_team_member_id;

  if (!opportunity_description) {
    return NextResponse.json({ error: "opportunity_description required" }, { status: 400 });
  }
  if (!assigned_team_member_id) {
    return NextResponse.json({ error: "assigned_team_member_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: enquiry, error: enqErr } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", enquiryId)
    .single();

  if (enqErr || !enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  if (enquiry.status !== PRE_SALES_STATUS) {
    return NextResponse.json(
      { error: `Set enquiry status to ${PRE_SALES_STATUS} before moving to Prospect Queue` },
      { status: 400 },
    );
  }

  const { data: existingOpp } = await supabase
    .from("engagement_opportunities")
    .select("id, primary_contact_id")
    .eq("enquiry_id", enquiryId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingOpp?.primary_contact_id) {
    return NextResponse.json(
      {
        error: "Enquiry is already in Prospect Queue",
        opportunity_id: existingOpp.id,
        contact_id: existingOpp.primary_contact_id,
      },
      { status: 409 },
    );
  }

  const { data: member } = await supabase
    .from("studio_team_members")
    .select("id, display_name")
    .eq("id", assigned_team_member_id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 400 });
  }

  let orgId = enquiry.organisation_id as string | null;
  let contactId = enquiry.contact_id as string | null;

  const nameParts = (enquiry.name as string).trim().split(/\s+/);
  const firstName = nameParts[0] || enquiry.name;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  if (!orgId) {
    const orgRes = await supabase
      .from("engagement_organisations")
      .insert({
        name: enquiry.name,
        source: "website_enquiry",
        status: "Prospect",
      })
      .select("id")
      .single();
    if (orgRes.error || !orgRes.data) {
      return NextResponse.json({ error: orgRes.error?.message || "Failed to create organisation" }, { status: 400 });
    }
    orgId = orgRes.data.id;
  }

  if (!contactId) {
    const contactRes = await supabase
      .from("engagement_contacts")
      .insert({
        organisation_id: orgId,
        first_name: firstName,
        last_name: lastName,
        professional_email: enquiry.email,
        phone: enquiry.telephone,
        contact_source: "website_enquiry",
      })
      .select("id")
      .single();
    if (contactRes.error || !contactRes.data) {
      return NextResponse.json({ error: contactRes.error?.message || "Failed to create contact" }, { status: 400 });
    }
    contactId = contactRes.data.id;
  }

  const oppRes = await supabase
    .from("engagement_opportunities")
    .insert({
      title: `${enquiry.name} — ${enquiry.support_type}`.slice(0, 120),
      organisation_id: orgId,
      primary_contact_id: contactId,
      stage: "Identified",
      notes: enquiry.admin_notes,
      desired_outcomes: opportunity_description,
      recommended_pathway: (enquiry.details as string)?.slice(0, 4000) || null,
      next_action: enquiry.next_action,
      enquiry_id: enquiryId,
      assigned_team_member_id,
    })
    .select("id")
    .single();

  if (oppRes.error || !oppRes.data) {
    return NextResponse.json({ error: oppRes.error?.message || "Failed to create opportunity" }, { status: 400 });
  }

  await supabase
    .from("enquiries")
    .update({
      contact_id: contactId,
      organisation_id: orgId,
      last_action: "Moved to Prospect Queue",
      last_action_date: new Date().toISOString(),
    })
    .eq("id", enquiryId);

  const { data: enquiryLinks } = await supabase
    .from("engagement_knowledge_attachments")
    .select("sector_ids, persona_ids, pain_point_ids")
    .eq("enquiry_id", enquiryId)
    .maybeSingle();

  if (enquiryLinks) {
    await supabase.from("engagement_knowledge_attachments").upsert({
      contact_id: contactId,
      sector_ids: enquiryLinks.sector_ids,
      persona_ids: enquiryLinks.persona_ids,
      pain_point_ids: enquiryLinks.pain_point_ids,
      updated_at: new Date().toISOString(),
    });
  }

  await supabase
    .from("engagement_tasks")
    .update({
      contact_id: contactId,
      organisation_id: orgId,
      opportunity_id: oppRes.data.id,
    })
    .eq("enquiry_id", enquiryId);

  await logActivity(supabase, {
    event_type: "moved_to_prospect_queue",
    title: "Moved to Prospect Queue",
    detail: opportunity_description,
    enquiry_id: enquiryId,
    opportunity_id: oppRes.data.id,
    contact_id: contactId,
    metadata: { assigned_team_member_id, source: "website_enquiry" },
  });

  return NextResponse.json({
    data: {
      enquiry_id: enquiryId,
      opportunity_id: oppRes.data.id,
      contact_id: contactId,
      organisation_id: orgId,
      assigned_team_member_name: member.display_name,
    },
  }, { status: 201 });
}