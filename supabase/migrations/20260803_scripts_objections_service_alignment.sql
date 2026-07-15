-- ================================================================
-- Knowledge Hub: Scripts & Blocks + Objections
-- Align copy with current VAxAI services:
-- free Admin Review → backlog recovery → AI & automation readiness
-- (groundwork, not selling AI) → ongoing admin support → maintain & improve
-- Prepare / Support / Maintain · human-led · quote after understanding work
-- ================================================================

-- ----------------------------------------------------------------
-- OBJECTIONS
-- ----------------------------------------------------------------
UPDATE engagement_objections SET
  response = CASE objection
    WHEN 'We do not need AI.' THEN
      'That may be completely right. VAxAI does not sell AI products and does not begin by assuming AI is the answer. We start with a free Admin Review of your administrative operations, then recommend the right mix of backlog recovery, clearer processes, human VA support, and — only where it fits — preparation so any tools you already use can work properly. Sometimes the honest recommendation is no AI at all.'
    WHEN 'We tried automation and it made things worse.' THEN
      'That is common, and useful to know. Automation usually fails when information is disorganised, processes are unclear, or exceptions have no owner. Our AI and automation readiness work is about that groundwork first — organising documents and data, documenting how work runs — before anyone switches more tools on. We can also help maintain systems so problems do not quietly return.'
    WHEN 'Our data is too sensitive.' THEN
      'Understood, and right to raise early. VAxAI is human-led operational admin support with people in the loop. We start by understanding what information you hold and what must stay controlled. We organise and separate what tools should never touch, and we do not recommend putting sensitive material into systems that are not appropriate for it.'
    WHEN 'We are too small.' THEN
      'Many of the organisations we support are founders, small teams and charities without a large operations function — that is often where admin pressure is sharpest. Support is scoped to what you actually need: a free Admin Review first, then project work or flexible monthly ongoing support, quoted after we understand the work.'
    WHEN 'We cannot afford this.' THEN
      'We do not publish fixed prices because every organisation''s admin is different. The first step is free: an Admin Review or conversation to see where pressure is building. Some improvements are process or better use of tools you already have. If further work makes sense, we quote after we understand the scope and the right person to deliver it.'
    WHEN 'We already have software.' THEN
      'Good — we prefer improving what you already have over selling new systems. VAxAI is not a software product. We look at whether tools are configured and used well, whether information is organised enough for them to help, and whether a person needs to own the routine admin and checking that technology still leaves behind.'
    WHEN 'We need a person, not another tool.' THEN
      'That is often exactly right. Ongoing admin support from matched freelancers is a core VAxAI service: inbox, diary, records, follow-ups and the judgement work that should stay human. We handle matching, coordination and quality review so you receive reliable people who get on with the work — not another platform to learn.'
    WHEN 'Our processes are too complicated.' THEN
      'Complicated processes often grew without review rather than being inherently complex. Backlog recovery and process documentation are part of how we prepare organisations for calmer day-to-day work and for any later automation. We start with a free Admin Review so recommendations stay proportionate.'
    WHEN 'We do not have time to implement anything.' THEN
      'That constraint is often why the backlog exists. We provide dedicated capacity so preparation does not compete with business as usual: clearing outstanding work, organising information, and taking routine admin off your plate. We always test on a small scale before larger project work, with costs agreed first.'
    WHEN 'AI will replace our staff.' THEN
      'VAxAI does not replace your people with AI. We clear admin backlogs, organise information, provide ongoing human support and maintain improvements so your team can focus on the work only they can do. Where AI or automation is used, human oversight is designed in — and we never require AI to work with us.'
    WHEN 'We have tried a VA before and it did not work.' THEN
      'VA work fails when scope, briefing and quality coordination are weak. VAxAI matches freelancers carefully, handles onboarding and coordination, and reviews work quality — including checking AI-assisted outputs where clients use them — so support is structured rather than ad hoc.'
    WHEN 'Our clients would not want to interact with a bot.' THEN
      'Client-facing automation is something we approach carefully. Much of our work is human admin support and human review of anything that goes out under your name. We do not recommend bots that pretend to be people. Any automation would be limited, approved by you, and appropriate to how your organisation already works.'
    WHEN 'We are not ready for AI yet.' THEN
      'That is a reasonable position. Much of what we deliver does not involve AI: backlog recovery, ongoing admin support, and maintain-and-improve reviews. AI and automation readiness is optional groundwork — organised information and clear processes — so tools can work later if you choose them. We never require AI to work with us.'
    WHEN 'GDPR means we cannot share data with AI tools.' THEN
      'GDPR depends on what data is involved, where it is processed and what controls apply — not a blanket ban on tools. We assess information handling before recommending any AI use, keep sensitive material out of tools that should not see it, and keep people accountable for outputs. Preferring existing trusted tools is part of how we work.'
    WHEN 'We are a charity — commercial software is not designed for us.' THEN
      'We work with charities on funder reporting, volunteer and case admin, records and safeguarding-aware information handling. We start with a free Admin Review, clear backlogs, organise information safely, and provide reliable human capacity — not a product pitch. Recommendations stay proportionate to delivery budgets and trust obligations.'
    WHEN 'We already have a CRM.' THEN
      'Good — that is a starting point. The usual issue is inconsistent use, incomplete records or no one owning the admin around it. We help clear CRM and document backlogs, keep records current, and provide ongoing capacity so the system supports the work rather than becoming another pile.'
    WHEN 'We have a board who will need to approve any expenditure.' THEN
      'Useful to know early. We start with a free Admin Review so the picture is clear before any paid work. Further support is scoped and quoted before it begins, with enough plain-English rationale for board decisions. We are used to approval timelines.'
    WHEN 'We are regulated.' THEN
      'Regulation shapes what is appropriate; it is not a reason to ignore admin pressure. We work within your procedures and information-handling requirements, especially for public sector and regulated contexts. Complex or enterprise builds go to trusted external partners — we prepare foundations and provide human operational support.'
    WHEN 'Our team would not use it.' THEN
      'Adoption risk is real. We favour improving existing ways of working and providing human support rather than forcing new tools. Any process or automation change is introduced carefully, with people in the loop, so it reduces burden rather than adding training debt.'
    WHEN 'We are just about to change our systems.' THEN
      'Useful timing. Preparing information and processes before a systems change — backlog clearing, data hygiene, documented workflows — often saves rework later. We can support that groundwork alongside business as usual so transformation does not land on disorganised foundations.'
    WHEN 'We do not want to be reliant on a third party.' THEN
      'Dependency should be designed carefully. We document how work runs, prefer tools you already own, and aim for support that strengthens your team''s control rather than locking you into opaque systems. Ongoing retainers can scale up or down; you stay in charge of decisions.'
    WHEN 'AI makes mistakes.' THEN
      'It does. That is why VAxAI keeps people in the loop. We prepare information so tools have something reliable to work from, and ongoing support includes human checking of AI-assisted work before it goes out. We only recommend AI where errors are catchable and the approach fits Value, Alignment and Trust.'
    WHEN 'We have tried outsourcing before.' THEN
      'Outsourcing fails without clear scope, briefing and quality standards. VAxAI coordinates freelance partners, matches specialisms to the work, and reviews delivery — for project backlog clearing, AI readiness groundwork, ongoing admin and maintenance — so external capacity is managed properly.'
    WHEN 'We are waiting for funding.' THEN
      'Understood. A free Admin Review can still clarify priorities. Some improvements are process-only. Paid project or monthly support can be timed to funding, with quotes agreed before work begins so there are no surprises.'
    WHEN 'We do not want our data in the cloud.' THEN
      'That affects tool choices, not whether admin pressure can be reduced. We work with your existing systems and constraints, organise information carefully, and do not push cloud AI where it is inappropriate. Human VA support can operate within the tools and access model you already trust.'
    WHEN 'Our sector is different.' THEN
      'We support founders, SMEs, charities and public sector organisations with the same service spine — backlog recovery, AI readiness groundwork, ongoing admin, maintain and improve — shaped to your context, language and compliance needs. Recommendations always follow how you actually work.'
    WHEN 'We do not have anyone technical.' THEN
      'You do not need a technical team to work with us. We provide human operational capacity and practical process support. We do not sell complex AI builds; where specialist technical work is needed we can identify trusted partners. Day to day, freelancers and coordination sit with VAxAI.'
    WHEN 'We have tried this before and it did not stick.' THEN
      'Improvements slip without ownership and maintenance. That is why Maintain and improve is a core service: regular admin reviews, data hygiene and watching automations so backlogs and broken processes do not quietly return after a one-off clear-up.'
    WHEN 'We are not sure what we need.' THEN
      'That is the right place to start. The free Admin Review looks at where pressure is building across backlog, information and day-to-day admin, then recommends honestly — including if we are not the right fit. Paid work is only scoped and quoted after that picture is clear.'
    WHEN 'Our volunteers would not cope with change.' THEN
      'Volunteer capacity matters. We favour simple process improvements and reliable human admin support over heavy new tools. Anything introduced should reduce burden on volunteers and staff, with clear handovers and ongoing maintenance so change does not create more work than it removes.'
    ELSE response
  END,
  last_reviewed = '2026-07-15',
  content_owner = COALESCE(content_owner, 'VAxAI')
