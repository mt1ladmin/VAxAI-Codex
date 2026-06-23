import Anthropic from "@anthropic-ai/sdk";
import { extractKnowledgeKeywords } from "@/lib/ai/context-builders";
import { logActivity } from "@/lib/engagement/activity-log";
import { outreachFromQueueEntry } from "@/lib/engagement/prospect-outreach/queue-snapshot";
import type { ProspectQueueEntry } from "@/lib/engagement/types";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function formatNoteEntry(summary: string) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `[${date}] Journey summary (AI)\n${summary.trim()}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = (await req.json()) as { contactId?: string };
  const contactId = body.contactId;
  if (!contactId) {
    return NextResponse.json({ error: "contactId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const [contactRes, oppRes, activityRes, enquiryRes] = await Promise.all([
    supabase
      .from("engagement_contacts")
      .select(`*, organisation:organisation_id(id, name)`)
      .eq("id", contactId)
      .single(),
    supabase
      .from("engagement_opportunities")
      .select("*")
      .eq("primary_contact_id", contactId)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("engagement_activity_log")
      .select("event_type, title, detail, created_at")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("enquiries")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (contactRes.error || !contactRes.data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const contact = contactRes.data;
  const opportunities = oppRes.data ?? [];
  const activities = activityRes.data ?? [];
  const enquiry = enquiryRes.data;

  const queueId = opportunities.find((o) => o.queue_id)?.queue_id ?? null;
  let queue: ProspectQueueEntry | null = null;
  if (queueId) {
    const { data } = await supabase.from("prospect_queue").select("*").eq("id", queueId).single();
    queue = data as ProspectQueueEntry | null;
  }

  const outreach = queue ? outreachFromQueueEntry(queue) : null;
  const fullName = `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`;

  const contextBlock = [
    `CLIENT: ${fullName}`,
    contact.role ? `Role: ${contact.role}` : null,
    contact.professional_email ? `Email: ${contact.professional_email}` : null,
    contact.organisation ? `Organisation: ${(contact.organisation as { name: string }).name}` : null,
    contact.notes ? `Existing client notes:\n${contact.notes}` : null,
    enquiry
      ? `WEBSITE ENQUIRY (${enquiry.created_at}): ${enquiry.support_type} — ${enquiry.details}\nStatus: ${enquiry.status}\nAdmin notes: ${enquiry.admin_notes ?? "—"}`
      : null,
    queue
      ? `PROSPECT QUEUE: ${queue.raw_org_name ?? "—"} | Status: ${queue.status}\nNotes: ${queue.raw_notes ?? "—"}`
      : null,
    outreach?.need_rationale ? `Original admin/AI need: ${outreach.need_rationale}` : null,
    opportunities.length
      ? `OPPORTUNITIES:\n${opportunities
          .map(
            (o) =>
              `• ${o.title} | ${o.stage}${o.desired_outcomes ? ` | Outcomes: ${o.desired_outcomes.slice(0, 200)}` : ""}`,
          )
          .join("\n")}`
      : null,
    activities.length
      ? `ACTIVITY LOG:\n${activities
          .slice(0, 15)
          .map((a) => `• ${a.created_at}: ${a.title}${a.detail ? ` — ${a.detail.slice(0, 120)}` : ""}`)
          .join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const keywords = extractKnowledgeKeywords(contextBlock);
  const { data: sectors } = await supabase
    .from("engagement_sector_profiles")
    .select("name, description")
    .limit(25);

  const sectorHints = (sectors ?? [])
    .filter((s) => keywords.some((k) => `${s.name} ${s.description ?? ""}`.toLowerCase().includes(k)))
    .slice(0, 3)
    .map((s) => `• ${s.name}: ${(s.description as string ?? "").slice(0, 120)}`)
    .join("\n");

  let summary = "";
  try {
    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1400,
      messages: [
        {
          role: "user",
          content: `You are the VAxAI studio assistant. Write a structured journey summary for this Prospect/Client account — from first touch (enquiry or outreach) through pre-sales to current client status.

Use these headings:
## Journey overview
## Key touchpoints
## Current status & agreed scope
## Risks & open items
## Recommended next actions
## Knowledge Hub connections

Be factual — only use data provided. Reference sectors/personas where relevant.
${sectorHints ? `\nRELEVANT SECTORS:\n${sectorHints}` : ""}

ACCOUNT DATA:
${contextBlock}`,
        },
      ],
    });
    summary = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 });
  }

  const entry = formatNoteEntry(summary);
  const combined = contact.notes ? `${contact.notes}\n\n${entry}` : entry;

  const { error: updateErr } = await supabase
    .from("engagement_contacts")
    .update({ notes: combined })
    .eq("id", contactId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await logActivity(supabase, {
    event_type: "journey_summary",
    title: "Journey summary generated",
    detail: summary.slice(0, 300) + (summary.length > 300 ? "…" : ""),
    contact_id: contactId,
    enquiry_id: enquiry?.id ?? null,
    queue_id: queueId,
    metadata: { saved_to_notes: true },
  });

  return NextResponse.json({ data: { summary, saved: true } });
}