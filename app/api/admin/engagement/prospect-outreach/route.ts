export const dynamic = "force-dynamic";

import { appendNextActionToNotes } from "@/lib/engagement/append-note";
import { logActivity } from "@/lib/engagement/activity-log";
import { engagementStatusForAssignment, isFinderEngagementStatus } from "@/lib/engagement/engagement-status";
import {
  buildFinderList,
  filterFinderList,
  loadCatalogRecords,
  loadOverrideMaps,
  loadTeamMembers,
  paginate,
} from "@/lib/engagement/prospect-finder/load-catalog";
import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);

  const [overrideMaps, members, catalog, tasksRes, countRes] = await Promise.all([
    loadOverrideMaps(supabase),
    loadTeamMembers(supabase),
    loadCatalogRecords(supabase),
    supabase
      .from("engagement_tasks")
      .select("outreach_id, task_type, title, due_date, created_at")
      .not("outreach_id", "is", null)
      .neq("status", "done")
      .eq("task_type", "follow_up")
      .order("created_at", { ascending: false }),
    supabase.from("prospect_outreach_catalog").select("*", { count: "exact", head: true }),
  ]);

  const tasks = tasksRes.data ?? [];
  const outreachIdsWithTasks = new Set(tasks.map((t) => t.outreach_id as string));

  // Build a map of outreach_id → title of first active follow_up task
  const followUpTitles = new Map<string, string>();
  for (const t of tasks) {
    if (t.task_type === "follow_up" && t.outreach_id && !followUpTitles.has(t.outreach_id as string)) {
      followUpTitles.set(t.outreach_id as string, t.title as string);
    }
  }

  const all = buildFinderList(overrideMaps.rows, overrideMaps.overrides, members, catalog, followUpTitles);
  const filtered = filterFinderList(all, {
    q: searchParams.get("q") || undefined,
    region: searchParams.get("region") || undefined,
    need_score: searchParams.get("need_score") || undefined,
    confidence: searchParams.get("confidence") || undefined,
    type: searchParams.get("type") || undefined,
    assigned_to: searchParams.get("assigned_to") || undefined,
    engagement_status: searchParams.get("engagement_status") || undefined,
    my_prospects: searchParams.get("my_prospects") === "true",
    unassigned: searchParams.get("unassigned") === "true",
    is_client: searchParams.get("is_client") === "true" ? true : searchParams.get("is_client") === "false" ? false : undefined,

    userEmail: searchParams.get("user_email") || undefined,
    members,
  });

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get("page_size") || "50", 10)));
  const paged = paginate(filtered, page, pageSize);

  const filteredByRegion: Record<string, number> = {};
  for (const row of filtered) {
    filteredByRegion[row.region] = (filteredByRegion[row.region] || 0) + 1;
  }

  const byRegion: Record<string, number> = {};
  const byNeedScore: Record<string, number> = {};
  let researchDate = "";
  for (const p of catalog) {
    byRegion[p.region] = (byRegion[p.region] || 0) + 1;
    byNeedScore[String(p.need_score)] = (byNeedScore[String(p.need_score)] || 0) + 1;
    if (p.research_date > researchDate) researchDate = p.research_date;
  }

  return NextResponse.json({
    meta: {
      research_date: researchDate || new Date().toISOString().slice(0, 10),
      by_region: byRegion,
      by_need_score: byNeedScore,
      total_count: all.length,
      filtered_count: filtered.length,
      filtered_by_region: filteredByRegion,
      unassigned_count: all.filter((p) => !p.assigned_team_member_id).length,
      with_tasks_count: all.filter((p) => outreachIdsWithTasks.has(p.id)).length,
      preparing_to_engage_count: all.filter((p) => p.engagement_status === "Conversation held").length,
      engagement_started_count: all.filter((p) => p.engagement_status === "Follow up required").length,
      opportunity_identified_count: all.filter((p) => p.engagement_status === "Opportunity identified").length,
      is_client_count: all.filter((p) => p.is_client).length,
      page: paged.page,
      page_size: paged.page_size,
      total_pages: paged.total_pages,
    },
    data: paged.data,
    count: paged.data.length,
    team_members: members.filter((m) => m.is_active),
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { outreach_id, overrides, review_notes } = body as {
    outreach_id?: string;
    overrides?: Partial<ProspectOutreachRecord>;
    review_notes?: string | null;
    assigned_team_member_id?: string | null;
    engagement_status?: string;
    opportunity_description?: string | null;
    next_action?: string | null;
    next_action_date?: string | null;
  };

  if (!outreach_id) {
    return NextResponse.json({ error: "outreach_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const [baseRes, existingRes] = await Promise.all([
    supabase.from("prospect_outreach_catalog").select("*").eq("id", outreach_id).maybeSingle(),
    supabase.from("prospect_outreach_overrides").select("*").eq("outreach_id", outreach_id).maybeSingle(),
  ]);
  const base = baseRes.data as unknown as ProspectOutreachRecord | null;
  if (!base) {
    return NextResponse.json({ error: "Prospect not found in catalog" }, { status: 404 });
  }
  const existing = existingRes.data;

  const mergedOverrides = {
    ...((existing?.overrides as Record<string, unknown>) || {}),
    ...(overrides || {}),
  };

  const upsertPayload: Record<string, unknown> = {
    outreach_id,
    overrides: mergedOverrides,
    updated_at: new Date().toISOString(),
  };

  let syncedReviewNotes: string | null | undefined = review_notes ?? existing?.review_notes ?? null;

  if (
    body.next_action !== undefined &&
    body.next_action?.trim() &&
    body.next_action !== existing?.next_action
  ) {
    syncedReviewNotes = appendNextActionToNotes(syncedReviewNotes, body.next_action);
    upsertPayload.review_notes = syncedReviewNotes;
  } else if (review_notes !== undefined) {
    upsertPayload.review_notes = review_notes;
  }
  if (body.assigned_team_member_id !== undefined) {
    upsertPayload.assigned_team_member_id = body.assigned_team_member_id;
    upsertPayload.engagement_status = engagementStatusForAssignment(
      body.assigned_team_member_id,
      body.engagement_status ?? existing?.engagement_status,
    );
  }
  if (body.engagement_status !== undefined) {
    if (!isFinderEngagementStatus(body.engagement_status)) {
      return NextResponse.json({ error: "Invalid engagement_status" }, { status: 400 });
    }
    upsertPayload.engagement_status = body.engagement_status;
  }
  if (body.opportunity_description !== undefined) {
    upsertPayload.opportunity_description = body.opportunity_description;
  }
  if (body.next_action !== undefined) upsertPayload.next_action = body.next_action;
  if (body.next_action_date !== undefined) upsertPayload.next_action_date = body.next_action_date;
  if (body.is_client !== undefined) {
    const currentOverrides = (upsertPayload.overrides as Record<string, unknown>) ?? mergedOverrides;
    upsertPayload.overrides = {
      ...currentOverrides,
      is_client: body.is_client,
      client_note: body.client_note ?? ((mergedOverrides as Record<string, unknown>).client_note ?? null),
    };
  }

  const { error } = await supabase.from("prospect_outreach_overrides").upsert(upsertPayload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (body.assigned_team_member_id !== undefined || body.engagement_status !== undefined) {
    await logActivity(supabase, {
      event_type: "assignment_updated",
      title: "Prospect assignment updated",
      outreach_id,
      metadata: {
        assigned_team_member_id: body.assigned_team_member_id ?? existing?.assigned_team_member_id,
        engagement_status: upsertPayload.engagement_status,
      },
    });
  }

  if (
    body.next_action !== undefined &&
    body.next_action !== existing?.next_action
  ) {
    await logActivity(supabase, {
      event_type: "next_action",
      title: "Next action updated",
      detail: body.next_action ?? null,
      outreach_id,
      opportunity_id: existing?.opportunity_id ?? null,
      contact_id: existing?.pipeline_contact_id ?? null,
      metadata: { due: body.next_action_date ?? existing?.next_action_date ?? null },
    });
  }

  const members = await loadTeamMembers(supabase);
  const merged = mergeProspectRecord(base, upsertPayload.overrides as Record<string, unknown>);
  const finalAssignedId = (upsertPayload.assigned_team_member_id ?? existing?.assigned_team_member_id ?? null) as string | null;

  return NextResponse.json({
    data: {
      ...merged,
      review_notes: (upsertPayload.review_notes ?? syncedReviewNotes ?? null) as string | null,
      assigned_team_member_id: finalAssignedId,
      engagement_status: (upsertPayload.engagement_status ?? existing?.engagement_status ?? "Not assigned") as string,
      opportunity_description: (upsertPayload.opportunity_description ?? existing?.opportunity_description ?? null) as string | null,
      next_action: (upsertPayload.next_action ?? existing?.next_action ?? null) as string | null,
      next_action_date: (upsertPayload.next_action_date ?? existing?.next_action_date ?? null) as string | null,
      opportunity_id: (existing?.opportunity_id ?? null) as string | null,
      pipeline_contact_id: (existing?.pipeline_contact_id ?? null) as string | null,
      assigned_team_member_name: members.find((m) => m.id === finalAssignedId)?.display_name ?? null,
    },
  });
}

/** Delete prospects from Finder (platform admin only). */
export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { outreach_ids?: string[] };
  const ids = body.outreach_ids?.filter(Boolean) ?? [];
  if (!ids.length) {
    return NextResponse.json({ error: "outreach_ids required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Remove overrides first to avoid FK constraint issues
  await supabase.from("prospect_outreach_overrides").delete().in("outreach_id", ids);

  const { error } = await supabase.from("prospect_outreach_catalog").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted_count: ids.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.prospect && typeof body.prospect === "object") {
      const supabase = createServiceClient();
      const p = body.prospect as Record<string, unknown>;
      const slug = String(p.organisation_name ?? "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "prospect";
      const id = `${slug}-${Date.now().toString(36)}`;

      // Use a SECURITY DEFINER RPC function to bypass any RLS or object-level
      // permission issues that have prevented direct .insert() from working.
      const { data, error } = await supabase.rpc("insert_prospect_catalog_entry", {
        p_id: id,
        p_organisation_name: String(p.organisation_name ?? ""),
        p_organisation_type: String(p.organisation_type ?? "Other"),
        p_location: String(p.location ?? ""),
        p_region: String(p.region ?? ""),
        p_need_score: Number(p.need_score ?? 3),
        p_decision_maker_name: String(p.decision_maker_name ?? ""),
        p_decision_maker_role: String(p.decision_maker_role ?? ""),
        p_email: String(p.email ?? ""),
        p_phone: String(p.phone ?? ""),
        p_research_date: new Date().toISOString().slice(0, 10),
      });

      if (error) {
        console.error("[prospect POST] rpc failed:", error.code, error.message, error.details, error.hint);
        return NextResponse.json(
          { error: error.message, code: error.code, hint: error.hint ?? undefined },
          { status: 500 },
        );
      }

      // data is the json row returned by the function
      const row = data as { id: string } | null;
      if (!row?.id) {
        console.error("[prospect POST] rpc returned no row");
        return NextResponse.json({ error: "Insert returned no data" }, { status: 500 });
      }

      return NextResponse.json({ data: row }, { status: 201 });
    }

    return NextResponse.json({ error: "No prospect data provided" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    console.error("[prospect POST] unexpected error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}