WHERE status IS DISTINCT FROM 'archived';

-- ----------------------------------------------------------------
-- SCRIPTS & BLOCKS (key public-facing and core blocks)
-- ----------------------------------------------------------------
UPDATE engagement_scripts SET
  content = CASE title
    WHEN 'Cold email opener — general' THEN
      'Subject: Reducing your admin load — a quick note from VAxAI

Hi [First name],

I wanted to reach out because [what you noticed / what prompted this] — and it made me think about the administrative side of [type of work they do].

VAxAI helps [audience type] organisations clear admin backlogs, prepare information and processes so AI and automation can work if you choose them, keep essential admin moving with human support, and maintain improvements so pressure does not return. We are human-led and we do not sell AI products.

We usually start with a free Admin Review — no obligation — so recommendations stay practical. We quote only after we understand the work.

Would a brief call in the next week or two be useful?

Best,
[Your name]
VAxAI | [contact details]'

    WHEN 'LinkedIn connection note' THEN
      'Hi [First name] — I came across [organisation/your work] and wanted to connect. I work with [sector] organisations on admin foundations: backlog recovery, AI readiness groundwork, ongoing human support and keeping improvements working. Happy to share ideas if admin pressure is ever on your mind.'

    WHEN 'LinkedIn follow-up after connection' THEN
      'Thanks for connecting, [First name]. VAxAI supports [sector] organisations with backlog recovery, preparing information for AI and automation (without selling tools), ongoing admin capacity, and maintenance so problems do not return. We usually start with a free Admin Review. If that resonates, a brief conversation about what is taking the most time would be welcome — no sales pitch.'

    WHEN 'Follow-up after no reply — email 1' THEN
      'Subject: Re: Reducing your admin load

