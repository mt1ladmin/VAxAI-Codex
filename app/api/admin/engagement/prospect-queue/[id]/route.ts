import { logActivity } from "@/lib/engagement/activity-log";
import { ensurePreSalesOpportunity } from "@/lib/engagement/pre-sales-pipeline";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("prospect_queue")
    .select(`
      *,
      organisation:organisation_id(id, name, industry, website, size, digital_maturity),
      contact:contact_id(id, first_name, last_name, professional_email, phone, role)
    `)
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await req.json();

  const { data: before } = await supabase.from("prospect_queue").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("prospect_queue")
    .update(body)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (before && data) {
    if (body.status && body.status !== before.status) {
      await logActivity(supabase, {
        event_type: "status_change",
        title: `Status → ${body.status}`,
        detail: before.status ? `From ${before.status}` : null,
        queue_id: id,
        contact_id: data.contact_id,
        metadata: { from: before.status, to: body.status },
      });

      if (body.status === "Opportunity") {
        await ensurePreSalesOpportunity(supabase, {
          source: "queue",
          sourceId: id,
          title: `${data.raw_org_name || data.raw_contact_name || "Prospect"} — Pre-sales`,
          notes: data.raw_notes,
          desiredOutcomes: data.raw_notes,
          organisationId: data.organisation_id,
          contactId: data.contact_id,
          nextAction: data.next_action,
        });
      }

      if (body.status === "Closed" && body.last_action?.includes("Advanced")) {
        await logActivity(supabase, {
          event_type: "advanced_to_client",
          title: "Advanced to client work",
          queue_id: id,
          contact_id: data.contact_id,
        });
      }
    }

    if (body.raw_notes && body.raw_notes !== before.raw_notes) {
      await logActivity(supabase, {
        event_type: body.last_action?.includes("AI summary") ? "ai_summary" : "note_added",
        title: body.last_action?.includes("AI summary") ? "AI summary saved" : "Note added",
        detail: body.last_action?.slice(0, 200) ?? null,
        queue_id: id,
        contact_id: data.contact_id,
      });
    }

    if (
      (body.next_action !== undefined && body.next_action !== before.next_action) ||
      (body.next_action_date !== undefined && body.next_action_date !== before.next_action_date)
    ) {
      await logActivity(supabase, {
        event_type: "next_action",
        title: "Next action updated",
        detail: data.next_action ?? null,
        queue_id: id,
        contact_id: data.contact_id,
        metadata: { due: data.next_action_date },
      });
    }

    const contactFields = ["raw_contact_name", "raw_email", "raw_phone", "raw_linkedin"] as const;
    if (contactFields.some((f) => body[f] !== undefined && body[f] !== before[f])) {
      await logActivity(supabase, {
        event_type: "contact_updated",
        title: "Contact details updated",
        queue_id: id,
        contact_id: data.contact_id,
      });
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const { error } = await supabase.from("prospect_queue").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}