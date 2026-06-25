import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import {
  buildFinderWorkflow,
  priorityLabel,
  sectorLabel,
  type OutreachOverrideRow,
} from "@/lib/engagement/prospect-finder/workflow";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { teamMemberForUserEmail } from "@/lib/engagement/team-members";
import type { createServiceClient } from "@/lib/supabase";

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Load prospect records from the Supabase catalog table.
 * Falls back to the bundled catalog.json if the table is empty or unavailable.
 */
export async function loadCatalogRecords(supabase: ServiceClient): Promise<ProspectOutreachRecord[]> {
  try {
    const { data, error } = await supabase
      .from("prospect_outreach_catalog")
      .select("*")
      .order("need_score", { ascending: false });
    if (!error && data && data.length > 0) {
      return data as unknown as ProspectOutreachRecord[];
    }
  } catch {
    // fall through to JSON fallback
  }
  return prospectOutreachCatalog.prospects;
}

export async function loadOverrideMaps(supabase: ServiceClient) {
  const { data } = await supabase
    .from("prospect_outreach_overrides")
    .select("*");

  const overrides = new Map<string, Record<string, unknown>>();
  const rows = new Map<string, OutreachOverrideRow>();

  for (const row of data || []) {
    overrides.set(row.outreach_id, (row.overrides as Record<string, unknown>) || {});
    rows.set(row.outreach_id, row as OutreachOverrideRow);
  }

  return { overrides, rows };
}

export async function loadTeamMembers(supabase: ServiceClient): Promise<StudioTeamMember[]> {
  const { data } = await supabase
    .from("studio_team_members")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data || []) as StudioTeamMember[];
}

export function isArchivedProspect(overrides: Record<string, unknown> | undefined): boolean {
  return overrides?.archived === true;
}

export function buildFinderList(
  overrideRows: Map<string, OutreachOverrideRow>,
  overrides: Map<string, Record<string, unknown>>,
  members: StudioTeamMember[],
  catalog?: ProspectOutreachRecord[],
): ProspectFinderListItem[] {
  const source = catalog ?? prospectOutreachCatalog.prospects;
  return source.filter((base) => !isArchivedProspect(overrides.get(base.id))).map((base) => {
    const row = overrideRows.get(base.id);
    const merged = mergeProspectRecord(base, overrides.get(base.id));
    const workflow = buildFinderWorkflow(row, members);
    return {
      ...merged,
      ...workflow,
      sector_label: sectorLabel(merged),
      priority_label: priorityLabel(merged.need_score),
    };
  });
}

export type FinderListFilters = {
  q?: string;
  region?: string;
  need_score?: string;
  confidence?: string;
  type?: string;
  assigned_to?: string;
  engagement_status?: string;
  my_prospects?: boolean;
  unassigned?: boolean;

  userEmail?: string | null;
  members: StudioTeamMember[];
};

export function filterFinderList(
  items: ProspectFinderListItem[],
  filters: FinderListFilters,
): ProspectFinderListItem[] {
  let filtered = items;
  const q = (filters.q || "").toLowerCase().trim();

  if (filters.region) filtered = filtered.filter((p) => p.region === filters.region);
  if (filters.need_score) {
    filtered = filtered.filter((p) => p.need_score === parseInt(filters.need_score!, 10));
  }
  if (filters.confidence) filtered = filtered.filter((p) => p.data_confidence === filters.confidence);
  if (filters.type) filtered = filtered.filter((p) => p.organisation_type === filters.type);
  if (filters.engagement_status) {
    filtered = filtered.filter((p) => p.engagement_status === filters.engagement_status);
  }
  if (filters.assigned_to) {
    filtered = filtered.filter((p) => p.assigned_team_member_id === filters.assigned_to);
  }
  if (filters.unassigned) {
    filtered = filtered.filter((p) => !p.assigned_team_member_id);
  }
  // Promoted prospects live in Prospect Queue only — never duplicate in Finder.
  filtered = filtered.filter((p) => !p.in_prospect_queue);
  if (filters.my_prospects) {
    const me = teamMemberForUserEmail(filters.members, filters.userEmail);
    if (me) filtered = filtered.filter((p) => p.assigned_team_member_id === me.id);
    else filtered = [];
  }
  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.organisation_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.sector_label.toLowerCase().includes(q) ||
        (p.assigned_team_member_name || "").toLowerCase().includes(q) ||
        p.engagement_status.toLowerCase().includes(q) ||
        (p.next_action || "").toLowerCase().includes(q),
    );
  }

  return filtered;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: safePage,
    page_size: pageSize,
    total_pages: totalPages,
    total_count: total,
  };
}

export function getFinderRecord(
  outreachId: string,
  overrideRows: Map<string, OutreachOverrideRow>,
  overrides: Map<string, Record<string, unknown>>,
  members: StudioTeamMember[],
  catalog?: ProspectOutreachRecord[],
): ProspectFinderListItem | null {
  const source = catalog ?? prospectOutreachCatalog.prospects;
  const base = source.find((p) => p.id === outreachId);
  if (!base) return null;
  const row = overrideRows.get(outreachId);
  const merged = mergeProspectRecord(base, overrides.get(outreachId));
  const workflow = buildFinderWorkflow(row, members);
  return {
    ...merged,
    ...workflow,
    sector_label: sectorLabel(merged),
    priority_label: priorityLabel(merged.need_score),
  };
}

export function getBaseRecord(
  outreachId: string,
  catalog?: ProspectOutreachRecord[],
): ProspectOutreachRecord | null {
  const source = catalog ?? prospectOutreachCatalog.prospects;
  return source.find((p) => p.id === outreachId) ?? null;
}