import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const needScore = searchParams.get("need_score");
  const confidence = searchParams.get("confidence");
  const type = searchParams.get("type");
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  let data = prospectOutreachCatalog.prospects;

  if (region) data = data.filter((p) => p.region === region);
  if (needScore) data = data.filter((p) => p.need_score === parseInt(needScore, 10));
  if (confidence) data = data.filter((p) => p.data_confidence === confidence);
  if (type) data = data.filter((p) => p.organisation_type === type);
  if (q) {
    data = data.filter(
      (p) =>
        p.organisation_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.decision_maker_name.toLowerCase().includes(q) ||
        p.sector_tags.some((t) => t.toLowerCase().includes(q)) ||
        p.need_rationale.toLowerCase().includes(q),
    );
  }

  return NextResponse.json({
    meta: prospectOutreachCatalog.meta,
    data,
    count: data.length,
  });
}

function toQueuePayload(p: ProspectOutreachRecord) {
  const notes = [
    `Need score: ${p.need_score}/5`,
    p.need_rationale,
    p.engagement_approach ? `Approach: ${p.engagement_approach}` : "",
    p.employees ? `Employees: ${p.employees}` : "",
    p.annual_revenue_gbp ? `Revenue: £${p.annual_revenue_gbp.toLocaleString("en-GB")}` : "",
    p.revenue_basis ? `Revenue basis: ${p.revenue_basis}` : "",
    `Confidence: ${p.data_confidence}`,
    `Research date: ${p.research_date}`,
    p.financial_source_url ? `Financial source: ${p.financial_source_url}` : "",
    p.contact_source_url ? `Contact source: ${p.contact_source_url}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    raw_org_name: p.organisation_name,
    raw_contact_name: [p.decision_maker_name, p.decision_maker_role].filter(Boolean).join(" — ") || null,
    raw_email: p.email || null,
    raw_phone: p.phone || null,
    raw_website: p.website || null,
    raw_industry: p.sector_tags[0] || p.organisation_type,
    raw_location: `${p.location}, ${p.region}`,
    raw_notes: notes,
    status: "Ready to contact",
    tags: [
      "prospect-outreach",
      p.region,
      `need-${p.need_score}`,
      ...p.sector_tags.slice(0, 2),
    ].filter(Boolean),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ids } = body as { ids?: string[] };

  if (!ids?.length) {
    return NextResponse.json({ error: "No prospect IDs provided" }, { status: 400 });
  }

  const selected = prospectOutreachCatalog.prospects.filter((p) => ids.includes(p.id));
  if (!selected.length) {
    return NextResponse.json({ error: "No matching prospects found" }, { status: 404 });
  }

  const supabase = createServiceClient();
  const payloads = selected.map(toQueuePayload);
  const { data, error } = await supabase.from("prospect_queue").insert(payloads).select("id, raw_org_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data, count: data?.length ?? 0 }, { status: 201 });
}