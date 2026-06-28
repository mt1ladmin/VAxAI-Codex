-- Performance indexes for common filter and sort patterns.
-- All use CREATE INDEX IF NOT EXISTS — safe to re-run.

-- engagement_tasks: filtered by status, ordered by due_date, joined on contact/outreach
CREATE INDEX IF NOT EXISTS idx_engagement_tasks_status
  ON engagement_tasks (status);

CREATE INDEX IF NOT EXISTS idx_engagement_tasks_due_date
  ON engagement_tasks (due_date)
  WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_tasks_contact_status
  ON engagement_tasks (contact_id, status)
  WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_tasks_outreach_status
  ON engagement_tasks (outreach_id, status)
  WHERE outreach_id IS NOT NULL;

-- engagement_opportunities: filtered by stage and assigned member
CREATE INDEX IF NOT EXISTS idx_engagement_opportunities_stage
  ON engagement_opportunities (stage);

CREATE INDEX IF NOT EXISTS idx_engagement_opportunities_assigned_stage
  ON engagement_opportunities (assigned_team_member_id, stage)
  WHERE assigned_team_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_opportunities_enquiry_id
  ON engagement_opportunities (enquiry_id)
  WHERE enquiry_id IS NOT NULL;

-- enquiries: filtered by status, ordered by created_at
CREATE INDEX IF NOT EXISTS idx_enquiries_status_created
  ON enquiries (status, created_at DESC);

-- prospect_outreach_overrides: filtered by assigned team member
CREATE INDEX IF NOT EXISTS idx_prospect_outreach_overrides_assigned
  ON prospect_outreach_overrides (assigned_team_member_id)
  WHERE assigned_team_member_id IS NOT NULL;

-- prospect_outreach_catalog: data_confidence filter (region/need_score already indexed)
CREATE INDEX IF NOT EXISTS idx_poc_data_confidence
  ON prospect_outreach_catalog (data_confidence);

-- ai_chat_sessions: looked up by context type+id on every chat request
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_context
  ON ai_chat_sessions (context_type, context_id);

-- ai_chat_messages: ordered by session + created_at for history queries
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_created
  ON ai_chat_messages (session_id, created_at DESC);
