import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "type and id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (type === "enquiry") {
    const { data } = await supabase
      .from("enquiries")
      .select("id, name, email, support_type, status, details, telephone, last_action, next_action, admin_notes")
      .eq("id", id)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const label = data.name || data.email || "Enquiry";
    const summary = [
      `Name: ${data.name} | Email: ${data.email}`,
      `Support type: ${data.support_type} | Status: ${data.status}`,
      data.telephone ? `Phone: ${data.telephone}` : null,
      data.last_action ? `Last action: ${data.last_action}` : null,
      data.next_action ? `Next action: ${data.next_action}` : null,
      data.details ? `Details: ${String(data.details).slice(0, 400)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({ type: "enquiry", id: data.id, label, summary });
  }

  if (type === "prospect") {
    const { data } = await supabase
      .from("prospect_queue")
      .select(
        "id, raw_org_name, raw_contact_name, raw_email, raw_industry, raw_location, status, raw_notes, last_action, next_action",
      )
      .eq("id", id)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const label = data.raw_org_name || data.raw_contact_name || "Prospect";
    const summary = [
      `Organisation: ${data.raw_org_name || "—"} | Contact: ${data.raw_contact_name || "—"}`,
      data.raw_email ? `Email: ${data.raw_email}` : null,
      data.raw_industry ? `Industry: ${data.raw_industry}` : null,
      data.raw_location ? `Location: ${data.raw_location}` : null,
      `Status: ${data.status}`,
      data.last_action ? `Last action: ${data.last_action}` : null,
      data.next_action ? `Next action: ${data.next_action}` : null,
      data.raw_notes ? `Notes: ${String(data.raw_notes).slice(0, 300)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({ type: "prospect", id: data.id, label, summary });
  }

  if (type === "client") {
    const { data } = await supabase
      .from("engagement_contacts")
      .select("id, first_name, last_name, professional_email, role, notes, organisation:organisation_id(name)")
      .eq("id", id)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rawOrg = data.organisation as unknown;
    const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as { name: string } | null | undefined;
    const fullName = `${data.first_name}${data.last_name ? ` ${data.last_name}` : ""}`.trim();
    const label = fullName || org?.name || "Client";
    const summary = [
      `Name: ${fullName} | Email: ${data.professional_email ?? "—"}`,
      data.role ? `Role: ${data.role}` : null,
      org?.name ? `Organisation: ${org.name}` : null,
      data.notes ? `Notes: ${String(data.notes).slice(0, 300)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({ type: "client", id: data.id, label, summary });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}