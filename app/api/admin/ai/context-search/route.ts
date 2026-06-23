import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  type: "enquiry" | "client" | "prospect";
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

  const [enquiryRes, contactRes, prospectRes] = await Promise.all([
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
      .from("prospect_queue")
      .select("id, raw_org_name, raw_contact_name, raw_email, status")
      .or(`raw_org_name.ilike.${search},raw_contact_name.ilike.${search},raw_email.ilike.${search}`)
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
    const org = c.organisation as { name: string } | null;
    results.push({
      type: "client",
      id: c.id,
      label: `${c.first_name} ${c.last_name ?? ""}`.trim(),
      sublabel: org?.name ?? (c.professional_email as string | null),
      status: null,
    });
  }

  for (const p of prospectRes.data ?? []) {
    results.push({
      type: "prospect",
      id: p.id,
      label: (p.raw_org_name as string) || (p.raw_contact_name as string) || "Unknown",
      sublabel: p.raw_contact_name as string | null,
      status: p.status as string,
    });
  }

  return NextResponse.json({ data: results });
}
