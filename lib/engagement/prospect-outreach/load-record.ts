import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import type { createServiceClient } from "@/lib/supabase";

type Supabase = ReturnType<typeof createServiceClient>;

export async function loadMergedOutreachRecord(
  supabase: Supabase,
  outreachId: string,
): Promise<{ record: ProspectOutreachRecord; reviewNotes: string | null } | null> {
  const [{ data: base }, { data: overrideRow }] = await Promise.all([
    supabase
      .from("prospect_outreach_catalog")
      .select("*")
      .eq("id", outreachId)
      .maybeSingle(),
    supabase
      .from("prospect_outreach_overrides")
      .select("overrides, review_notes")
      .eq("outreach_id", outreachId)
      .maybeSingle(),
  ]);

  if (!base) return null;

  const record = mergeProspectRecord(
    base as unknown as ProspectOutreachRecord,
    (overrideRow?.overrides as Record<string, unknown>) ?? null,
  );

  return { record, reviewNotes: overrideRow?.review_notes ?? null };
}
