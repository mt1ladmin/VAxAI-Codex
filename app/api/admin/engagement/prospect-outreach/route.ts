import { logActivity } from "@/lib/engagement/activity-log";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import {
  mergeProspectRecord,
  snapshotToQueueFields,
} from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";

async function loadQueuedOutreachIds(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase
    .from("prospect_queue")
    .select("outreach_id")
    .not("outreach_id", "is", null);
  return new Set((data || []).map((r) => r.outreach_id as string));
}

async function loadOverrideData(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase
    .from("prospect_outreach_overrides")
    .select("outreach_id, overrides, review_notes");
  const overrides = new Map<string, Record<string, unknown>>();
  const reviewNotes = new Map<string, string>();
  for (const row of data || []) {
    overrides.set(row.outreach_id, (row.overrides as Record<string, unknown>) || {});
    if (row.review_notes) reviewNotes.set(row.outreach_id, row.review_notes as string);
  }
  return { overrides, reviewNotes };
}

type OutreachWithNotes = ProspectOutreachRecord & { review_notes?: string | null };

function applyFilters(
  data: OutreachWithNotes[],
  searchParams: URLSearchParams,
): OutreachWithNotes[] {
  const region = searchParams.get("region");
  const needScore = searchParams.get("need_score");
  const confidence = searchParams.get("confidence");
  const type = searchParams.get("type");
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  let filtered = data;
  if (region) filtered = filtered.filter((p) => p.region === region);
  if (needScore) filtered = filtered.filter((p) => p.need_score === parseInt(needScore, 10));
  if (confidence) filtered = filtered.filter((p) => p.data_confidence === confidence);
  if (type) filtered = filtered.filter((p) => p.organisation_type === type);
  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.organisation_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.decision_maker_name.toLowerCase().includes(q) ||
        p.sector_tags.some((t) => t.toLowerCase().includes(q)) ||
        p.need_rationale.toLowerCase().includes(q),
    );
  }
  return filtered;
}

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const [queuedIds, { overrides, reviewNotes }] = await Promise.all([
    loadQueuedOutreachIds(supabase),
    loadOverrideData(supabase),
  ]);

  const available: OutreachWithNotes[] = prospectOutreachCatalog.prospects
    .filter((p) => !queuedIds.has(p.id))
    .map((p) => ({
      ...mergeProspectRecord(p, overrides.get(p.id)),
      review_notes: reviewNotes.get(p.id) ?? null,
    }));

  const data = applyFilters(available, new URL(req.url).searchParams);

  const filteredByRegion: Record<string, number> = {};
  for (const row of data) {
    filteredByRegion[row.region] = (filteredByRegion[row.region] || 0) + 1;
  }

  return NextResponse.json({
    meta: {
      ...prospectOutreachCatalog.meta,
      available_count: available.length,
      filtered_count: data.length,
      filtered_by_region: filteredByRegion,
      queued_count: queuedIds.size,
    },
    data,
    count: data.length,
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { outreach_id, overrides, review_notes } = body as {
    outreach_id?: string;
    overrides?: Partial<ProspectOutreachRecord>;
    review_notes?: string | null;
  };

  if (!outreach_id) {
    return NextResponse.json({ error: "outreach_id required" }, { status: 400 });
  }

  const base = prospectOutreachCatalog.prospects.find((p) => p.id === outreach_id);
  if (!base) {
    return NextResponse.json({ error: "Prospect not found in catalog" }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("prospect_outreach_overrides")
    .select("overrides")
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
  if (review_notes !== undefined) upsertPayload.review_notes = review_notes;

  const { error } = await supabase.from("prospect_outreach_overrides").upsert(upsertPayload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      ...mergeProspectRecord(base, mergedOverrides),
      review_notes: review_notes ?? null,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  type ProspectPayload = ProspectOutreachRecord & { review_notes?: string | null };
  const prospects = (body.prospects || []) as ProspectPayload[];
  const ids = (body.ids || []) as string[];

  let selected: ProspectPayload[] = prospects;

  if (!selected.length && ids.length) {
    const supabase = createServiceClient();
    const { overrides, reviewNotes } = await loadOverrideData(supabase);
    selected = prospectOutreachCatalog.prospects
      .filter((p) => ids.includes(p.id))
      .map((p) => ({
        ...mergeProspectRecord(p, overrides.get(p.id)),
        review_notes: reviewNotes.get(p.id) ?? null,
      }));
  }

  if (!selected.length) {
    return NextResponse.json({ error: "No prospects provided" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const queuedIds = await loadQueuedOutreachIds(supabase);
  const toInsert = selected.filter((p) => !queuedIds.has(p.id));

  if (!toInsert.length) {
    return NextResponse.json({ error: "All selected prospects are already in the queue" }, { status: 409 });
  }

  const payloads = toInsert.map((p) => snapshotToQueueFields(p, p.review_notes));
  const { data, error } = await supabase
    .from("prospect_queue")
    .insert(payloads)
    .select("id, raw_org_name, outreach_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (const row of data ?? []) {
    await logActivity(supabase, {
      event_type: "queued",
      title: "Added to prospect queue",
      detail: row.raw_org_name ?? undefined,
      queue_id: row.id,
      outreach_id: row.outreach_id ?? undefined,
    });

    if (row.outreach_id) {
      const { data: outreachLinks } = await supabase
        .from("engagement_knowledge_attachments")
        .select("sector_ids, persona_ids, pain_point_ids")
        .eq("outreach_id", row.outreach_id)
        .maybeSingle();
      if (outreachLinks) {
        await supabase.from("engagement_knowledge_attachments").upsert({
          queue_id: row.id,
          sector_ids: outreachLinks.sector_ids,
          persona_ids: outreachLinks.persona_ids,
          pain_point_ids: outreachLinks.pain_point_ids,
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  return NextResponse.json({ data, count: data?.length ?? 0 }, { status: 201 });
}