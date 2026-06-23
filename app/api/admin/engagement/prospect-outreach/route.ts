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

async function loadOverrides(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase.from("prospect_outreach_overrides").select("outreach_id, overrides");
  const map = new Map<string, Record<string, unknown>>();
  for (const row of data || []) {
    map.set(row.outreach_id, (row.overrides as Record<string, unknown>) || {});
  }
  return map;
}

function applyFilters(
  data: ProspectOutreachRecord[],
  searchParams: URLSearchParams,
) {
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
  const [queuedIds, overrides] = await Promise.all([
    loadQueuedOutreachIds(supabase),
    loadOverrides(supabase),
  ]);

  let data = prospectOutreachCatalog.prospects
    .filter((p) => !queuedIds.has(p.id))
    .map((p) => mergeProspectRecord(p, overrides.get(p.id)));

  data = applyFilters(data, new URL(req.url).searchParams);

  const byRegion: Record<string, number> = {};
  for (const row of data) {
    byRegion[row.region] = (byRegion[row.region] || 0) + 1;
  }

  return NextResponse.json({
    meta: {
      ...prospectOutreachCatalog.meta,
      total_count: data.length,
      by_region: byRegion,
      queued_count: queuedIds.size,
    },
    data,
    count: data.length,
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { outreach_id, overrides } = body as {
    outreach_id?: string;
    overrides?: Partial<ProspectOutreachRecord>;
  };

  if (!outreach_id || !overrides) {
    return NextResponse.json({ error: "outreach_id and overrides required" }, { status: 400 });
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
    ...overrides,
  };

  const { error } = await supabase
    .from("prospect_outreach_overrides")
    .upsert({
      outreach_id,
      overrides: mergedOverrides,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: mergeProspectRecord(base, mergedOverrides),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prospects = (body.prospects || []) as ProspectOutreachRecord[];
  const ids = (body.ids || []) as string[];

  let selected: ProspectOutreachRecord[] = prospects;

  if (!selected.length && ids.length) {
    const supabase = createServiceClient();
    const overrides = await loadOverrides(supabase);
    selected = prospectOutreachCatalog.prospects
      .filter((p) => ids.includes(p.id))
      .map((p) => mergeProspectRecord(p, overrides.get(p.id)));
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

  const payloads = toInsert.map(snapshotToQueueFields);
  const { data, error } = await supabase
    .from("prospect_queue")
    .insert(payloads)
    .select("id, raw_org_name, outreach_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data, count: data?.length ?? 0 }, { status: 201 });
}