-- Align website enquiry statuses with prospect queue
UPDATE enquiries SET status = 'Needs review' WHERE status IN ('new', 'open') OR status IS NULL;
UPDATE enquiries SET status = 'Contact attempted' WHERE status = 'contacted';
UPDATE enquiries SET status = 'No response' WHERE status = 'no_reply';
UPDATE enquiries SET status = 'Follow-up required' WHERE status = 'following_up';
UPDATE enquiries SET status = 'Conversation held' WHERE status = 'met';
UPDATE enquiries SET status = 'Closed' WHERE status = 'completed';

ALTER TABLE enquiries ALTER COLUMN status SET DEFAULT 'Needs review';