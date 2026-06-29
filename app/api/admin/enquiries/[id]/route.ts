import { appendNextActionToNotes } from "@/lib/engagement/append-note";
import { logActivity } from "@/lib/engagement/activity-log";
import { ensurePreSalesOpportunity } from "@/lib/engagement/pre-sales-pipeline";
import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import { PROSPECT_QUEUE_STATUSES } from "@/lib/engagement/types";

const VALID_STATUSES = new Set<string>(PROSPECT_QUEUE_STATUSES);

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const db = createServiceClient();
    const { data, error } = await db
      .from("enquiries")
      .select("*, posts(id, title, slug)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const body = await req.json() as {
      status?: string;
      next_action?: string | null;
      next_action_date?: string | null;
      admin_notes?: string | null;
      last_action?: string | null;
      last_action_date?: string | null;
      contact_id?: string | null;
      organisation_id?: string | null;
      sector_snapshot?: Record<string, unknown> | null;
      persona_snapshot?: Record<string, unknown> | null;
      pain_points_snapshot?: Record<string, unknown>[] | null;
      assigned_team_member_id?: string | null;
      is_client?: boolean;
      client_note?: string | null;
      source?: string | null;
      name?: string;
      email?: string;
      telephone?: string | null;
      support_type?: string;
      details?: string;
      service_fit_summary?: string | null;
      likely_need?: string | null;
      complexity_level?: string | null;
      engagement_basis?: string | null;
    };

    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (body.status !== "" && !VALID_STATUSES.has(body.status)) {
        return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
      }
      updates.status = body.status;
      updates.last_action = `Status changed to ${body.status}`;
      updates.last_action_date = new Date().toISOString();
    }
    if (body.next_action !== undefined) updates.next_action = body.next_action;
    if (body.next_action_date !== undefined) updates.next_action_date = body.next_action_date;
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
    if (body.last_action !== undefined) updates.last_action = body.last_action;
    if (body.last_action_date !== undefined) updates.last_action_date = body.last_action_date;
    if (body.contact_id !== undefined) updates.contact_id = body.contact_id;
    if (body.organisation_id !== undefined) updates.organisation_id = body.organisation_id;
    if (body.sector_snapshot !== undefined) updates.sector_snapshot = body.sector_snapshot;
    if (body.persona_snapshot !== undefined) updates.persona_snapshot = body.persona_snapshot;
    if (body.pain_points_snapshot !== undefined) updates.pain_points_snapshot = body.pain_points_snapshot;
    if (body.assigned_team_member_id !== undefined) updates.assigned_team_member_id = body.assigned_team_member_id;
    if (body.is_client !== undefined) updates.is_client = body.is_client;
    if (body.client_note !== undefined) updates.client_note = body.client_note;
    if (body.source !== undefined) updates.source = body.source;
    if (body.name !== undefined && body.name.trim()) updates.name = body.name.trim();
    if (body.email !== undefined && body.email.trim()) updates.email = body.email.trim();
    if (body.telephone !== undefined) updates.telephone = body.telephone?.trim() || null;
    if (body.support_type !== undefined && body.support_type.trim()) updates.support_type = body.support_type.trim();
    if (body.details !== undefined) updates.details = body.details.trim();
    if (body.service_fit_summary !== undefined) updates.service_fit_summary = body.service_fit_summary;
    if (body.likely_need !== undefined) updates.likely_need = body.likely_need;
    if (body.complexity_level !== undefined) updates.complexity_level = body.complexity_level;
    if (body.engagement_basis !== undefined) updates.engagement_basis = body.engagement_basis;

    const db = createServiceClient();

    const { data: before } = await db.from("enquiries").select("*").eq("id", id).single();

    const { data, error } = await db
      .from("enquiries")
      .update(updates)
      .eq("id", id)
      .select("*, posts(id, title, slug)")
      .single();
    if (error) {
      const hint = error.message.includes("last_action") || error.message.includes("next_action")
        ? "Run the Supabase migration supabase/migrations/20260622_enquiry_workflow_fields.sql"
        : error.message.includes("check constraint") || error.message.includes("violates check")
          ? "Run the Supabase migration supabase/migrations/20260626_enquiry_status_constraint_fix.sql"
          : undefined;
      return NextResponse.json({ error: error.message, hint }, { status: 500 });
    }

    if (before && data) {
      if (updates.status && updates.status !== before.status) {
        await logActivity(db, {
          event_type: "status_change",
          title: `Status → ${updates.status}`,
          detail: before.status ? `From ${before.status}` : null,
          enquiry_id: id,
          contact_id: data.contact_id,
          metadata: { from: before.status, to: updates.status },
        });

        if (updates.status === "Opportunity" || updates.status === "Opportunity identified") {
          await ensurePreSalesOpportunity(db, {
            source: "enquiry",
            sourceId: id,
            title: `${data.name} — ${data.support_type}`.slice(0, 120),
            notes: data.details,
            desiredOutcomes: data.details,
            organisationId: data.organisation_id,
            contactId: data.contact_id,
            nextAction: data.next_action,
          });
        }

        if (updates.status === "Closed" && updates.last_action?.toString().includes("Advanced")) {
          await logActivity(db, {
            event_type: "advanced_to_client",
            title: "Advanced to client work",
            enquiry_id: id,
            contact_id: data.contact_id,
          });
        }
      }

      if (updates.admin_notes && updates.admin_notes !== before.admin_notes) {
        await logActivity(db, {
          event_type: updates.last_action?.toString().includes("AI summary") ? "ai_summary" : "note_added",
          title: updates.last_action?.toString().includes("AI summary") ? "AI summary saved" : "Note added",
          detail: updates.last_action?.toString().slice(0, 200) ?? null,
          enquiry_id: id,
          contact_id: data.contact_id,
        });
      }

      if (
        (updates.next_action !== undefined && updates.next_action !== before.next_action) ||
        (updates.next_action_date !== undefined && updates.next_action_date !== before.next_action_date)
      ) {
        await logActivity(db, {
          event_type: "next_action",
          title: "Next action updated",
          detail: data.next_action ?? null,
          enquiry_id: id,
          contact_id: data.contact_id,
          metadata: { due: data.next_action_date },
        });

        if (
          updates.next_action !== undefined &&
          updates.next_action !== before.next_action &&
          data.next_action?.trim()
        ) {
          const combined = appendNextActionToNotes(before.admin_notes, data.next_action);
          if (combined !== before.admin_notes) {
            await db.from("enquiries").update({ admin_notes: combined }).eq("id", id);
            data.admin_notes = combined;
          }
        }
      }
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const db = createServiceClient();
    const { error } = await db.from("enquiries").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}