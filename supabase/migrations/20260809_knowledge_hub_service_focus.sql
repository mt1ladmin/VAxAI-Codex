-- ================================================================
-- Knowledge Hub focus refresh: Sectors, Personas, Pain points, VAT
-- Align tightly with VAxAI's four services and highest-demand markets:
--   1. Backlog recovery
--   2. AI and automation readiness (groundwork, not tool sales)
--   3. Ongoing operational administration
--   4. Monitoring and maintenance
-- Journey: Prepare → Support → Maintain · Free Admin Review first
-- Primary demand: founders, growing SMEs, charities/non-profits, public sector
-- ================================================================

-- Pathways shared across sectors / pain points
-- Free Admin Review | Backlog recovery | AI readiness groundwork |
-- Ongoing operational administration | Monitoring and maintenance

-- ----------------------------------------------------------------
-- 0. Soft-archive existing records in these four libraries so the
--    hub shows the focused set below (scripts/pricing/objections untouched).
-- ----------------------------------------------------------------
UPDATE engagement_sector_profiles
SET status = 'archived', review_date = '2026-07-16'
WHERE status IS DISTINCT FROM 'archived';

UPDATE engagement_personas
SET status = 'archived'
WHERE status IS DISTINCT FROM 'archived';

UPDATE engagement_pain_points
SET status = 'archived', last_reviewed = '2026-07-16'
WHERE status IS DISTINCT FROM 'archived';

