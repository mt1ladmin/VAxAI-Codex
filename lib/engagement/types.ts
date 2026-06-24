// ================================================================
// VAxAI Studio – Client Engagement module types
// ================================================================

export type EngagementOrganisation = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  audience_type: string | null;
  industry: string | null;
  charity_number: string | null;
  company_number: string | null;
  website: string | null;
  main_location: string | null;
  country: string | null;
  region: string | null;
  town_city: string | null;
  local_authority: string | null;
  postcode_area: string | null;
  delivery_preference: string | null;
  size: string | null;
  description: string | null;
  digital_maturity: string | null;
  ai_confidence: string | null;
  trust_risk_context: string | null;
  known_systems: string[] | null;
  known_pain_points: string[] | null;
  source: string | null;
  owner_email: string | null;
  status: string | null;
  tags: string[] | null;
  last_reviewed: string | null;
  notes: string | null;
};

export type EngagementContact = {
  id: string;
  created_at: string;
  updated_at: string;
  organisation_id: string | null;
  first_name: string;
  last_name: string | null;
  role: string | null;
  professional_email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  preferred_channel: string | null;
  communication_prefs: string | null;
  contact_source: string | null;
  contact_basis: string | null;
  is_suppressed: boolean;
  suppression_reason: string | null;
  do_not_contact: boolean;
  notes: string | null;
  owner_email: string | null;
  tags: string[] | null;
  // joined
  organisation?: Pick<EngagementOrganisation, 'id' | 'name' | 'industry'> | null;
};

export type OpportunityStage =
  | 'Identified'
  | 'Researching'
  | 'Ready to contact'
  | 'Contacted'
  | 'Response received'
  | 'Discovery booked'
  | 'Discovery completed'
  | 'Workflow review proposed'
  | 'Proposal sent'
  | 'Decision pending'
  | 'Won'
  | 'Onboarding'
  | 'Active client'
  | 'Nurture'
  | 'Paused'
  | 'Lost'
  | 'Not suitable';

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'Identified','Researching','Ready to contact','Contacted','Response received',
  'Discovery booked','Discovery completed','Workflow review proposed','Proposal sent',
  'Decision pending','Won','Onboarding','Active client','Nurture','Paused','Lost','Not suitable',
];

export type EngagementOpportunity = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  organisation_id: string | null;
  primary_contact_id: string | null;
  stage: OpportunityStage;
  pain_point_ids: string[] | null;
  desired_outcomes: string | null;
  vat_observations: Record<string, unknown>;
  recommended_pathway: string | null;
  indicative_value_low: number | null;
  indicative_value_high: number | null;
  probability: number | null;
  next_action: string | null;
  expected_decision_date: string | null;
  loss_pause_reason: string | null;
  owner_email: string | null;
  notes: string | null;
  enquiry_id: string | null;
  queue_id: string | null;
  // joined
  organisation?: Pick<EngagementOrganisation, 'id' | 'name'> | null;
  primary_contact?: Pick<EngagementContact, 'id' | 'first_name' | 'last_name'> | null;
};

export type EngagementInteraction = {
  id: string;
  created_at: string;
  updated_at: string;
  organisation_id: string | null;
  contact_id: string | null;
  opportunity_id: string | null;
  enquiry_id: string | null;
  interaction_date: string;
  interaction_type: string;
  channel: string | null;
  direction: string | null;
  participants: string[] | null;
  summary: string | null;
  full_notes: string | null;
  pain_point_ids: string[] | null;
  objections: string[] | null;
  commitments: string | null;
  outcome: string | null;
  follow_up_date: string | null;
  created_by: string | null;
  is_sensitive: boolean;
  // joined
  organisation?: Pick<EngagementOrganisation, 'id' | 'name'> | null;
  contact?: Pick<EngagementContact, 'id' | 'first_name' | 'last_name'> | null;
};

export type EngagementTask = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  organisation_id: string | null;
  contact_id: string | null;
  opportunity_id: string | null;
  enquiry_id: string | null;
  queue_id: string | null;
  outreach_id: string | null;
  assigned_team_member_id: string | null;
  owner_email: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  task_type: string;
  notes: string | null;
  // joined
  organisation?: Pick<EngagementOrganisation, 'id' | 'name'> | null;
  contact?: Pick<EngagementContact, 'id' | 'first_name' | 'last_name'> | null;
  opportunity?: Pick<EngagementOpportunity, 'id' | 'title' | 'stage' | 'enquiry_id' | 'queue_id'> | null;
  assignee?: Pick<{ id: string; display_name: string }, 'id' | 'display_name'> | null;
};

