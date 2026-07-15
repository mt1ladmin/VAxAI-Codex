-- ================================================================
-- Knowledge Hub content refresh — align with current VAxAI direction
-- Run against Supabase so Studio tabs show updated copy from the DB.
-- Does not change schema. Safe to re-run (idempotent UPDATEs).
-- ================================================================

-- ----------------------------------------------------------------
-- Sectors: starting language → free Admin Review, human-led, no tool-sell
-- ----------------------------------------------------------------
UPDATE engagement_sector_profiles
SET
  starting_language = CASE name
    WHEN 'Charity and Community Services' THEN
      'We understand charities are often managing multiple priorities with limited resource. VAxAI starts with a free Admin Review of the administrative picture — backlog, information and day-to-day load — not by assuming AI is the answer. We look for clearer process, better use of what you already have, human support, or carefully controlled automation only where it fits safeguarding and trust.'
    WHEN 'Professional Services' THEN
      'VAxAI looks at how your practice manages the administrative side of client work — from first contact through invoice and follow-up. We start with a free Admin Review, then help clear backlogs, organise information for any AI or automation you choose, keep essential admin moving, and maintain improvements so problems do not return.'
    WHEN 'Health and Wellbeing' THEN
      'In health and wellbeing services, VAxAI focuses on the administrative side of practice — scheduling, communications and record management — with clear boundaries where automation is not appropriate. We start with a free Admin Review and recommend proportionate support, not a technology product.'
    WHEN 'Education and Training' THEN
      'VAxAI helps training and education providers reduce the administrative burden of managing learners, communications and reporting so more time can go on delivery. We start with a free Admin Review and quote only after we understand the work and the right support model.'
    WHEN 'Coaching and Consultancy' THEN
      'VAxAI works with coaches and consultants to reduce time spent on administration so more capacity goes on clients and delivery — without asking you to become a systems expert. We start with a free Admin Review; further work is scoped and quoted before anything begins.'
    ELSE starting_language
  END,
  potential_pathways = CASE
    WHEN potential_pathways IS NULL THEN ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing admin support', 'Maintain and improve']
    ELSE potential_pathways
  END,
  content_owner = COALESCE(content_owner, 'VAxAI'),
  review_date = '2026-07-15'
WHERE status IS DISTINCT FROM 'archived';

-- Generic refresh for remaining sectors not listed above
UPDATE engagement_sector_profiles
SET
  starting_language = 'VAxAI helps organisations reduce administrative pressure with people in the loop: clear backlogs, prepare information and processes so AI and automation can work if you choose them, keep essential admin moving, and maintain improvements. We start with a free Admin Review and quote after we understand the work — we do not publish fixed prices or sell AI products.',
  review_date = '2026-07-15'
