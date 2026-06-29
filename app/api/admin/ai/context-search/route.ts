import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  type: "enquiry" | "client" | "outreach";
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

  const [enquiryRes, contactRes, catalogRes, overrideRes] = await Promise.all([
    supabase
      .from("enquiries")
      .select("id, name, email, support_type, status")
      .or(`name.ilike.${search},email.ilike.${search}`)
      .limit(8),

    supabase
      .from("engagement_contacts")
      .select("id, first_name, last_name, professional_email, role, organisation:organisation_id(name)")
      .or(`first_name.ilike.${search},last_name.ilike.${search},professional_email.ilike.${search}`)
      .limit(8),

    supabase
      .from("prospect_outreach_catalog")
      .select("id, organisation_name, decision_maker_name, email, location")
      .or(`organisation_name.ilike.${search},decision_maker_name.ilike.${search},email.ilike.${search},location.ilike.${search}`)
      .limit(8),

    // Also search overridden names stored in the overrides JSON blob
    supabase
      .from("prospect_outreach_overrides")
      .select("outreach_id, overrides")
      .limit(200),
  ]);

  // Build a map of outreach_id → effective name/decision_maker from overrides
  type OverrideFields = { organisation_name?: string; decision_maker_name?: string };
  const overrideMap = new Map<string, OverrideFields>();
  for (const row of overrideRes.data ?? []) {
    const ov = (row.overrides as OverrideFields | null) ?? {};
    if (ov.organisation_name || ov.decision_maker_name) {
      overrideMap.set(row.outreach_id as string, ov);
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

  for (const c of contactRes.data ?? []) {
    const rawOrg = c.organisation as unknown;
    const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as { name: string } | null | undefined;
    results.push({
      type: "client",
      id: c.id,
      label: `${c.first_name} ${c.last_name ?? ""}`.trim(),
      sublabel: org?.name ?? (c.professional_email as string | null),
      status: null,
    });
  }

  const seenOutreachIds = new Set<string>();

  for (const p of catalogRes.data ?? []) {
    const ov = overrideMap.get(p.id as string) ?? {};
    const label = (ov.organisation_name ?? p.organisation_name) as string;
    const sublabel = ((ov.decision_maker_name ?? p.decision_maker_name) as string | null) || (p.email as string | null) || null;
    seenOutreachIds.add(p.id as string);
    results.push({ type: "outreach", id: p.id as string, label, sublabel, status: null });
  }

  // Find prospects matched only by their overridden name (not in catalog results above)
  const lq = q.toLowerCase();
  for (const [outreachId, ov] of overrideMap) {
    if (seenOutreachIds.has(outreachId)) continue;
    const name = ov.organisation_name ?? "";
    const dm = ov.decision_maker_name ?? "";
    if (name.toLowerCase().includes(lq) || dm.toLowerCase().includes(lq)) {
      results.push({
        type: "outreach",
        id: outreachId,
        label: name || outreachId,
        sublabel: dm || null,
        status: null,
      });
    }
  }

  return NextResponse.json({ data: results });
}