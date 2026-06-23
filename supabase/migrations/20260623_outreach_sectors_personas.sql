-- Outreach research sectors and personas (23 Jun 2026)

INSERT INTO engagement_sector_profiles (
  name, audience_types, description, common_admin_pressures,
  typical_stakeholders, common_systems, common_data_types,
  relevant_risk_areas, starting_language, questions_to_explore,
  common_objections, potential_pathways, status, content_owner, review_date
) VALUES
(
  'Housing and Homelessness Services',
  ARRAY['Charity or non-profit','Social enterprise or CIC'],
  'Organisations providing supported accommodation, homelessness prevention, housing advice and tenancy support. Often multi-site with high casework, rotas and commissioner reporting.',
  ARRAY['Casework and referral management','Tenancy and occupancy records','Rota and shift scheduling','Safeguarding documentation','Housing benefit and welfare admin','Funder and commissioner reporting'],
  ARRAY['CEO','Head of operations','Service managers','Housing officers','Trustees'],
  ARRAY['Housing management systems','CRM','Rota tools','Email','Spreadsheets'],
  ARRAY['Beneficiary records','Tenancy agreements','Support plans','Incident logs','Funder KPIs'],
  ARRAY['Safeguarding','Homelessness vulnerability','GDPR','Commissioner accountability'],
  'We know housing and homelessness services carry heavy documentation and reporting alongside frontline delivery. VAxAI starts with how referrals, rotas and reporting actually work today — not with introducing new technology for its own sake.',
  ARRAY['How do referrals arrive and who triages them?','What reporting do commissioners require monthly?','How are rotas and on-call cover managed?','Where do support plans and case notes live?'],
  ARRAY['Our clients are too vulnerable for automation','We are already stretched on the front line','Data is too sensitive'],
  ARRAY['Process clarification','VA support','Better use of existing tools','Combined approach'],
  'approved', 'VAxAI', '2026-06-23'
),
(
  'Domestic Abuse and Safeguarding Services',
  ARRAY['Charity or non-profit'],
  'Refuge, outreach and advocacy providers supporting survivors of domestic abuse. Extremely sensitive casework with MARAC, safeguarding and statutory reporting obligations.',
  ARRAY['High-risk casework','Refuge placement admin','MARAC and safeguarding records','Commissioner reporting','24/7 helpline triage'],
  ARRAY['CEO','Head of services','Safeguarding lead','IDVA/ISVA practitioners'],
  ARRAY['Case management systems','Secure email','Spreadsheets','Telephony'],
  ARRAY['Risk assessments','Safeguarding records','Placement data','Anonymous reporting stats'],
  ARRAY['Safeguarding','Trauma-informed practice','Data minimisation','Statutory disclosure'],
  'For domestic abuse services, any administrative support must be trauma-informed and security-first. VAxAI focuses on reducing reporting and coordination burden while keeping practitioners in control of sensitive case decisions.',
  ARRAY['What admin tasks take practitioners away from clients?','How is anonymised reporting compiled for funders?','What would safe triage support look like for your team?'],
  ARRAY['Automation is inappropriate for our work','We cannot risk data breaches','Staff will not adopt new tools'],
  ARRAY['Process clarification','VA support','Governance and training'],
  'approved', 'VAxAI', '2026-06-23'
),
(
  'Domiciliary and Residential Care',
  ARRAY['Small business','Charity or non-profit'],
  'Care home groups and domiciliary care providers managing client care plans, carer scheduling, CQC compliance and family communications.',
  ARRAY['Rota and carer scheduling','Care plan documentation','Recruitment admin','CQC evidence','Family update communications'],
  ARRAY['Registered manager','Operations director','Care coordinators','Recruitment lead'],
  ARRAY['Care planning software','Rota systems','HR systems','Email'],
  ARRAY['Care plans','Staff records','CQC compliance data','Client contact details'],
  ARRAY['CQC regulation','Health data','Safeguarding','Staffing compliance'],
  'Care providers often run complex scheduling and compliance admin on a thin back-office team. VAxAI looks at rota coordination, family communications and documentation — always within care governance boundaries.',
  ARRAY['How much time does the office spend on scheduling changes?','How are care plan updates communicated?','What compliance reporting is manual today?'],
  ARRAY['We already have a care system','CQC would not allow it','Managers are too busy'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-23'
),
(
  'Grant-making and Community Foundations',
  ARRAY['Charity or non-profit'],
  'Community foundations and grant-makers assessing applications, managing donor funds, due diligence and impact reporting.',
  ARRAY['Application assessment workflows','Due diligence records','Award letters and agreements','Donor reporting','Impact evidence collection'],
  ARRAY['CEO','Head of grants','Programme officers','Trustees','Finance manager'],
  ARRAY['Grant management platforms','CRM','Finance systems','Document stores'],
  ARRAY['Applicant data','Grant agreements','Donor records','Impact metrics'],
  ARRAY['GDPR','Financial governance','Conflicts of interest','Public accountability'],
  'Grant-makers process high volumes of applications and reporting relative to team size. VAxAI helps clarify assessment workflows and reduce manual evidence gathering — without replacing grant decisions.',
  ARRAY['How many applications do you assess per funding round?','Where does due diligence information sit?','What reporting do donors expect and how is it compiled?'],
  ARRAY['We are a funder not a buyer','Assessment requires human judgement','Our platform already handles this'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-23'
);

INSERT INTO engagement_personas (
  persona_name, typical_role, goals, pressures, decision_responsibilities,
  likely_concerns, information_needed, useful_questions, language_to_avoid,
  preferred_detail, possible_channels, evidence_status, status
) VALUES
(
  'Charity CEO — high caseload services',
  'Chief Executive of a £500k–£5m charity with significant casework and funder reporting',
  ARRAY['Deliver mission impact','Retain staff','Meet funder requirements','Protect reputation'],
  ARRAY['Reporting deadlines','Inbox overload','Thin central admin team','Board scrutiny','Multiple contracts'],
  ARRAY['Strategic direction','Major expenditure','Funder relationships','Service redesign'],
  ARRAY['Cost','AI hype','Data breaches','Displacing staff','Failed IT projects'],
  ARRAY['Evidence of time saved','Clear first steps','What staff involvement is needed','Risk controls'],
  ARRAY['What admin work is pulling your senior team away from delivery?','Which reports take longest to compile each month?','Where do the same details get entered more than once?'],
  ARRAY['Digital transformation','Disruption','Scale'],
  'concise', ARRAY['Email','Phone'], 'hypothesis', 'approved'
),
(
  'Operations Manager — multi-site charity',
  'Director of Operations or Head of Services across multiple sites or contracts',
  ARRAY['Hit contract KPIs','Coordinate teams','Accurate reporting','Reduce firefighting'],
  ARRAY['Referral bottlenecks','Rota gaps','Spreadsheet duplication','Volunteer coordination','Last-minute reporting'],
  ARRAY['Service delivery standards','Team scheduling','Contract compliance','System choices'],
  ARRAY['Frontline resistance','Setup burden','Another platform'],
  ARRAY['Workflow diagrams','Pilot scope','Integration with existing CRM'],
  ARRAY['Where does information get stuck between teams?','What would your team stop doing if admin were halved?','Which reports are built manually each month?'],
  ARRAY['Revolution','Fully automated'],
  'practical', ARRAY['Email','Teams'], 'hypothesis', 'approved'
),
(
  'Professional services partner — introducer',
  'Managing Partner at regional accountancy or law firm with charity/SME clients',
  ARRAY['Client retention','Practice efficiency','Advisory reputation','Staff development'],
  ARRAY['Deadline peaks','Client expectations','Training junior staff','Keeping up with AI discourse'],
  ARRAY['Practice investments','Client referrals','Training spend'],
  ARRAY['Regulatory breach','Client confidentiality','Unproven vendors'],
  ARRAY['Compliance framing','Charity-sector examples','Train-the-trainer options'],
  ARRAY['Which clients mention admin pressure most often?','Would a short CPD-style AI workshop interest your team?','What would make you comfortable introducing us?'],
  ARRAY['Replace lawyers','Fully automated advice'],
  'concise', ARRAY['Email','LinkedIn'], 'hypothesis', 'approved'
);