Hi [First name],

Just following up on my earlier note in case it arrived at a busy time.

If admin pressure is not on your radar right now, I completely understand — no further contact from me unless that changes.

If it is, I am happy to offer a free Admin Review or a short conversation with no commitment. Sometimes talking through backlog, day-to-day admin and systems is useful on its own.

Best,
[Your name]
VAxAI'

    WHEN 'Follow-up after no reply — email 2 (final)' THEN
      'Subject: One last note — VAxAI

Hi [First name],

I will not keep following up after this — I just wanted to leave the door open.

If clearing admin backlogs, preparing for AI and automation, or getting reliable ongoing admin support is ever useful for [type of work], I am easy to reach at [email] or [phone].

Thanks for your time.
[Your name] | VAxAI'

    WHEN 'Charity opener — warm' THEN
      'Subject: Admin pressure in the charity sector — a note from VAxAI

Hi [First name],

Running [charity name] well takes enormous effort — especially when reporting, records, volunteer coordination and service delivery all compete for the same capacity.

VAxAI works with charities on the administrative side: clearing backlogs, organising information safely, providing reliable human admin support, and maintaining systems so pressure does not return. We do not sell AI products; we prepare foundations and keep people in the loop.

We usually start with a free Admin Review. If a brief conversation would help, I would be glad to find a time.

