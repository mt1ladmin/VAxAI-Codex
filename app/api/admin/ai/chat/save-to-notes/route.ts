import { scheduleAccountStateRefresh } from "@/lib/ai/account-state";
import { logActivity } from "@/lib/engagement/activity-log";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

function formatNoteEntry(title: string, summary: string) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `[${date}] ${title}\n${summary.trim()}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    contextType?: string;
    contextId?: string;
    title?: string;
    summary?: string;
  };

  const { contextType, contextId, title, summary } = body;

  if (!contextType || !contextId || !title?.trim() || !summary?.trim()) {
    return NextResponse.json(
      { error: "contextType, contextId, title, and summary are required" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const entry = formatNoteEntry(title.trim(), summary.trim());

  if (contextType === "enquiry") {
    const { data: enquiry, error: fetchErr } = await supabase
      .from("enquiries")
      .select("admin_notes")
      .eq("id", contextId)
      .single();

    if (fetchErr || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const combined = enquiry.admin_notes ? `${enquiry.admin_notes}\n\n${entry}` : entry;
    const { error } = await supabase
      .from("enquiries")
      .update({
        admin_notes: combined,
        last_action: `AI summary saved: ${title.trim().slice(0, 60)}`,
        last_action_date: new Date().toISOString(),
      })
      .eq("id", contextId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(supabase, {
      event_type: "ai_summary",
      title: `AI summary: ${title.trim().slice(0, 60)}`,
      detail: summary.trim().slice(0, 300),
      enquiry_id: contextId,
    });
    scheduleAccountStateRefresh(contextType, contextId, summary.trim());
    return NextResponse.json({ data: { saved: true, notes: combined } });
  }

  if (contextType === "prospect") {
    const { data: entryRow, error: fetchErr } = await supabase
      .from("prospect_queue")
      .select("raw_notes")
      .eq("id", contextId)
      .single();

    if (fetchErr || !entryRow) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const combined = entryRow.raw_notes ? `${entryRow.raw_notes}\n\n${entry}` : entry;
    const { error } = await supabase
      .from("prospect_queue")
      .update({
        raw_notes: combined,
        last_action: `AI summary saved: ${title.trim().slice(0, 60)}`,
        last_action_date: new Date().toISOString(),
      })
      .eq("id", contextId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(supabase, {
      event_type: "ai_summary",
      title: `AI summary: ${title.trim().slice(0, 60)}`,
      detail: summary.trim().slice(0, 300),
      queue_id: contextId,
    });
    scheduleAccountStateRefresh(contextType, contextId, summary.trim());
    return NextResponse.json({ data: { saved: true, notes: combined } });
  }

  if (contextType === "outreach") {
    const { data: row, error: fetchErr } = await supabase
      .from("prospect_outreach_overrides")
      .select("review_notes, overrides")
      .eq("outreach_id", contextId)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const combined = row?.review_notes ? `${row.review_notes}\n\n${entry}` : entry;
    const existingOverrides =
      row?.overrides && typeof row.overrides === "object"
        ? (row.overrides as Record<string, unknown>)
        : {};

    const { error } = await supabase
      .from("prospect_outreach_overrides")
      .upsert({
        outreach_id: contextId,
        overrides: existingOverrides,
        review_notes: combined,
        updated_at: new Date().toISOString(),
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(supabase, {
      event_type: "ai_summary",
      title: `AI summary: ${title.trim().slice(0, 60)}`,
      detail: summary.trim().slice(0, 300),
      outreach_id: contextId,
    });
    scheduleAccountStateRefresh(contextType, contextId, summary.trim());
    return NextResponse.json({ data: { saved: true, notes: combined } });
  }

  if (contextType === "client") {
    const { data: contact, error: fetchErr } = await supabase
      .from("engagement_contacts")
      .select("notes")
      .eq("id", contextId)
      .single();

    if (fetchErr || !contact) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const combined = contact.notes ? `${contact.notes}\n\n${entry}` : entry;
    const { error } = await supabase
      .from("engagement_contacts")
      .update({ notes: combined })
      .eq("id", contextId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(supabase, {
      event_type: "ai_summary",
      title: `AI summary: ${title.trim().slice(0, 60)}`,
      detail: summary.trim().slice(0, 300),
      contact_id: contextId,
    });
    scheduleAccountStateRefresh(contextType, contextId, summary.trim());
    return NextResponse.json({ data: { saved: true, notes: combined } });
  }

  if (contextType === "general") {
    return NextResponse.json(
      { error: "Open an enquiry, prospect, client, or Prospect Queue record before saving to notes." },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Unsupported context type" }, { status: 400 });
}