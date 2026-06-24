import { logActivity } from "@/lib/engagement/activity-log";
import { isFinderEngagementStatus } from "@/lib/engagement/engagement-status";
import { getBaseRecord, loadOverrideMaps, loadTeamMembers } from "@/lib/engagement/prospect-finder/load-catalog";
import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const outreach_id = body.outreach_id as string | undefined;
  const opportunity_description = (body.opportunity_description as string | undefined)?.trim();
  const assigned_team_member_id = body.assigned_team_member_id as string | undefined;

  if (!outreach_id) {
    return NextResponse.json({ error: "outreach_id required" }, { status: 400 });
  }
  if (!opportunity_description) {
    return NextResponse.json({ error: "opportunity_description required" }, { status: 400 });
  }
  if (!assigned_team_member_id) {
    return NextResponse.json({ error: "assigned_team_member_id required" }, { status: 400 });
  }

  const base = getBaseRecord(outreach_id);
  if (!base) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const supabase = createServiceClient();
  const [{ overrides, rows }, members] = await Promise.all([
    loadOverrideMaps(supabase),
    loadTeamMembers(supabase),
  ]);

  const existing = rows.get(outreach_id);
  if (existing?.opportunity_id) {
    return NextResponse.json(
      { error: "Prospect is already in Prospect Queue", opportunity_id: existing.opportunity_id },
      { status: 409 },
    );
  }

  const member = members.find((m) => m.id === assigned_team_member_id);
  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 400 });
  }

  const merged = mergeProspectRecord(base, overrides.get(outreach_id)) as ProspectOutreachRecord;
  const reviewNotes = existing?.review_notes ?? null;

  const orgRes = await supabase
    .from("engagement_organisations")
    .insert({
      name: merged.organisation_name,
      industry: merged.sector_tags[0] || merged.organisation_type,
      website: merged.website || null,
      main_location: merged.location || null,
      region: merged.region || null,
      source: "prospect_finder",
      status: "Prospect",
    })
    .select("id")
    .single();

  if (orgRes.error || !orgRes.data) {
    return NextResponse.json({ error: orgRes.error?.message || "Failed to create organisation" }, { status: 400 });
  }

  const nameParts = merged.decision_maker_name.trim().split(/\s+/);
  const firstName = nameParts[0] || merged.decision_maker_name || "Contact";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  const contactRes = await supabase
    .from("engagement_contacts")
    .insert({
      organisation_id: orgRes.data.id,
      first_name: firstName,
      last_name: lastName,
      role: merged.decision_maker_role || null,
      professional_email: merged.email || null,
      phone: merged.phone || null,
      contact_source: "prospect_finder",
    })
    .select("id")
    .single();

  if (contactRes.error || !contactRes.data) {
    return NextResponse.json({ error: contactRes.error?.message || "Failed to create contact" }, { status: 400 });
  }

  const oppRes = await supabase
    .from("engagement_opportunities")
    .insert({
      title: `${merged.organisation_name} — ${opportunity_description}`.slice(0, 120),
      organisation_id: orgRes.data.id,
      primary_contact_id: contactRes.data.id,
      stage: "Identified",
      notes: reviewNotes,
      desired_outcomes: opportunity_description,
      next_action: existing?.next_action ?? null,
      outreach_id,
      assigned_team_member_id,
    })
    .select("id")
    .single();

  if (oppRes.error || !oppRes.data) {
    return NextResponse.json({ error: oppRes.error?.message || "Failed to create opportunity" }, { status: 400 });
  }

  const engagement_status = "In prospect queue";

  await supabase.from("prospect_outreach_overrides").upsert({
    outreach_id,
    overrides: overrides.get(outreach_id) || {},
    review_notes: reviewNotes,
    assigned_team_member_id,
    engagement_status,
    opportunity_description,
    opportunity_id: oppRes.data.id,
    pipeline_contact_id: contactRes.data.id,
    updated_at: new Date().toISOString(),
  });

  const { data: outreachLinks } = await supabase
    .from("engagement_knowledge_attachments")
    .select("sector_ids, persona_ids, pain_point_ids")
    .eq("outreach_id", outreach_id)
    .maybeSingle();

  if (outreachLinks) {
    await supabase.from("engagement_knowledge_attachments").upsert({
      contact_id: contactRes.data.id,
      sector_ids: outreachLinks.sector_ids,
      persona_ids: outreachLinks.persona_ids,
      pain_point_ids: outreachLinks.pain_point_ids,
      updated_at: new Date().toISOString(),
    });
  }

  await supabase
    .from("engagement_tasks")
    .update({
      contact_id: contactRes.data.id,
      organisation_id: orgRes.data.id,
      opportunity_id: oppRes.data.id,
    })
    .eq("outreach_id", outreach_id);

  await logActivity(supabase, {
    event_type: "moved_to_prospect_queue",
    title: "Moved to Prospect Queue",
    detail: opportunity_description,
    outreach_id,
    opportunity_id: oppRes.data.id,
    contact_id: contactRes.data.id,
    metadata: { assigned_team_member_id, engagement_status },
  });

  return NextResponse.json({
    data: {
      outreach_id,
      opportunity_id: oppRes.data.id,
      contact_id: contactRes.data.id,
      organisation_id: orgRes.data.id,
      engagement_status,
      assigned_team_member_name: member.display_name,
    },
  }, { status: 201 });
}