import type { Persona, SectorProfile } from "./types";
import type { ProspectPrepClient } from "./prospect-prep";

export type PrepCard = {
  id: string;
  what_we_know: string[];
  to_confirm: string[];
  previous_engagement_summary: string;
  sector_considerations: string[];
  pain_points_to_explore: Array<{ title: string; why: string; caution: string }>;
  discovery_questions: string[];
  suggested_opening: string;
  key_cautions: string[];
};

export type CustomCard = { id: string; title: string; content: string };

export type ProspectCallContext = {
  sourceType: "enquiry" | "queue" | "contact" | "opportunity";
  sourceId: string;
  enquiryId?: string | null;
  opportunityId?: string | null;
  contactId?: string | null;
  organisationId?: string | null;
  queueId: string;
  orgName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  linkedin: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  sector?: SectorProfile | null;
  persona?: Persona | null;
  aiPrepCards: PrepCard[];
  prospectPreps: ProspectPrepClient[];
  customCards: CustomCard[];
};

export type CallAssistChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};