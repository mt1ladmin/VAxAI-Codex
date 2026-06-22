-- ================================================================
-- VAxAI Studio – Client Engagement Seed Data
-- Safe to re-run (uses ON CONFLICT DO NOTHING)
-- ================================================================

-- ----------------------------------------------------------------
-- Pain point categories and playbooks (20+)
-- ----------------------------------------------------------------

INSERT INTO engagement_pain_points (
  category, title, slug, plain_english_definition,
  what_person_says, what_this_means, what_not_assume, common_root_causes,
  natural_questions, quick_improvements, possible_ai, human_va_responsibilities,
  tasks_remain_human, measures_improvement, explanation_to_prospect,
  relevant_sectors, recommendation_pathways, status, content_owner, last_reviewed
) VALUES
-- Communications
(
  'Communications and Enquiries',
  'Inbox overload',
  'inbox-overload',
  'The inbox has become unmanageable: important messages are missed, responses are slow, and the inbox doubles as a filing system and task list.',
  ARRAY['I live in my inbox','Important emails keep getting missed','Everyone forwards messages to me','We have several inboxes and no one knows who replied','I cannot keep on top of enquiries'],
  ARRAY['No clear ownership or triage rules','Too many communication channels','Repetitive replies are written manually','Messages are not converted into tasks or CRM records','A shared inbox exists but is not configured well'],
  ARRAY['Do not assume the person wants full automation','Do not assume the inbox is the core problem — it may be a symptom of unclear process','Do not assume AI will solve it without understanding what the emails contain'],
  ARRAY['No agreed inbox owner','No triage rules or folders','Standard responses written from scratch each time','Multiple inboxes with overlapping responsibilities'],
  ARRAY['What kinds of messages take up most of the time?','Who needs to see or act on them?','How do you currently know whether someone has replied?','Which messages need your personal judgement?','Do enquiries need to be recorded anywhere else?','Are there standard responses you write repeatedly?'],
  ARRAY['Create folders and labels','Write standard reply templates','Set up filters and rules','Agree who owns which type of message'],
  ARRAY['AI can draft low-risk standard replies for review','AI can summarise message threads','AI must not send sensitive or complaint-related messages independently'],
  ARRAY['Triage and prioritise incoming messages','Monitor for time-sensitive items','Maintain response standards','Escalate exceptions'],
  ARRAY['Sensitive or complaint-related messages','Messages requiring personal relationships or context','Decisions with legal or financial consequences'],
  ARRAY['Response time improvement','Missed message rate reduction','Time spent on inbox per week'],
  'We would start by understanding what kinds of messages are coming in, who needs to act on them, and whether any can be handled with clearer rules or templates before considering any technology change.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Communications and Enquiries',
  'Slow response times',
  'slow-response-times',
  'Enquiries, messages or requests take longer to respond to than the organisation would like, creating a poor experience and lost opportunities.',
  ARRAY['We take days to reply','People chase us before we respond','Enquiries go cold because we are too slow','We do not have a response time standard'],
  ARRAY['No clear owner for responses','High volume relative to capacity','No triage to identify urgency','Standard responses written from scratch each time'],
  ARRAY['Do not assume faster responses require more software','Speed may be a capacity problem, not a process problem'],
  ARRAY['No response-time standard','No clear ownership','No standard templates for common queries','Insufficient capacity'],
  ARRAY['What response time would you like to aim for?','Who currently handles the responses?','What percentage of messages are similar or standard?','What stops responses going out the same day?'],
  ARRAY['Set a response time standard','Create a response template library','Assign clear ownership','Use auto-acknowledgements to buy time'],
  ARRAY['AI can draft standard replies for review','AI can categorise incoming messages by urgency'],
  ARRAY['Monitor incoming messages','Draft responses to standard queries','Flag urgent or sensitive items','Send approved responses'],
  ARRAY['Complaint handling','Sensitive communications','Decisions requiring judgement'],
  ARRAY['Average response time','Percentage meeting response standard','Volume of follow-up chasers received'],
  'We would look at what is causing the delay — whether it is capacity, unclear ownership or a need for templates — before recommending a technical solution.',
  ARRAY['All'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Communications and Enquiries',
  'Follow-ups not happening',
  'follow-ups-not-happening',
  'Commitments to follow up are not fulfilled because there is no reliable system to capture, track and action them.',
  ARRAY['Things fall through the gaps','We say we will follow up and then forget','Leads go cold because no one chased','I rely on my memory for follow-ups'],
  ARRAY['No central place to record follow-up commitments','No reminders or task system','Follow-ups depend on one person remembering','No defined owner for follow-up tasks'],
  ARRAY['Do not assume CRM software will solve this without addressing ownership','Do not assume the person wants to automate all follow-ups'],
  ARRAY['No task management system or habit','Follow-ups recorded in email or notes only','No agreed owner','No reminder mechanism'],
  ARRAY['Where do follow-up commitments currently get recorded?','Who is responsible for following them up?','What happens when someone does not respond?','How predictable are the follow-up steps?'],
  ARRAY['Start a simple follow-up log','Set calendar reminders','Agree ownership of each follow-up type'],
  ARRAY['AI can draft follow-up messages for review','AI can suggest follow-up timing based on interaction type'],
  ARRAY['Monitor follow-up log','Send approved follow-up messages','Escalate overdue follow-ups','Keep contact record updated'],
  ARRAY['Follow-ups involving negotiation or relationship decisions','Sensitive or complaint follow-ups'],
  ARRAY['Follow-up completion rate','Leads contacted within agreed timeframe','Opportunities lost to missed follow-up'],
  'We would first look at where follow-up commitments are currently captured and who owns them, then work out the simplest reliable system to make sure nothing is missed.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','Integration','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Communications and Enquiries',
  'Missed enquiries',
  'missed-enquiries',
  'Incoming enquiries are not seen or acted on promptly, resulting in lost potential clients, customers or referrals.',
  ARRAY['We keep missing messages','Enquiries come in and nobody sees them','We lost a client because nobody replied','Enquiries come from too many places'],
  ARRAY['Multiple channels with no single point of responsibility','No alert or notification system','High-volume periods overwhelm current capacity','Forms or website submissions not routed to the right person'],
  ARRAY['Do not assume all channels need to feed one tool immediately','Do not assume the volume is higher than it is'],
  ARRAY['No triage process','Multiple channels with no agreed owner','Form submissions not connected to email or task system'],
  ARRAY['How do enquiries currently arrive?','Which channel produces the most enquiries?','Who is responsible for each channel?','What happens to an enquiry after it arrives?'],
  ARRAY['Consolidate enquiry channels where possible','Ensure form submissions trigger a notification','Assign clear ownership per channel'],
  ARRAY['AI can categorise and prioritise enquiries','AI-drafted acknowledgements can be sent automatically for low-risk messages'],
  ARRAY['Monitor all enquiry channels','Log and triage incoming enquiries','Send timely responses or acknowledgements'],
  ARRAY['Complex or sensitive enquiries','Those requiring pricing or contractual decisions'],
  ARRAY['Percentage of enquiries responded to within target time','Number of unactioned enquiries per week'],
  'We would map all the channels enquiries come through and work out how they currently reach the right person, then look at whether there are gaps in coverage or ownership.',
  ARRAY['All'],
  ARRAY['Process clarification','Integration','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Scheduling
(
  'Scheduling and Coordination',
  'Diary management',
  'diary-management',
  'Managing a calendar is taking significant time — bookings, conflicts, preparation and coordination across multiple people or commitments.',
  ARRAY['My diary is out of control','I spend hours a week on scheduling','We keep double-booking','Clients cannot book easily'],
  ARRAY['No self-service booking option','Scheduling done via email threads','No clear buffer or preparation time built in','Multiple calendars not synchronised'],
  ARRAY['Do not assume a booking tool is always the answer','Do not assume the person wants clients to self-book'],
  ARRAY['Calendar not shared or synchronised','No booking link or self-service option','Scheduling by email requires multiple exchanges'],
  ARRAY['How many bookings do you manage per week?','Who coordinates between multiple diaries?','How far in advance are appointments typically made?','What preparation do appointments require?'],
  ARRAY['Use a shared calendar','Create a booking link for straightforward appointments','Set standard appointment durations and buffers'],
  ARRAY['AI can suggest meeting times based on availability','AI can draft scheduling communications'],
  ARRAY['Manage complex or multi-party scheduling','Handle last-minute changes and conflicts','Coordinate preparation requirements'],
  ARRAY['Appointments requiring senior negotiation over timing','High-sensitivity scheduling decisions'],
  ARRAY['Time spent on scheduling per week','Proportion of appointments booked via self-service','Double-booking incidents per month'],
  'We would look at how appointments are currently arranged and whether a booking link, shared calendar or a VA to manage the diary would best reduce the scheduling load.',
  ARRAY['Professional services','Coaching and consultancy','Health and wellbeing','Recruitment and people services'],
  ARRAY['Better use of existing tools','New tool implementation','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Data
(
  'Data, Records and Files',
  'Duplicate data entry',
  'duplicate-data-entry',
  'The same information is entered into more than one system or spreadsheet, wasting time and creating inconsistencies.',
  ARRAY['We enter the same details into three different places','Our data is always out of date','We keep retyping information from emails into spreadsheets','The systems do not talk to each other'],
  ARRAY['No integration between systems','Multiple systems with overlapping purposes','Process designed around limitations of old tools','No single source of truth agreed'],
  ARRAY['Do not assume integration is always the right fix','Manual entry may be intentional for audit or control reasons'],
  ARRAY['Systems not integrated','No agreed single source of truth','Process built around disconnected tools','Staff maintaining parallel records for convenience'],
  ARRAY['Which systems receive the same data?','How many times per week is this information re-entered?','Who enters it in each system?','What would need to happen for the data to be in one place?'],
  ARRAY['Map where the same data goes','Agree a single source of truth for each data type','Stop maintaining parallel records where not required'],
  ARRAY['AI can help identify duplicate records','AI can assist with data standardisation'],
  ARRAY['Monitor data quality','Review exceptions and errors','Handle records that do not match automation rules'],
  ARRAY['Records requiring human interpretation or context','High-risk financial or personal data'],
  ARRAY['Hours spent on duplicate entry per week','Data inconsistency incidents','Number of systems requiring the same data'],
  'We would first map where the same information currently goes and why, then identify whether an integration or a change to the process would remove the duplication.',
  ARRAY['All'],
  ARRAY['Process clarification','Integration','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Data, Records and Files',
  'Spreadsheet dependency',
  'spreadsheet-dependency',
  'Core operations depend heavily on spreadsheets that are difficult to maintain, prone to error and not accessible to the whole team.',
  ARRAY['Everything is in a spreadsheet','Our spreadsheets are a mess','We have multiple versions of the same file','Nobody knows which spreadsheet is correct'],
  ARRAY['Spreadsheets used as a substitute for a database or system','Multiple people editing the same file causing version conflicts','No shared access or real-time updating','Complex formulas maintained by one person only'],
  ARRAY['Do not assume spreadsheets should always be replaced','Sometimes a better-structured spreadsheet is the right answer'],
  ARRAY['No suitable system implemented','Spreadsheets grew organically without governance','Resistance to change from users who built the spreadsheets'],
  ARRAY['What does this spreadsheet do that could not be done in another existing system?','Who maintains it?','What happens when that person is unavailable?','How many people use it?'],
  ARRAY['Consolidate overlapping spreadsheets','Document formulas and structure','Set access controls and version management','Identify which data belongs in an existing system'],
  ARRAY['AI can help analyse and clean spreadsheet data','AI can help spot inconsistencies'],
  ARRAY['Maintain and audit key spreadsheets during transition','Flag errors and inconsistencies','Keep stakeholders informed of data quality'],
  ARRAY['Interpretation of complex legacy data structures','Decisions about what to migrate and what to discard'],
  ARRAY['Number of critical spreadsheets in use','Data errors found per period','Time spent on spreadsheet maintenance'],
  'We would look at what the spreadsheets are doing and whether the same result could be achieved more reliably using an existing system you already have.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','New tool implementation'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Reporting
(
  'Reporting and Governance',
  'Funder reporting',
  'funder-reporting',
  'Producing reports for funders and grant-makers is time-consuming, repetitive and stressful, often involving pulling data from multiple sources.',
  ARRAY['Reporting takes days','We have to compile data from everywhere','Every funder wants different information','We always leave reports to the last minute'],
  ARRAY['Data collected in different places without a consistent structure','Report formats vary by funder','No template or standard sections agreed','No clear owner for data collection'],
  ARRAY['Do not assume AI can draft the report without reliable data','Do not assume the funder will accept a new format'],
  ARRAY['Data not collected consistently','No agreed reporting template','Last-minute data gathering from multiple teams','No single person responsible for the report'],
  ARRAY['Where does the information for the report currently come from?','Are the same data fields collected consistently?','Who checks accuracy before the report is sent?','How long does each stage of the process take?'],
  ARRAY['Create a reporting template for each funder','Standardise how data is collected during the project','Assign a clear owner and deadline'],
  ARRAY['AI can draft narrative sections for review','AI can help format and summarise data','AI output must be reviewed for accuracy before submission'],
  ARRAY['Data verification before submission','Chasing teams for information','Final review and sign-off coordination','Maintaining funder relationship'],
  ARRAY['Accuracy verification of outputs','Funder relationship management','Final approval decisions'],
  ARRAY['Time spent on each report','Number of data-gathering cycles required per report','Report accuracy rate'],
  'We would look at where the data currently comes from and whether standardising how it is collected would reduce the reporting burden before considering any other change.',
  ARRAY['Charity and community services','Social care and support services','Education and training','Research and policy'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Reporting and Governance',
  'Monthly management reporting',
  'monthly-management-reporting',
  'Producing management information for boards, trustees or senior teams takes significant effort and may not produce the clarity decision-makers need.',
  ARRAY['Monthly reports take forever','The board does not find the reports useful','We pull the same numbers from multiple places every month','Reporting is done differently each time'],
  ARRAY['No standard template','Data pulled manually from multiple sources each time','Report produced by person with least time','No clarity on what decisions the report should inform'],
  ARRAY['Do not assume a dashboard is the right solution','Do not assume the report is wrong without understanding what decisions it informs'],
  ARRAY['No agreed report format or frequency','Data sources not connected','Report purpose and audience not clearly defined','Process owned by one person without documentation'],
  ARRAY['What decisions should this report help people make?','Who currently compiles it and how long does it take?','Which parts of the data are most often queried or challenged?','Is the data in one place or spread across systems?'],
  ARRAY['Agree what the report needs to show and why','Create a standard template','Document data sources and refresh process','Assign ownership and deadline'],
  ARRAY['AI can help draft commentary for review','AI can format data into standard sections'],
  ARRAY['Data compilation from agreed sources','Template maintenance','Distribution and follow-up on actions'],
  ARRAY['Interpretation of results for board','Decisions arising from the report'],
  ARRAY['Time to compile report','Board satisfaction with information quality','Percentage of actions completed following board'],
  'We would start by agreeing what the report needs to achieve and what decisions it supports, then look at whether standardising the data sources would reduce the monthly effort.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Finance
(
  'Finance and Commercial Administration',
  'Late payment chasing',
  'late-payment-chasing',
  'Outstanding invoices are not followed up systematically, resulting in cash flow pressure and unpaid debts.',
  ARRAY['We forget to chase invoices','People take months to pay','Chasing feels uncomfortable','We do not know what is outstanding'],
  ARRAY['No systematic chase process','Chasing left to the person who issued the invoice','No escalation path','Discomfort with credit control seen as a personal relationship issue'],
  ARRAY['Do not assume automation will improve client relationships on its own','Do not assume all late payment is intentional'],
  ARRAY['No invoice tracking system','No agreed chase schedule','No escalation process','Lack of confidence in credit control conversations'],
  ARRAY['How do you currently know an invoice is overdue?','What happens at each stage — reminder, second chase, escalation?','Are the same clients always late or is it spread?','What would an acceptable payment timeframe look like?'],
  ARRAY['Record all outstanding invoices in one place','Set a chase schedule (e.g. at 7, 14, 30 days)','Create standard chase email templates','Separate invoice sending from credit control responsibility'],
  ARRAY['AI can draft chase emails for review','AI can help categorise payment history'],
  ARRAY['Send approved chase communications on schedule','Monitor payment status','Escalate to lead when needed','Keep records updated'],
  ARRAY['Escalation decisions','Decisions about waiving or negotiating payment terms','Sensitive conversations about financial difficulty'],
  ARRAY['Average payment days','Percentage of invoices paid within terms','Outstanding debtors value per period'],
  'We would look at your current invoicing process and work out whether a clearer chase schedule and standard templates would be the quickest improvement before considering any system change.',
  ARRAY['Professional services','Freelancer','Consultant','Founder or entrepreneur','Trades construction and property services'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Finance and Commercial Administration',
  'Invoicing delays',
  'invoicing-delays',
  'Invoices are sent later than they should be, reducing cash flow and creating an unprofessional impression.',
  ARRAY['We are slow to send invoices','We forget to invoice until the client asks','Our invoicing is inconsistent','Invoices go out at different times each month'],
  ARRAY['No trigger or reminder to create and send invoices','Invoicing done when capacity allows','Work completed but not recorded in a way that prompts billing','Multiple people responsible without clear ownership'],
  ARRAY['Do not assume the person wants automated invoicing without understanding their clients and contracts'],
  ARRAY['No systematic prompt to invoice at project milestones','Invoicing left to end-of-month rather than triggered by delivery','No clear owner for invoicing across multiple team members'],
  ARRAY['What triggers an invoice being raised?','Who is responsible for invoicing?','Are invoices always for the same amount or variable?','How long between completing work and sending the invoice?'],
  ARRAY['Create a trigger: delivery → invoice within 24 hours','Use templates to reduce drafting time','Assign one person responsibility for invoicing'],
  ARRAY['AI can draft invoices from project notes for review','Automation can create a draft invoice when a project status changes'],
  ARRAY['Send approved invoices on schedule','Track which projects need invoicing','Keep records updated'],
  ARRAY['Variable or complex invoice calculations','Negotiation over invoice amounts'],
  ARRAY['Average days from delivery to invoice','Proportion of invoices sent within agreed timeframe'],
  'We would look at what currently triggers an invoice being raised and whether a clearer process and standard template would reduce the delay.',
  ARRAY['Professional services','Freelancer','Consultant','Trades construction and property services'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Client journey
(
  'Client, Customer, Donor or Beneficiary Journeys',
  'Lead tracking',
  'lead-tracking',
  'Potential clients or customers are not being tracked consistently, so opportunities are lost and there is no clear picture of the pipeline.',
  ARRAY['We do not know what is in our pipeline','Leads fall through the gaps','I keep prospects in my head','We have no consistent follow-up process for new enquiries'],
  ARRAY['No CRM or contact management system','Leads tracked in a spreadsheet, email or notepad','No agreed stages or next-action discipline','No owner for each lead'],
  ARRAY['Do not assume a CRM is always the answer','A simple system done consistently may be more useful than a complex system done poorly'],
  ARRAY['No shared lead-tracking system','Reliance on individual memory or email','No agreed process for moving leads through stages','No regular pipeline review'],
  ARRAY['Where do you currently record new leads or enquiries?','Who is responsible for following them up?','How do you know what stage each lead is at?','How many leads are you typically managing at once?'],
  ARRAY['Create a simple lead log with name, source, stage and next action','Hold a weekly 15-minute pipeline review','Assign one owner to each lead'],
  ARRAY['AI can help categorise and summarise lead information','AI can suggest follow-up timing'],
  ARRAY['Maintain lead records','Send approved follow-up communications','Keep pipeline stages updated','Flag stale leads for review'],
  ARRAY['Qualification decisions','Pricing and proposal decisions','Relationship management'],
  ARRAY['Pipeline visibility','Follow-up completion rate','Lead-to-opportunity conversion rate'],
  'We would look at where leads currently go and what happens to them, then find the simplest way to make the process visible and consistent before recommending any system.',
  ARRAY['Professional services','Freelancer','Consultant','Founder or entrepreneur','Coaching and consultancy'],
  ARRAY['Process clarification','Better use of existing tools','New tool implementation','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Client, Customer, Donor or Beneficiary Journeys',
  'Client onboarding',
  'client-onboarding',
  'The process of bringing a new client into the organisation is inconsistent, slow or creates a poor first experience.',
  ARRAY['Onboarding is always different','New clients do not know what to expect','We forget steps in the onboarding process','It takes too long to get a new client set up'],
  ARRAY['No documented onboarding process','Different team members handle onboarding differently','No standard information or document pack','No defined timeline or milestones'],
  ARRAY['Do not assume all onboarding can be standardised','Relationship-based onboarding may require human warmth'],
  ARRAY['No onboarding checklist or playbook','No templates for welcome communications','Onboarding responsibility not clearly assigned'],
  ARRAY['What does the current onboarding process look like from the client perspective?','How long does it take?','What are the most common points of confusion or delay?','What information does the client need to provide?'],
  ARRAY['Create a standard onboarding checklist','Write a welcome email template','Agree a timeline: when each step happens'],
  ARRAY['AI can draft welcome and onboarding communications for review','AI can generate personalised instructions from a template'],
  ARRAY['Send welcome communications on schedule','Chase outstanding documents or information','Update onboarding status','Flag exceptions'],
  ARRAY['Relationship management during onboarding','Complex or sensitive setup requiring judgement','Pricing or contract discussions'],
  ARRAY['Time from agreement to active client','Client satisfaction with onboarding experience','Percentage of onboarding steps completed on schedule'],
  'We would document what onboarding currently looks like, identify the steps that cause delays or inconsistencies, and find the simplest way to make the process reliable.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Team admin
(
  'Team and Delivery Administration',
  'Task ownership',
  'task-ownership',
  'It is not always clear who is responsible for specific tasks, leading to duplication, missed work and finger-pointing.',
  ARRAY['Nobody knows who is doing what','Things get done twice or not at all','I am always chasing people for updates','Team members assume someone else has it covered'],
  ARRAY['No central task list','Responsibilities assigned verbally or by email only','No agreed escalation when tasks are blocked','No regular check-in on task status'],
  ARRAY['Do not assume a project management tool will solve ownership without clear process','Do not introduce a tool without agreeing how it will be used'],
  ARRAY['No task management system','Assignments made informally','No standard for recording agreed actions'],
  ARRAY['Where do you currently record who is doing what?','How do team members communicate about task progress?','What happens when a task is blocked or missed?','How many active tasks does the team manage at once?'],
  ARRAY['Create a shared task list — even a shared document is a start','Record owner, due date and status for every task','Hold a brief weekly check-in on open tasks'],
  ARRAY['AI can suggest task assignments based on workload','AI can summarise task status from notes'],
  ARRAY['Maintain and update the task list','Send reminders for approaching due dates','Flag blocked or overdue tasks'],
  ARRAY['Decisions about priorities when tasks conflict','Reassignment of work requiring judgement'],
  ARRAY['Percentage of tasks completed on time','Proportion of tasks with a clear owner','Number of missed or duplicated tasks per period'],
  'We would look at how tasks are currently allocated and tracked, then find the simplest way to make ownership and status visible to the whole team.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','New tool implementation','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Founder/freelancer
(
  'Founder, Freelancer and Consultant Administration',
  'Everything depends on one person',
  'everything-depends-one-person',
  'A single person is the contact, decision-maker and operator for every aspect of the business, creating a bottleneck and continuity risk.',
  ARRAY['I am the only person who knows how anything works','Nothing happens if I am not there','I cannot take a holiday without everything stopping','I need to delegate but do not know where to start'],
  ARRAY['No documented processes','No second person trained on key tasks','Client relationships tied to the founder personally','No handover plan for absence'],
  ARRAY['Do not assume the person wants to grow a team','Do not assume automation can replace the owner in all cases'],
  ARRAY['Processes never documented','Training never prioritised','Everything lives in the founder''s head or inbox'],
  ARRAY['Which tasks do you do purely because nobody else can?','Which tasks could someone else do if you showed them once?','What would happen to your clients if you were unavailable for two weeks?','Have you ever tried to delegate?','What stopped it working?'],
  ARRAY['List all recurring tasks and categorise by: only I can do this; someone else could with training; could be templated or automated','Document one process per week','Identify the highest-risk task and build a handover for it first'],
  ARRAY['AI can help draft process documentation from notes','AI can handle low-risk standard communications on approval'],
  ARRAY['Take over documented recurring tasks','Handle standard communications','Monitor and triage inbox with agreed rules','Maintain records and follow-ups'],
  ARRAY['Client relationship decisions','Pricing and proposals','Strategic decisions','Anything requiring personal authority or judgement'],
  ARRAY['Tasks successfully delegated or documented','Holiday taken without business disruption','Time freed from administrative tasks per week'],
  'We would start by identifying which tasks most need to be off your plate and building a simple handover for those first, rather than trying to document everything at once.',
  ARRAY['Freelancer','Consultant','Founder or entrepreneur','Sole trader','Coach or trainer'],
  ARRAY['Process clarification','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Founder, Freelancer and Consultant Administration',
  'Proposal and contract delays',
  'proposal-contract-delays',
  'Proposals and contracts take too long to produce, delaying revenue and sometimes losing opportunities.',
  ARRAY['Proposals take me days to write','I keep writing the same proposal from scratch','Contracts sit waiting to be signed for weeks','We lose momentum between the conversation and the written offer'],
  ARRAY['No proposal templates','Proposals written from scratch for each client','No e-signature process','No follow-up process after sending'],
  ARRAY['Do not assume the person needs a complex proposal tool'],
  ARRAY['No template library','Proposal ownership unclear','No chasing process after proposals are sent'],
  ARRAY['How long does it typically take to produce a proposal?','How much of it is new content versus repeated?','What happens after a proposal is sent?','How do you manage contract signing?'],
  ARRAY['Create a proposal template with standard sections','Build a library of service description blocks','Agree a follow-up schedule for outstanding proposals','Use e-signature where contracts are straightforward'],
  ARRAY['AI can draft proposals from a brief for review','AI can adapt standard sections to the client context'],
  ARRAY['Populate proposal templates with client-specific information','Track outstanding proposals and send reminders','Chase contract signature','Keep CRM updated with proposal status'],
  ARRAY['Pricing decisions','Negotiation over terms','Final approval and signature'],
  ARRAY['Time from enquiry to proposal sent','Proposal-to-win conversion rate','Average time to signed contract'],
  'We would look at how long proposals currently take and how much of the content is reusable, then create a template that reduces the time without reducing the quality.',
  ARRAY['Professional services','Freelancer','Consultant','Founder or entrepreneur','Coaching and consultancy'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Marketing
(
  'Marketing and Content Operations',
  'Content planning',
  'content-planning',
  'Content is produced reactively and inconsistently, with no forward plan or clear ownership.',
  ARRAY['We never know what to post','Content is always last-minute','We do not have a content plan','Social media is always forgotten'],
  ARRAY['No content calendar','Content produced reactively','No clear owner','No bank of planned topics or ideas'],
  ARRAY['Do not assume the person needs expensive scheduling software','Do not assume more content is always better'],
  ARRAY['No content strategy or editorial calendar','Content ownership diffuse or unclear','No process for capturing ideas and turning them into content'],
  ARRAY['How often do you aim to produce content?','Who is responsible for creating and publishing it?','How do you currently decide what to write or post?','What content has performed well in the past?'],
  ARRAY['Create a simple monthly content calendar','Batch-write content when in the right headspace','Build an ideas list to draw from'],
  ARRAY['AI can suggest topics based on sector and pain points','AI can draft content for review','AI must not publish without human review'],
  ARRAY['Research content topics','Populate the content calendar','Draft content for review','Schedule approved content','Monitor engagement'],
  ARRAY['Final approval of all content','Tone and brand decisions','Sensitive or regulatory subject matter'],
  ARRAY['Content published per month versus plan','Time spent on content per week','Engagement improvement over time'],
  'We would look at what content you want to produce and how often, then find the simplest planning system and division of labour to make it consistent.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
-- Membership
(
  'Client, Customer, Donor or Beneficiary Journeys',
  'Membership renewals',
  'membership-renewals',
  'Member renewal cycles are inconsistent, resulting in lapsed memberships, lost income and gaps in community engagement.',
  ARRAY['We lose members because we forget to chase renewals','Our renewal process is manual','Members let memberships lapse without meaning to','We do not know which members are about to lapse'],
  ARRAY['No automated renewal reminder cycle','Renewal data not easily accessible','No standard renewal communication','No process for following up lapsed members'],
  ARRAY['Do not assume all renewals can be automated — some may require personal contact'],
  ARRAY['No renewal reminder scheduled','Membership data in a spreadsheet without renewal dates flagged','No standard renewal email sequence'],
  ARRAY['When do members typically renew?','How are renewal reminders currently sent?','What proportion of members lapse without renewing?','Do you follow up with lapsed members?'],
  ARRAY['Create a renewal calendar with dates flagged 60, 30, 7 days before expiry','Write standard renewal reminder templates','Agree a lapsed-member follow-up process'],
  ARRAY['AI can personalise renewal reminders','Automation can trigger reminders at defined intervals'],
  ARRAY['Send approved renewal reminders on schedule','Monitor renewal status','Follow up with lapsed members','Update membership records'],
  ARRAY['Decisions about membership pricing or terms','Handling complaints or exceptions from existing members'],
  ARRAY['Renewal rate','Lapsed member recovery rate','Time spent on renewal administration per cycle'],
  'We would look at when members currently receive reminders and what happens when memberships lapse, then design a reliable renewal sequence.',
  ARRAY['Membership and associations','Charity and community services','Education and training'],
  ARRAY['Process clarification','Better use of existing tools','Automation','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Reporting and Governance',
  'Meeting minutes and actions',
  'meeting-minutes-actions',
  'Meeting minutes are not consistently produced, distributed or followed up, so agreed actions are lost or forgotten.',
  ARRAY['Nobody takes proper minutes','Actions from meetings get forgotten','Minutes take ages to write up','We never know what was decided last time'],
  ARRAY['No designated minute-taker','No standard format for minutes','Actions not assigned to named owners with deadlines','No circulation process for distributing minutes'],
  ARRAY['Do not assume AI-transcription is appropriate without consent from all participants'],
  ARRAY['Meeting minutes seen as low priority','No standard template','Minute-taking falls to most junior person available','No follow-up system for actions'],
  ARRAY['Who currently takes meeting notes?','How long does it take to produce minutes after a meeting?','How are actions tracked and followed up?','Are minutes ever referred back to at the next meeting?'],
  ARRAY['Create a standard minutes template','Assign a consistent minute-taker','Distribute minutes within 24 hours','Open every meeting by reviewing previous actions'],
  ARRAY['AI can help draft minutes from typed notes for review','AI can extract a list of actions from meeting notes','Audio transcription requires explicit consent from all participants'],
  ARRAY['Prepare agenda and minutes template','Take and circulate minutes','Track and chase actions','Maintain a decisions register'],
  ARRAY['Final review and approval of minutes','Decisions made during meetings','Sensitive board or trustee discussions'],
  ARRAY['Time from meeting to minutes circulated','Action completion rate','Number of meetings where previous actions are reviewed'],
  'We would look at your current meeting process and find the simplest way to make minutes reliable and actions tracked without adding significant administrative burden.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Finance and Commercial Administration',
  'Subscription and renewal management',
  'subscription-renewal-management',
  'Software subscriptions, contracts and licences are not tracked, leading to unexpected charges, forgotten renewals and duplicate tools.',
  ARRAY['We keep paying for things we do not use','A subscription renewed and we did not notice','We have no idea what software we are paying for','We found three tools that do the same thing'],
  ARRAY['No central register of subscriptions','Subscriptions charged to personal cards or multiple accounts','No renewal date tracking','No review process for whether tools are still needed'],
  ARRAY['Do not assume all subscriptions should be cancelled','Some may be used more than the organisation realises'],
  ARRAY['Subscriptions spread across accounts and cards','No register maintained','No owner for reviewing whether tools are needed'],
  ARRAY['Do you have a list of all active subscriptions?','Who reviews whether they are still needed?','How are you notified of renewals?','Have you ever found a subscription you had forgotten about?'],
  ARRAY['Create a subscription register with renewal dates, cost and owner','Set calendar reminders 30 days before renewal','Review the list quarterly'],
  ARRAY['AI can help categorise subscription tools and identify overlaps'],
  ARRAY['Maintain subscription register','Send renewal reminders','Coordinate cancellations','Keep payment records updated'],
  ARRAY['Decision to cancel or renew subscriptions','Contract or supplier negotiations'],
  ARRAY['Number of unreviewed renewals per year','Total monthly subscription cost visibility','Duplicate tools identified and removed'],
  'We would start by listing all current subscriptions in one place with their renewal dates, then put a simple review process in place to make sure nothing renews unnoticed.',
  ARRAY['All'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------
-- Synonyms for pain points
-- ----------------------------------------------------------------

INSERT INTO engagement_pain_point_synonyms (pain_point_id, phrase)
SELECT p.id, s.phrase
FROM engagement_pain_points p
CROSS JOIN (VALUES
  ('inbox-overload', 'email overload'),
  ('inbox-overload', 'too many emails'),
  ('inbox-overload', 'inbox chaos'),
  ('inbox-overload', 'shared inbox confusion'),
  ('inbox-overload', 'missed messages'),
  ('inbox-overload', 'email triage'),
  ('inbox-overload', 'unread messages'),
  ('inbox-overload', 'client communication'),
  ('inbox-overload', 'enquiry management'),
  ('inbox-overload', 'messages across multiple accounts'),
  ('slow-response-times', 'slow replies'),
  ('slow-response-times', 'late responses'),
  ('slow-response-times', 'not responding quickly'),
  ('follow-ups-not-happening', 'things fall through gaps'),
  ('follow-ups-not-happening', 'falling through cracks'),
  ('follow-ups-not-happening', 'forgot to follow up'),
  ('follow-ups-not-happening', 'no follow up'),
  ('follow-ups-not-happening', 'missed follow-ups'),
  ('duplicate-data-entry', 'rekeying data'),
  ('duplicate-data-entry', 'entering same information twice'),
  ('duplicate-data-entry', 'manual data transfer'),
  ('funder-reporting', 'grant reporting'),
  ('funder-reporting', 'impact reporting'),
  ('funder-reporting', 'reporting takes days'),
  ('funder-reporting', 'board reports'),
  ('funder-reporting', 'funder reports'),
  ('monthly-management-reporting', 'management information'),
  ('monthly-management-reporting', 'board packs'),
  ('monthly-management-reporting', 'monthly reports'),
  ('monthly-management-reporting', 'pulling data together'),
  ('monthly-management-reporting', 'spreadsheet reporting'),
  ('late-payment-chasing', 'unpaid invoices'),
  ('late-payment-chasing', 'chasing payment'),
  ('late-payment-chasing', 'clients not paying'),
  ('late-payment-chasing', 'outstanding invoices'),
  ('spreadsheet-dependency', 'everything in spreadsheets'),
  ('spreadsheet-dependency', 'spreadsheet mess'),
  ('spreadsheet-dependency', 'excel dependency'),
  ('lead-tracking', 'losing leads'),
  ('lead-tracking', 'pipeline management'),
  ('lead-tracking', 'prospect tracking'),
  ('everything-depends-one-person', 'single point of failure'),
  ('everything-depends-one-person', 'key person dependency'),
  ('everything-depends-one-person', 'all relies on me'),
  ('content-planning', 'social media planning'),
  ('content-planning', 'no content calendar'),
  ('content-planning', 'marketing planning')
) AS s(slug, phrase)
WHERE p.slug = s.slug
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Sector profiles (15+)
-- ----------------------------------------------------------------

INSERT INTO engagement_sector_profiles (
  name, audience_types, description, common_admin_pressures,
  typical_stakeholders, common_systems, common_data_types,
  relevant_risk_areas, starting_language, questions_to_explore,
  common_objections, potential_pathways, status, content_owner, review_date
) VALUES
(
  'Charity and Community Services',
  ARRAY['Charity or non-profit','Social enterprise or CIC','Community group'],
  'Charities, community interest companies and voluntary organisations delivering services in the community. Often have multiple funders, volunteers, service users and reporting requirements.',
  ARRAY['Funder reporting','Volunteer coordination','Service-user communications','Data spread across multiple systems','Impact reporting','Board governance','Meeting minutes and actions'],
  ARRAY['CEO or executive director','Finance manager','Programme or project managers','Volunteer coordinator','Trustees or board members','Funders'],
  ARRAY['CRM (e.g. Salesforce NPSP, Beacon)','Finance (e.g. Xero, QuickBooks)','Volunteer management','Email marketing','Grant management'],
  ARRAY['Beneficiary data','Funder contact details','Volunteer records','Grant information','Financial records','Impact data'],
  ARRAY['Safeguarding','Special-category data','Funder accountability','Public trust','GDPR compliance'],
  'We understand that charities are often managing multiple priorities with limited resource. VAxAI looks at the whole administrative picture — not just whether AI might help, but whether a clearer process or better use of what you already have would make the biggest difference.',
  ARRAY['How many funders do you report to?','How much of the team''s time goes on reporting?','Do you use a CRM or manage beneficiary data in spreadsheets?','Are volunteer records and service-user data kept separately?'],
  ARRAY['We cannot afford consultancy fees','Our data is sensitive','We need a person not a tool','We do not have capacity to implement anything'],
  ARRAY['Process clarification','VA support','Better use of existing tools','Integration'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Professional Services',
  ARRAY['Small business','Freelancer','Consultant'],
  'Consultants, advisers, accountants, lawyers and professional firms selling expertise and time.',
  ARRAY['Proposal delays','Late payment chasing','Client onboarding','Diary management','Duplicate data entry','Follow-up discipline'],
  ARRAY['Principals and partners','Client relationship managers','Finance or admin staff'],
  ARRAY['CRM','Time tracking','Project management','Accounting','Document management','E-signature'],
  ARRAY['Client contact data','Financial records','Contract and engagement letters','Time records','Confidential advice'],
  ARRAY['Regulated professional work','Confidentiality','Financial information','Legal obligations'],
  'VAxAI looks at how your practice manages the administrative side of client work — from first contact through to invoice and follow-up — and finds the areas where time is being lost to unclear process or manual repetition.',
  ARRAY['How do new client enquiries come in?','How do you track what is outstanding across all your clients?','How long does it take to produce a proposal or engagement letter?','How do you currently manage invoice chasing?'],
  ARRAY['We are too busy to implement anything','We already have a CRM we do not use fully','Our clients expect personal service not automation'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Combined approach'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Health and Wellbeing',
  ARRAY['Small business','Freelancer','Sole trader','Consultant','Charity or non-profit'],
  'Practitioners, therapists, coaches, clinics and health-related organisations managing client bookings, records and sensitive personal information.',
  ARRAY['Appointment scheduling','Client reminders','Record management','Cancellations and rescheduling','Follow-up communications','Invoicing'],
  ARRAY['Practitioners','Receptionists','Practice managers','Patients or clients'],
  ARRAY['Practice management software','Booking systems','Medical records (where relevant)','Payment systems'],
  ARRAY['Health information','Personal data','Appointment records','Payment details'],
  ARRAY['Special-category health data','Safeguarding','Regulated professional work','GDPR and clinical data'],
  'In health and wellbeing services, VAxAI focuses on the administrative side of practice — the scheduling, communications and record management — while being clear about the boundaries where automation is not appropriate.',
  ARRAY['How many appointments do you manage per week?','How are appointment reminders currently sent?','What happens with cancellations and rescheduling?','How are client records maintained?'],
  ARRAY['Our data is too sensitive','We cannot automate patient communications','We are already regulated'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Education and Training',
  ARRAY['Small business','Charity or non-profit','Freelancer','Consultant','Coach or trainer'],
  'Training providers, tutors, educational organisations and learning-focused charities managing enrolments, content delivery and learner communications.',
  ARRAY['Enrolment and onboarding','Learner communications','Content scheduling','Certificate and completion tracking','Reporting to funders or commissioners'],
  ARRAY['Trainers and tutors','Programme coordinators','Learners','Funders or commissioners'],
  ARRAY['Learning management system','Booking systems','Email platforms','Spreadsheets'],
  ARRAY['Learner data','Attendance records','Assessment results','Funder data'],
  ARRAY['Learner safeguarding','Age-appropriate data handling','Funder accountability','GDPR'],
  'VAxAI helps training and education providers reduce the administrative burden of managing learners, communications and reporting so that more time can go on delivery.',
  ARRAY['How do you currently manage learner enrolment?','How do you track completion and attendance?','What reporting do commissioners or funders require?','How do learners currently receive communications?'],
  ARRAY['We are not a tech organisation','Our learners are not digitally confident','We do not have budget for systems'],
  ARRAY['Process clarification','Better use of existing tools','VA support','Integration'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Coaching and Consultancy',
  ARRAY['Freelancer','Consultant','Coach or trainer','Sole trader'],
  'Independent coaches, consultants and trainers managing client acquisition, session delivery, content and administration as a one- or two-person operation.',
  ARRAY['Everything depends on one person','Proposal delays','Booking and onboarding friction','Lead tracking','Content planning','Invoicing delays'],
  ARRAY['The founder or principal','Clients'],
  ARRAY['Calendar and booking tools','Email','CRM','Accounting','Document tools'],
  ARRAY['Client contact data','Session notes','Contracts','Financial records'],
  ARRAY['Confidentiality of coaching conversations','Professional conduct','Financial information'],
  'VAxAI works with coaches and consultants to reduce the time spent on administration so more of your capacity goes on clients and delivery — without asking you to become a systems expert.',
  ARRAY['How do new clients find you and how do they book?','How long does your proposal or onboarding process take?','What administrative tasks do you do every week that feel repetitive?','Do you have a consistent follow-up process for enquiries?'],
  ARRAY['I need a human relationship not a tool','I do not want to outsource client communication','I cannot afford this'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Creative, Marketing and Media',
  ARRAY['Small business','Freelancer','Founder or entrepreneur','Sole trader'],
  'Creative agencies, freelance designers, content producers and marketing teams managing projects, clients and creative output.',
  ARRAY['Project and task management','Client communication','Proposal and brief delays','Content scheduling','Invoicing delays','File and version management'],
  ARRAY['Creative leads','Project managers','Clients'],
  ARRAY['Project management tools','Design platforms','Shared storage','CRM','Accounting'],
  ARRAY['Project briefs','Client feedback','Creative assets','Financial records'],
  ARRAY['Intellectual property','Client confidentiality','Financial information'],
  'VAxAI helps creative teams and freelancers reduce the administrative overhead of client management and project coordination so that creative time is protected.',
  ARRAY['How do you manage briefs and approvals?','How are files organised and shared with clients?','How often do invoices go out late?','What does your current onboarding process look like for a new client?'],
  ARRAY['Creative work cannot be automated','Our clients expect a personal service','We move too fast to document processes'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Retail and Ecommerce',
  ARRAY['Small business','Sole trader','Founder or entrepreneur'],
  'Independent retailers and ecommerce sellers managing orders, customer service, inventory and supplier relationships.',
  ARRAY['Order management','Customer enquiries','Returns and complaints','Inventory tracking','Supplier management','Marketing and promotions'],
  ARRAY['Owner or manager','Customer service staff','Suppliers'],
  ARRAY['Ecommerce platform','Accounting','Email marketing','Inventory management','Customer service tools'],
  ARRAY['Customer personal data','Payment data','Order records','Supplier contracts'],
  ARRAY['Financial information','Customer complaints','Consumer rights'],
  'VAxAI looks at the operational and customer-facing administration of your retail or ecommerce operation to find where time and accuracy can be improved.',
  ARRAY['How are customer enquiries and complaints currently handled?','How do you track orders and inventory?','What takes the most time in day-to-day operations?'],
  ARRAY['We are too small','We already use an ecommerce platform','Customers expect immediate responses'],
  ARRAY['Process clarification','Better use of existing tools','Automation','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Membership and Associations',
  ARRAY['Charity or non-profit','Membership organisation','Community group'],
  'Professional associations, networks and membership organisations managing member recruitment, renewals, communications and events.',
  ARRAY['Membership renewals','Member communications','Event administration','Board governance','Reporting','Volunteer coordination'],
  ARRAY['Membership manager','Board or committee','Members'],
  ARRAY['Membership management software','Email platforms','Event booking','Accounting'],
  ARRAY['Member personal data','Payment records','Event registrations'],
  ARRAY['Member data privacy','GDPR','Communication consent'],
  'VAxAI helps membership organisations make their renewal and communications processes more reliable and less manual, so staff capacity can go on engagement rather than administration.',
  ARRAY['How do you manage member renewals?','How do members receive communications?','What does your event administration process look like?','How do you track member engagement?'],
  ARRAY['Our members value personal communication','We are not ready to automate renewals','Our database is too old'],
  ARRAY['Process clarification','Better use of existing tools','Automation','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Accountancy and Finance Services',
  ARRAY['Small business','Freelancer','Consultant'],
  'Accountants, bookkeepers and finance professionals managing client accounts, compliance and reporting.',
  ARRAY['Client document collection','Deadline tracking','Reporting','Client communications','Practice management'],
  ARRAY['Principals and managers','Clients','HMRC and regulatory bodies'],
  ARRAY['Practice management software','Accounting platforms','Document management','E-signature'],
  ARRAY['Financial records','Client personal and business data','Tax information'],
  ARRAY['Regulated professional work','Financial information','GDPR','Client confidentiality'],
  'VAxAI helps finance practices reduce the administrative burden of client management, document collection and deadline tracking so professional time is spent on advice rather than chasing.',
  ARRAY['How do you currently collect documents from clients?','How do you track deadlines for multiple clients?','What are the most time-consuming non-billable administrative tasks?'],
  ARRAY['Our clients'' data is too sensitive','We are already regulated','We use cloud accounting'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Social Care and Support Services',
  ARRAY['Charity or non-profit','Social enterprise or CIC','Small business'],
  'Social care providers, support services, housing associations and organisations working with vulnerable people.',
  ARRAY['Safeguarding compliance','Service-user records','Referral management','Staff and volunteer records','Funder reporting','Incident recording'],
  ARRAY['Care managers','Support workers','Service users and families','Commissioners'],
  ARRAY['Case management systems','HR systems','Financial systems','Email'],
  ARRAY['Service-user personal data','Health information','Safeguarding records','Financial records'],
  ARRAY['Safeguarding','Special-category data','Regulated care','Public accountability'],
  'VAxAI approaches social care administration with a clear understanding that safeguarding, human oversight and data security are not optional. We focus on administrative efficiency in areas where it is appropriate and safe.',
  ARRAY['What administrative tasks take the most staff time?','How are safeguarding incidents currently recorded and reviewed?','How is service-user data managed across teams?'],
  ARRAY['Safeguarding means we cannot automate anything','Our data is too sensitive','We are regulated'],
  ARRAY['Process clarification','VA support','Human review always required for safeguarding-related processes'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Technology and Digital Services',
  ARRAY['Small business','Founder or entrepreneur','Freelancer'],
  'Software companies, digital agencies, SaaS businesses and technology consultancies.',
  ARRAY['Lead tracking','Client onboarding','Proposal and contract delays','Subscription management','Support management','Reporting'],
  ARRAY['Founders and technical leads','Sales and customer success','Clients'],
  ARRAY['CRM','Project management','Support ticketing','Accounting','Development tools'],
  ARRAY['Client data','Product data','Financial records','Support records'],
  ARRAY['Data privacy','Security','Financial information'],
  'VAxAI helps technology businesses separate technical delivery time from administrative overhead, focusing on client management, sales and operational processes that can be improved without distracting engineering resources.',
  ARRAY['How do you currently manage the sales pipeline?','What does client onboarding look like?','How do support requests reach the right person?'],
  ARRAY['We already use lots of tools','We can build our own solution','We do not need outside help for this'],
  ARRAY['Process clarification','Better use of existing tools','Integration','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Trades, Construction and Property Services',
  ARRAY['Small business','Sole trader','Freelancer'],
  'Tradespeople, contractors, builders, property managers and related services managing quotes, jobs and invoicing.',
  ARRAY['Quoting and proposal delays','Invoicing delays','Late payment chasing','Job scheduling','Supplier coordination','Compliance documentation'],
  ARRAY['Owner or director','Site managers','Clients','Suppliers'],
  ARRAY['Quoting software','Accounting','Job management apps','Email'],
  ARRAY['Client contact data','Financial records','Job records','Compliance certificates'],
  ARRAY['Financial information','Health and safety compliance','Contract terms'],
  'VAxAI helps trades and property businesses reduce the administrative overhead of quoting, invoicing and job management so more time goes on site and with clients.',
  ARRAY['How do quotes currently go out?','How long does it take from job completion to invoice?','How do you track what is outstanding?','What is your current process for chasing payment?'],
  ARRAY['We are too busy to change our processes','Our clients just want us to get on with the job','We manage fine with what we have'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Research and Policy',
  ARRAY['Charity or non-profit','Consultant','Small business'],
  'Think tanks, research organisations, policy consultancies and academic units producing analysis, evidence and recommendations.',
  ARRAY['Report production','Literature management','Stakeholder communications','Project coordination','Publication planning'],
  ARRAY['Researchers','Programme managers','Communications staff','Funders'],
  ARRAY['Reference management','Project management','Publishing tools','Email'],
  ARRAY['Research data','Participant information','Funder data'],
  ARRAY['Research ethics','Participant data','Funder accountability'],
  'VAxAI helps research and policy organisations manage the administrative side of project and publication work so researchers can focus on analysis and impact.',
  ARRAY['How do research projects get tracked and coordinated?','What does the report production process look like?','How are stakeholder communications managed?'],
  ARRAY['Research is too nuanced to be supported by automation','Our outputs require expert judgement'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Recruitment and People Services',
  ARRAY['Small business','Consultant','Freelancer'],
  'Recruitment agencies, HR consultancies and people-services businesses managing candidate and client relationships.',
  ARRAY['Candidate and client communication','Shortlisting and scheduling','Compliance documentation','Reporting','Follow-up discipline'],
  ARRAY['Recruiters','Candidates','Client hiring managers'],
  ARRAY['ATS','CRM','Accounting','Email','Video interview tools'],
  ARRAY['Candidate personal data','Right-to-work records','Financial records'],
  ARRAY['Employment law','Personal data','Right to work compliance','GDPR'],
  'VAxAI helps recruitment businesses manage candidate and client communications, scheduling and compliance administration more efficiently.',
  ARRAY['How do candidate enquiries and applications arrive?','What does the interview scheduling process look like?','How is compliance documentation collected and stored?'],
  ARRAY['Recruitment is relationship-driven — automation does not work here','Our data is too sensitive'],
  ARRAY['Process clarification','Better use of existing tools','VA support'],
  'approved', 'VAxAI', '2026-06-21'
),
(
  'Environmental and Sustainability Services',
  ARRAY['Charity or non-profit','Social enterprise or CIC','Consultant','Small business'],
  'Environmental charities, sustainability consultancies and organisations working on climate, nature or community environment projects.',
  ARRAY['Project reporting','Volunteer coordination','Grant management','Stakeholder communications','Impact measurement'],
  ARRAY['Project leads','Volunteers','Funders','Community stakeholders'],
  ARRAY['Project management','Email','Reporting tools','Spreadsheets'],
  ARRAY['Beneficiary data','Environmental monitoring data','Funder records'],
  ARRAY['Funder accountability','Volunteer data','Environmental data ethics'],
  'VAxAI helps environmental organisations reduce administrative burden so that more time and energy goes on the mission.',
  ARRAY['How do you track project progress and impact?','How are volunteers recruited and coordinated?','What reporting do funders require?'],
  ARRAY['We are too small','Our data is not suitable for automation','We cannot afford consultancy'],
  ARRAY['Process clarification','VA support','Better use of existing tools'],
  'approved', 'VAxAI', '2026-06-21'
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Personas (10+)
-- ----------------------------------------------------------------

INSERT INTO engagement_personas (
  persona_name, typical_role, goals, pressures, decision_responsibilities,
  likely_concerns, information_needed, useful_questions, language_to_avoid,
  preferred_detail, possible_channels, evidence_status, status
) VALUES
(
  'The Stretched CEO',
  'Chief Executive of a small charity or social enterprise',
  ARRAY['Deliver mission impact','Secure continued funding','Manage a small team effectively','Maintain board confidence'],
  ARRAY['Never enough time or resource','Constantly switching between operational and strategic work','Responsible for everything from strategy to day-to-day admin','Reporting burden to multiple funders'],
  ARRAY['Hiring and team decisions','Funder relationships','Strategic direction','Major expenditure'],
  ARRAY['Cost','Change management burden','Whether support is genuine or sales-driven','Data sensitivity'],
  ARRAY['Practical evidence of what has worked elsewhere','Clear cost and time to benefit','What would happen first','Whether they need to be heavily involved'],
  ARRAY['What is taking the most time away from the things only you can do?','If you had an extra half-day per week freed up, what would you do with it?','What administrative tasks do you currently do that feel unnecessary?'],
  ARRAY['AI','Automation','Digital transformation','Scale'],
  'concise', ARRAY['Email','Phone','LinkedIn'], 'hypothesis', 'approved'
),
(
  'The Founder-Operator',
  'Business founder running operations solo or with minimal staff',
  ARRAY['Grow the business without burning out','Deliver a great client experience','Get paid promptly','Build consistent systems as the team grows'],
  ARRAY['Everything depends on them','Reactive rather than proactive','Administration competes with billable or delivery time','No clear boundary between work and admin'],
  ARRAY['All decisions','Client relationships','Financial decisions'],
  ARRAY['Cost relative to revenue','Whether any support is flexible','Protecting client relationships from impersonal automation','Data security'],
  ARRAY['Specific tasks that could be taken off their plate quickly','Flexible support that does not require long onboarding','Evidence that the investment pays back'],
  ARRAY['If you could stop doing three administrative tasks tomorrow, which ones would they be?','What is the most important thing that falls through the gaps when you are busy?'],
  ARRAY['Scale','Enterprise','Solutions'],
  'concise', ARRAY['Email','LinkedIn','Phone'], 'hypothesis', 'approved'
),
(
  'The Charity Finance and Operations Manager',
  'Finance or operations manager in a charity or non-profit',
  ARRAY['Accurate financial reporting','Manage grant compliance','Efficient use of staff time','Reliable processes and systems'],
  ARRAY['Multiple funder requirements','Spreadsheet-based reporting','Small team with many responsibilities','Year-end and audit preparation'],
  ARRAY['Day-to-day operational decisions','Finance processes','Systems and tools within budget','Reporting to the CEO'],
  ARRAY['Data security and funder compliance','Cost','Change burden on a stretched team','Whether technology can be trusted with sensitive information'],
  ARRAY['What implementation looks like in practice','Cost of change versus cost of staying the same','References from similar organisations'],
  ARRAY['How much time does monthly reporting currently take?','Are your systems connected or do you rekey data?','What would better reporting look like for you and your board?'],
  ARRAY['AI will do it for you','Automate the whole process','No human needed'],
  'structured', ARRAY['Email','Video call'], 'hypothesis', 'approved'
),
(
  'The Independent Consultant',
  'Self-employed consultant or adviser selling expertise',
  ARRAY['Protect billable time','Win new clients consistently','Get paid on time','Present a professional image'],
  ARRAY['No administrative support','Business development competes with delivery','Inconsistent pipeline','Proposals and contracts take too long'],
  ARRAY['All decisions — sole operator'],
  ARRAY['Cost and value','Protecting client confidentiality','Not wanting to appear to use mass-market tools'],
  ARRAY['Which tasks could be handled without their time','Whether support is flexible per project','Clear return on investment'],
  ARRAY['What proportion of your week goes on administration rather than client work?','Have you lost opportunities because proposals were delayed?','How do you currently manage follow-ups with prospects?'],
  ARRAY['Scale up','Build a team','Enterprise systems'],
  'concise', ARRAY['Email','LinkedIn','Phone'], 'hypothesis', 'approved'
),
(
  'The Membership Manager',
  'Manager of a professional association or membership organisation',
  ARRAY['Grow and retain membership','Deliver value to members','Run efficient events','Maintain reliable communications'],
  ARRAY['Renewal cycle pressure','Member communication volume','Event logistics','Small staff team'],
  ARRAY['Day-to-day operations','Member communications','Events and programming'],
  ARRAY['Disrupting existing relationships with members','Impersonal automation for a relationship-driven community','Cost'],
  ARRAY['How renewals and communications can be improved without losing personal touch','Practical examples from similar organisations'],
  ARRAY['What proportion of members lapse each year?','What does the renewal reminder process currently look like?','How do you currently communicate with members?'],
  ARRAY['Mass communication','Blast emails','Automated responses'],
  'structured', ARRAY['Email','Phone','Video call'], 'hypothesis', 'approved'
),
(
  'The Practice Manager',
  'Practice or office manager for a professional services firm',
  ARRAY['Keep operations running smoothly','Manage client administration','Support fee-earners to focus on clients','Maintain compliance and records'],
  ARRAY['High volume of routine administration','Multiple stakeholders with different needs','Balancing quality and speed','System fragmentation'],
  ARRAY['Operational decisions within scope','Staff management','Supplier relationships'],
  ARRAY['Disruption to established workflows','Cost','Change management','Data privacy'],
  ARRAY['How improvements could be introduced without disruption','Clear responsibilities and handovers','Practical case examples'],
  ARRAY['What are the most repetitive tasks your team handles each week?','Where do delays most often occur in client work?','Which tasks could be done by someone else if there were clear instructions?'],
  ARRAY['Replace your team','Fully automate'],
  'structured', ARRAY['Email','Phone'], 'hypothesis', 'approved'
),
(
  'The Freelance Creative',
  'Freelance designer, writer, photographer or creative professional',
  ARRAY['Protect creative time','Win consistent work','Invoice promptly and get paid','Manage client relationships smoothly'],
  ARRAY['Administration is not a strength','Business development is inconsistent','Client work and admin compete for the same day','Irregular income makes investment feel risky'],
  ARRAY['All decisions — solo operator'],
  ARRAY['Cost','Automation damaging creative brand','Impersonal client experience'],
  ARRAY['Specific time-saving on administration','Flexibility','Low setup overhead'],
  ARRAY['How many hours per week do you spend on administration?','What happens between finishing a project and getting paid?','Do you have a reliable way to follow up with clients who might want more work?'],
  ARRAY['Scale','Systems','Digital transformation'],
  'concise', ARRAY['Email','Instagram DM','LinkedIn'], 'hypothesis', 'approved'
),
(
  'The Volunteer Coordinator',
  'Coordinator responsible for volunteer recruitment, management and retention in a charity or community organisation',
  ARRAY['Recruit and retain enough volunteers','Match volunteers to roles effectively','Maintain compliance and training records','Keep volunteers engaged and informed'],
  ARRAY['High coordinator-to-volunteer ratio','Paper and spreadsheet records','Inconsistent communications','High volunteer turnover'],
  ARRAY['Day-to-day volunteer management','Communications and scheduling','Compliance records'],
  ARRAY['Volunteer data privacy','Volunteer experience impact of automation','Cost'],
  ARRAY['Practical examples of how similar organisations manage volunteer administration','What implementation would involve'],
  ARRAY['How do volunteers currently sign up?','How do you track who is available and trained for each role?','What volunteer information takes the most time to manage?'],
  ARRAY['Automate volunteer relationships','Replace coordinator with technology'],
  'structured', ARRAY['Email','Phone'], 'hypothesis', 'approved'
),
(
  'The Sole Trader Trade or Service Provider',
  'Sole trader operating in trades, construction or personal services',
  ARRAY['Get jobs done and invoiced quickly','Win more work through referrals','Get paid on time','Spend less time on paperwork'],
  ARRAY['Administration seen as low priority','No admin support','Invoicing and chasing payment happens between jobs','Everything managed on a phone'],
  ARRAY['All decisions'],
  ARRAY['Cost','Complexity','Time to set up','Not being seen as "corporate"'],
  ARRAY['Something quick to set up','Works on a phone','Does not require training'],
  ARRAY['How do jobs currently get booked?','How soon do invoices go out after a job?','What happens if a client does not pay on time?'],
  ARRAY['Transform your business','Digital transformation','Enterprise'],
  'concise', ARRAY['Phone','WhatsApp','Text'], 'hypothesis', 'approved'
),
(
  'The Trustee or Board Member',
  'Volunteer trustee or non-executive board member of a charity or social enterprise',
  ARRAY['Provide effective oversight','Understand organisational risk','Ensure the organisation meets its legal duties','Support the executive team'],
  ARRAY['Limited time — voluntary role','Reliance on board papers from the executive','Governance responsibilities with limited operational visibility','Keeping pace with compliance requirements'],
  ARRAY['Strategic and governance decisions','Risk oversight','Approval of major expenditure'],
  ARRAY['Legal liability','Data governance','Whether AI use is appropriate for their organisation','Reputational risk'],
  ARRAY['Clear summary of what is proposed and why','Evidence that risks are managed','Clarity on human oversight'],
  ARRAY['What governance concerns does the board have about AI or automation?','How are board papers currently produced and distributed?','Are there decisions the board struggles to make because the information arrives too late or in the wrong format?'],
  ARRAY['AI will make decisions','Automate governance'],
  'structured', ARRAY['Email','Video call'], 'hypothesis', 'approved'
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- VAT prompts
-- ----------------------------------------------------------------

INSERT INTO engagement_vat_prompts (category, dimension, prompt, context_tags, status, sort_order) VALUES
-- Value
('general', 'value', 'What is the problem costing in time, stress, missed income or service quality right now?', ARRAY['all'], 'approved', 1),
('general', 'value', 'Who experiences this problem and how often?', ARRAY['all'], 'approved', 2),
('general', 'value', 'What would a meaningfully better outcome look like?', ARRAY['all'], 'approved', 3),
('general', 'value', 'Would solving this remove work entirely or just move it somewhere else?', ARRAY['all'], 'approved', 4),
('general', 'value', 'What capacity would be released if this were resolved?', ARRAY['all'], 'approved', 5),
('reporting', 'value', 'Which reports consume the most time, and what would the team do with the capacity released?', ARRAY['reporting','funder-reporting'], 'approved', 6),
('communications', 'value', 'How much time per week goes on inbox management, and what is the cost of a missed enquiry?', ARRAY['inbox-overload','communications'], 'approved', 7),
('finance', 'value', 'What is the current outstanding debt, and what would collecting it promptly change for the business?', ARRAY['late-payment-chasing','invoicing'], 'approved', 8),
-- Alignment
('general', 'alignment', 'What systems or tools does the organisation already have?', ARRAY['all'], 'approved', 10),
('general', 'alignment', 'How consistently is the current process followed?', ARRAY['all'], 'approved', 11),
('general', 'alignment', 'Who owns the process and who is responsible for exceptions?', ARRAY['all'], 'approved', 12),
('general', 'alignment', 'Is the data available in a usable format?', ARRAY['all'], 'approved', 13),
('general', 'alignment', 'What is the team''s capacity to adopt or learn a new approach?', ARRAY['all'], 'approved', 14),
('reporting', 'alignment', 'Are the same data fields collected consistently across all projects?', ARRAY['reporting','funder-reporting'], 'approved', 15),
('data', 'alignment', 'Is there a single agreed source of truth for this information?', ARRAY['duplicate-data-entry','data'], 'approved', 16),
-- Trust
('general', 'trust', 'How sensitive is the information involved?', ARRAY['all'], 'approved', 20),
('general', 'trust', 'Who needs to check or approve the output before it is used?', ARRAY['all'], 'approved', 21),
('general', 'trust', 'What happens if the output is wrong?', ARRAY['all'], 'approved', 22),
('general', 'trust', 'Are there escalation routes if something goes wrong?', ARRAY['all'], 'approved', 23),
('general', 'trust', 'How confident is the team in adopting new approaches?', ARRAY['all'], 'approved', 24),
('reporting', 'trust', 'Who checks accuracy before information is sent to the funder?', ARRAY['reporting','funder-reporting'], 'approved', 25),
('ai', 'trust', 'Does the organisation understand the limitations of AI for this type of task?', ARRAY['ai','automation'], 'approved', 26),
('ai', 'trust', 'Is there a process for reviewing and correcting AI-generated content?', ARRAY['ai','automation'], 'approved', 27)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Recommendation rules (30+)
-- ----------------------------------------------------------------

INSERT INTO engagement_recommendation_rules (
  title, recommendation_type, condition_field, condition_operator, condition_value,
  priority, reason, evidence_needed, risk_gate, risk_gate_reason, status
) VALUES
('No clear task owner', 'process_improvement', 'task_owner', 'is_empty', NULL, 1,
  'If a task has no clear owner it cannot be reliably automated or delegated. Define ownership first.',
  'Who is responsible for this task?', false, NULL, 'active'),
('Steps vary with no agreed standard', 'process_improvement', 'process_consistency', 'equals', 'variable', 1,
  'Variable processes produce unpredictable outputs. Agree a standard before introducing any tool.',
  'Document the intended standard process.', false, NULL, 'active'),
('Work appears unnecessary or duplicated', 'process_improvement', 'work_type', 'equals', 'duplicated', 1,
  'Remove or consolidate the work before considering any technology.',
  'Is this task actually needed? Who uses the output?', false, NULL, 'active'),
('Required feature exists in current tool', 'use_existing_tools', 'existing_capability', 'equals', 'true', 2,
  'The feature already exists. Training or configuration is more cost-effective than a new tool.',
  'Which existing tool has this capability?', false, NULL, 'active'),
('Staff using workarounds due to lack of training', 'use_existing_tools', 'workaround_reason', 'equals', 'training', 2,
  'Training on existing tools is faster and cheaper than a new system.',
  'Confirm training would resolve the workaround.', false, NULL, 'active'),
('Multiple subscriptions duplicate same capability', 'use_existing_tools', 'duplicate_subscriptions', 'equals', 'true', 2,
  'Consolidate to one tool before adding another.',
  'List all subscriptions that provide this capability.', false, NULL, 'active'),
('Same data manually copied between stable systems', 'integration', 'manual_data_transfer', 'equals', 'true', 3,
  'An integration would remove the rekeying without changing either system.',
  'Are both systems stable and supported? Can fields be matched?', false, NULL, 'active'),
('Clear trigger and destination exist for data', 'integration', 'trigger_destination', 'equals', 'defined', 3,
  'Integration is viable when trigger and destination are reliably defined.',
  'Map the trigger event and receiving system.', false, NULL, 'active'),
('Task is repetitive and rules-based', 'automation', 'task_type', 'equals', 'repetitive_rules_based', 4,
  'Rule-based repetitive tasks are strong automation candidates.',
  'Are the rules consistent? Are exceptions manageable?', false, NULL, 'active'),
('Volume is meaningful', 'automation', 'volume', 'greater_than', '10_per_week', 4,
  'Automation saves more time when volume is sufficient.',
  'Confirm volume and whether it is consistent.', false, NULL, 'active'),
('Inputs are sufficiently structured', 'automation', 'input_structure', 'equals', 'structured', 4,
  'Unstructured inputs reduce automation reliability.',
  'How are inputs received and are they consistent?', false, NULL, 'active'),
('Action is reversible or low risk', 'automation', 'reversibility', 'equals', 'reversible', 4,
  'Automation is appropriate for reversible actions with limited downside.',
  'What is the consequence of an error?', false, NULL, 'active'),
('Task involves drafting or summarising', 'ai_assistance', 'task_nature', 'in', 'drafting,summarising,categorising', 5,
  'AI is well-suited to drafting and summarisation where a person reviews the output.',
  'Who will review the output? How will accuracy be checked?', false, NULL, 'active'),
('Person can review the AI output', 'ai_assistance', 'review_in_place', 'equals', 'true', 5,
  'AI assistance is appropriate only where human review is part of the process.',
  'Confirm the review step and who is responsible.', false, NULL, 'active'),
('Organisation understands AI limitations', 'ai_assistance', 'ai_understanding', 'equals', 'adequate', 5,
  'AI should only be introduced where the team understands what it can and cannot do.',
  'Has the team discussed AI limitations for this task?', false, NULL, 'active'),
('Work requires judgement or relationship management', 'va_support', 'task_nature', 'equals', 'judgement_required', 6,
  'Human VA support is the right solution when judgement, relationship or tact is required.',
  'What judgement is involved and why is it irreplaceable?', false, NULL, 'active'),
('Volume too low or variable to justify automation', 'va_support', 'volume', 'less_than', '5_per_week', 6,
  'Low or variable volume rarely justifies automation setup costs.',
  'Confirm volume and variability.', false, NULL, 'active'),
('Organisation learning a new system', 'va_support', 'change_maturity', 'equals', 'learning', 6,
  'VA support during a system transition maintains quality while the team builds confidence.',
  'What is the team''s experience with similar changes?', false, NULL, 'active'),
('Trust in automation is low', 'va_support', 'trust_level', 'equals', 'low', 6,
  'Human support builds trust. Start with VA support and introduce automation incrementally.',
  'What has caused the low trust? Past failures, sensitivity, or unfamiliarity?', false, NULL, 'active'),
('Automation creates but person must review', 'combined_approach', 'exception_handling', 'equals', 'required', 7,
  'A combined approach works well when automation handles the routine and a person handles exceptions or approvals.',
  'Map which steps are routine and which require human review.', false, NULL, 'active'),
('Safeguarding workflow detected', 'human_review_required', 'risk_type', 'equals', 'safeguarding', 99,
  'Safeguarding workflows must not be automated. Human oversight is required at every stage.',
  NULL, true, 'This workflow involves safeguarding. Specialist or human review required before any change.', 'active'),
('Clinical decision detected', 'human_review_required', 'risk_type', 'equals', 'clinical', 99,
  'Clinical decisions must not be automated.',
  NULL, true, 'Clinical decisions require qualified human oversight.', 'active'),
('Legal advice workflow detected', 'human_review_required', 'risk_type', 'equals', 'legal_advice', 99,
  'Legal advice must not be automated or drafted without qualified legal review.',
  NULL, true, 'Legal advice workflows require solicitor oversight.', 'active'),
('Employment decision detected', 'human_review_required', 'risk_type', 'equals', 'employment_decision', 99,
  'Employment decisions must have human oversight and legal review.',
  NULL, true, 'Employment decisions carry legal risk. Human review required.', 'active'),
('Special-category data without approved process', 'human_review_required', 'data_category', 'equals', 'special_category', 99,
  'Special-category data requires an approved legal basis and data process before any automation.',
  NULL, true, 'Special-category data detected. Data governance review required before proceeding.', 'active'),
('Automated decision affecting individual', 'human_review_required', 'automated_decision', 'equals', 'true', 99,
  'Fully automated decisions affecting individuals are restricted under UK GDPR. Human review must be available.',
  NULL, true, 'Automated individual decisions require GDPR compliance review.', 'active'),
('Financial approval above threshold', 'human_review_required', 'financial_value', 'greater_than', 'threshold', 99,
  'Financial approvals above the configured threshold require human authorisation.',
  NULL, true, 'Financial approval above configured threshold. Human authorisation required.', 'active'),
('Unclear consent or contact permissions', 'human_review_required', 'contact_basis', 'equals', 'unclear', 99,
  'Contact should not happen until a lawful basis is confirmed.',
  NULL, true, 'Contact permission unclear. Legal review required before outreach.', 'active'),
('Process purpose is unclear', 'explore_further', 'desired_outcome', 'is_empty', NULL, 8,
  'Without a clear desired outcome, no recommendation can be made. Discovery required.',
  'What would a successful outcome look like?', false, NULL, 'active'),
('Exceptions more common than standard path', 'process_improvement', 'exception_rate', 'greater_than', '30_percent', 1,
  'When exceptions dominate, the standard process may be wrong. Redesign before automating.',
  'What proportion of cases follow the standard path?', false, NULL, 'active')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Objections (30+)
-- ----------------------------------------------------------------

INSERT INTO engagement_objections (objection, response, category, status, content_owner, last_reviewed) VALUES
('We do not need AI.',
 'That may be completely right. VAxAI does not begin by assuming AI is the answer. We first look at the work, what is creating the pressure and whether the better response is a clearer process, better use of what you already have, human support or a carefully controlled combination. AI is one option at the end of that review — and sometimes the answer is that it is not appropriate at all.',
 'ai_concern', 'approved', 'VAxAI', '2026-06-21'),
('We tried automation and it made things worse.',
 'That is really useful to know — and it is one of the most common things we hear. When automation goes wrong it is usually because the underlying process was unclear or the exceptions were not handled. We would want to understand what you tried, what happened and what the process looked like before recommending anything. That experience is valuable information, not a reason to give up.',
 'past_bad_experience', 'approved', 'VAxAI', '2026-06-21'),
('Our data is too sensitive.',
 'Understood, and that is exactly the right concern to raise early. Sensitive data changes what is appropriate — it does not necessarily mean nothing can be done, but it does mean the controls and human oversight need to be very clear. We would start by understanding exactly what data is involved before suggesting any approach.',
 'data_concern', 'approved', 'VAxAI', '2026-06-21'),
('We are too small.',
 'Many of the organisations we work with are small or solo — that is often where administrative pressure is felt most acutely because one person is doing everything. The approaches we would discuss are designed to be proportionate. We would not suggest something that costs more in setup than it saves.',
 'size_concern', 'approved', 'VAxAI', '2026-06-21'),
('We cannot afford this.',
 'Cost is an important consideration and we would not suggest anything without understanding your budget. The first step we would suggest is a conversation to understand what is taking the most time — that is free. Some improvements cost nothing at all: a clearer process or a better-used existing tool. We only talk about investment when we understand the value.',
 'cost_concern', 'approved', 'VAxAI', '2026-06-21'),
('We already have software.',
 'That is great — the best first question is usually whether that software is being used well. Very often the capability already exists and the issue is configuration, training or process rather than a gap in the tools. We would rather help you get more from what you have than add something new.',
 'existing_tools', 'approved', 'VAxAI', '2026-06-21'),
('We need a person, not another tool.',
 'You may be absolutely right. Human VA support is a genuine and often better option for work that requires judgement, relationships, exceptions or accountability. VAxAI offers both — and sometimes the answer is entirely human support with no technology change at all.',
 'human_preference', 'approved', 'VAxAI', '2026-06-21'),
('Our processes are too complicated.',
 'Complicated processes are often a sign that the process has grown without being reviewed rather than that it is inherently complex. A process that cannot be documented clearly may not be ready for any change — but simplifying or clarifying it is itself a valuable outcome. We would start there.',
 'complexity_concern', 'approved', 'VAxAI', '2026-06-21'),
('We do not have time to implement anything.',
 'That is a genuine constraint — and often the reason the problem exists in the first place. We would look for what could be improved with minimal disruption first: a template, a process change, a shared document. If a bigger change is warranted we would sequence it so the disruption is manageable.',
 'time_concern', 'approved', 'VAxAI', '2026-06-21'),
('AI will replace our staff.',
 'VAxAI does not use AI to replace people — it uses AI to help people do the repetitive parts of their work more quickly so they can focus on the parts that require judgement and relationships. Human oversight is a designed part of every approach we recommend.',
 'ai_concern', 'approved', 'VAxAI', '2026-06-21'),
('We have tried a VA before and it did not work.',
 'That is valuable context. VA engagements fail when the scope is unclear, the handover is not documented or the VA does not have the right briefing. We would want to understand what happened and design a better structure before suggesting anything similar.',
 'past_bad_experience', 'approved', 'VAxAI', '2026-06-21'),
('Our clients would not want to interact with a bot.',
 'Client-facing automation is something we approach carefully — and for many situations a human response is the right answer. Any automated communications we might discuss would always be reviewed and approved by a person, and clearly identified as coming from your organisation. We do not recommend impersonation or bots that pretend to be human.',
 'client_concern', 'approved', 'VAxAI', '2026-06-21'),
('We are not ready for AI yet.',
 'That is a reasonable position, and many of the improvements we would talk about do not involve AI at all. Process clarity, better use of existing tools and human VA support are often the right starting points — with AI available later if it becomes appropriate.',
 'readiness', 'approved', 'VAxAI', '2026-06-21'),
('GDPR means we cannot share data with AI tools.',
 'GDPR compliance depends on what data is involved, where it is processed and what controls are in place — not a blanket prohibition on AI tools. We would always assess what data is involved before recommending any AI function, and some information should never go into third-party tools. Where AI is used, appropriate data minimisation and governance apply.',
 'data_concern', 'approved', 'VAxAI', '2026-06-21'),
('We are a charity — commercial software is not designed for us.',
 'Some is and some is not — and some general-purpose tools work well for charity administration once configured correctly. We would look at what you need to achieve and whether an existing tool can be adapted, rather than assuming you need specialist charity software in every area.',
 'sector_concern', 'approved', 'VAxAI', '2026-06-21'),
('We already have a CRM.',
 'Good — that is a starting point. The most common issue is not having a CRM but using it inconsistently or not having the right process around it. We would look at how it is being used and whether the problem is the tool or the way it is being used.',
 'existing_tools', 'approved', 'VAxAI', '2026-06-21'),
('We have a board who will need to approve any expenditure.',
 'Understood — and it is useful to know that early. We would make sure that anything we recommend comes with a clear business case and the information needed to support a board decision. We are used to working with organisations where approval takes time.',
 'governance_concern', 'approved', 'VAxAI', '2026-06-21'),
('We are regulated.',
 'Regulation is important context rather than a barrier. It affects what approaches are appropriate and what controls are required. We would always take regulatory requirements into account before recommending anything, and where a change involves regulated activity we would flag the need for specialist advice.',
 'regulatory_concern', 'approved', 'VAxAI', '2026-06-21'),
('Our team would not use it.',
 'Adoption is one of the biggest risks in any change — and it is right to name it early. We would want to understand why the concern exists: is it a confidence issue, a preference for existing ways of working, or a past experience? The answer changes the approach significantly.',
 'change_resistance', 'approved', 'VAxAI', '2026-06-21'),
('We are just about to change our systems.',
 'That is actually useful timing — understanding what the new systems can do before they go live may save significant duplication later. We would be happy to look at what is changing and whether some of the administrative improvements could be built in from the start.',
 'timing', 'approved', 'VAxAI', '2026-06-21'),
('We do not want to be reliant on a third party.',
 'Dependency is a real risk and it is right to consider it. Where we recommend tools or integrations we would always look at what happens if the tool changes, what data portability looks like and whether the organisation can operate if the tool is unavailable. Sustainability is part of the recommendation.',
 'dependency_concern', 'approved', 'VAxAI', '2026-06-21'),
('AI makes mistakes.',
 'It does — that is an accurate observation. AI is not a reliable source of facts and it can generate plausible-sounding errors. Every AI function we discuss would include a human review step and would be limited to tasks where errors are catchable before they cause harm.',
 'ai_concern', 'approved', 'VAxAI', '2026-06-21'),
('We have tried outsourcing before.',
 'That is useful to know. Outsourcing that does not work usually fails because of unclear scope, insufficient briefing or a lack of process documentation. We would want to understand what the previous experience was before making any recommendation that involves external support.',
 'past_bad_experience', 'approved', 'VAxAI', '2026-06-21'),
('We are waiting for funding.',
 'Understood. Some improvements do not require funding — process clarity and better use of existing tools are often free. We can look at what could be done now and what could be planned for when funding is in place.',
 'cost_concern', 'approved', 'VAxAI', '2026-06-21'),
('We do not want our data in the cloud.',
 'That is a consideration that affects tool selection. We would look at what your current data handling looks like, what the specific concern is and whether there are solutions that address it — some tools offer data residency options or on-premise configurations.',
 'data_concern', 'approved', 'VAxAI', '2026-06-21'),
('Our sector is different.',
 'Every sector has its own pressures, language and constraints — and we take those seriously. The principles we work from apply across sectors, but the specific recommendations are always shaped by what the organisation actually does and the context it operates in.',
 'sector_concern', 'approved', 'VAxAI', '2026-06-21'),
('We do not have anyone technical.',
 'That is exactly the kind of situation where human VA support can be the right answer — someone who can manage the technical side so your team does not have to. We would not recommend a solution that requires ongoing technical expertise your team does not have.',
 'capacity_concern', 'approved', 'VAxAI', '2026-06-21'),
('We have tried this before and it did not stick.',
 'Sustainability is a real challenge. Changes that do not stick usually lack clear ownership, documented process or ongoing support. We would look at what you tried, what got in the way and what would need to be different this time.',
 'past_bad_experience', 'approved', 'VAxAI', '2026-06-21'),
('We are not sure what we need.',
 'That is exactly the right place to start. We begin with a conversation about what is taking the most time or causing the most pressure — not with a predetermined solution. The picture becomes clearer through that conversation.',
 'uncertainty', 'approved', 'VAxAI', '2026-06-21'),
('Our volunteers would not cope with change.',
 'Volunteer capacity and confidence is an important constraint. Any change we discussed would need to be straightforward for volunteers to use and would be introduced with appropriate support. We would not recommend something that creates more burden than it removes.',
 'capacity_concern', 'approved', 'VAxAI', '2026-06-21')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Approved scripts / outreach blocks (40+)
-- ----------------------------------------------------------------

INSERT INTO engagement_scripts (title, channel, tone, audience_type, block_type, content, status, content_owner, last_reviewed) VALUES
('Cold email opener — general', 'email', 'warm_and_supportive', 'all', 'opener',
 'Subject: Reducing your admin load — a quick note from VAxAI

Hi [First name],

I wanted to reach out because [what you noticed / what prompted this] — and it made me think about the administrative side of [type of work they do].

VAxAI helps [audience type] organisations reduce the time spent on routine admin by improving processes, making better use of existing systems and — where it genuinely makes sense — introducing carefully managed automation or human support.

I am not suggesting there is necessarily a problem. But if administrative pressure is something you think about, I would be happy to have a no-pressure conversation about what is taking the most time.

Would a brief call in the next week or two be useful?

Best,
[Your name]
VAxAI | [contact details]',
 'approved', 'VAxAI', '2026-06-21'),

('LinkedIn connection note', 'linkedin', 'friendly_and_conversational', 'all', 'opener',
 'Hi [First name] — I came across [organisation/your work] and wanted to connect. I work with [sector] organisations on reducing administrative pressure. Happy to share ideas if admin is ever on your mind.',
 'approved', 'VAxAI', '2026-06-21'),

('LinkedIn follow-up after connection', 'linkedin', 'friendly_and_conversational', 'all', 'follow_up',
 'Thanks for connecting, [First name]. I work with [sector] organisations to find where administrative pressure can be reduced — whether that is a clearer process, better use of existing tools or human support to handle the repetitive parts. If it is something that resonates, I would be happy to have a brief conversation. No sales pitch — just a conversation about what is taking the most time.',
 'approved', 'VAxAI', '2026-06-21'),

('Phone call opener', 'phone', 'professional_and_structured', 'all', 'opener',
 'Hi, is that [First name]? I am [your name] from VAxAI — I hope I have caught you at a reasonable moment. [Brief reason for calling]. I wanted to have a quick conversation about [specific angle]. Is now a good moment, or would it be better to find a time that suits you?',
 'approved', 'VAxAI', '2026-06-21'),

('Voicemail note', 'phone', 'professional_and_structured', 'all', 'voicemail',
 'Hi [First name], this is [your name] from VAxAI. I am calling because [brief specific reason]. I will send a short email so you have my details, and if it is something that sounds useful, a quick call would be great. Have a good day.',
 'approved', 'VAxAI', '2026-06-21'),

('Follow-up after no reply — email 1', 'email', 'friendly_and_conversational', 'all', 'follow_up',
 'Subject: Re: Reducing your admin load

Hi [First name],

Just following up on my earlier note in case it arrived at a busy time.

If admin pressure is not something on your radar right now, I completely understand — no further contact from me unless that changes.

If it is, I am happy to have a brief conversation with no commitment. Sometimes just talking through what is taking the most time is useful on its own.

Best,
[Your name]',
 'approved', 'VAxAI', '2026-06-21'),

('Follow-up after no reply — email 2 (final)', 'email', 'concise_and_direct', 'all', 'follow_up',
 'Subject: One last note — VAxAI

Hi [First name],

I will not keep following up after this — I just wanted to leave the door open.

If the administrative side of running [type of work] is ever something you want to look at, I am easy to reach at [email] or [phone].

Thanks for your time.
[Your name] | VAxAI',
 'approved', 'VAxAI', '2026-06-21'),

('Charity opener — warm', 'email', 'mission_aware', 'Charity or non-profit', 'opener',
 'Subject: Admin pressure in the charity sector — a note from VAxAI

Hi [First name],

Running [charity name] well takes enormous effort — especially when reporting, data management, volunteer coordination and the day-to-day pull of service delivery are all happening at once.

VAxAI works with voluntary and community organisations on the administrative side of that — not to automate relationships or frontline work, but to find where process, existing tools or targeted human support could reduce the pressure on the team.

If it is something worth a brief conversation, I would be happy to find a time.

[Your name] | VAxAI',
 'approved', 'VAxAI', '2026-06-21'),

('Founder opener — practical', 'email', 'founder_to_founder', 'Founder or entrepreneur', 'opener',
 'Subject: The admin side of running [type of business]

Hi [First name],

When you are running [type of business] on your own or with a small team, administration has a way of taking up time that should be going on clients or delivery.

VAxAI works with founders and small teams to find where the administrative load can be reduced — sometimes through a clearer process, sometimes through better use of existing tools, and sometimes through a VA who can take specific tasks off your plate entirely.

If any of that sounds relevant, a brief conversation might be useful.

[Your name] | VAxAI',
 'approved', 'VAxAI', '2026-06-21'),

('Event / networking opener', 'networking', 'warm_and_supportive', 'all', 'opener',
 'Hi [First name] — I noticed you are from [organisation]. I work with [sector] organisations on the administrative side — reducing the time spent on routine processes, reporting and communications. Not a sales pitch — just something I find comes up a lot at events like this. How are things going with the admin load at the moment?',
 'approved', 'VAxAI', '2026-06-21'),

('Referral introduction', 'email', 'warm_and_supportive', 'all', 'opener',
 'Subject: Introduction from [referrer name]

Hi [First name],

[Referrer name] suggested I reach out — they thought the work VAxAI does with administrative processes might be relevant to [organisation].

VAxAI helps organisations reduce the time spent on routine admin by improving processes, making better use of existing systems and adding human or technical support where it genuinely helps.

I would be happy to have a brief conversation if [referrer]''s thinking resonates. No commitment on your side — just a conversation.

[Your name] | VAxAI',
 'approved', 'VAxAI', '2026-06-21'),

('Post-discovery call follow-up', 'email', 'professional_and_structured', 'all', 'follow_up',
 'Subject: Following up from our conversation — VAxAI

Hi [First name],

Thank you for your time today. It was really useful to understand more about [brief summary of what they shared].

As I mentioned, the areas that stood out to me were:
- [Pain point 1]
- [Pain point 2]
- [Pain point 3]

My initial thought is that [brief recommendation direction]. The next step I suggested was [agreed next step].

I will [specific action you committed to] by [date]. Please let me know if anything I noted is wrong or if priorities have changed.

[Your name] | VAxAI',
 'approved', 'VAxAI', '2026-06-21'),

('Pain point — inbox — response block', 'email', 'warm_and_supportive', 'all', 'content_block',
 'One of the things we hear most often is that the inbox has become a project management system, a filing cabinet and a to-do list all at once — and that important things are getting missed as a result. We usually start by understanding what kinds of messages arrive, who needs to act on them and whether any can be handled with clearer rules before thinking about tools.',
 'approved', 'VAxAI', '2026-06-21'),

('Pain point — reporting — response block', 'email', 'mission_aware', 'Charity or non-profit', 'content_block',
 'Reporting is one of the most time-consuming areas for charities and social enterprises — especially when data lives in multiple places. We usually start by looking at where the information currently comes from and whether standardising how it is collected would reduce the preparation time significantly.',
 'approved', 'VAxAI', '2026-06-21'),

('VAxAI plain English description — short', 'all', 'all', 'all', 'vaxai_description',
 'VAxAI looks at the whole administrative setup. We help improve the process, make better use of existing tools, introduce appropriate automation or AI where it genuinely helps, and provide human VA support where the work still needs judgement and follow-through.',
 'approved', 'VAxAI', '2026-06-21'),

('Discovery question set — inbox overload', 'all', 'all', 'all', 'discovery_questions',
 E'1. What kinds of messages take up most of the time?\n2. Who needs to see or act on them?\n3. How do you currently know whether someone has replied?\n4. Which messages need your personal judgement?\n5. Do enquiries need to be recorded anywhere else?\n6. Are there standard responses you write repeatedly?\n7. How many emails arrive in a typical day?\n8. Do multiple people share access to the inbox?',
 'approved', 'VAxAI', '2026-06-21'),

('Discovery question set — reporting', 'all', 'all', 'all', 'discovery_questions',
 E'1. Where does the information for the report currently come from?\n2. Are the same data fields collected consistently?\n3. Who checks accuracy before the report is sent?\n4. How long does each stage of the process take?\n5. How many funders or recipients require reports?\n6. Do different funders want different formats?\n7. Who is responsible for producing the report?\n8. What happens if the deadline is missed?',
 'approved', 'VAxAI', '2026-06-21'),

('Discovery question set — follow-ups', 'all', 'all', 'all', 'discovery_questions',
 E'1. Where do follow-up commitments currently get recorded?\n2. Who is responsible for following them up?\n3. What happens when someone does not respond?\n4. How predictable are the follow-up steps?\n5. Is there a standard timeframe for follow-ups?\n6. How many active follow-ups are open at any time?\n7. What has been tried already?',
 'approved', 'VAxAI', '2026-06-21'),

('Discovery question set — invoicing and payment', 'all', 'all', 'all', 'discovery_questions',
 E'1. What triggers an invoice being raised?\n2. Who is responsible for invoicing?\n3. Are invoices always for the same amount or variable?\n4. How long between completing work and sending the invoice?\n5. How do you currently know an invoice is overdue?\n6. What happens at each stage of chasing — first reminder, second, escalation?\n7. Are the same clients always late?\n8. What would an acceptable payment timeframe look like?',
 'approved', 'VAxAI', '2026-06-21'),

('Post-call summary template', 'internal', 'professional_and_structured', 'all', 'call_summary',
 E'Call summary — [Date] — [Contact name] at [Organisation]\n\nCall purpose: [Type of call]\n\nConfirmed pain points:\n- [Pain point 1]\n- [Pain point 2]\n\nDesired outcomes:\n- [Outcome 1]\n\nExisting tools and processes:\n- [Tools mentioned]\n\nRisks and constraints:\n- [Any constraints raised]\n\nVAT observations:\n- Value: [What they said about cost/time/impact]\n- Alignment: [What they said about systems/process]\n- Trust: [What they said about data/confidence]\n\nActions — VAxAI:\n1. [Action 1] by [date]\n\nActions — [Contact]:\n1. [Action 1] by [date]\n\nProposed next step: [Next step]\nSuggested follow-up date: [Date]\n\nDraft follow-up:\n[Draft email to review]',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — AI explanation', 'all', 'all', 'all', 'plain_english',
 'AI is software that can help with tasks such as drafting, summarising, sorting or finding patterns. It does not understand your organisation in the way a person does, so its work needs appropriate instructions, checks and boundaries.',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — Automation explanation', 'all', 'all', 'all', 'plain_english',
 'Automation is a set of rules that moves a routine task forward without someone repeating every step. For example, a completed form can create a record, send an acknowledgement and assign a follow-up task.',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — Integration explanation', 'all', 'all', 'all', 'plain_english',
 'An integration connects systems so information can move between them. It can stop a team retyping the same details into several places.',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — Workflow explanation', 'all', 'all', 'all', 'plain_english',
 'A workflow is the route a piece of work follows from start to finish: what triggers it, who is responsible, which information is needed and what happens next.',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — CRM explanation', 'all', 'all', 'all', 'plain_english',
 'A CRM is a shared record of organisations, contacts, conversations and next actions. It helps a team know what has happened and what needs to happen next.',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — Virtual assistance explanation', 'all', 'all', 'all', 'plain_english',
 'A VA provides real human administrative support. In VAxAI, that can include organising work, following up, checking systems, handling exceptions and keeping automations on track.',
 'approved', 'VAxAI', '2026-06-21'),

('Plain English — VAxAI explanation', 'all', 'all', 'all', 'plain_english',
 'VAxAI looks at the whole administrative setup. We help improve the process, make better use of existing tools, introduce appropriate automation or AI, and provide human support where the work still needs judgement and follow-through.',
 'approved', 'VAxAI', '2026-06-21'),

('Reassurance — technology and control', 'all', 'all', 'all', 'reassurance',
 'We always start with the process before considering any technology, and we do not recommend automation or AI where human judgement, sensitivity or accountability requires it. Everything we suggest would be reviewed and approved by you before it goes anywhere.',
 'approved', 'VAxAI', '2026-06-21'),

('Low-pressure next step — discovery call', 'all', 'all', 'all', 'cta',
 'The simplest next step would be a brief call — 20 to 30 minutes — to understand what is taking the most time. There is no commitment on your side and nothing to prepare. It is just a conversation.',
 'approved', 'VAxAI', '2026-06-21'),

('Low-pressure next step — workflow review', 'all', 'all', 'all', 'cta',
 'If it would be helpful, we could arrange a short workflow review to look at the administrative areas taking the most time. This gives you a clear picture of what is possible before any decision is made.',
 'approved', 'VAxAI', '2026-06-21'),

('Tone block — warm opening', 'all', 'warm_and_supportive', 'all', 'tone',
 'I can see how much is on your plate — and I want to make sure anything I suggest is genuinely useful rather than adding to it.',
 'approved', 'VAxAI', '2026-06-21'),

('Tone block — direct opener', 'all', 'concise_and_direct', 'all', 'tone',
 'I will be direct — the reason I am reaching out is [reason]. If it is not relevant, please say so and I will not follow up.',
 'approved', 'VAxAI', '2026-06-21'),

('Sector block — charity relevance', 'all', 'mission_aware', 'Charity or non-profit', 'sector_block',
 'Charities often manage reporting, data and communications with less administrative resource than the complexity of the work requires. VAxAI looks at where process, existing tools or targeted support could reduce that pressure without affecting frontline relationships.',
 'approved', 'VAxAI', '2026-06-21'),

('Sector block — freelancer relevance', 'all', 'founder_to_founder', 'Freelancer', 'sector_block',
 'When you are working independently, administration competes directly with the time you have for clients and delivery. VAxAI helps freelancers and consultants identify which administrative tasks could be handled differently so that more time goes where it matters.',
 'approved', 'VAxAI', '2026-06-21'),

('Sector block — founder relevance', 'all', 'founder_to_founder', 'Founder or entrepreneur', 'sector_block',
 'As a founder, you are often the contact, decision-maker and operator for every part of the business. VAxAI looks at which administrative tasks depend on you unnecessarily and finds the simplest way to change that.',
 'approved', 'VAxAI', '2026-06-21'),

('Observation block — inbox', 'all', 'warm_and_supportive', 'all', 'observation',
 'When the inbox is the primary way of managing work, enquiries and follow-up, it is very easy for things to fall through the gaps — not because of carelessness but because the inbox is simply not designed for that purpose.',
 'approved', 'VAxAI', '2026-06-21'),

('Observation block — funder reporting', 'all', 'mission_aware', 'Charity or non-profit', 'observation',
 'Funder reporting often takes far longer than it should because the data lives in different places and has to be assembled each time. The report itself is rarely the problem — it is the data collection before it.',
 'approved', 'VAxAI', '2026-06-21'),

('Observation block — founder dependency', 'all', 'founder_to_founder', 'Founder or entrepreneur', 'observation',
 'When everything flows through one person, the business is always one illness or busy period away from things stopping. It is not a reflection of how the founder is working — it is a common stage in how small businesses grow.',
 'approved', 'VAxAI', '2026-06-21'),

('Access to Work mention', 'all', 'professional_and_structured', 'all', 'compliance_block',
 'Eligible disabled professionals may be able to receive funding towards appropriate workplace support through Access to Work, subject to an individual assessment and approval. We can provide information but would not want to create any expectation about whether support would be approved or what it would cover.',
 'approved', 'VAxAI', '2026-06-21')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Pricing rules
-- ----------------------------------------------------------------

INSERT INTO engagement_pricing_rules (name, category, band_low, band_expected, band_high, unit, description, inclusions, status, internal_only, last_reviewed) VALUES
('Solo or micro-business snapshot', 'assessment', 750, 1250, 1500, 'project',
 'Workflow snapshot for a solo or micro-business (1–5 people)',
 ARRAY['Admin and workflow review','Current systems map','Pain-point analysis','VAT review','Quick wins','Prioritised recommendations'],
 'active', true, '2026-06-21'),
('Small-team workflow review', 'assessment', 1500, 2500, 3500, 'project',
 'Workflow review for a team of 2–15 people',
 ARRAY['Admin and workflow review','Current systems map','Pain-point analysis','VAT review','Quick wins','Prioritised recommendations','Implementation roadmap'],
 'active', true, '2026-06-21'),
('Multi-team or higher-complexity assessment', 'assessment', 3500, 5500, 7500, 'project',
 'Assessment for larger teams or more complex environments (16+ people or multi-department)',
 ARRAY['Admin and workflow review','Current systems map','Pain-point analysis','VAT review','Quick wins','Prioritised recommendations','Implementation roadmap','Stakeholder interviews'],
 'active', true, '2026-06-21'),
('Single low-complexity workflow implementation', 'implementation', 2500, 3750, 5000, 'project',
 'Assessment plus implementation for a single straightforward workflow',
 ARRAY['Process redesign','Configuration of existing tools','Testing','Documentation','Training','Handover'],
 'active', true, '2026-06-21'),
('Several connected workflows', 'implementation', 5000, 10000, 15000, 'project',
 'Assessment plus implementation across several connected workflows or systems',
 ARRAY['Process redesign','Configuration and integration','Automation build','Testing','Documentation','Training','Handover'],
 'active', true, '2026-06-21'),
('Complex data, integration or governance', 'implementation', 15000, 20000, 40000, 'project',
 'Complex implementation requiring significant data, integration or governance work — requires detailed scoping',
 ARRAY['Detailed scoping','Process redesign','Integration setup','Data preparation','Governance framework','Testing','Documentation','Training','Handover','Ongoing review'],
 'active', true, '2026-06-21'),
('General VA support — hourly', 'ongoing_support', 25, 30, 35, 'hour',
 'General virtual assistance — administrative support tasks',
 ARRAY['Administrative task support','Communication management','Scheduling and coordination','Document management'],
 'active', true, '2026-06-21'),
('Experienced or specialist VA — hourly', 'ongoing_support', 30, 38, 45, 'hour',
 'Experienced or specialist VA work requiring deeper knowledge or capability',
 ARRAY['Complex administrative support','System and process management','Stakeholder communications','Reporting support'],
 'active', true, '2026-06-21'),
('Automation monitoring and systems administration', 'ongoing_support', 40, 50, 60, 'hour',
 'Technical oversight of automations, integrations and systems requiring specialist capability',
 ARRAY['Automation monitoring','Error handling and resolution','System administration','Technical reporting'],
 'active', true, '2026-06-21'),
('Monthly managed support', 'ongoing_support', 500, 1500, 2500, 'month',
 'Monthly retainer for managed administrative support — scope, hours and response expectations to be agreed',
 ARRAY['Agreed hours per month','Defined response time','Regular review','Reporting'],
 'active', true, '2026-06-21')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Sources
-- ----------------------------------------------------------------

INSERT INTO engagement_sources (title, url, content_type, notes, status) VALUES
('Sage: The hidden admin burden on small businesses', 'https://www.sage.com/en-gb/company/digital-newsroom/2025/05/09/the-hidden-admin-burden-on-small-businesses/', 'research', 'Research on small-business financial administration and payment chasing. Review before citing.', 'active'),
('NCVO: How AI can help small charities', 'https://www.ncvo.org.uk/help-and-guidance/digital-technology/technology-tools-and-software/how-ai-can-help-small-charities/', 'guidance', 'NCVO guidance on AI for small charities. Review for currency.', 'active'),
('Charity Digital: Why your organisation needs an AI assistant', 'https://charitydigital.org.uk/essentials/why-your-organisation-needs-an-ai-assistant-12505', 'guidance', 'Charity Digital guidance on AI assistants and operations.', 'active'),
('Plinth: Complete guide to charity admin burden', 'https://www.plinth.org.uk/complete-guide/charity-admin-burden', 'guidance', 'Guidance on charity reporting, duplicated data and integrated systems.', 'active'),
('ICO: Electronic mail marketing guidance', 'https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/', 'legal_guidance', 'ICO guidance on PECR and electronic marketing. Subject to change — always check current version.', 'active'),
('ICO: Guide to the data protection principles', 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/', 'legal_guidance', 'ICO UK GDPR principles guidance. Subject to change — always check current version.', 'active'),
('ICO: AI and data protection', 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/', 'legal_guidance', 'ICO guidance on AI and data protection. Subject to change — always check current version.', 'active')
ON CONFLICT DO NOTHING;
