import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import { createServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

const BATCH_SIZE = 100;

/** Upsert all catalog.json records into prospect_outreach_catalog. Safe to run repeatedly. */
export async function POST() {
  const supabase = createServiceClient();
  const prospects = prospectOutreachCatalog.prospects;

  let upserted = 0;
  let failed = 0;

  for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
    const batch = prospects.slice(i, i + BATCH_SIZE);
    const rows = batch.map((p) => ({
      id: p.id,
      organisation_name: p.organisation_name,
      organisation_type: p.organisation_type,
      location: p.location,
      region: p.region,
      website: p.website,
      employees: p.employees ?? null,
      annual_revenue_gbp: p.annual_revenue_gbp ?? null,
      revenue_basis: p.revenue_basis,
      need_score: p.need_score,
      need_rationale: p.need_rationale,
      data_confidence: p.data_confidence,
      research_date: p.research_date,
      priority_region: p.priority_region,
      decision_maker_name: p.decision_maker_name,
      decision_maker_role: p.decision_maker_role,
      email: p.email,
      phone: p.phone,
      financial_source_url: p.financial_source_url,
      contact_source_url: p.contact_source_url,
      sector_tags: p.sector_tags,
      pain_point_tags: p.pain_point_tags,
      engagement_approach: p.engagement_approach,
      // Service-fit fields
      likely_need: p.likely_need ?? null,
      complexity_level: p.complexity_level ?? null,
      complexity_rationale: p.complexity_rationale ?? null,
      vaxai_direct_support: p.vaxai_direct_support ?? null,
      vaxai_partial_support: p.vaxai_partial_support ?? null,
      partner_support: p.partner_support ?? null,
      capability_boundaries: p.capability_boundaries ?? null,
      recommended_engagement: p.recommended_engagement ?? null,
      engagement_basis: p.engagement_basis ?? null,
      service_fit_summary: p.service_fit_summary ?? null,
      evidence_summary: p.evidence_summary ?? null,
      open_questions: p.open_questions ?? null,
      systems_landscape: p.systems_landscape ?? null,
      admin_capacity: p.admin_capacity ?? null,
      ai_automation_use: p.ai_automation_use ?? null,
      data_sensitivity: p.data_sensitivity ?? null,
      internal_capability: p.internal_capability ?? null,
      accessibility_considerations: p.accessibility_considerations ?? null,
      build_vs_improve: p.build_vs_improve ?? null,
      bespoke_build_fit: p.bespoke_build_fit ?? null,
      bespoke_build_note: p.bespoke_build_note ?? null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("prospect_outreach_catalog")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      console.error(`Seed batch ${i}–${i + BATCH_SIZE} error:`, error.message);
      failed += batch.length;
    } else {
      upserted += batch.length;
    }
  }

  return NextResponse.json({
    total: prospects.length,
    upserted,
    failed,
  });
}
