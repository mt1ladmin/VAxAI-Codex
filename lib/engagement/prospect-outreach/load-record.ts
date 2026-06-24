import { getProspectById } from "@/lib/engagement/prospect-outreach/catalog";
import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import type { createServiceClient } from "@/lib/supabase";

type Supabase = ReturnType<typeof createServiceClient>;

export async function loadMergedOutreachRecord(
  supabase: Supabase,
  outreachId: string,
): Promise<{ record: ProspectOutreachRecord; reviewNotes: string | null } | null> {
  const base = getProspectById(outreachId);
  if (!base) return null;

  const { data: overrideRow } = await supabase
    .from("prospect_outreach_overrides")
    .select("overrides, review_notes")
    .eq("outreach_id", outreachId)
    .maybeSingle();

  const record = mergeProspectRecord(
    base,
    (overrideRow?.overrides as Record<string, unknown>) ?? null,
  );

  return { record, reviewNotes: overrideRow?.review_notes ?? null };
}