[Your name] | VAxAI'

    WHEN 'Founder opener — practical' THEN
      'Subject: The admin side of running [type of business]

Hi [First name],

When you run [type of business] alone or with a small team, admin has a way of taking time that should go on clients and growth.

VAxAI helps founders clear backlogs, organise information, keep day-to-day admin moving with matched freelance support, and prepare for AI or automation only where it fits how you already work. We start with a free Admin Review and quote once we understand what you need.

If that sounds relevant, a brief conversation might be useful.

[Your name] | VAxAI'

    WHEN 'Event / networking opener' THEN
      'Hi [First name] — I noticed you are from [organisation]. I work with [sector] organisations on practical admin foundations: clearing backlogs, organising information for AI readiness, ongoing human support and keeping improvements working. Not a product pitch — just something that comes up a lot at events like this. How is the admin load at the moment?'

    WHEN 'Referral introduction' THEN
      'Subject: Introduction from [referrer name]

Hi [First name],

[Referrer name] suggested I reach out — they thought VAxAI''s operational admin support might be relevant to [organisation].

VAxAI helps organisations clear admin backlogs, prepare information and processes for AI and automation without selling tools, provide ongoing human VA support, and maintain improvements over time. We start with a free Admin Review.

Happy to have a brief conversation if that resonates. No commitment on your side.

[Your name] | VAxAI'

    WHEN 'Post-discovery call follow-up' THEN
      'Subject: Following up from our conversation — VAxAI

Hi [First name],

Thank you for your time today. It was useful to understand more about [brief summary of what they shared].

The areas that stood out were:
- [Pain point 1 — e.g. backlog / information / day-to-day admin / maintenance]
- [Pain point 2]
- [Pain point 3]

My initial view is that [direction: free Admin Review findings / backlog recovery / AI readiness groundwork / ongoing support / maintain and improve]. The next step I suggested was [agreed next step]. Any further work would be scoped and quoted before it begins.

I will [specific action] by [date]. Please tell me if anything I noted is wrong or if priorities have changed.

