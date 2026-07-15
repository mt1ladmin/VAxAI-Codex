-- ================================================================
-- Knowledge Hub: Sectors, Personas, Pain points, VAT prompts, Pricing
-- Align with current VAxAI services (same direction as scripts/objections):
-- Free Admin Review → Backlog recovery → AI & automation readiness
-- (groundwork, not tool sales) → Ongoing admin support → Maintain & improve
-- Prepare / Support / Maintain · human-led · quote after understanding work
-- ================================================================

-- Shared pathway set used across sectors / pain points
-- Free Admin Review | Backlog recovery | AI readiness groundwork |
-- Ongoing admin support | Maintain and improve

-- ----------------------------------------------------------------
-- 1. SECTORS
-- ----------------------------------------------------------------
UPDATE engagement_sector_profiles SET
  potential_pathways = ARRAY[
    'Free Admin Review',
    'Backlog recovery',
    'AI readiness groundwork',
    'Ongoing admin support',
    'Maintain and improve'
  ],
  starting_language = CASE name
    WHEN 'Charity and Community Services' THEN
      'We understand charities often manage reporting, records, volunteers and delivery with limited admin capacity. VAxAI starts with a free Admin Review of the administrative picture — not by assuming AI is the answer. We help clear backlogs, organise information safely, provide reliable human support, and maintain systems so pressure does not return. We do not sell AI products.'
    WHEN 'Professional Services' THEN
      'VAxAI looks at the administrative side of client work — enquiries, onboarding, proposals, records, invoicing and follow-up. We start with a free Admin Review, then support backlog recovery, information and process foundations for any tools you use, ongoing human admin capacity, and maintenance so problems do not return.'
    WHEN 'Health and Wellbeing' THEN
      'In health and wellbeing, VAxAI focuses on administrative practice work — scheduling, communications and records — with clear boundaries where automation is not appropriate. Free Admin Review first; human oversight stays central. We prepare foundations and provide VA capacity rather than selling clinical or AI products.'
    WHEN 'Education and Training' THEN
      'VAxAI helps training and education providers reduce admin around enrolment, learner communications, records and reporting so more time goes on delivery. Free Admin Review first; then backlog recovery, organised information, ongoing support and maintenance — quoted after we understand the work.'
    WHEN 'Coaching and Consultancy' THEN
      'VAxAI works with coaches and consultants so administration does not compete endlessly with client delivery. Free Admin Review, backlog clearing, day-to-day human support, and groundwork for tools only where useful — without asking you to become a systems expert.'
    WHEN 'Creative, Marketing and Media' THEN
      'VAxAI helps creative teams protect delivery time by clearing admin backlogs, organising files and client records, keeping enquiries and invoicing moving, and maintaining systems. Free Admin Review first; we do not sell creative AI tools — we strengthen operational foundations and human capacity.'
    WHEN 'Retail and Ecommerce' THEN
      'VAxAI looks at operational and customer-facing administration — enquiries, orders records, returns admin, supplier follow-up — to restore control without adding software you do not need. Free Admin Review; backlog recovery; ongoing human support; readiness for automation only where processes and data are solid.'
    WHEN 'Membership and Associations' THEN
      'VAxAI helps membership organisations with renewals admin, member communications, events paperwork and records — clearing backlogs, providing ongoing capacity and keeping improvements working. Free Admin Review first; tools only after foundations are clear.'
    WHEN 'Accountancy and Finance Services' THEN
      'VAxAI helps finance practices reduce non-billable admin: document collection, deadline tracking, client communications and records hygiene. Free Admin Review; human VA support; process clarity; careful handling of sensitive financial information. We do not replace professional advice with AI.'
    WHEN 'Social Care and Support Services' THEN
      'In social care, safeguarding and human oversight are not optional. VAxAI focuses on administrative efficiency where it is safe — records, referrals admin, reporting capacity — with free Admin Review first and clear limits on automation. People stay accountable.'
    WHEN 'Technology and Digital Services' THEN
      'Technology businesses often need operational admin support separate from engineering. VAxAI clears CRM and sales admin backlogs, supports onboarding and reporting admin, and provides ongoing capacity so technical teams stay on product work. Free Admin Review; we do not sell you another stack.'
    WHEN 'Trades, Construction and Property Services' THEN
      'VAxAI helps trades and property businesses with quoting admin, job paperwork, invoicing and payment follow-up so more time goes on site and with clients. Free Admin Review; backlog recovery; ongoing human support; simple process foundations before any automation talk.'
    WHEN 'Research and Policy' THEN
      'VAxAI supports research and policy organisations with project coordination admin, document and records organisation, stakeholder communications and reporting load — so expert time stays on analysis. Free Admin Review; human support; no claim that AI replaces research judgement.'
    WHEN 'Recruitment and People Services' THEN
      'VAxAI helps recruitment and people-services businesses with candidate and client admin, scheduling support, compliance paperwork and follow-up discipline. Free Admin Review; backlog clearing; ongoing VA capacity; careful data handling. Relationships stay human.'
    WHEN 'Environmental and Sustainability Services' THEN
      'VAxAI helps environmental organisations reduce administrative burden on projects, volunteers, grants and impact reporting so energy stays on mission. Free Admin Review; backlog recovery; organised information; ongoing support and maintenance.'
    ELSE
      'VAxAI is human-led operational admin support and AI readiness. Free Admin Review first, then backlog recovery, AI readiness groundwork (not tool sales), ongoing admin support and maintain-and-improve. We quote after we understand the work.'
  END,
  questions_to_explore = CASE name
    WHEN 'Charity and Community Services' THEN
      ARRAY[
        'Where is admin pressure building — backlog, information, day-to-day load, or all three?',
        'How much time goes on funder reporting and where does the data live?',
        'What would a free Admin Review of your current admin operations be most useful for?',
        'Which work must always stay with staff versus what could be supported by a matched VA?'
      ]
    WHEN 'Professional Services' THEN
      ARRAY[
        'How do new enquiries arrive and what happens after they land?',
        'Where does work pile up — documents, proposals, invoicing or follow-up?',
        'Are tools already in place but underused because nobody owns the admin?',
        'Would ongoing monthly support help more than a one-off clear-up?'
      ]
    WHEN 'Health and Wellbeing' THEN
      ARRAY[
        'What takes the most time outside client sessions — booking, records or follow-up?',
        'How are records kept, and who needs to approve anything before it goes out?',
        'Where must a person always stay in the loop for clinical or safeguarding reasons?',
        'Would clearing a records or diary backlog free capacity first?'
      ]
    ELSE questions_to_explore
  END,
  common_objections = CASE
    WHEN common_objections IS NULL THEN
      ARRAY['We cannot afford this','We do not need AI','We need a person not a tool','We are not sure what we need']
    ELSE common_objections
  END,
  content_owner = COALESCE(content_owner, 'VAxAI'),
  review_date = '2026-07-15'
