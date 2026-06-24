import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  type: "enquiry" | "client" | "prospect" | "outreach";
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
  const qLower = q.toLowerCase();

  const [enquiryRes, contactRes] = await Promise.all([
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
  ]);

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

  const catalogMatches = prospectOutreachCatalog.prospects
    .filter(
      (p) =>
        p.organisation_name.toLowerCase().includes(qLower) ||
        p.decision_maker_name.toLowerCase().includes(qLower) ||
        p.email.toLowerCase().includes(qLower) ||
        p.location.toLowerCase().includes(qLower),
    )
    .slice(0, 8);

  for (const p of catalogMatches) {
    results.push({
      type: "outreach",
      id: p.id,
      label: p.organisation_name,
      sublabel: p.decision_maker_name || p.email || null,
      status: null,
    });
  }

  return NextResponse.json({ data: results });
}