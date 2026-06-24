import type { FinderEngagementStatus } from "@/lib/engagement/engagement-status";
import { isFinderEngagementStatus } from "@/lib/engagement/engagement-status";
import type { ProspectFinderWorkflow } from "@/lib/engagement/prospect-finder/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { teamMemberLabel } from "@/lib/engagement/team-members";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";

export type OutreachOverrideRow = {
  outreach_id: string;
  overrides: Record<string, unknown> | null;
  review_notes: string | null;
  assigned_team_member_id: string | null;
  engagement_status: string | null;
  opportunity_description: string | null;
  next_action: string | null;
  next_action_date: string | null;
  opportunity_id: string | null;
  pipeline_contact_id: string | null;
  updated_at?: string | null;
};

export function priorityLabel(needScore: number): string {
  if (needScore >= 5) return "High";
  if (needScore >= 4) return "Strong";
  if (needScore >= 3) return "Moderate";
  return "Lower";
}

export function sectorLabel(record: ProspectOutreachRecord): string {
  return record.sector_tags[0] || record.organisation_type || "—";
}

export function buildFinderWorkflow(
  row: OutreachOverrideRow | undefined,
  members: StudioTeamMember[],
): ProspectFinderWorkflow {
  const engagementStatus = row?.engagement_status && isFinderEngagementStatus(row.engagement_status)
    ? row.engagement_status
    : ("Not assigned" as FinderEngagementStatus);

  const touchedAt = row?.updated_at ? new Date(row.updated_at) : null;
  const daysSinceTouch = touchedAt
    ? Math.floor((Date.now() - touchedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    assigned_team_member_id: row?.assigned_team_member_id ?? null,
    assigned_team_member_name: teamMemberLabel(members, row?.assigned_team_member_id),
    engagement_status: engagementStatus,
    opportunity_description: row?.opportunity_description ?? null,
    next_action: row?.next_action ?? null,
    next_action_date: row?.next_action_date ?? null,
    opportunity_id: row?.opportunity_id ?? null,
    pipeline_contact_id: row?.pipeline_contact_id ?? null,
    review_notes: row?.review_notes ?? null,
    in_prospect_queue: Boolean(row?.opportunity_id),
    days_since_touch: daysSinceTouch,
  };
}