export type PainPoint = {
  id: string;
  created_at: string;
  updated_at: string;
  category: string;
  title: string;
  slug: string | null;
  plain_english_definition: string | null;
  what_person_says: string[] | null;
  what_this_means: string[] | null;
  what_not_assume: string[] | null;
  common_root_causes: string[] | null;
  natural_questions: string[] | null;
  process_map_prompts: string[] | null;
  information_data: string[] | null;
  risk_sensitivity: string | null;
  quick_improvements: string[] | null;
  existing_tool_opps: string[] | null;
  integration_opps: string[] | null;
  possible_automation: string[] | null;
  possible_ai: string[] | null;
  human_va_responsibilities: string[] | null;
  tasks_remain_human: string[] | null;
  measures_improvement: string[] | null;
  explanation_to_prospect: string | null;
  common_objections: string[] | null;
  relevant_sectors: string[] | null;
  related_pain_point_ids: string[] | null;
  recommendation_pathways: string[] | null;
  status: string;
  content_owner: string | null;
  last_reviewed: string | null;
  next_review: string | null;
  synonyms?: string[];
};

export type SectorProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  audience_types: string[] | null;
  description: string | null;
  common_operating_model: string | null;
  common_admin_pressures: string[] | null;
  typical_stakeholders: string[] | null;
  common_systems: string[] | null;
  common_data_types: string[] | null;
  relevant_risk_areas: string[] | null;
  starting_language: string | null;
  questions_to_explore: string[] | null;
  common_objections: string[] | null;
  relevant_pain_point_ids: string[] | null;
  potential_pathways: string[] | null;
  evidence_sources: string[] | null;
  content_owner: string | null;
  review_date: string | null;
  status: string;
};

export type VatPrompt = {
  id: string;
  category: string;
  dimension: 'value' | 'alignment' | 'trust';
  prompt: string;
  context_tags: string[] | null;
  pain_point_ids: string[] | null;
  status: string;
  sort_order: number;
};

export type RecommendationRule = {
  id: string;
  title: string;
  recommendation_type: string;
  condition_field: string | null;
  condition_operator: string | null;
  condition_value: string | null;
  priority: number;
  reason: string | null;
  evidence_needed: string | null;
  risk_gate: boolean;
  risk_gate_reason: string | null;
  status: string;
};

export type EngagementScript = {
  id: string;
  title: string;
  channel: string;
  tone: string | null;
  audience_type: string | null;
  industry: string | null;
  block_type: string | null;
  content: string;
  placeholders: unknown[];
  version: number;
  status: string;
  content_owner: string | null;
  last_reviewed: string | null;
};

export type Objection = {
  id: string;
  objection: string;
  response: string;
  category: string | null;
  tone: string | null;
  status: string;
  content_owner: string | null;
  last_reviewed: string | null;
};

export type PricingRule = {
  id: string;
  name: string;
  category: string;
  band_low: number | null;
  band_expected: number | null;
  band_high: number | null;
  unit: string;
  description: string | null;
  inclusions: string[] | null;
  factor_weights: Record<string, number>;
  status: string;
  internal_only: boolean;
  last_reviewed: string | null;
};

export type Persona = {
  id: string;
  persona_name: string;
  typical_role: string | null;
  goals: string[] | null;
  pressures: string[] | null;
  decision_responsibilities: string[] | null;
  likely_concerns: string[] | null;
  information_needed: string[] | null;
  useful_questions: string[] | null;
  language_to_avoid: string[] | null;
  preferred_detail: string | null;
  possible_channels: string[] | null;
  evidence_status: string;
  status: string;
};

export type SearchResult = {
  id: string;
  type: 'organisation' | 'contact' | 'opportunity' | 'pain_point' | 'sector' | 'script' | 'objection' | 'task';
  title: string;
  description: string | null;
  tags: string[];
  status: string;
  last_reviewed: string | null;
  quick_action?: string;
};

// Constants
export const AUDIENCE_TYPES = [
  'Small business','Charity or non-profit','Social enterprise or CIC','Freelancer',
  'Consultant','Coach or trainer','Founder or entrepreneur','Sole trader',
  'Community group','Membership organisation','Other',
];

