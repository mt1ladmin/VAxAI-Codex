import type { CustomCard, ProspectCallContext } from "./call-context";
import type { Persona, SectorProfile } from "./types";

type EnquiryRecord = {
  id: string;
  name: string;
  email: string;
  telephone: string | null;
  support_type: string;
  preferred_contact: string;
  details: string;
  wants_discovery_call: boolean;
  admin_notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  contact_id: string | null;
  organisation_id: string | null;
  sector_snapshot: SectorProfile | null;
  persona_snapshot: Persona | null;
};

type QueueRecord = {
  id: string;
  raw_org_name: string | null;
  raw_contact_name: string | null;
  raw_email: string | null;
  raw_phone: string | null;
  raw_website: string | null;
  raw_industry: string | null;
  raw_location: string | null;
  raw_linkedin: string | null;
  raw_notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  contact_id: string | null;
  organisation_id: string | null;
  organisation?: { id: string; name: string; industry: string | null } | null;
  contact?: { id: string; first_name: string; last_name: string | null; professional_email: string | null } | null;
};

type OpportunityRecord = {
  id: string;
  title: string;
  stage: string;
  next_action: string | null;
  expected_decision_date: string | null;
  notes: string | null;
  enquiry_id: string | null;
  queue_id: string | null;
  organisation_id: string | null;
  primary_contact_id: string | null;
  organisation?: { id: string; name: string } | null;
  primary_contact?: { id: string; first_name: string; last_name: string | null } | null;
};

export function buildEnquiryCallContext(enquiry: EnquiryRecord, opportunityId?: string | null): ProspectCallContext {
  const submissionCard: CustomCard = {
    id: "enquiry-submission",
    title: "Website submission",
    content: [
      `Query type: ${enquiry.support_type}`,
      `Preferred contact: ${enquiry.preferred_contact || "—"}`,
      `Discovery call requested: ${enquiry.wants_discovery_call ? "Yes" : "No"}`,
      "",
      enquiry.details,
    ].join("\n"),
  };
  return {
    sourceType: "enquiry",
    sourceId: enquiry.id,
    enquiryId: enquiry.id,
    opportunityId: opportunityId || null,
    contactId: enquiry.contact_id,
    organisationId: enquiry.organisation_id,
    queueId: `enquiry-${enquiry.id}`,
    orgName: enquiry.name,
    contactName: enquiry.name,
    email: enquiry.email,
    phone: enquiry.telephone,
    website: null,
    industry: enquiry.sector_snapshot?.name || null,
    location: null,
    linkedin: null,
    notes: enquiry.admin_notes || enquiry.details,
    nextAction: enquiry.next_action,
    nextActionDate: enquiry.next_action_date,
    sector: enquiry.sector_snapshot,
    persona: enquiry.persona_snapshot,
    aiPrepCards: [],
    prospectPreps: [],
    customCards: [submissionCard],
  };
}

export function buildQueueCallContext(entry: QueueRecord, opportunityId?: string | null): ProspectCallContext {
  const orgName = entry.organisation?.name || entry.raw_org_name || "Unknown organisation";
  const contactName = entry.contact
    ? `${entry.contact.first_name} ${entry.contact.last_name || ""}`.trim()
    : entry.raw_contact_name || null;
  const prospectCard: CustomCard = {
    id: "queue-prospect",
    title: "Prospect details",
    content: [
      `Organisation: ${orgName}`,
      entry.raw_industry ? `Industry: ${entry.raw_industry}` : null,
      entry.raw_location ? `Location: ${entry.raw_location}` : null,
      entry.raw_website ? `Website: ${entry.raw_website}` : null,
      "",
      entry.raw_notes || "",
    ].filter((line) => line !== null).join("\n"),
  };
  return {
    sourceType: "queue",
    sourceId: entry.id,
    contactId: entry.contact_id,
    organisationId: entry.organisation_id,
    queueId: entry.id,
    opportunityId: opportunityId || null,
    orgName,
    contactName,
    email: entry.contact?.professional_email || entry.raw_email || null,
    phone: entry.raw_phone || null,
    website: entry.raw_website || null,
    industry: entry.raw_industry || entry.organisation?.industry || null,
    location: entry.raw_location || null,
    linkedin: entry.raw_linkedin || null,
    notes: entry.raw_notes || null,
    nextAction: entry.next_action,
    nextActionDate: entry.next_action_date,
    aiPrepCards: [],
    prospectPreps: [],
    customCards: [prospectCard],
  };
}

export function buildOpportunityCallContext(opp: OpportunityRecord): ProspectCallContext {
  const contactName = opp.primary_contact
    ? `${opp.primary_contact.first_name} ${opp.primary_contact.last_name || ""}`.trim()
    : null;
  return {
    sourceType: "opportunity",
    sourceId: opp.id,
    opportunityId: opp.id,
    enquiryId: opp.enquiry_id,
    queueId: opp.queue_id || `opportunity-${opp.id}`,
    contactId: opp.primary_contact_id,
    organisationId: opp.organisation_id,
    orgName: opp.organisation?.name || opp.title,
    contactName,
    email: null,
    phone: null,
    website: null,
    industry: null,
    location: null,
    linkedin: null,
    notes: opp.notes,
    nextAction: opp.next_action,
    nextActionDate: opp.expected_decision_date,
    aiPrepCards: [],
    prospectPreps: [],
    customCards: [{
      id: "opportunity-summary",
      title: "Opportunity",
      content: [`Title: ${opp.title}`, `Stage: ${opp.stage}`, `Next action: ${opp.next_action || "—"}`].join("\n"),
    }],
  };
}

export function persistCallContext(ctx: ProspectCallContext) {
  sessionStorage.setItem("prospectCallContext", JSON.stringify(ctx));
  if (ctx.prospectPreps?.length) {
    sessionStorage.setItem("currentProspectPreps", JSON.stringify(ctx.prospectPreps));
  } else {
    sessionStorage.removeItem("currentProspectPreps");
  }
}

export function clearPersistedCallContext() {
  sessionStorage.removeItem("prospectCallContext");
  sessionStorage.removeItem("currentProspectPreps");
}