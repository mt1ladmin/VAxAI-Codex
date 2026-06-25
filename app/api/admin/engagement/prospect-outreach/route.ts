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
import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);

  const [overrideMaps, members, catalog] = await Promise.all([
    loadOverrideMaps(supabase),
    loadTeamMembers(supabase),
    loadCatalogRecords(supabase),
  ]);

  const all = buildFinderList(overrideMaps.rows, overrideMaps.overrides, members, catalog);
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

  return NextResponse.json({
    meta: {
      ...prospectOutreachCatalog.meta,
      total_count: all.length,
      filtered_count: filtered.length,
      filtered_by_region: filteredByRegion,
      in_queue_count: all.filter((p) => p.in_prospect_queue).length,
      unassigned_count: all.filter((p) => !p.assigned_team_member_id).length,
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
  const catalog = await loadCatalogRecords(supabase);
  const base = catalog.find((p) => p.id === outreach_id);
  if (!base) {
    return NextResponse.json({ error: "Prospect not found in catalog" }, { status: 404 });
  }
  const { data: existing } = await supabase
    .from("prospect_outreach_overrides")
    .select("*")
    .eq("outreach_id", outreach_id)
    .maybeSingle();

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
  const { overrides: overrideMap, rows } = await loadOverrideMaps(supabase);
  const row = rows.get(outreach_id);
  const merged = mergeProspectRecord(base, overrideMap.get(outreach_id));

  return NextResponse.json({
    data: {
      ...merged,
      review_notes: upsertPayload.review_notes ?? syncedReviewNotes ?? row?.review_notes ?? null,
      assigned_team_member_id: row?.assigned_team_member_id ?? body.assigned_team_member_id ?? null,
      engagement_status: upsertPayload.engagement_status ?? row?.engagement_status ?? "Not assigned",
      opportunity_description: row?.opportunity_description ?? null,
      next_action: row?.next_action ?? null,
      next_action_date: row?.next_action_date ?? null,
      opportunity_id: row?.opportunity_id ?? null,
      pipeline_contact_id: row?.pipeline_contact_id ?? null,
      assigned_team_member_name:
        members.find((m) => m.id === (row?.assigned_team_member_id ?? body.assigned_team_member_id))?.display_name ??
        null,
    },
  });
}

/** Archive prospects from Finder (platform admin only). */
export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { outreach_ids?: string[] };
  const ids = body.outreach_ids?.filter(Boolean) ?? [];
  if (!ids.length) {
    return NextResponse.json({ error: "outreach_ids required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const [catalog, { data: existing }] = await Promise.all([
    loadCatalogRecords(supabase),
    supabase
      .from("prospect_outreach_overrides")
      .select("outreach_id, overrides")
      .in("outreach_id", ids),
  ]);
  const catalogIds = new Set(catalog.map((p) => p.id));
  const existingMap = new Map((existing || []).map((r) => [r.outreach_id, r]));

  for (const outreach_id of ids) {
    if (!catalogIds.has(outreach_id)) continue;
    const row = existingMap.get(outreach_id);
    const mergedOverrides = {
      ...((row?.overrides as Record<string, unknown>) || {}),
      archived: true,
      archived_at: new Date().toISOString(),
    };
    await supabase.from("prospect_outreach_overrides").upsert({
      outreach_id,
      overrides: mergedOverrides,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true, archived_count: ids.length });
}

/** @deprecated Use move-to-queue — kept for backward compatibility */
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.prospects?.length || body.ids?.length) {
    return NextResponse.json(
      { error: "Use POST /api/admin/engagement/prospect-outreach/move-to-queue instead" },
      { status: 410 },
    );
  }
  return NextResponse.json({ error: "No prospects provided" }, { status: 400 });
}