[Your name] | VAxAI'

    WHEN 'Pain point — inbox — response block' THEN
      'One of the things we hear most often is that the inbox has become a project system, a filing cabinet and a to-do list at once — and important things get missed. Ongoing admin support can take ownership of triage and routine replies, while backlog recovery clears what has already piled up. We start by understanding what arrives, who must act, and what should stay human.'

    WHEN 'Pain point — reporting — response block' THEN
      'Reporting often takes too long because data lives in different places and has to be rebuilt each cycle. We help clear reporting and records backlogs, organise information so figures are trustworthy, and provide ongoing capacity for collection and checking — with human oversight, especially where funders or boards are involved.'

    WHEN 'VAxAI plain English description — short' THEN
      'VAxAI is human-led operational admin support and AI readiness. We clear backlogs, organise information and processes so AI and automation can work if you choose them, provide ongoing VA capacity, and maintain improvements so problems do not return. We start with a free Admin Review. We do not sell AI products.'

    WHEN 'Plain English — Virtual assistance explanation' THEN
      'A VA provides real human administrative support. In VAxAI, freelancers help with backlog clearing, day-to-day admin, checking AI-assisted work where clients use tools, and keeping systems maintained — matched, coordinated and quality-reviewed by us.'

    WHEN 'Plain English — VAxAI explanation' THEN
      'VAxAI helps organisations regain control of everyday administration. Four connected services: backlog recovery, AI and automation readiness (groundwork, not tool sales), ongoing admin support, and maintain and improve. Journey: Prepare, Support, Maintain. Free Admin Review first; costs agreed before paid work.'

    WHEN 'Reassurance — technology and control' THEN
      'We start with administration and process before technology. We do not sell AI, and we do not recommend automation where judgement, sensitivity or accountability need a person. Anything involving tools is checked against how you already work and what you trust. You approve approaches before they go live.'

    WHEN 'Low-pressure next step — discovery call' THEN
      'The simplest next step is a brief call — 20 to 30 minutes — or a free Admin Review of your administrative operations. There is no commitment and nothing you must prepare. It is a conversation about where pressure is building and what would help.'

    WHEN 'Low-pressure next step — workflow review' THEN
      'If useful, we can start with a free Admin Review of the administrative areas taking the most time — backlog, information, day-to-day load and maintenance. That gives a clear picture of options before any decision or quote.'

    WHEN 'Sector block — charity relevance' THEN
      'Charities often carry reporting, records, volunteer coordination and communications with limited admin capacity. VAxAI clears backlogs, organises information with safeguarding and trust in mind, provides reliable human support, and maintains systems so delivery capacity is protected — without selling AI products.'

    WHEN 'Sector block — freelancer relevance' THEN
      'When you work independently, admin competes with client time. VAxAI helps freelancers and consultants clear backlogs, keep day-to-day systems moving with matched support, and prepare information for tools only where useful — starting with a free Admin Review.'

    WHEN 'Sector block — founder relevance' THEN
      'As a founder you are often contact, decision-maker and operator at once. VAxAI clears the admin backlog, organises information, provides flexible ongoing support and helps keep improvements working so growth is not limited by the pile behind the scenes.'

    WHEN 'Access to Work mention' THEN
      'Eligible disabled professionals may be able to receive funding towards appropriate workplace support through Access to Work, subject to individual assessment and approval. We can share information about how our support works; we cannot guarantee approval or what any award would cover.'

    ELSE content
  END,
  last_reviewed = '2026-07-15',
  content_owner = COALESCE(content_owner, 'VAxAI')
WHERE status IS DISTINCT FROM 'archived'
  AND title IN (
    'Cold email opener — general',
    'LinkedIn connection note',
    'LinkedIn follow-up after connection',
    'Follow-up after no reply — email 1',
    'Follow-up after no reply — email 2 (final)',
    'Charity opener — warm',
    'Founder opener — practical',
    'Event / networking opener',
    'Referral introduction',
    'Post-discovery call follow-up',
    'Pain point — inbox — response block',
    'Pain point — reporting — response block',
    'VAxAI plain English description — short',
    'Plain English — Virtual assistance explanation',
    'Plain English — VAxAI explanation',
    'Reassurance — technology and control',
    'Low-pressure next step — discovery call',
    'Low-pressure next step — workflow review',
    'Sector block — charity relevance',
    'Sector block — freelancer relevance',
    'Sector block — founder relevance',
    'Access to Work mention'
  );

-- Soft cleanup on remaining scripts that still sound like we sell automation as the product
UPDATE engagement_scripts SET
  content = replace(
    content,
    'introducing carefully managed automation or human support',
    'providing human VA support and AI readiness groundwork where it fits'
  ),
  last_reviewed = '2026-07-15'
WHERE content ILIKE '%introducing carefully managed automation or human support%';

UPDATE engagement_scripts SET
  content = replace(
    content,
    'introduce appropriate automation or AI where it genuinely helps',
    'prepare foundations for AI and automation where appropriate, without selling tools'
  ),
  last_reviewed = '2026-07-15'
WHERE content ILIKE '%introduce appropriate automation or AI where it genuinely helps%';

UPDATE engagement_scripts SET
  content = replace(
    content,
    'introduce appropriate automation or AI, and provide human support',
    'prepare for AI and automation where appropriate, and provide human support'
  ),
  last_reviewed = '2026-07-15'
WHERE content ILIKE '%introduce appropriate automation or AI, and provide human support%';
