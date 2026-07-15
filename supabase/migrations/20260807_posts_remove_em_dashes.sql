-- Remove em dashes and en dashes from published (and all) post content.
-- Aligns with site voice: no em dashes in public copy.

UPDATE posts SET
  title = replace(replace(coalesce(title, ''), '—', ', '), '–', '-'),
  description = replace(replace(coalesce(description, ''), '—', ', '), '–', '-'),
  body_html = replace(replace(coalesce(body_html, ''), '—', ', '), '–', '-'),
  linkedin_post = replace(replace(coalesce(linkedin_post, ''), '—', ', '), '–', '-'),
  instagram_caption = replace(replace(coalesce(instagram_caption, ''), '—', ', '), '–', '-'),
  sharing_caption = replace(replace(coalesce(sharing_caption, ''), '—', ', '), '–', '-')
WHERE
  coalesce(title, '') LIKE '%—%'
  OR coalesce(title, '') LIKE '%–%'
  OR coalesce(description, '') LIKE '%—%'
  OR coalesce(description, '') LIKE '%–%'
  OR coalesce(body_html, '') LIKE '%—%'
  OR coalesce(body_html, '') LIKE '%–%'
  OR coalesce(linkedin_post, '') LIKE '%—%'
  OR coalesce(linkedin_post, '') LIKE '%–%'
  OR coalesce(instagram_caption, '') LIKE '%—%'
  OR coalesce(instagram_caption, '') LIKE '%–%'
  OR coalesce(sharing_caption, '') LIKE '%—%'
  OR coalesce(sharing_caption, '') LIKE '%–%';

-- Social posts calendar content if present
UPDATE social_posts SET
  title = replace(replace(coalesce(title, ''), '—', ', '), '–', '-'),
  description = replace(replace(coalesce(description, ''), '—', ', '), '–', '-'),
  content = replace(replace(coalesce(content, ''), '—', ', '), '–', '-')
WHERE
  coalesce(title, '') LIKE '%—%'
  OR coalesce(title, '') LIKE '%–%'
  OR coalesce(description, '') LIKE '%—%'
  OR coalesce(description, '') LIKE '%–%'
  OR coalesce(content, '') LIKE '%—%'
  OR coalesce(content, '') LIKE '%–%';