WHERE status IS DISTINCT FROM 'archived';

-- Generic questions refresh for sectors without bespoke set above
UPDATE engagement_sector_profiles SET
  questions_to_explore = ARRAY[
    'Where is administrative pressure building right now?',
    'Is the bigger issue backlog, day-to-day capacity, or systems that keep slipping?',
    'What tools do you already use, and what information do they rely on?',
    'Would a free Admin Review help clarify the next step before any quote?'
  ],
  review_date = '2026-07-15'
WHERE name NOT IN (
  'Charity and Community Services',
  'Professional Services',
  'Health and Wellbeing'
)
AND status IS DISTINCT FROM 'archived';

-- Soft-update descriptions that still frame VAxAI as pure automation sales
UPDATE engagement_sector_profiles SET
  description = description || ' VAxAI support is human-led: free Admin Review, backlog recovery, AI readiness groundwork, ongoing admin support and maintenance.'
WHERE status IS DISTINCT FROM 'archived'
  AND (description IS NULL OR description NOT ILIKE '%free Admin Review%')
  AND length(coalesce(description, '')) < 500;

-- ----------------------------------------------------------------
-- 2. PERSONAS
-- ----------------------------------------------------------------
UPDATE engagement_personas SET
  language_to_avoid = (
    SELECT array_agg(DISTINCT x)
    FROM unnest(
      coalesce(language_to_avoid, ARRAY[]::text[])
      || ARRAY[
        'Digital transformation',
        'AI will fix this',
        'We sell AI',
        'High-value work only',
        'Automate everything',
        'No human needed'
      ]
    ) AS t(x)
  ),
  useful_questions = CASE persona_name
    WHEN 'The Stretched CEO' THEN
      ARRAY[
        'What is taking the most time away from the work only you can do?',
        'Where is admin pressure building — backlog, information, day-to-day load, or all three?',
        'Would a free Admin Review of your operations be a useful first step for the board?',
        'What must stay with senior staff versus what a matched VA could own?'
      ]
    WHEN 'The Founder-Operator' THEN
      ARRAY[
        'If three admin tasks disappeared tomorrow, which would they be?',
        'What falls through the gaps when clients are busy?',
        'Do you need a one-off backlog clear-up, ongoing monthly support, or both?',
        'Would a free Admin Review help you decide before spending?'
      ]
    WHEN 'The Charity Finance and Operations Manager' THEN
      ARRAY[
        'How long does monthly or funder reporting take, and where does data live?',
        'Are systems connected or is data rekeyed?',
        'What would better records look like for you and the board?',
        'Where does human checking always need to stay in the loop?'
      ]
    WHEN 'The Independent Consultant' THEN
      ARRAY[
        'What share of the week is admin rather than client work?',
        'Have opportunities been lost because proposals or follow-ups slipped?',
        'Would flexible ongoing support fit better than a fixed full-time hire?',
        'What would you want a free Admin Review to look at first?'
      ]
    WHEN 'The Membership Manager' THEN
      ARRAY[
        'How are renewals and member communications currently handled?',
        'Where do backlogs build — renewals, events admin or records?',
        'What would reliable ongoing admin capacity change for engagement work?',
        'Which processes must stay personal for members?'
      ]
    WHEN 'The Practice Manager' THEN
      ARRAY[
        'What takes the most reception or practice admin time each week?',
        'How are appointments, records and follow-ups owned?',
        'Where is a person essential for patient or client trust?',
        'Would clearing a backlog free the team before any tool change?'
      ]
    WHEN 'The Freelance Creative' THEN
      ARRAY[
        'How much time goes on briefs, files, invoicing and client admin?',
        'What slips when delivery is full?',
        'Would a one-off clear-up or monthly support help more?',
        'What should never be automated in client relationships?'
      ]
    WHEN 'The Volunteer Coordinator' THEN
      ARRAY[
        'What admin around volunteers is most time-consuming?',
        'How are rotas, records and communications kept current?',
        'What change would create more burden than it removes for volunteers?',
        'Where would human VA support help without replacing relationships?'
      ]
    WHEN 'The Sole Trader Trade or Service Provider' THEN
      ARRAY[
        'How long from job complete to invoice sent?',
        'How do quotes and follow-ups currently work?',
        'What admin keeps you off site or away from clients?',
        'Would a free Admin Review help set a simple next step?'
      ]
    WHEN 'The Trustee or Board Member' THEN
      ARRAY[
        'What information does the board need that arrives late or incomplete?',
        'Where does administrative risk sit — records, reporting or capacity?',
        'Would a free Admin Review give a clearer picture before approving spend?',
        'What assurances does the board need about people staying in the loop?'
      ]
    ELSE useful_questions
  END,
  information_needed = CASE
    WHEN information_needed IS NULL THEN
      ARRAY[
        'Where pressure is building (backlog, information, day-to-day, maintenance)',
        'What a free Admin Review would cover first',
        'Whether support is project-based, monthly, or both',
        'That VAxAI does not sell AI products'
      ]
    ELSE information_needed
  END,
  evidence_status = COALESCE(evidence_status, 'hypothesis')
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- 3. PAIN POINTS
-- ----------------------------------------------------------------
UPDATE engagement_pain_points SET
  recommendation_pathways = ARRAY[
    'Free Admin Review',
    'Backlog recovery',
    'AI readiness groundwork',
    'Ongoing admin support',
    'Maintain and improve',
    'Process clarification',
    'Better use of existing tools',
    'VA support'
  ],
  explanation_to_prospect = CASE slug
    WHEN 'inbox-overload' THEN
      'We would start with a free Admin Review of how messages arrive and who owns them. Backlog recovery can clear the pile; ongoing admin support can own triage and routine replies; maintain-and-improve stops the inbox becoming the filing system again. We do not sell inbox AI products.'
    WHEN 'slow-response-times' THEN
      'Slow responses are often capacity or ownership issues, not missing software. A free Admin Review clarifies the cause. Ongoing VA support and simple process standards usually move the needle faster than a new tool. Quotes follow once the work is understood.'
    WHEN 'follow-ups-not-happening' THEN
      'We look at where commitments are captured and who owns them. Backlog recovery can clear overdue follow-ups; ongoing support keeps a reliable log; maintenance reviews stop the system slipping. Human judgement stays on sensitive or commercial follow-ups.'
    WHEN 'missed-enquiries' THEN
      'We map channels and ownership first (free Admin Review). Then we clear unactioned enquiries, set coverage for day-to-day admin, and keep monitoring so gaps do not reopen. Tools only help after ownership and information are clear.'
    WHEN 'diary-management' THEN
      'Scheduling load is often better fixed with clear ownership and ongoing diary support than with another booking product. Free Admin Review first; then backlog of conflicts and outstanding arrangements; ongoing VA support for complex coordination.'
    WHEN 'duplicate-data-entry' THEN
      'We map where the same information is entered and why. Prefer a single source of truth and better use of existing systems over new builds. Backlog recovery can clean records; AI readiness groundwork organises data so any later automation is safer.'
    WHEN 'spreadsheet-dependency' THEN
      'Spreadsheets are sometimes right; chaos is not. We review what the spreadsheet is doing, consolidate versions, document how it works, and add human capacity so one person is not the only failsafe. Free Admin Review before any system change.'
    WHEN 'funder-reporting' THEN
      'Funder reporting usually hurts because data is scattered. We clear reporting backlogs, organise source information, provide ongoing capacity for collection and checking, and maintain hygiene between cycles — with people accountable for what goes to funders.'
    WHEN 'monthly-management-reporting' THEN
      'We look at where figures come from and how long assembly takes. Backlog and data hygiene first; then lighter ongoing support for monthly pack production and human checking. Free Admin Review; quote after scope is clear.'
    WHEN 'late-payment-chasing' THEN
      'We map invoice-to-cash steps and who owns each chase. Backlog recovery for aged debt admin; ongoing support for routine reminders; humans for sensitive conversations. Free Admin Review; no promise that automation alone collects cash.'
    WHEN 'invoicing-delays' THEN
      'Delays often sit between job complete and invoice raised. We clear the billing backlog, document triggers, and provide ongoing capacity so invoices leave on time. Free Admin Review first.'
    WHEN 'lead-tracking' THEN
      'We check whether the issue is missing CRM, unused CRM, or no one owning follow-up. Backlog recovery for cold pipeline items; ongoing admin for logging and chases; readiness work only if information quality is the blocker.'
    WHEN 'client-onboarding' THEN
      'Onboarding friction is usually process and capacity. We document the route from win to start, clear onboarding backlogs, and provide ongoing support for paperwork and checks. Free Admin Review; keep relationship-critical steps human.'
    WHEN 'task-ownership' THEN
      'If nobody owns the task, tools will not save it. Free Admin Review to map ownership; process clarification; then backlog clear and ongoing support with clear RACI-style habits. Maintenance reviews keep ownership from drifting.'
    WHEN 'everything-depends-one-person' THEN
      'Founder or key-person dependency is common. We free capacity with backlog recovery and ongoing VA support, document how work runs, and maintain systems so the organisation is less fragile. Free Admin Review; quote for proportionate monthly or project support.'
    WHEN 'proposal-contract-delays' THEN
      'We look at templates, information gathering and who drafts. Backlog of stuck proposals; ongoing support for pack assembly; human review before anything client-facing leaves. Free Admin Review first.'
    WHEN 'content-planning' THEN
      'Content admin is often calendars, assets and approvals — not the creative itself. We organise planning admin, clear backlog of unfinished assets admin, and provide ongoing coordination support. We do not sell content AI as a product.'
    WHEN 'membership-renewals' THEN
      'Renewals fail when data and ownership are weak. Backlog recovery on lapsed or stuck renewals; ongoing admin for cycles; maintain-and-improve so the process survives busy periods. Free Admin Review first.'
    WHEN 'meeting-minutes-actions' THEN
      'Minutes and actions slip without ownership and a simple system. Ongoing support can run capture and chase; backlog recovery clears old open actions; maintenance keeps the habit. Free Admin Review to see what is failing.'
    WHEN 'subscription-renewal-management' THEN
      'Subscription admin needs clean records and timely chase. We clear renewal backlogs, organise customer data, provide ongoing capacity, and maintain hygiene. Free Admin Review; quote after volume and sensitivity are clear.'
    ELSE
      coalesce(explanation_to_prospect, '')
      || CASE
           WHEN coalesce(explanation_to_prospect, '') ILIKE '%free Admin Review%' THEN ''
           ELSE ' We usually begin with a free Admin Review so recommendations stay practical: backlog recovery, AI readiness groundwork, ongoing admin support and maintain-and-improve as needed. We do not sell AI products.'
         END
  END,
  possible_ai = CASE
    WHEN possible_ai IS NULL THEN possible_ai
    ELSE possible_ai
  END,
  last_reviewed = '2026-07-15',
  content_owner = COALESCE(content_owner, 'VAxAI')