UPDATE engagement_vat_prompts
SET status = 'archived'
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- 1. SECTORS - markets with highest demand for the four services
-- ----------------------------------------------------------------
INSERT INTO engagement_sector_profiles (
  name, audience_types, description, common_operating_model, common_admin_pressures,
  typical_stakeholders, common_systems, common_data_types, relevant_risk_areas,
  starting_language, questions_to_explore, common_objections, potential_pathways,
  status, content_owner, review_date
) VALUES
(
  'Founders and early-stage ventures',
  ARRAY['Founder or entrepreneur', 'Small business'],
  'Founders and early teams (roughly under 20 people) where administration still sits with the founder or a thin operations layer. Highest demand for backlog recovery (inbox, files, CRM, billing), ongoing operational administration so founders reclaim time, AI readiness groundwork before tools like Copilot, and light maintenance so systems do not collapse under growth.',
  'Founder-led or small core team; informal processes; tools adopted faster than information is organised.',
  ARRAY[
    'Founder inbox and diary overload',
    'Shared drives and knowledge stuck in heads',
    'CRM and pipeline not kept current',
    'Invoicing and payment follow-up lag',
    'No capacity to prepare data or processes for AI tools'
  ],
  ARRAY['Founder', 'Co-founder', 'Ops lead', 'EA or PA', 'Fractional COO'],
  ARRAY['Email', 'Google Workspace or Microsoft 365', 'CRM', 'Accounting tools', 'Shared drives', 'Project tools'],
  ARRAY['Client and prospect records', 'Contracts', 'Financial admin', 'Product or service docs', 'Team knowledge'],
  ARRAY['GDPR', 'Client confidentiality', 'Key-person dependency'],
  'Founders often carry the admin load that should free them for growth. VAxAI starts with a free Admin Review of how work actually runs, then clears backlogs, organises information so any later AI use is safer, provides reliable ongoing admin support, and maintains systems so pressure does not return. We do not sell AI products.',
  ARRAY[
    'What admin is taking the most time away from work only you can do?',
    'Where is the backlog worst - inbox, files, CRM, billing or reporting?',
    'Are you trying tools before information and processes are organised?',
    'Do you need a one-off clear-up, monthly support, or both?'
  ],
  ARRAY['We cannot afford support yet', 'I should just do it myself', 'We need AI not admin', 'We will hire full-time later'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Growing SMEs and professional practices',
  ARRAY['Small business', 'Professional services'],
  'SMEs that have outgrown informal ways of working: professional services, agencies, consultancies and similar. Strong demand for backlog recovery after growth, AI readiness groundwork before Copilot or CRM AI, ongoing operational administration across enquiries, delivery admin and finance, and maintenance so duplicated processes do not return.',
  'Team of roughly 5-50; mix of specialists and thin central admin; multiple tools without a single owner of information quality.',
  ARRAY[
    'Enquiry and proposal admin bottlenecks',
    'Client onboarding and document chasing',
    'Duplicate data across CRM, files and finance',
    'Reporting packs that take days to assemble',
    'AI tools tried without clean records or process'
  ],
  ARRAY['Managing director', 'Operations manager', 'Practice manager', 'Office manager', 'Finance lead'],
  ARRAY['CRM', 'Practice management', 'Microsoft 365 or Google Workspace', 'Accounting', 'Project tools'],
  ARRAY['Client files', 'Proposals and contracts', 'Time and billing data', 'Staff records', 'Pipeline'],
  ARRAY['GDPR', 'Professional confidentiality', 'Quality of advice vs admin'],
  'Growing practices often feel admin debt before they feel a people shortage. VAxAI clears the backlog, prepares information and processes for any tools you already use, provides day-to-day human admin capacity, and maintains hygiene so the same problems do not return. Free Admin Review first; we quote after we understand the work.',
  ARRAY[
    'Where does work pile up between winning a client and getting paid?',
    'Which tools are in place but underused because nobody owns the admin?',
    'What would need to be true before AI assistants could help safely?',
    'Would ongoing monthly support help more than a one-off clear-up?'
  ],
  ARRAY['We already have a VA', 'Our systems should do this', 'We need a full-time hire', 'AI will fix it soon'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Charities and non-profits',
  ARRAY['Charity or non-profit', 'Social enterprise or CIC'],
  'Charities and non-profits where grant, donor, volunteer and programme administration compete with mission delivery. Highest demand for backlog recovery (reporting, files, CRM), AI readiness groundwork before any AI-assisted reporting, ongoing operational administration, and maintenance of records so compliance and funder cycles do not slip.',
  'Mission-led teams with limited central admin; multiple funders and reporting cycles; high accountability, thin capacity.',
  ARRAY[
    'Funder and board reporting load',
    'Grant evidence scattered across systems',
    'Volunteer and programme admin backlogs',
    'Shared drives and case records hard to trust',
    'No capacity for AI readiness before tools are offered'
  ],
  ARRAY['CEO', 'COO or head of operations', 'Finance and ops manager', 'Programme lead', 'Trustees'],
  ARRAY['CRM or donor systems', 'Finance packages', 'Shared drives', 'Email', 'Grant portals', 'Spreadsheets'],
  ARRAY['Beneficiary and volunteer records', 'Grant files', 'Financial admin', 'Impact evidence', 'Policies'],
  ARRAY['GDPR', 'Safeguarding', 'Funder terms', 'Public accountability', 'Charity Commission expectations'],
  'Charities often run complex administration on a thin back office. VAxAI starts with a free Admin Review - not with selling AI. We clear reporting and records backlogs, organise information safely, provide reliable human support for day-to-day admin, and maintain systems so pressure does not return. People stay accountable for what goes to funders and boards.',
  ARRAY[
    'Where is admin pressure building - backlog, day-to-day load, or systems that keep slipping?',
    'How long does funder or board reporting take and where does the data live?',
    'What would a free Admin Review of your admin operations be most useful for?',
    'Which work must stay with staff versus what a matched VA could own?'
  ],
  ARRAY['We cannot afford this', 'Our data is too sensitive', 'Volunteers will not adopt change', 'We need a person not a tool'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Public sector and public services',
  ARRAY['Public sector'],
  'Local and public service teams under backlog, records and compliance pressure, often with legacy systems and limited ops capacity. Demand for backlog recovery, AI readiness groundwork before enterprise AI or Copilot rollouts, ongoing operational administration for routine processes, and monitoring so improvements hold.',
  'Teams inside larger public bodies; governance-heavy; multiple stakeholders; information governance constraints.',
  ARRAY[
    'Case and correspondence backlogs',
    'Records and shared information hard to find or trust',
    'Reporting and FOI-style evidence gathering',
    'Process undocumented before automation is proposed',
    'Capacity gaps for day-to-day operational admin'
  ],
  ARRAY['Service manager', 'Business support lead', 'Information governance', 'Digital or transformation lead', 'Team leaders'],
  ARRAY['Case systems', 'Shared drives', 'Email', 'Line-of-business applications', 'Microsoft 365'],
  ARRAY['Case records', 'Citizen correspondence', 'Management information', 'Policy and procedure docs'],
  ARRAY['Information governance', 'Equality and accessibility', 'Public accountability', 'Data protection'],
  'Public services need operational resilience before smarter tools. VAxAI supports backlog recovery, organised information and process documentation, day-to-day admin capacity, and maintenance - always with people accountable. Free Admin Review first; we do not sell AI platforms.',
  ARRAY[
    'Where is the administrative backlog most visible to the public or to staff?',
    'What must be true of your records before any AI or automation pilot?',
    'Who owns day-to-day operational admin today?',
    'How will improvements be maintained after the first clear-up?'
  ],
  ARRAY['Procurement is too hard', 'Data is too sensitive', 'We already have transformation programmes', 'Change fatigue'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Accountancy and finance practices',
  ARRAY['Professional services', 'Small business'],
  'Accountancy and finance practices with heavy document collection, deadline tracking and client admin. High demand for backlog recovery, AI readiness groundwork before AI-assisted drafting, ongoing operational administration for non-billable work, and maintenance of client information quality.',
  'Fee-earners plus thin practice admin; seasonal peaks; sensitive financial information.',
  ARRAY[
    'Client document collection chases',
    'Deadline and compliance tracking admin',
    'Onboarding and engagement letter admin',
    'Scattered client files and version chaos',
    'Interest in AI tools before records are clean'
  ],
  ARRAY['Practice owner', 'Practice manager', 'Office manager', 'Partners', 'Client services lead'],
  ARRAY['Practice management software', 'Portals', 'Email', 'Shared drives', 'Accounting platforms'],
  ARRAY['Client documents', 'Deadlines', 'Engagement records', 'Billing admin'],
  ARRAY['Client confidentiality', 'AML admin accuracy', 'Professional standards', 'GDPR'],
  'Finance practices lose billable time to non-advisory admin. VAxAI clears document and deadline backlogs, organises client information, provides ongoing human admin capacity, and maintains hygiene. Free Admin Review first. We do not replace professional advice with AI.',
  ARRAY[
    'What non-billable admin takes the most team time each week?',
    'How reliable is client document collection today?',
    'What would need to be organised before any AI-assisted drafting is safe?',
    'Would ongoing support through peaks help more than temporary cover?'
  ],
  ARRAY['Clients expect us to do it', 'Software should handle this', 'Data is too sensitive for external support'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Health, care and wellbeing services',
  ARRAY['Small business', 'Charity or non-profit'],
  'Clinics, practices and care-related services where scheduling, records and family or client communications create large admin load. Demand for backlog recovery, careful AI readiness (with strict human oversight), ongoing operational administration for reception and practice admin, and maintenance of records hygiene.',
  'Clinicians or carers plus small admin team; high trust requirements; clear limits on automation.',
  ARRAY[
    'Diary and booking complexity',
    'Records and correspondence backlog',
    'Referral and intake admin',
    'Family or client update communications',
    'Compliance evidence gathering'
  ],
  ARRAY['Practice manager', 'Registered manager', 'Clinic owner', 'Operations lead', 'Reception lead'],
  ARRAY['Practice or care systems', 'Rota tools', 'Email', 'Shared drives', 'Telephony'],
  ARRAY['Appointment data', 'Client or patient admin records', 'Staff rotas', 'Compliance evidence'],
  ARRAY['Confidentiality', 'Safeguarding', 'Regulatory evidence', 'Clinical boundaries'],
  'In health and care, human oversight is not optional. VAxAI focuses on administrative practice work - scheduling, communications and records - with free Admin Review first. We clear safe admin backlogs, provide ongoing capacity, prepare foundations carefully, and maintain systems. We do not sell clinical or AI products.',
  ARRAY[
    'What takes the most time outside client or care sessions?',
    'Where must a person always stay in the loop?',
    'Would clearing a diary or records backlog free capacity first?',
    'How are records kept and who approves anything before it goes out?'
  ],
  ARRAY['Automation is inappropriate', 'Regulators would not allow it', 'We already have a care system'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Education, training and skills providers',
  ARRAY['Small business', 'Charity or non-profit', 'Public sector'],
  'Training providers, academies and education organisations with enrolment, learner communications, records and reporting admin. Strong fit for backlog recovery, AI readiness groundwork for knowledge and records, ongoing operational administration, and maintenance between cohorts.',
  'Delivery staff plus small admin; cohort peaks; multiple reporting audiences.',
  ARRAY[
    'Enrolment and onboarding admin',
    'Learner communications volume',
    'Attendance and evidence records',
    'Funder or quality reporting packs',
    'Course materials and shared knowledge disorganised'
  ],
  ARRAY['Centre manager', 'Operations lead', 'Quality lead', 'Head of programmes', 'Admin lead'],
  ARRAY['MIS or LMS', 'CRM', 'Email', 'Shared drives', 'Spreadsheets'],
  ARRAY['Learner records', 'Enrolment files', 'Evidence packs', 'Staff and timetable admin'],
  ARRAY['Data protection', 'Safeguarding where relevant', 'Funding compliance'],
  'Education and training providers need admin that protects delivery time. VAxAI clears enrolment and reporting backlogs, organises learner and course information, provides ongoing human admin support, and maintains systems between peaks. Free Admin Review first; we do not sell learning AI products.',
  ARRAY[
    'Where does admin peak in the learner journey?',
    'How long does reporting or evidence assembly take?',
    'What information would need to be organised before any AI-assisted drafting helps?',
    'Is the need mainly backlog, ongoing capacity, or both?'
  ],
  ARRAY['Term-time is too busy', 'Our MIS already does this', 'Funding rules are too complex'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Membership, associations and networks',
  ARRAY['Charity or non-profit', 'Small business'],
  'Membership bodies and associations with renewals, member communications, events paperwork and records. High demand for backlog recovery on renewals and events, ongoing operational administration through cycles, AI readiness for organised member data, and maintenance so processes survive busy periods.',
  'Small central team serving many members; cyclical renewals and events.',
  ARRAY[
    'Renewals and lapsed member admin',
    'Member enquiries and communications',
    'Events and CPD admin',
    'Directory and records accuracy',
    'Board or committee paper packs'
  ],
  ARRAY['CEO', 'Membership manager', 'Events lead', 'Operations manager', 'Board'],
  ARRAY['Membership CRM', 'Email platforms', 'Events tools', 'Shared drives', 'Finance systems'],
  ARRAY['Member records', 'Renewal status', 'Events data', 'Committee papers'],
  ARRAY['GDPR', 'Member trust', 'Financial governance'],
  'Membership organisations process high volumes of renewals and communications relative to team size. VAxAI clears backlogs, organises member information, provides ongoing capacity through cycles, and maintains processes. Free Admin Review first. Relationships that should stay personal stay human.',
  ARRAY[
    'Where do renewals and member communications currently fail?',
    'What backlog builds after events or campaigns?',
    'How accurate and usable is member data today?',
    'Would monthly support through peaks help more than temporary cover?'
  ],
  ARRAY['Members expect personal contact', 'Our CRM should automate this', 'Budget is fixed for the year'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Trades, construction and field services',
  ARRAY['Small business', 'Founder or entrepreneur'],
  'Trades, property and field-service businesses where quoting, job paperwork, invoicing and payment follow-up pull people off site. Strong demand for backlog recovery, ongoing operational administration, simple process foundations (AI readiness where tools are considered), and maintenance of job and customer records.',
  'Owner-operators and small office support; high volume of jobs; admin often secondary to site work.',
  ARRAY[
    'Quote and follow-up lag',
    'Job paperwork and certificates admin',
    'Invoice and payment chasing backlog',
    'Customer and job records incomplete',
    'Diary and subcontractor coordination'
  ],
  ARRAY['Owner', 'Office manager', 'Contracts manager', 'Finance admin'],
  ARRAY['Job management apps', 'Email', 'Accounting tools', 'Shared drives', 'Spreadsheets'],
  ARRAY['Quotes', 'Job sheets', 'Invoices', 'Customer contacts', 'Certificates'],
  ARRAY['Consumer protection', 'Health and safety records', 'GDPR'],
  'Trades and field services lose billable time to office admin. VAxAI clears quoting and billing backlogs, keeps job records organised, provides ongoing human admin capacity, and maintains simple systems so work keeps moving. Free Admin Review first; tools only after foundations are clear.',
  ARRAY[
    'How long from job complete to invoice sent?',
    'How do quotes and follow-ups currently work?',
    'What admin keeps people off site?',
    'Would a free Admin Review help set a simple next step?'
  ],
  ARRAY['We are always on site', 'My accountant handles it', 'We just need better software'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Housing, community and social impact services',
  ARRAY['Charity or non-profit', 'Public sector', 'Social enterprise or CIC'],
  'Housing, homelessness and community services with high casework, rotas and commissioner reporting. Demand for backlog recovery, careful AI readiness groundwork, ongoing operational administration for coordination and reporting, and maintenance of records under safeguarding constraints.',
  'Multi-site or multi-contract delivery; thin central admin; high documentation load.',
  ARRAY[
    'Referral and case admin backlogs',
    'Rota and cover coordination',
    'Commissioner and funder reporting',
    'Support plans and case notes administration',
    'Shared information hard to trust or find'
  ],
  ARRAY['CEO', 'Head of operations', 'Service managers', 'Housing or community leads', 'Trustees'],
  ARRAY['Housing or case systems', 'CRM', 'Rota tools', 'Email', 'Spreadsheets'],
  ARRAY['Referral data', 'Case and occupancy records', 'Rota data', 'Funder KPIs', 'Incident admin'],
  ARRAY['Safeguarding', 'Vulnerability', 'GDPR', 'Commissioner accountability'],
  'Housing and community services carry heavy documentation alongside frontline delivery. VAxAI starts with how referrals, rotas and reporting actually work - free Admin Review first. We clear admin backlogs, organise information safely, provide human capacity, and maintain systems. Frontline judgement stays with staff.',
  ARRAY[
    'How do referrals arrive and who triages the admin?',
    'What reporting do commissioners require and how is it assembled?',
    'Where do rotas and cover create the most admin load?',
    'What would need to be true before any AI-assisted drafting of non-sensitive admin is safe?'
  ],
  ARRAY['Clients are too vulnerable for external support', 'We are stretched on the front line', 'Data is too sensitive'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  'approved', 'VAxAI', '2026-07-16'
);

-- ----------------------------------------------------------------
-- 2. PERSONAS - decision-makers who feel the four services most
-- ----------------------------------------------------------------
INSERT INTO engagement_personas (
  persona_name, typical_role, goals, pressures, decision_responsibilities,
  likely_concerns, information_needed, useful_questions, language_to_avoid,
  preferred_detail, possible_channels, evidence_status, status
) VALUES
(
  'Founder carrying the admin load',
  'Founder or co-founder still running inbox, diary, files and billing alongside delivery',
  ARRAY['Protect time for growth and clients', 'Reduce key-person dependency', 'Get control of backlog without a full-time hire', 'Use tools safely only after foundations exist'],
  ARRAY['Everything routes through them', 'Admin competes with sales and delivery', 'Tools adopted without organised information', 'No one owns day-to-day admin consistently'],
  ARRAY['Whether to bring in external support', 'How to prioritise clear-up vs ongoing capacity', 'Spend on tools vs people'],
  ARRAY['Cost', 'Trusting someone with the business', 'Losing control', 'Buying the wrong tool again'],
  ARRAY['Where the backlog is worst', 'What only they can do', 'Whether they need project support, monthly support or both', 'What a free Admin Review would cover'],
  ARRAY[
    'If three admin tasks disappeared tomorrow, which would they be?',
    'What falls through the gaps when clients are busy?',
    'Are you trying AI tools before information is organised?',
    'Would a free Admin Review help you decide before spending more?'
  ],
  ARRAY['Digital transformation', 'AI will fix this', 'Automate everything', 'You just need a better stack'],
  'Practical and concrete; short; focused on time freed and risk reduced',
  ARRAY['LinkedIn', 'Email', 'Referral', 'Warm intro'],
  'hypothesis',
  'approved'
),
(
  'SME operations or office manager',
  'Operations, office or practice manager in a growing SME holding systems, people admin and delivery support together',
  ARRAY['Keep the business running smoothly', 'Reduce firefighting', 'Make tools and information reliable', 'Protect specialists from admin drag'],
  ARRAY['Thin team', 'Multiple systems', 'Enquiries and onboarding bottlenecks', 'Reporting that takes too long', 'Pressure to adopt AI without readiness'],
  ARRAY['Recommend external support', 'Own process standards', 'Coordinate freelancers or VAs', 'Escalate cost decisions'],
  ARRAY['Will this create more work?', 'Will the team adopt it?', 'Is information safe?', 'Can we maintain improvements?'],
  ARRAY['Map of current admin load', 'What is backlog vs day-to-day', 'Existing tools and owners', 'Success measures for 30-90 days'],
  ARRAY[
    'Where does work pile up between winning work and getting paid?',
    'Which tools are underused because nobody owns the admin?',
    'What would need to be true before AI assistants help safely?',
    'Would ongoing monthly support help more than a one-off clear-up?'
  ],
  ARRAY['Transformation programme', 'Rip and replace', 'AI-first', 'Hands-off automation'],
  'Structured; process-aware; respects existing tools',
  ARRAY['Email', 'LinkedIn', 'Peer networks'],
  'hypothesis',
  'approved'
),
(
  'Charity CEO or head of operations',
  'CEO, COO or head of operations in a charity or non-profit with limited central admin',
  ARRAY['Protect mission delivery', 'Meet funder and board expectations', 'Reduce staff burnout from admin', 'Keep people accountable for sensitive work'],
  ARRAY['Reporting deadlines', 'Scattered evidence', 'Volunteer and programme admin', 'Thin central team', 'Board scrutiny'],
  ARRAY['Approve external support', 'Set risk appetite for tools and AI', 'Prioritise free Admin Review vs paid work'],
  ARRAY['Cost and funder optics', 'Safeguarding and data sensitivity', 'Change fatigue', 'Whether AI is appropriate'],
  ARRAY['Where pressure is building', 'What free Admin Review would cover', 'What must stay with staff', 'Mix of backlog, ongoing and maintenance support'],
  ARRAY[
    'Where is admin pressure building - backlog, information, day-to-day load, or all three?',
    'How much time goes on funder or board reporting and where does the data live?',
    'What would a free Admin Review of your admin operations be most useful for?',
    'Which work must always stay with staff versus what a matched VA could own?'
  ],
  ARRAY['Digital transformation', 'AI will replace admin staff', 'We sell AI', 'Automation first'],
  'Calm, mission-aware, risk-aware; plain English',
  ARRAY['Email', 'Sector networks', 'LinkedIn', 'Referral'],
  'hypothesis',
  'approved'
),
(
  'Charity finance and operations manager',
  'Finance and operations manager owning reporting, records and day-to-day systems hygiene',
  ARRAY['Reliable reporting', 'Cleaner records', 'Less rekeying', 'Support that understands funder cycles'],
  ARRAY['Month-end and funder packs', 'Data in multiple places', 'Limited capacity for process work', 'Requests for AI tools without readiness'],
  ARRAY['Recommend suppliers', 'Define information requirements', 'Own process documentation'],
  ARRAY['Accuracy', 'Audit trail', 'Whether external people understand charity finance'],
  ARRAY['Reporting calendar', 'Where source data lives', 'What is backlog vs recurring', 'Controls required'],
  ARRAY[
    'How long does monthly or funder reporting take, and where does data live?',
    'Are systems connected or is data rekeyed?',
    'What would better records look like for you and the board?',
    'Where does human checking always need to stay in the loop?'
  ],
  ARRAY['Fully automated reporting', 'Set and forget AI', 'Generic outsourcing'],
  'Detail-friendly; process and control oriented',
  ARRAY['Email', 'LinkedIn'],
  'hypothesis',
  'approved'
),
(
  'Public service or business support lead',
  'Service manager or business support lead in public or public-facing services',
  ARRAY['Clear backlogs', 'Resilient processes', 'Safe use of tools', 'Capacity for routine operational admin'],
  ARRAY['Correspondence and case admin load', 'Legacy systems', 'Governance requirements', 'Change fatigue', 'Pressure to adopt AI quickly'],
  ARRAY['Sponsor process improvement', 'Coordinate with digital or IG teams', 'Recommend external capacity'],
  ARRAY['Information governance', 'Equality and accessibility', 'Whether support fits public constraints'],
  ARRAY['Where backlog is visible', 'What must be true before AI pilots', 'Who owns day-to-day admin', 'How improvements will be maintained'],
  ARRAY[
    'Where is the administrative backlog most visible?',
    'What must be true of records before any AI or automation pilot?',
    'Who owns day-to-day operational admin today?',
    'How will improvements be maintained after the first clear-up?'
  ],
  ARRAY['Move fast and break things', 'Shadow IT AI', 'Ignore governance'],
  'Formal enough for public context; practical; no hype',
  ARRAY['Email', 'Professional networks'],
  'hypothesis',
  'approved'
),
(
  'Practice or clinic operations lead',
  'Practice manager or operations lead in professional, health or wellbeing settings',
  ARRAY['Smooth diary and intake', 'Records under control', 'Protect practitioners from admin', 'Clear boundaries for any automation'],
  ARRAY['Booking complexity', 'Correspondence backlog', 'Compliance evidence', 'Thin reception or admin cover'],
  ARRAY['Own admin standards', 'Recommend external VA support', 'Define what must stay human'],
  ARRAY['Client or patient trust', 'Confidentiality', 'Regulatory expectations'],
  ARRAY['Where time goes outside sessions', 'Ownership of follow-up', 'What a safe Admin Review would examine'],
  ARRAY[
    'What takes the most time outside client sessions?',
    'How are appointments, records and follow-ups owned?',
    'Where is a person essential for trust or safety?',
    'Would clearing a backlog free the team before any tool change?'
  ],
  ARRAY['Automate clinical judgement', 'Replace reception entirely', 'Generic chatbots first'],
  'Respectful of professional boundaries; concrete',
  ARRAY['Email', 'LinkedIn', 'Peer groups'],
  'hypothesis',
  'approved'
),
(
  'Membership or associations manager',
  'Membership, events or engagement manager in an association or network',
  ARRAY['Smoother renewals', 'Better member data', 'Less admin during peaks', 'Time for engagement not paperwork'],
  ARRAY['Renewal cycles', 'Events admin', 'Enquiry volume', 'Committee papers', 'Thin team'],
  ARRAY['Own member admin processes', 'Recommend support for peaks', 'Protect personal member contact where it matters'],
  ARRAY['Member experience', 'Data quality', 'Budget timing'],
  ARRAY['Where renewals fail', 'Event admin load', 'Accuracy of member data', 'What should stay personal'],
  ARRAY[
    'How are renewals and member communications currently handled?',
    'Where do backlogs build - renewals, events admin or records?',
    'What would reliable ongoing admin capacity change for engagement work?',
    'Which processes must stay personal for members?'
  ],
  ARRAY['Fully automate member relationships', 'Blast campaigns only', 'Ignore data quality'],
  'Member-aware; cyclical planning language',
  ARRAY['Email', 'LinkedIn', 'Sector networks'],
  'hypothesis',
  'approved'
),
(
  'Owner-operator in trades or field services',
  'Owner or office manager in trades, property or field services',
  ARRAY['Faster quotes to cash', 'Less admin off site', 'Simple reliable processes', 'Fewer lost follow-ups'],
  ARRAY['Always on site', 'Paperwork lag', 'Invoice chasing', 'Diary coordination'],
  ARRAY['Whether to buy support', 'What to standardise', 'What tools are worth it'],
  ARRAY['Cost', 'Complexity', 'Someone who understands their world'],
  ARRAY['Time from job complete to invoice', 'How quotes are followed up', 'What admin pulls people off site'],
  ARRAY[
    'How long from job complete to invoice sent?',
    'How do quotes and follow-ups currently work?',
    'What admin keeps people off site or away from clients?',
    'Would a free Admin Review help set a simple next step?'
  ],
  ARRAY['Enterprise transformation', 'AI platform pitch', 'Heavy jargon'],
  'Plain, practical, short',
  ARRAY['Phone', 'Email', 'Referral', 'Local networks'],
  'hypothesis',
  'approved'
),
(
  'Trustee or non-executive sponsor',
  'Trustee or NED sponsoring operational improvement without day-to-day ops ownership',
  ARRAY['Reduce organisational risk', 'Better information for governance', 'Proportionate spend', 'Confidence that people stay accountable'],
  ARRAY['Late or incomplete board information', 'Capacity risk in the executive team', 'Uncertainty about AI hype vs real need'],
  ARRAY['Approve external support', 'Challenge risk', 'Ask for clear next steps'],
  ARRAY['Value for money', 'Reputation', 'Whether this is the right problem to solve'],
  ARRAY['Where administrative risk sits', 'What free Admin Review would show', 'What success looks like in 90 days'],
  ARRAY[
    'What information does the board need that arrives late or incomplete?',
    'Where does administrative risk sit - records, reporting or capacity?',
    'Would a free Admin Review give a clearer picture before approving spend?',
    'What assurances does the board need about people staying in the loop?'
  ],
  ARRAY['Guaranteed ROI claims', 'AI will run the organisation', 'Vague transformation'],
  'Governance-aware; concise; risk and value language',
  ARRAY['Email', 'Board networks'],
  'hypothesis',
  'approved'
);

-- ----------------------------------------------------------------
-- 3. PAIN POINTS - organised by the four services
-- ----------------------------------------------------------------
INSERT INTO engagement_pain_points (
  title, slug, category, plain_english_definition, explanation_to_prospect,
  human_va_responsibilities, possible_ai, recommendation_pathways,
  relevant_sectors, status, content_owner, last_reviewed
) VALUES
-- Backlog recovery
(
  'Built-up admin backlog across inbox, files and records',
  'admin-backlog-across-channels',
  'operations',
  'Outstanding messages, documents, filing and records that block day-to-day work and make every task slower.',
  'We start with a free Admin Review of where the backlog sits and what is blocking the team. Backlog recovery clears the pile in a controlled way; then we recommend ongoing support and maintenance so it does not rebuild. We do not sell AI as a shortcut around the clear-up.',
  ARRAY['Clear agreed backlog areas', 'Organise files and records to a simple standard', 'Log exceptions for the client', 'Hand over a cleaner baseline'],
  ARRAY['AI may help classify or draft only after information is organised', 'AI must not decide priorities for sensitive work without a person'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Charities and non-profits','Public sector and public services'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Reporting and evidence pack backlog',
  'reporting-evidence-backlog',
  'reporting',
  'Board, funder, commissioner or management packs that take days because source data is scattered or incomplete.',
  'Reporting pain is usually an information and capacity problem. Free Admin Review first; backlog recovery for overdue packs; AI readiness groundwork so sources are trustworthy; ongoing support for recurring cycles; maintenance between deadlines. Humans remain accountable for what is filed or sent.',
  ARRAY['Assemble packs from agreed sources', 'Chase missing inputs', 'Check completeness before human review', 'Keep a simple reporting calendar'],
  ARRAY['AI may draft non-sensitive narrative for human review only', 'Never auto-submit funder or board papers'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Charities and non-profits','Public sector and public services','Education, training and skills providers','Housing, community and social impact services','Accountancy and finance practices'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'CRM and pipeline not kept current',
  'crm-pipeline-stale',
  'sales_admin',
  'Leads, stages and follow-ups are out of date, so opportunities and relationships slip.',
  'We check whether the issue is missing CRM, unused CRM, or no one owning follow-up. Backlog recovery for cold pipeline items; ongoing operational administration for logging and chases; readiness work if information quality is the blocker. Free Admin Review first.',
  ARRAY['Update records to an agreed standard', 'Run follow-up lists', 'Flag stuck opportunities', 'Keep fields clean enough to use'],
  ARRAY['AI may suggest next actions from notes for human review', 'AI must not send commercial follow-ups unsupervised'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Membership, associations and networks','Trades, construction and field services'],
  'approved', 'VAxAI', '2026-07-16'
),
-- AI readiness
(
  'Information and shared drives not organised for tools or people',
  'information-not-organised',
  'information',
  'Files, versions and knowledge are scattered, so both people and any AI tools work from weak foundations.',
  'AI readiness starts with organised information, not a new product. Free Admin Review maps the mess; backlog recovery and structure create a usable baseline; process documentation supports later automation; maintenance keeps structure. VAxAI does not sell AI tools.',
  ARRAY['Structure folders and naming', 'Remove obvious duplicates with client rules', 'Document where key information lives', 'Support migration of working sets'],
  ARRAY['AI search only helps after duplicates and access are under control', 'Do not feed confidential stores into consumer AI tools'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Monitoring and maintenance'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Charities and non-profits','Public sector and public services','Education, training and skills providers'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Processes undocumented before automation or AI is considered',
  'processes-undocumented',
  'process',
  'Work lives in people''s heads, so tools and AI amplify inconsistency instead of reducing load.',
  'We document how work actually runs before any automation conversation. Free Admin Review; AI readiness groundwork including process documentation; ongoing support to operate the process; maintenance reviews when it drifts. Prefer improving existing tools over new builds.',
  ARRAY['Capture current-state steps with the team', 'Agree simple standards', 'Support adoption of the written process', 'Flag exceptions'],
  ARRAY['AI can help draft process notes for human edit', 'Automation only after the process is agreed'],
  ARRAY['Free Admin Review', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Growing SMEs and professional practices','Public sector and public services','Charities and non-profits','Health, care and wellbeing services'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'AI tools tried before operations are ready',
  'ai-before-readiness',
  'ai',
  'Teams experiment with Copilot or assistants while records, access and processes are still messy, creating risk and disappointment.',
  'We reframe the work as readiness: organise information, clean data, document process, agree human review. Free Admin Review; AI readiness groundwork; only then light use of tools the client already has. VAxAI does not sell AI products.',
  ARRAY['Prepare information and access', 'Support pilot admin with human review', 'Log what worked and what failed', 'Keep sensitive work out of unsuitable tools'],
  ARRAY['AI drafting only with review', 'No autonomous sending or deciding'],
  ARRAY['Free Admin Review', 'AI readiness groundwork', 'Monitoring and maintenance'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Public sector and public services','Charities and non-profits','Accountancy and finance practices'],
  'approved', 'VAxAI', '2026-07-16'
),
-- Ongoing operational administration
(
  'Day-to-day admin consumes senior or delivery time',
  'day-to-day-admin-drain',
  'capacity',
  'Inbox, diary, coordination and routine paperwork pull founders, managers or specialists away from high-value work.',
  'Ongoing operational administration is often the highest-value service after a clear-up. Free Admin Review to define scope; backlog recovery if needed; then matched human support for inbox, diary, documents and coordination; maintenance so standards hold. Quotes after we understand the work.',
  ARRAY['Own agreed inbox and diary tasks', 'Coordinate meetings and follow-ups', 'Prepare packs for human approval', 'Keep light records of what was done'],
  ARRAY['AI may draft routine replies for human send', 'Sensitive or commercial messages stay human'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Charities and non-profits','Health, care and wellbeing services','Trades, construction and field services'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Follow-ups and commitments not reliably owned',
  'follow-ups-not-owned',
  'coordination',
  'Actions from meetings, enquiries and clients slip because there is no reliable owner or log.',
  'We look at where commitments are captured and who owns them. Backlog recovery can clear overdue follow-ups; ongoing operational administration keeps a reliable log; maintenance stops the system slipping. Human judgement stays on sensitive or commercial follow-ups.',
  ARRAY['Maintain action log', 'Send agreed reminders', 'Escalate stuck items', 'Update status after meetings'],
  ARRAY['AI may summarise meeting notes for human edit', 'AI must not own accountability'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Membership, associations and networks','Trades, construction and field services'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Invoice-to-cash admin lag',
  'invoice-to-cash-lag',
  'finance_admin',
  'Delays between work complete, invoice raised and payment chased - usually capacity and process, not missing software alone.',
  'We map invoice-to-cash steps and ownership. Backlog recovery for aged debt admin; ongoing support for routine invoicing and reminders; humans for sensitive conversations. Free Admin Review; no promise that automation alone collects cash.',
  ARRAY['Prepare invoices from agreed triggers', 'Send approved chases', 'Keep status lists current', 'Flag disputes'],
  ARRAY['AI may draft chase text for human approval', 'Never auto-threaten or escalate legally'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'Ongoing operational administration'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Trades, construction and field services','Accountancy and finance practices'],
  'approved', 'VAxAI', '2026-07-16'
),
-- Monitoring and maintenance
(
  'Improvements slip after a clear-up',
  'improvements-slip',
  'maintenance',
  'After a project or burst of effort, filing, CRM and process standards drift and the backlog returns.',
  'Maintain and improve is a core service, not an afterthought. Free Admin Review can set a maintenance rhythm; ongoing operational administration holds the line day to day; monitoring reviews data hygiene, process checks and, where relevant, AI output quality. Quote for proportionate monthly support.',
  ARRAY['Run agreed hygiene checks', 'Report drift early', 'Support small fixes', 'Keep standards visible to the team'],
  ARRAY['AI monitoring only where outputs are reviewed by people', 'Do not leave tools unsupervised on sensitive work'],
  ARRAY['Free Admin Review', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Growing SMEs and professional practices','Charities and non-profits','Public sector and public services','Membership, associations and networks'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'Key-person dependency for how work runs',
  'key-person-dependency',
  'resilience',
  'Only one person knows how admin and systems work, creating risk when they are busy or away.',
  'We free capacity with backlog recovery and ongoing VA support, document how work runs (readiness groundwork), and maintain systems so the organisation is less fragile. Free Admin Review; quote for proportionate monthly or project support.',
  ARRAY['Document routines with the key person', 'Shadow and then own agreed tasks', 'Keep a simple operations handbook', 'Cover absence with agreed standards'],
  ARRAY['AI cannot replace institutional knowledge without documentation first'],
  ARRAY['Free Admin Review', 'Backlog recovery', 'AI readiness groundwork', 'Ongoing operational administration', 'Monitoring and maintenance'],
  ARRAY['Founders and early-stage ventures','Growing SMEs and professional practices','Charities and non-profits','Trades, construction and field services'],
  'approved', 'VAxAI', '2026-07-16'
),
(
  'No one monitoring quality after tools or AI are introduced',
  'no-ai-or-process-monitoring',
  'ai',
  'Once a tool or light automation is live, nobody checks outputs, access or process drift.',
  'Monitoring and maintenance covers process checks, data hygiene and AI output review where tools are used. Free Admin Review to set what must be checked; ongoing support to operate checks; clear human accountability. VAxAI does not sell monitoring software.',
  ARRAY['Sample outputs for human review', 'Log errors and exceptions', 'Keep access lists current', 'Report issues early'],
  ARRAY['AI cannot be the sole quality control', 'Human sign-off remains required for client-facing work'],
  ARRAY['Free Admin Review', 'AI readiness groundwork', 'Monitoring and maintenance', 'Ongoing operational administration'],
  ARRAY['Growing SMEs and professional practices','Public sector and public services','Charities and non-profits','Accountancy and finance practices'],
  'approved', 'VAxAI', '2026-07-16'
);

-- ----------------------------------------------------------------
-- 4. VAT PROMPTS - Value, Alignment, Trust for service-led conversations
-- ----------------------------------------------------------------
INSERT INTO engagement_vat_prompts (category, dimension, prompt, context_tags, status, sort_order)
VALUES
-- Value
('general', 'value',
 'What is the admin problem costing in time, stress, missed income, delivery quality or risk right now?',
 ARRAY['all','value'], 'approved', 10),
('general', 'value',
 'Is the need mainly backlog recovery, ongoing operational administration, monitoring and maintenance, AI readiness groundwork, or a combination?',
 ARRAY['all','service-fit'], 'approved', 11),
('general', 'value',
 'Is a free Admin Review the right first step before any quote or tool spend?',
 ARRAY['all','admin-review'], 'approved', 12),
('general', 'value',
 'Would solving this free capacity for work only your team can do, or merely move the pile?',
 ARRAY['all','value'], 'approved', 13),
('backlog', 'value',
 'What volume of outstanding admin is blocking day-to-day work, and what does a cleared backlog unlock?',
 ARRAY['backlog','value'], 'approved', 14),
('ongoing_support', 'value',
 'Would flexible monthly human support reduce pressure more reliably than a one-off project alone?',
 ARRAY['ongoing','value'], 'approved', 15),
('ai', 'value',
 'Would AI readiness groundwork (organised information, clean data, documented processes) create more value than buying another tool right now?',
 ARRAY['ai','readiness','value'], 'approved', 16),
('maintain', 'value',
 'If we only clear the backlog once, how quickly will the same problems return without maintenance?',
 ARRAY['maintain','value'], 'approved', 17),
-- Alignment
('general', 'alignment',
 'Does the proposed support fit how the organisation already works and the tools it already trusts?',
 ARRAY['all','alignment'], 'approved', 20),
('general', 'alignment',
 'Should we improve existing systems before considering anything new? (VAxAI does not sell AI products.)',
 ARRAY['all','alignment','tools'], 'approved', 21),
('general', 'alignment',
 'Can improvements be maintained after the first clear-up, or is ongoing operational administration required?',
 ARRAY['all','maintain','alignment'], 'approved', 22),
('ai', 'alignment',
 'Is any AI use aligned with safeguarding, confidentiality and professional standards for this organisation?',
 ARRAY['ai','alignment','trust'], 'approved', 23),
('sector', 'alignment',
 'For this sector, which admin work is high demand for VAxAI services versus work that must stay with specialists or frontline staff?',
 ARRAY['sector','alignment'], 'approved', 24),
('persona', 'alignment',
 'Who feels this pain day to day, and who decides spend - are we speaking to both?',
 ARRAY['persona','alignment'], 'approved', 25),
-- Trust
('general', 'trust',
 'Where must a person always stay accountable, even if tools draft or sort work?',
 ARRAY['all','trust','human-in-loop'], 'approved', 30),
('general', 'trust',
 'How sensitive is the information, and what must never go into third-party AI tools without clear controls?',
 ARRAY['all','trust','data'], 'approved', 31),
('general', 'trust',
 'Who must check or approve outputs before they go out, and is human review designed in?',
 ARRAY['all','trust'], 'approved', 32),
('ai', 'trust',
 'Does the organisation understand AI limits here, and does use pass Value, Alignment and Trust - or is process clarity and human VA support the better answer?',
 ARRAY['ai','trust','vat'], 'approved', 33),
('ai', 'trust',
 'Is there a process for reviewing and correcting AI-assisted content, and who is accountable when something is wrong?',
 ARRAY['ai','trust','monitoring'], 'approved', 34),
('maintain', 'trust',
 'Who will own monitoring of process drift, data hygiene and AI outputs after go-live?',
 ARRAY['maintain','trust'], 'approved', 35),
('backlog', 'trust',
 'What could go wrong if the backlog is cleared without agreed standards or human checks?',
 ARRAY['backlog','trust'], 'approved', 36);

-- ----------------------------------------------------------------
-- 5. Hub copy hint (no schema change) - document intent in review dates
-- ----------------------------------------------------------------
-- Sectors, personas, pain points and VAT prompts above are the active set.
-- Scripts, objections and pricing are intentionally unchanged by this migration.
