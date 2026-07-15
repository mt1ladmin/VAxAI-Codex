-- When a topic was generated / is meant to speak into live conversation.
-- Always set from the server clock at generation time (evolves year by year).

ALTER TABLE studio_content_topics
  ADD COLUMN IF NOT EXISTS live_as_of date;

ALTER TABLE studio_content_topics
  ADD COLUMN IF NOT EXISTS conversation_hook text;

COMMENT ON COLUMN studio_content_topics.live_as_of IS
  'Calendar date the topic was generated for live SEO/conversation relevance. Set at create time; not a fixed year.';

COMMENT ON COLUMN studio_content_topics.conversation_hook IS
  'Optional note of the live discussion or search theme this joins (not trend-chasing).';
