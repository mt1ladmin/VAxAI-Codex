import type { FinderEngagementStatus } from "@/lib/engagement/engagement-status";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";

export type ProspectFinderWorkflow = {
  assigned_team_member_id: string | null;
  assigned_team_member_name: string | null;
  engagement_status: FinderEngagementStatus;
  opportunity_description: string | null;
  next_action: string | null;
  next_action_date: string | null;
  opportunity_id: string | null;
  pipeline_contact_id: string | null;
  review_notes: string | null;
  in_prospect_queue: boolean;
  /** Days since last override update — for staleness signals on the list. */
  days_since_touch: number | null;
};

export type ProspectFinderListItem = ProspectOutreachRecord &
  ProspectFinderWorkflow & {
    sector_label: string;
    priority_label: string;
  };

export type ProspectFinderListMeta = {
  total_count: number;
  filtered_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  in_queue_count: number;
  unassigned_count: number;
};