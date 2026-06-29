-- Clear legacy engagement status values that are no longer valid.
-- The new status set is: Contact attempted, No response, Conversation held,
-- Follow up required, Opportunity identified, Not suitable.
-- Old values (Not assigned, Assigned, Preparing to engage, Engagement started,
-- Not progressing) are reset to NULL so the UI shows blank rather than a
-- stale/invalid label.

UPDATE prospect_outreach_overrides
SET engagement_status = NULL
WHERE engagement_status IN (
  'Not assigned',
  'Assigned',
  'Preparing to engage',
  'Engagement started',
  'Not progressing'
);