export const INDUSTRIES = [
  'Professional services','Accountancy and finance services','Legal and compliance services',
  'Education and training','Coaching and consultancy','Health and wellbeing',
  'Social care and support services','Charity and community services','Membership and associations',
  'Creative, marketing and media','Technology and digital services','Retail and ecommerce',
  'Hospitality and events','Trades, construction and property services',
  'Recruitment and people services','Environmental and sustainability services',
  'Research and policy','Other',
];

export const ORG_SIZES = ['Solo','2–5 people','6–15 people','16–50 people','51–249 people','250+','Unknown'];

export const DIGITAL_MATURITY_LEVELS = [
  'Mostly manual','Basic digital tools but disconnected',
  'Established systems with inconsistent use','Integrated systems with gaps',
  'Highly digital and optimisation-focused','Unknown',
];

export const AI_CONFIDENCE_LEVELS = [
  'Avoiding AI','Curious but uncertain','Trying isolated tools',
  'Using AI informally','Using AI with defined processes','Advanced or governed use','Unknown',
];

export const TRUST_RISK_CONTEXTS = [
  'Low-risk routine administration','Personal data','Special-category or sensitive information',
  'Financial information','Safeguarding or vulnerable people','Regulated professional work',
  'Public-sector or funder accountability','Unknown',
];

export const DELIVERY_PREFS = ['Remote','In-person','Hybrid','Unknown'];

export const PAIN_POINT_CATEGORIES = [
  'Communications and Enquiries','Scheduling and Coordination',
  'Client, Customer, Donor or Beneficiary Journeys','Data, Records and Files',
  'Reporting and Governance','Finance and Commercial Administration',
  'Marketing and Content Operations','Team and Delivery Administration',
  'Founder, Freelancer and Consultant Administration',
];

export const RECOMMENDATION_TYPES = [
  'explore_further','process_improvement','use_existing_tools','integration',
  'automation','ai_assistance','va_support','combined_approach','human_review_required',
];

export const RECOMMENDATION_LABELS: Record<string, string> = {
  explore_further: 'Explore further',
  process_improvement: 'Process improvement first',
  use_existing_tools: 'Use existing tools better',
  integration: 'Integrate existing systems',
  automation: 'Pilot a low-risk automation',
  ai_assistance: 'Introduce AI with review controls',
  va_support: 'Add VA support',
  combined_approach: 'Combine automation and VA support',
  human_review_required: 'Human review required',
};

export const BADGE_COLORS: Record<string, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Hypothesis: 'bg-amber-100 text-amber-700',
  'Needs evidence': 'bg-orange-100 text-orange-700',
  'Human review': 'bg-red-100 text-red-700',
  Sensitive: 'bg-red-100 text-red-700',
  'Quick win': 'bg-[#f5f274] text-[#111111]',
  'Process first': 'bg-blue-100 text-blue-700',
  'Existing tool': 'bg-purple-100 text-purple-700',
  Integration: 'bg-indigo-100 text-indigo-700',
  Automation: 'bg-cyan-100 text-cyan-700',
  'AI-assisted': 'bg-violet-100 text-violet-700',
  'VA support': 'bg-[#063b32]/10 text-[#063b32]',
  approved: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  'needs review': 'bg-orange-100 text-orange-700',
  archived: 'bg-gray-100 text-gray-500',
};

export const STAGE_COLORS: Record<string, string> = {
  Identified: 'bg-gray-100 text-gray-600',
  Researching: 'bg-blue-100 text-blue-700',
  'Ready to contact': 'bg-indigo-100 text-indigo-700',
  Contacted: 'bg-violet-100 text-violet-700',
  'Response received': 'bg-purple-100 text-purple-700',
  'Discovery booked': 'bg-amber-100 text-amber-700',
  'Discovery completed': 'bg-yellow-100 text-yellow-700',
  'Workflow review proposed': 'bg-orange-100 text-orange-700',
  'Proposal sent': 'bg-cyan-100 text-cyan-700',
  'Decision pending': 'bg-teal-100 text-teal-700',
  Won: 'bg-[#063b32]/10 text-[#063b32]',
  'Onboarding planned': 'bg-teal-100 text-teal-800',
  'Contract sent': 'bg-cyan-100 text-cyan-800',
  'Invoices sent': 'bg-indigo-100 text-indigo-800',
  'Onboarding in progress': 'bg-emerald-100 text-emerald-800',
  Onboarding: 'bg-emerald-100 text-emerald-700',
  'Active client': 'bg-green-100 text-green-700',
  Nurture: 'bg-sky-100 text-sky-700',
  Paused: 'bg-slate-100 text-slate-600',
  Lost: 'bg-red-100 text-red-600',
  'Not suitable': 'bg-gray-100 text-gray-500',
};

