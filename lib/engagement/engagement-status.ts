/** Prospect Finder engagement statuses — distinct from outreach queue statuses. */
export const FINDER_ENGAGEMENT_STATUSES = [
  "Not assigned",
  "Assigned",
  "Preparing to engage",
  "Engagement started",
  "Opportunity identified",
  "In prospect queue",
  "Not progressing",
] as const;

export type FinderEngagementStatus = (typeof FINDER_ENGAGEMENT_STATUSES)[number];

export const FINDER_ENGAGEMENT_STATUS_LABELS: Record<FinderEngagementStatus, string> = {
  "Not assigned": "Not assigned",
  Assigned: "Assigned",
  "Preparing to engage": "Preparing to engage",
  "Engagement started": "Engagement started",
  "Opportunity identified": "Opportunity identified",
  "In prospect queue": "In prospect queue",
  "Not progressing": "Not progressing",
};

export function isFinderEngagementStatus(value: string): value is FinderEngagementStatus {
  return (FINDER_ENGAGEMENT_STATUSES as readonly string[]).includes(value);
}

export function engagementStatusForAssignment(
  assignedTeamMemberId: string | null | undefined,
  current?: string | null,
): FinderEngagementStatus {
  if (!assignedTeamMemberId) return "Not assigned";
  if (current && current !== "Not assigned") return current as FinderEngagementStatus;
  return "Assigned";
}