WHERE status IS DISTINCT FROM 'archived';

-- Soft-tune AI arrays: emphasise review / draft assist not autonomous send
UPDATE engagement_pain_points SET
  possible_ai = array(
    SELECT DISTINCT e
    FROM unnest(
      coalesce(possible_ai, ARRAY[]::text[])
      || ARRAY[
        'AI may draft low-risk text for human review only',
        'AI must not send sensitive or client-facing work without a person',
        'Prefer organised information and process before any AI use'
      ]
    ) AS t(e)
  )
WHERE status IS DISTINCT FROM 'archived';

UPDATE engagement_pain_points SET
  human_va_responsibilities = array(
    SELECT DISTINCT e
    FROM unnest(
      coalesce(human_va_responsibilities, ARRAY[]::text[])
      || ARRAY[
        'Own agreed day-to-day admin within scope',
        'Flag exceptions and sensitive items',
        'Support backlog clearing and record hygiene',
        'Help keep improvements from slipping'
      ]
    ) AS t(e)
  )
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- 4. VAT PROMPTS (update text + add service-aligned prompts)
-- ----------------------------------------------------------------
UPDATE engagement_vat_prompts SET
  prompt = CASE
    WHEN prompt = 'What is the problem costing in time, stress, missed income or service quality right now?' THEN
      'What is the admin problem costing in time, stress, missed income, delivery quality or risk right now?'
    WHEN prompt = 'Would solving this remove work entirely or just move it somewhere else?' THEN
      'Would solving this remove work, free capacity for work only your team can do, or merely move the pile — and which of backlog recovery, ongoing support or maintenance is needed?'
    WHEN prompt = 'What systems or tools does the organisation already have?' THEN
      'What systems or tools does the organisation already have, and should we improve those before considering anything new? (VAxAI does not sell AI products.)'
    WHEN prompt = 'Is the data available in a usable format?' THEN
      'Is information organised and trustworthy enough for people — and any tools — to rely on, or is AI readiness groundwork needed first?'
    WHEN prompt = 'How sensitive is the information involved?' THEN
      'How sensitive is the information, and what must never go into third-party AI tools without clear controls?'
    WHEN prompt = 'Who needs to check or approve the output before it is used?' THEN
      'Who must check or approve outputs before they go out — and is human review designed in (as VAxAI requires for AI-assisted work)?'
    WHEN prompt = 'Does the organisation understand the limitations of AI for this type of task?' THEN
      'Does the organisation understand AI limits here, and does use pass Value, Alignment and Trust — or is the better answer process clarity and human VA support only?'
    WHEN prompt = 'Is there a process for reviewing and correcting AI-generated content?' THEN
      'Is there a process for reviewing and correcting AI-assisted content, and who is accountable when something is wrong?'
    ELSE prompt
  END
