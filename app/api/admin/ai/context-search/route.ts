import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  type: "enquiry" | "outreach";
  id: string;
  label: string;
  sublabel: string | null;
  status: string | null;
};

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const search = `%${q}%`;

  type OverrideFields = { organisation_name?: string; decision_maker_name?: string };

  const [enquiryRes, catalogRes, overrideOrgRes, overrideDmRes] = await Promise.all([
    supabase
      .from("enquiries")
      .select("id, name, email, support_type, status")
      .or(`name.ilike.${search},email.ilike.${search}`)
      .limit(6),

    supabase
      .from("prospect_outreach_catalog")
      .select("id, organisation_name, decision_maker_name, email, location")
      .or(`organisation_name.ilike.${search},decision_maker_name.ilike.${search},email.ilike.${search},location.ilike.${search}`)
      .limit(6),

    // Search overridden org names via JSONB path — Postgres does the filtering
    supabase
      .from("prospect_outreach_overrides")
      .select("outreach_id, overrides")
      .ilike("overrides->>organisation_name", search)
      .limit(6),

    // Search overridden decision maker names via JSONB path
    supabase
      .from("prospect_outreach_overrides")
      .select("outreach_id, overrides")
      .ilike("overrides->>decision_maker_name", search)
      .limit(6),
  ]);

  // Build a map of outreach_id → effective overrides from the targeted override queries
  const overrideMap = new Map<string, OverrideFields>();
  for (const row of [...(overrideOrgRes.data ?? []), ...(overrideDmRes.data ?? [])]) {
    if (!overrideMap.has(row.outreach_id as string)) {
      overrideMap.set(row.outreach_id as string, (row.overrides as OverrideFields | null) ?? {});
    }
  }

  const results: SearchResult[] = [];

  for (const e of enquiryRes.data ?? []) {
    results.push({
      type: "enquiry",
      id: e.id,
      label: e.name as string,
      sublabel: e.email as string,
      status: e.status as string,
    });
  }

  // Prospects matched by original catalog name (show effective/overridden label)
  const seenOutreachIds = new Set<string>();
  for (const p of catalogRes.data ?? []) {
    const ov = overrideMap.get(p.id as string) ?? {};
    const label = (ov.organisation_name ?? p.organisation_name) as string;
    const sublabel = ((ov.decision_maker_name ?? p.decision_maker_name) as string | null) || (p.email as string | null) || null;
    seenOutreachIds.add(p.id as string);
    results.push({ type: "outreach", id: p.id as string, label, sublabel, status: null });
  }

  // Resolve override-only matches against the live Finder catalogue. Deleted
  // catalogue rows are intentionally excluded even if an old override remains.
  const overrideOnlyIds = [...overrideMap.keys()].filter((id) => !seenOutreachIds.has(id));
  const { data: liveOverrideMatches } = overrideOnlyIds.length
    ? await supabase
        .from("prospect_outreach_catalog")
        .select("id, organisation_name, decision_maker_name, email")
        .in("id", overrideOnlyIds)
    : { data: [] };

  for (const prospect of liveOverrideMatches ?? []) {
    const outreachId = prospect.id as string;
    const ov = overrideMap.get(outreachId) ?? {};
    if (seenOutreachIds.has(outreachId)) continue;
    const label = ov.organisation_name ?? (prospect.organisation_name as string);
    const sublabel = ov.decision_maker_name ?? (prospect.decision_maker_name as string | null) ?? (prospect.email as string | null);
    results.push({ type: "outreach", id: outreachId, label, sublabel, status: null });
  }

  return NextResponse.json({ data: results.slice(0, 10) });
}
