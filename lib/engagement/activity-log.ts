import type { createServiceClient } from "@/lib/supabase";

export type ActivityEventType =
  | "created"
  | "status_change"
  | "note_added"
  | "next_action"
  | "contact_updated"
  | "queued"
  | "opportunity_created"
  | "opportunity_linked"
  | "opportunity_stage"
  | "task_created"
  | "ai_summary"
  | "journey_summary"
  | "advanced_to_client"
  | "research_updated";

export type ActivityLogEntry = {
  id: string;
  created_at: string;
  event_type: ActivityEventType;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown>;
  enquiry_id: string | null;
  queue_id: string | null;
  contact_id: string | null;
  opportunity_id: string | null;
  outreach_id: string | null;
  actor_email: string | null;
};

export type LogActivityParams = {
  event_type: ActivityEventType;
  title: string;
  detail?: string | null;
  metadata?: Record<string, unknown>;
  enquiry_id?: string | null;
  queue_id?: string | null;
  contact_id?: string | null;
  opportunity_id?: string | null;
  outreach_id?: string | null;
  actor_email?: string | null;
};

type ServiceClient = ReturnType<typeof createServiceClient>;

export async function logActivity(supabase: ServiceClient, params: LogActivityParams) {
  const { error } = await supabase.from("engagement_activity_log").insert({
    event_type: params.event_type,
    title: params.title,
    detail: params.detail ?? null,
    metadata: params.metadata ?? {},
    enquiry_id: params.enquiry_id ?? null,
    queue_id: params.queue_id ?? null,
    contact_id: params.contact_id ?? null,
    opportunity_id: params.opportunity_id ?? null,
    outreach_id: params.outreach_id ?? null,
    actor_email: params.actor_email ?? null,
  });
  if (error) console.error("activity log failed:", error.message);
}

export async function fetchActivityLog(query: {
  enquiryId?: string;
  queueId?: string;
  contactId?: string;
}): Promise<ActivityLogEntry[]> {
  const params = new URLSearchParams();
  if (query.enquiryId) params.set("enquiry_id", query.enquiryId);
  if (query.queueId) params.set("queue_id", query.queueId);
  if (query.contactId) params.set("contact_id", query.contactId);
  const res = await fetch(`/api/admin/engagement/activity-log?${params}`);
  if (!res.ok) return [];
  const j = (await res.json()) as { data?: ActivityLogEntry[] };
  return j.data ?? [];
}

export const ACTIVITY_EVENT_DOT: Record<ActivityEventType, string> = {
  created: "bg-[#063b32]",
  status_change: "bg-blue-500",
  note_added: "bg-violet-500",
  next_action: "bg-sky-500",
  contact_updated: "bg-slate-500",
  queued: "bg-[#063b32]",
  opportunity_created: "bg-amber-500",
  opportunity_linked: "bg-amber-500",
  opportunity_stage: "bg-amber-600",
  task_created: "bg-emerald-500",
  ai_summary: "bg-indigo-500",
  journey_summary: "bg-[#063b32]",
  advanced_to_client: "bg-[#063b32]",
  research_updated: "bg-teal-500",
};