import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const db = createServiceClient();

    const { data: enquiry, error: fetchErr } = await db
      .from("enquiries")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !enquiry) throw new Error("Enquiry not found");

    if (enquiry.contact_id) {
      const { data: contact } = await db
        .from("engagement_contacts")
        .select("*, organisation:organisation_id(id, name, industry)")
        .eq("id", enquiry.contact_id)
        .single();
      const { data: org } = enquiry.organisation_id
        ? await db.from("engagement_organisations").select("*").eq("id", enquiry.organisation_id).single()
        : { data: null };
      return NextResponse.json({ data: { contact, organisation: org, alreadyLinked: true } });
    }

    const nameParts = (enquiry.name as string).trim().split(/\s+/);
    const firstName = nameParts[0] || enquiry.name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    const { data: org, error: orgErr } = await db
      .from("engagement_organisations")
      .insert({
        name: enquiry.name,
        source: "website_enquiry",
        status: "Prospect",
        notes: `Created from website enquiry ${id}. Query: ${enquiry.support_type}`,
      })
      .select()
      .single();
    if (orgErr) throw orgErr;

    const { data: contact, error: contactErr } = await db
      .from("engagement_contacts")
      .insert({
        organisation_id: org.id,
        first_name: firstName,
        last_name: lastName,
        professional_email: enquiry.email,
        phone: enquiry.telephone,
        preferred_channel: enquiry.preferred_contact,
        contact_source: "website_enquiry",
        notes: enquiry.details,
      })
      .select("*, organisation:organisation_id(id, name, industry)")
      .single();
    if (contactErr) throw contactErr;

    const { data: updated, error: updateErr } = await db
      .from("enquiries")
      .update({
        contact_id: contact.id,
        organisation_id: org.id,
        last_action: "Linked to CRM contact",
        last_action_date: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, posts(id, title, slug)")
      .single();
    if (updateErr) throw updateErr;

    return NextResponse.json({ data: { contact, organisation: org, enquiry: updated } }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}