WHERE status IS DISTINCT FROM 'archived';

-- Insert additional VAT prompts if not already present (by prompt text)
INSERT INTO engagement_vat_prompts (category, dimension, prompt, context_tags, status, sort_order)
SELECT v.category, v.dimension, v.prompt, v.context_tags, 'approved', v.sort_order
FROM (VALUES
  ('general', 'value',
   'Is a free Admin Review the right first step to understand where pressure is building before any quote?',
   ARRAY['all','admin-review'], 30),
  ('general', 'value',
   'Is the need mainly backlog recovery, ongoing admin capacity, maintenance, AI readiness groundwork, or a combination?',
   ARRAY['all','service-fit'], 31),
  ('general', 'alignment',
   'Does the proposed support fit how the organisation already works and the tools it already trusts?',
   ARRAY['all','alignment'], 32),
  ('general', 'alignment',
   'Can improvements be maintained after the first clear-up, or will the backlog return without ongoing support?',
   ARRAY['all','maintain'], 33),
  ('general', 'trust',
   'Where must a person always stay accountable, even if tools draft or sort work?',
   ARRAY['all','trust','human-in-loop'], 34),
  ('ai', 'value',
   'Would AI readiness groundwork (organised information and clear processes) create more value than buying another tool right now?',
   ARRAY['ai','readiness'], 35),
  ('ai', 'alignment',
   'Is any AI use aligned with safeguarding, confidentiality and professional standards for this organisation?',
   ARRAY['ai','trust','safeguarding'], 36),
  ('backlog', 'value',
   'What volume of outstanding admin is blocking day-to-day work, and what does a cleared backlog unlock?',
   ARRAY['backlog'], 37),
  ('ongoing_support', 'value',
   'Would flexible monthly human support reduce pressure more reliably than a one-off project alone?',
   ARRAY['ongoing','va-support'], 38)
) AS v(category, dimension, prompt, context_tags, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM engagement_vat_prompts e WHERE e.prompt = v.prompt
);

