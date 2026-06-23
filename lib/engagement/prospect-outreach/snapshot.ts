import type { ProspectOutreachRecord } from "./types";

export function mergeProspectRecord(
  base: ProspectOutreachRecord,
  overrides: Partial<ProspectOutreachRecord> | Record<string, unknown> | null | undefined,
): ProspectOutreachRecord {
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const merged = { ...base, ...overrides, id: base.id };
  if (Array.isArray(overrides.sector_tags)) merged.sector_tags = overrides.sector_tags as string[];
  if (Array.isArray(overrides.pain_point_tags)) {
    merged.pain_point_tags = overrides.pain_point_tags as string[];
  }
  return merged;
}

export function snapshotToQueueFields(snapshot: ProspectOutreachRecord) {
  const contactName = [snapshot.decision_maker_name, snapshot.decision_maker_role]
    .filter(Boolean)
    .join(" — ");

  return {
    outreach_id: snapshot.id,
    outreach_snapshot: snapshot,
    raw_org_name: snapshot.organisation_name,
    raw_contact_name: contactName || null,
    raw_email: snapshot.email || null,
    raw_phone: snapshot.phone || null,
    raw_website: snapshot.website || null,
    raw_industry: snapshot.sector_tags[0] || snapshot.organisation_type,
    raw_location: `${snapshot.location}, ${snapshot.region}`,
    raw_notes: null,
    status: "Ready to contact",
    tags: [
      "prospect-outreach",
      snapshot.region,
      `need-${snapshot.need_score}`,
      ...snapshot.sector_tags.slice(0, 2),
    ].filter(Boolean),
  };
}

export function syncQueueFromSnapshot(
  snapshot: ProspectOutreachRecord,
  existing?: { raw_notes?: string | null },
) {
  const fields = snapshotToQueueFields(snapshot);
  return {
    ...fields,
    raw_notes: existing?.raw_notes ?? null,
  };
}

export function outreachSummaryForConversion(snapshot: ProspectOutreachRecord): string {
  return [
    `Need score: ${snapshot.need_score}/5`,
    snapshot.need_rationale,
    snapshot.engagement_approach ? `Approach: ${snapshot.engagement_approach}` : "",
    snapshot.employees ? `Employees: ${snapshot.employees}` : "",
    snapshot.annual_revenue_gbp
      ? `Revenue: £${snapshot.annual_revenue_gbp.toLocaleString("en-GB")}`
      : "",
    snapshot.revenue_basis ? `Revenue basis: ${snapshot.revenue_basis}` : "",
    snapshot.sector_tags.length ? `Sectors: ${snapshot.sector_tags.join(", ")}` : "",
    snapshot.pain_point_tags.length ? `Pain points: ${snapshot.pain_point_tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatRevenue(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  return `£${n.toLocaleString("en-GB")}`;
}