WHERE name NOT IN (
  'Charity and Community Services',
  'Professional Services',
  'Health and Wellbeing',
  'Education and Training',
  'Coaching and Consultancy'
)
AND status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- Personas: keep human; avoid hype language; free Admin Review framing
-- ----------------------------------------------------------------
UPDATE engagement_personas
SET
  language_to_avoid = CASE
    WHEN language_to_avoid IS NULL OR array_length(language_to_avoid, 1) IS NULL
      THEN ARRAY['Digital transformation', 'AI will fix this', 'Scale at all costs', 'High-value work only', 'We sell AI']
    ELSE (
      SELECT array_agg(DISTINCT x)
      FROM unnest(
        language_to_avoid || ARRAY['Digital transformation', 'AI will fix this', 'We sell AI', 'High-value work only']
      ) AS t(x)
    )
  END,
  useful_questions = CASE persona_name
    WHEN 'The Stretched CEO' THEN
      ARRAY[
        'What is taking the most time away from the work only you can do?',
        'Where is admin pressure building — backlog, information, day-to-day load, or all three?',
        'Would a free Admin Review of your current admin operations be a useful first step?'
      ]
    WHEN 'The Founder-Operator' THEN
      ARRAY[
        'If you could stop doing three administrative tasks tomorrow, which ones would they be?',
        'What falls through the gaps when you are busy with clients?',
        'Would a free Admin Review help you see where support would make the biggest difference?'
      ]
    ELSE useful_questions
  END,
  evidence_status = COALESCE(evidence_status, 'hypothesis')
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- Pain points: prospect explanations → free Admin Review + no tool-sell
-- ----------------------------------------------------------------
UPDATE engagement_pain_points
SET
  explanation_to_prospect = CASE
    WHEN explanation_to_prospect IS NULL OR btrim(explanation_to_prospect) = '' THEN
      'We would start with a free Admin Review to understand what is going on, then recommend the right mix of backlog recovery, process clarity, human support and AI readiness — only where it adds genuine value and fits how you work. We do not sell AI products.'
    WHEN explanation_to_prospect ILIKE '%free Admin Review%' THEN explanation_to_prospect
    ELSE explanation_to_prospect || ' We usually begin with a free Admin Review so recommendations stay practical and proportionate.'
  END,
  recommendation_pathways = CASE
    WHEN recommendation_pathways IS NULL THEN
      ARRAY['Free Admin Review', 'Process clarification', 'Better use of existing tools', 'VA support', 'AI readiness groundwork']
    ELSE recommendation_pathways
  END,
  last_reviewed = '2026-07-15',
  content_owner = COALESCE(content_owner, 'VAxAI')
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- VAT prompts: reinforce Value / Alignment / Trust without tool-selling
-- ----------------------------------------------------------------
UPDATE engagement_vat_prompts
SET
  prompt = CASE
    WHEN dimension ILIKE 'value%' AND prompt NOT ILIKE '%Admin Review%' THEN
      prompt || ' Frame options against a free Admin Review of current admin operations first.'
    WHEN dimension ILIKE 'alignment%' AND prompt NOT ILIKE '%how the organisation works%' THEN
      prompt || ' Prefer approaches that fit how the organisation already works and the tools they trust.'
    WHEN dimension ILIKE 'trust%' AND prompt NOT ILIKE '%human%' THEN
      prompt || ' Keep a person accountable for review; never present AI output as a final decision.'
    ELSE prompt
  END
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- Objections: cost / AI / readiness aligned with quote-first model
-- ----------------------------------------------------------------
UPDATE engagement_objections
SET
  response = CASE objection
    WHEN 'We cannot afford this.' THEN
      'Cost matters, and we do not publish fixed prices because every organisation''s admin is different. The first step is a free Admin Review or conversation to understand what is taking the most time. Some improvements cost little or nothing — a clearer process or better use of existing tools. We only quote after we understand the work, the person who would deliver it, and a proportionate arrangement.'
    WHEN 'We do not need AI.' THEN
      'That may be completely right. VAxAI does not begin by assuming AI is the answer, and we do not sell AI products. We first look at the work, what is creating the pressure and whether the better response is a clearer process, better use of what you already have, human support, or a carefully controlled combination. AI readiness is optional and only where it fits.'
    WHEN 'AI will replace our staff.' THEN
      'VAxAI does not use AI to replace people. We help organisations clear admin backlogs, organise information, keep essential work moving and maintain improvements — with people in the loop. Where AI or automation is used, human oversight is designed in. The aim is less pressure on your team, not fewer people who matter.'
    WHEN 'We are not ready for AI yet.' THEN
      'That is a reasonable position. Many of the improvements we discuss do not involve AI at all: process clarity, backlog recovery, better use of existing tools and human VA support. We prepare foundations so tools can work later if you choose them — and we never require AI to work with us.'
    WHEN 'We need a person, not another tool.' THEN
      'You may be absolutely right. Human VA support is often the better option for work that requires judgement, relationships, exceptions or accountability. VAxAI coordinates skilled freelancers and quality review so you receive reliable people who get on with the work — not another platform to learn.'
    WHEN 'We are not sure what we need.' THEN
      'That is exactly the right place to start. We begin with a free Admin Review or conversation about what is taking the most time or causing the most pressure — not with a predetermined solution. The picture becomes clearer through that conversation, and any quote follows only once the work is understood.'
    ELSE response
  END,
  last_reviewed = '2026-07-15',
  content_owner = COALESCE(content_owner, 'VAxAI')
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- Scripts: free Admin Review, human-led, no fixed public prices
-- ----------------------------------------------------------------
UPDATE engagement_scripts
SET
  content = CASE title
    WHEN 'Cold email opener — general' THEN
      'Subject: Reducing your admin load — a quick note from VAxAI

Hi [First name],

I wanted to reach out because [what you noticed / what prompted this] — and it made me think about the administrative side of [type of work they do].

VAxAI helps [audience type] organisations clear admin backlogs, prepare information and processes for AI and automation where it genuinely helps, keep essential admin moving, and maintain improvements so pressure does not return. We are human-led and we do not sell AI products.

We usually start with a free Admin Review — no obligation — so recommendations stay practical. There are no fixed public prices; we quote after we understand the work and the right person to deliver it.

Would a brief call in the next week or two be useful?