-- ----------------------------------------------------------------
-- 5. PRICING BANDS (internal only — public site is quote-first)
-- Reshape categories around real services; keep numeric bands as
-- internal scoping guides, not public rates.
-- ----------------------------------------------------------------
-- Map both legacy and already-renamed names so this migration is re-runnable
UPDATE engagement_pricing_rules SET
  internal_only = true,
  last_reviewed = '2026-07-15',
  name = CASE name
    WHEN 'Solo or micro-business snapshot' THEN 'Internal — Solo/micro post-review scoping'
    WHEN 'Small-team workflow review' THEN 'Internal — Small-team post-review scoping'
    WHEN 'Multi-team or higher-complexity assessment' THEN 'Internal — Multi-team / complex scoping'
    WHEN 'Single low-complexity workflow implementation' THEN 'Internal — Single-area project delivery'
    WHEN 'Several connected workflows' THEN 'Internal — Multi-area project delivery'
    WHEN 'Complex data, integration or governance' THEN 'Internal — Complex data / governance project'
    WHEN 'General VA support — hourly' THEN 'Internal — Ongoing admin support (standard)'
    WHEN 'Experienced or specialist VA — hourly' THEN 'Internal — Ongoing admin support (specialist)'
    WHEN 'Automation monitoring and systems administration' THEN 'Internal — Maintain and improve'
    WHEN 'Monthly managed support' THEN 'Internal — Monthly managed retainer'
    ELSE name
  END
