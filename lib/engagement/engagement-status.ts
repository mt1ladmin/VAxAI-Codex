/** Prospect Finder engagement statuses — distinct from outreach queue statuses. */
export const FINDER_ENGAGEMENT_STATUSES = [
  "Contact attempted",
  "No response",
  "Conversation held",
  "Follow up required",
  "Opportunity identified",
  "Not suitable",
] as const;

export type FinderEngagementStatus = (typeof FINDER_ENGAGEMENT_STATUSES)[number];

export const FINDER_ENGAGEMENT_STATUS_LABELS: Record<FinderEngagementStatus, string> = {
  "Contact attempted": "Contact attempted",
  "No response": "No response",
  "Conversation held": "Conversation held",
  "Follow up required": "Follow up required",
  "Opportunity identified": "Opportunity identified",
  "Not suitable": "Not suitable",
};

export function isFinderEngagementStatus(value: string): value is FinderEngagementStatus {
  return (FINDER_ENGAGEMENT_STATUSES as readonly string[]).includes(value);
}

/** Prospect Queue engagement statuses — post-opportunity-identified, post-engagement stages. */
export const QUEUE_ENGAGEMENT_STATUSES = [
  "Active engagement",
  "Discovery call booked",
  "Proposal stage",
  "Awaiting decision",
  "Won",
  "On hold",
  "Not progressing",
] as const;

export type QueueEngagementStatus = (typeof QUEUE_ENGAGEMENT_STATUSES)[number];

export function isQueueEngagementStatus(value: string): value is QueueEngagementStatus {
  return (QUEUE_ENGAGEMENT_STATUSES as readonly string[]).includes(value);
}

export function engagementStatusForAssignment(
  assignedTeamMemberId: string | null | undefined,
  current?: string | null,
): FinderEngagementStatus {
  if (current && isFinderEngagementStatus(current)) return current as FinderEngagementStatus;
  return "Contact attempted";
}