// ================================================================
// New types: Prospect Imports, Queue, Knowledge Drafts
// ================================================================

export type ProspectImportBatch = {
  id: string;
  created_at: string;
  updated_at: string;
  filename: string;
  original_csv: string;
  column_mapping: Record<string, string> | null;
  row_count: number | null;
  imported_count: number;
  status: 'pending' | 'reviewing' | 'imported' | 'failed';
  notes: string | null;
  created_by: string | null;
};

export type ProspectQueueEntry = {
  id: string;
  created_at: string;
  updated_at: string;
  import_batch_id: string | null;
  organisation_id: string | null;
  contact_id: string | null;
  raw_org_name: string | null;
  raw_contact_name: string | null;
  raw_email: string | null;
  raw_phone: string | null;
  raw_website: string | null;
  raw_industry: string | null;
  raw_location: string | null;
  raw_linkedin: string | null;
  raw_notes: string | null;
  status: string;
  last_action: string | null;
  last_action_date: string | null;
  next_action: string | null;
  next_action_date: string | null;
  duplicate_of_org_id: string | null;
  duplicate_warning: string | null;
  previous_contact_warning: string | null;
  owner_email: string | null;
  tags: string[] | null;
  outreach_id: string | null;
  outreach_snapshot: Record<string, unknown> | null;
  // joined
  organisation?: Pick<EngagementOrganisation, 'id' | 'name' | 'industry'> | null;
  contact?: Pick<EngagementContact, 'id' | 'first_name' | 'last_name' | 'professional_email'> | null;
};

export type KnowledgeDraft = {
  id: string;
  created_at: string;
  updated_at: string;
  source_phrase: string | null;
  source_call_id: string | null;
  source_org_id: string | null;
  category: string | null;
  title: string;
  plain_english_definition: string | null;
  what_person_says: string[] | null;
  what_this_means: string[] | null;
  what_not_assume: string[] | null;
  common_root_causes: string[] | null;
  natural_questions: string[] | null;
  possible_automation: string[] | null;
  possible_ai: string[] | null;
  human_va_responsibilities: string[] | null;
  recommendation_pathways: string[] | null;
  related_pain_point_ids: string[] | null;
  tags: string[] | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'merged';
  reviewer_notes: string | null;
  merged_into_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_by: string | null;
};

export const PROSPECT_QUEUE_STATUSES = [
  'Needs review', 'Ready to contact', 'Contact planned', 'Contact attempted',
  'No response', 'Conversation held', 'Follow-up required', 'Opportunity',
  'Not suitable', 'Do not contact', 'Closed',
] as const;

export const PROSPECT_QUEUE_STATUS_COLORS: Record<string, string> = {
  'Needs review': 'bg-amber-100 text-amber-700',
  'Ready to contact': 'bg-blue-100 text-blue-700',
  'Contact planned': 'bg-indigo-100 text-indigo-700',
  'Contact attempted': 'bg-violet-100 text-violet-700',
  'No response': 'bg-slate-100 text-slate-600',
  'Conversation held': 'bg-emerald-100 text-emerald-700',
  'Follow-up required': 'bg-orange-100 text-orange-700',
  'Opportunity': 'bg-[#063b32]/10 text-[#063b32]',
  'Not suitable': 'bg-gray-100 text-gray-500',
  'Do not contact': 'bg-red-100 text-red-600',
  'Closed': 'bg-gray-100 text-gray-500',
};

export type CallPreparationCard = {
  what_we_know?: string[];
  to_confirm?: string[];
  previous_engagement_summary?: string;
  sector_considerations?: string[];
  pain_points_to_explore?: Array<{ title: string; why: string; caution?: string }>;
  discovery_questions?: string[];
  suggested_opening?: string;
  key_cautions?: string[];
};
