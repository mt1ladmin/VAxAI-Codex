import type { ProspectOutreachRecord } from "./types";
import type { ProspectQueueEntry } from "@/lib/engagement/types";

export function outreachFromQueueEntry(entry: ProspectQueueEntry): ProspectOutreachRecord | null {
  const snap = entry.outreach_snapshot;
  if (snap && typeof snap === "object" && "organisation_name" in snap) {
    return snap as unknown as ProspectOutreachRecord;
  }
  if (!entry.raw_org_name && !entry.raw_contact_name) return null;
  const [location = "", region = ""] = (entry.raw_location || "").split(",").map((s) => s.trim());
  return {
    id: entry.outreach_id || entry.id,
    organisation_name: entry.raw_org_name || "Unknown organisation",
    organisation_type: "Charity",
    location: location || entry.raw_location || "",
    region: region || "East of England (other)",
    website: entry.raw_website || "",
    employees: null,
    annual_revenue_gbp: null,
    revenue_basis: "",
    need_score: 3,
    need_rationale: entry.raw_notes || "",
    decision_maker_name: (entry.raw_contact_name || "").split(" — ")[0] || "",
    decision_maker_role: (entry.raw_contact_name || "").split(" — ")[1] || "",
    email: entry.raw_email || "",
    phone: entry.raw_phone || "",
    financial_source_url: "",
    contact_source_url: entry.raw_website || "",
    data_confidence: "Medium",
    sector_tags: entry.raw_industry ? [entry.raw_industry] : [],
    pain_point_tags: [],
    engagement_approach: "",
    research_date: entry.created_at.split("T")[0],
    priority_region: "primary",
  };
}