Best,
[Your name]
VAxAI | [contact details]'
    WHEN 'Founder opener — practical' THEN
      'Subject: The admin side of running [type of business]

Hi [First name],

When you are running [type of business] on your own or with a small team, administration has a way of taking up time that should be going on clients or delivery.

VAxAI works with founders to clear backlogs, organise information, keep day-to-day admin moving, and prepare for AI or automation only where it fits how you already work. We start with a free Admin Review and quote once we understand what you need.

If any of that sounds relevant, a brief conversation might be useful.

[Your name] | VAxAI'
    WHEN 'Charity opener — warm' THEN
      'Subject: Admin pressure in the charity sector — a note from VAxAI

Hi [First name],

Running [charity name] well takes enormous effort — especially when reporting, data management, volunteer coordination and service delivery are all happening at once.

VAxAI works with voluntary and community organisations on the administrative side of that — not to automate relationships or frontline work, but to clear backlogs, organise information safely, keep essential admin moving and maintain improvements. We start with a free Admin Review; we do not sell AI products.

If it is something worth a brief conversation, I would be happy to find a time.

[Your name] | VAxAI'
    WHEN 'LinkedIn follow-up after connection' THEN
      'Thanks for connecting, [First name]. I work with [sector] organisations to reduce administrative pressure — clearing backlogs, organising information for any AI or automation they choose, and providing reliable human support so improvements last. We usually start with a free Admin Review. If that resonates, I would be happy to have a brief conversation — no sales pitch, just what is taking the most time.'
    ELSE content
  END,
  last_reviewed = '2026-07-15',
  content_owner = COALESCE(content_owner, 'VAxAI')
WHERE status IS DISTINCT FROM 'archived';

-- Soft-update remaining openers that still read as pure automation sales
UPDATE engagement_scripts
SET
  content = replace(
    content,
    'introducing carefully managed automation or human support',
    'clearing backlogs, preparing foundations for AI where it fits, and providing human VA support'
  ),
  last_reviewed = '2026-07-15'
WHERE content ILIKE '%introducing carefully managed automation or human support%';

-- ----------------------------------------------------------------
-- Pricing bands: internal only; quote-first public posture
-- ----------------------------------------------------------------
UPDATE engagement_pricing_rules
SET
  description = CASE name
    WHEN 'General VA support — hourly' THEN
      'Internal guide only for ongoing admin support scoping. Public quote after understanding hours, complexity and the right freelancer match. Do not publish rates on the website.'
    WHEN 'Experienced or specialist VA — hourly' THEN
      'Internal guide for specialist or senior VA scoping. Public quote after fit assessment. Do not publish rates on the website.'
    WHEN 'Automation monitoring and systems administration' THEN
      'Internal guide for maintain-and-improve / monitoring work. Public quote after scope. Do not publish rates on the website.'
    WHEN 'Monthly managed support' THEN
      'Internal guide for monthly retainers that can scale up or down. Public quote after understanding monthly capacity needs. Do not publish fixed packages on the website.'
    WHEN 'Solo or micro-business snapshot' THEN
      'Internal guide for free Admin Review follow-on project scoping for solo/micro organisations. Always confirm scope before quoting.'
    WHEN 'Small-team workflow review' THEN
      'Internal guide for project scoping with small teams. Free Admin Review first where appropriate; quote before work begins.'
    WHEN 'Multi-team or higher-complexity assessment' THEN
      'Internal guide for larger or multi-team scoping. Quote after small-scale test where needed; never publish fixed project prices.'
    WHEN 'Single low-complexity workflow implementation' THEN
      'Internal guide for single-workflow project implementation. Prefer improving existing tools; quote after scope.'
    WHEN 'Several connected workflows' THEN
      'Internal guide for multi-workflow projects. Complex builds may need trusted external partners — VAxAI does not sell enterprise AI.'
    WHEN 'Complex data, integration or governance' THEN
      'Internal guide for complex data/governance work. Detailed scoping required; instalment plans possible; quote only after understanding.'
    ELSE COALESCE(description, '') || ' Internal only — contact for quote externally.'
  END,
  internal_only = true,
  last_reviewed = '2026-07-15'
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- Sources: note review date for team
-- ----------------------------------------------------------------
UPDATE engagement_sources
SET
  notes = CASE
    WHEN notes IS NULL OR btrim(notes) = '' THEN 'Review for currency before citing in client materials.'
    WHEN notes ILIKE '%review%' THEN notes
    ELSE notes || ' Review for currency before citing.'
  END,
  status = COALESCE(status, 'active')
WHERE true;