WHERE status IS DISTINCT FROM 'archived';

UPDATE engagement_pricing_rules SET
  description = CASE name
    WHEN 'Internal — Solo/micro post-review scoping' THEN
      'Internal guide: post–Admin Review scoping for solo/micro (1–5 people). Prefer free Admin Review first. Public: contact for quote. Do not publish rates.'
    WHEN 'Internal — Small-team post-review scoping' THEN
      'Internal guide: project scoping for small teams after free Admin Review. May cover backlog + readiness groundwork. Public: contact for quote.'
    WHEN 'Internal — Multi-team / complex scoping' THEN
      'Internal guide: multi-team or complex environments. Small-scale test then full scope. Public: contact for quote. Never publish fixed project prices.'
    WHEN 'Internal — Single-area project delivery' THEN
      'Internal guide: single-area project delivery (e.g. one backlog domain or one process) after scoping. Prefer existing tools. Public: contact for quote.'
    WHEN 'Internal — Multi-area project delivery' THEN
      'Internal guide: multi-area project (backlog + process + readiness across connected work). Complex builds → trusted partners, not VAxAI product sales. Public: contact for quote.'
    WHEN 'Internal — Complex data / governance project' THEN
      'Internal guide: complex data, records or governance-heavy projects (charity/public sector often). Detailed scoping; instalments possible. Public: contact for quote.'
    WHEN 'Internal — Ongoing admin support (standard)' THEN
      'Internal guide only for ongoing admin support scoping (inbox, diary, records, routine admin). Match freelancers; monthly retainers can scale. Public: contact for quote — do not publish hourly rates.'
    WHEN 'Internal — Ongoing admin support (specialist)' THEN
      'Internal guide for specialist/senior VA scoping (founder support, sensitive admin, quality review of AI-assisted work). Public: contact for quote.'
    WHEN 'Internal — Maintain and improve' THEN
      'Internal guide for Maintain and improve: monitoring automations, data hygiene, admin reviews so problems do not return. Public: contact for quote.'
    WHEN 'Internal — Monthly managed retainer' THEN
      'Internal guide for monthly retainers (ongoing admin support ± light maintenance). Hours scale up/down by period. Public: contact for quote — no fixed public packages.'
    WHEN 'Internal — Free Admin Review' THEN
      'Public offer: free Admin Review of administrative operations. No obligation. Gate to any paid quote.'
    ELSE description
  END,
  inclusions = CASE name
    WHEN 'Internal — Solo/micro post-review scoping' THEN
      ARRAY[
        'Free Admin Review where not already done',
        'Map of admin pressure (backlog, information, day-to-day, maintenance)',
        'VAT-informed recommendations',
        'Prioritised next steps',
        'Indicative internal scope only — formal quote separate'
      ]
    WHEN 'Internal — Small-team post-review scoping' THEN
      ARRAY[
        'Admin operations review',
        'Backlog and systems picture',
        'AI readiness groundwork assessment (not tool sales)',
        'Recommended mix of project vs ongoing support',
        'Implementation outline before quote'
      ]
    WHEN 'Internal — Multi-team / complex scoping' THEN
      ARRAY[
        'Stakeholder input as needed',
        'Cross-team backlog and information map',
        'Governance and sensitivity flags',
        'Small-scale test recommendation',
        'Full project outline for quote'
      ]
    WHEN 'Internal — Single-area project delivery' THEN
      ARRAY[
        'Agreed backlog or process scope',
        'Use/improve existing tools where possible',
        'Documentation of how work runs',
        'Handover and quality checks',
        'Optional path to ongoing support'
      ]
    WHEN 'Internal — Multi-area project delivery' THEN
      ARRAY[
        'Multi-area backlog recovery and process work',
        'Information organisation for safer tool use',
        'Human VA delivery with coordination',
        'Documentation and training on new habits',
        'Partner referral if complex build needed'
      ]
    WHEN 'Internal — Complex data / governance project' THEN
      ARRAY[
        'Detailed scoping',
        'Records and data hygiene plan',
        'Sensitivity and access controls',
        'Human-in-the-loop design',
        'Phased delivery and review points'
      ]
    WHEN 'Internal — Ongoing admin support (standard)' THEN
      ARRAY[
        'Matched freelance VA',
        'Agreed task types (e.g. inbox, diary, records)',
        'Coordination and quality review by VAxAI',
        'Flexible monthly hours',
        'Escalation of exceptions'
      ]
    WHEN 'Internal — Ongoing admin support (specialist)' THEN
      ARRAY[
        'Senior or specialist match',
        'Founder/executive or sensitive admin support',
        'Human review of AI-assisted outputs where used',
        'Coordination and quality standards',
        'Flexible monthly hours'
      ]
    WHEN 'Internal — Maintain and improve' THEN
      ARRAY[
        'Regular admin and data hygiene reviews',
        'Watch automations and flag failures',
        'Stop backlogs rebuilding',
        'Light process adjustments',
        'Reporting to the client owner'
      ]
    WHEN 'Internal — Monthly managed retainer' THEN
      ARRAY[
        'Agreed hours per month (scalable)',
        'Defined response expectations',
        'Blend of ongoing admin and light maintenance',
        'Regular check-in',
        'Quote adjusted when scope changes'
      ]
    WHEN 'Internal — Free Admin Review' THEN
      ARRAY[
        'Structured review of admin pressure',
        'Honest recommendation (including if not a fit)',
        'No obligation',
        'Gate to any paid quote'
      ]
    ELSE inclusions
  END,
  category = CASE name
    WHEN 'Internal — Solo/micro post-review scoping' THEN 'admin_review_follow_on'
    WHEN 'Internal — Small-team post-review scoping' THEN 'admin_review_follow_on'
    WHEN 'Internal — Multi-team / complex scoping' THEN 'admin_review_follow_on'
    WHEN 'Internal — Single-area project delivery' THEN 'project_backlog_or_readiness'
    WHEN 'Internal — Multi-area project delivery' THEN 'project_backlog_or_readiness'
    WHEN 'Internal — Complex data / governance project' THEN 'project_backlog_or_readiness'
    WHEN 'Internal — Ongoing admin support (standard)' THEN 'ongoing_support'
    WHEN 'Internal — Ongoing admin support (specialist)' THEN 'ongoing_support'
    WHEN 'Internal — Maintain and improve' THEN 'maintain_and_improve'
    WHEN 'Internal — Monthly managed retainer' THEN 'ongoing_support'
    WHEN 'Internal — Free Admin Review' THEN 'admin_review'
    ELSE category
  END
WHERE status IS DISTINCT FROM 'archived';

-- Optional: add free Admin Review as a zero-band internal marker if missing
INSERT INTO engagement_pricing_rules (
  name, category, band_low, band_expected, band_high, unit,
  description, inclusions, status, internal_only, last_reviewed
)
SELECT
  'Internal — Free Admin Review',
  'admin_review',
  0, 0, 0,
  'review',
  'Public offer: free Admin Review of administrative operations. No obligation. Not a paid product. Use to recommend backlog recovery, AI readiness groundwork, ongoing support and/or maintain-and-improve — then quote only if paid work is agreed.',
  ARRAY[
    'Structured review of admin pressure',
    'Honest recommendation (including if not a fit)',
    'No obligation',
    'Gate to any paid quote'
  ],
  'active',
  true,
  '2026-07-15'
WHERE NOT EXISTS (
  SELECT 1 FROM engagement_pricing_rules WHERE name = 'Internal — Free Admin Review'
);
