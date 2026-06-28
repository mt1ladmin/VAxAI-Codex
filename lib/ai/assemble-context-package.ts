import { formatAccountStateForContext, loadAccountState } from "@/lib/ai/account-state";
import {
  buildClientContextSummary,
  buildEnquiryContextSummary,
  buildOutreachContextSummary,
  extractKnowledgeKeywords,
} from "@/lib/ai/context-builders";
import type { KnowledgeLinkIds } from "@/lib/engagement/knowledge-links";
import { EMPTY_KNOWLEDGE_LINKS } from "@/lib/engagement/knowledge-links";
import { loadMergedOutreachRecord } from "@/lib/engagement/prospect-outreach/load-record";
import type { EngagementOpportunity, EngagementTask } from "@/lib/engagement/types";
import type { createServiceClient } from "@/lib/supabase";

type Supabase = ReturnType<typeof createServiceClient>;

export type AssembledContext = {
  label: string;
  package: string;
  keywords: string[];
  attachments: KnowledgeLinkIds;
};

function clip(text: string | null | undefined, max: number): string {
  if (!text) return "";
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function formatFees(opp: EngagementOpportunity | null | undefined): string | null {
  if (!opp) return null;
  const low = opp.indicative_value_low;
  const high = opp.indicative_value_high;
  if (!low && !high) return null;
  const fmt = (n: number) => (n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`);
  if (low && high && low !== high) return `${fmt(low)}–${fmt(high)}`;
  return fmt(low ?? high!);
}

async function loadAttachments(
  supabase: Supabase,
  filter: { col: string; val: string },
): Promise<KnowledgeLinkIds> {
  const { data } = await supabase
    .from("engagement_knowledge_attachments")
    .select("sector_ids, persona_ids, pain_point_ids")
    .eq(filter.col, filter.val)
    .maybeSingle();

  return {
    sector_ids: (data?.sector_ids as string[]) ?? [],
    persona_ids: (data?.persona_ids as string[]) ?? [],
    pain_point_ids: (data?.pain_point_ids as string[]) ?? [],
  };
}

async function loadOpenTasks(
  supabase: Supabase,
  filters: Array<{ col: string; val: string }>,
  limit = 5,
): Promise<EngagementTask[]> {
  const tasks: EngagementTask[] = [];
  for (const { col, val } of filters) {
    const { data } = await supabase
      .from("engagement_tasks")
      .select("id, title, due_date, status, priority")
      .eq(col, val)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(limit);
    tasks.push(...((data as EngagementTask[]) ?? []));
  }
  const seen = new Set<string>();
  return tasks
    .filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    })
    .slice(0, limit);
}

async function loadRecentActivity(
  supabase: Supabase,
  filter: { col: string; val: string },
  limit = 4,
): Promise<string[]> {
  const { data } = await supabase
    .from("engagement_activity_log")
    .select("created_at, title, detail")
    .eq(filter.col, filter.val)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((a) => {
    const date = String(a.created_at).slice(0, 10);
    const detail = a.detail ? ` — ${clip(a.detail, 80)}` : "";
    return `${date}: ${a.title}${detail}`;
  });
}

function extractRecentNotes(notes: string | null | undefined, maxEntries = 2): string[] {
  if (!notes?.trim()) return [];
  const blocks = notes.split(/\n\n\[/).filter(Boolean);
  return blocks.slice(-maxEntries).map((b) => clip(b.startsWith("[") ? b : `[${b}`, 180));
}

function appendSupplement(
  parts: string[],
  tasks: EngagementTask[],
  activity: string[],
  notes: string[],
  fees: string | null,
  gaps: string[],
) {
  if (tasks.length) {
    parts.push(
      "OPEN TASKS:",
      ...tasks.map(
        (t) =>
          `• ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""}${t.priority ? ` [${t.priority}]` : ""}`,
      ),
    );
  }
  if (activity.length) {
    parts.push("RECENT ACTIVITY:", ...activity.map((a) => `• ${a}`));
  }
  if (notes.length) {
    parts.push("RECENT SAVED NOTES:", ...notes.map((n) => `• ${n}`));
  }
  if (fees) parts.push(`FEES DISCUSSED: ${fees}`);
  if (gaps.length) parts.push("GAPS:", ...gaps.map((g) => `• ${g}`));
}

async function finalizeWithAccountState(
  supabase: Supabase,
  contextType: string,
  contextId: string,
  result: AssembledContext,
  includeWorkingState: boolean,
): Promise<AssembledContext> {
  if (!includeWorkingState) return result;
  const state = await loadAccountState(supabase, contextType, contextId);
  const block = formatAccountStateForContext(state);
  if (!block) return result;
  return { ...result, package: `${result.package}\n\n${block}` };
}

export async function assembleContextPackage(
  supabase: Supabase,
  contextType: string,
  contextId: string,
  options?: { includeWorkingState?: boolean; depth?: 0 | 1 | 2 },
): Promise<AssembledContext> {
  const includeWorkingState = options?.includeWorkingState !== false;
  // depth 0 = core only, 1 = core+tasks, 2 = full (default)
  const depth = options?.depth ?? 2;
  const gaps: string[] = [];

  if (contextType === "enquiry") {
    const [enquiryRes, oppRes] = await Promise.all([
      supabase
        .from("enquiries")
        .select(
          "id, name, email, support_type, details, status, telephone, wants_discovery_call, admin_notes, next_action, last_action",
        )
        .eq("id", contextId)
        .maybeSingle(),
      supabase.from("engagement_opportunities").select("*").eq("enquiry_id", contextId).limit(5),
    ]);

    const enquiry = enquiryRes.data;
    if (!enquiry) {
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: "Unknown enquiry",
        package: "Account not found.",
        keywords: [],
        attachments: EMPTY_KNOWLEDGE_LINKS,
      }, includeWorkingState);
    }

    const opportunities = (oppRes.data ?? []) as EngagementOpportunity[];
    const core = buildEnquiryContextSummary(enquiry, opportunities);

    const parts = [core];

    if (depth >= 2) {
      const attachments = await loadAttachments(supabase, { col: "enquiry_id", val: contextId });
      const [tasks, activity] = await Promise.all([
        loadOpenTasks(supabase, [{ col: "enquiry_id", val: contextId }]),
        loadRecentActivity(supabase, { col: "enquiry_id", val: contextId }),
      ]);
      const notes = extractRecentNotes(enquiry.admin_notes);
      const fees = formatFees(opportunities[0] ?? null);
      if (!enquiry.details?.trim() || enquiry.details.toLowerCase().includes("test")) {
        gaps.push("Enquiry details look empty or like test data");
      }
      appendSupplement(parts, tasks, activity, notes, fees, gaps);

      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: enquiry.name || enquiry.email || "Enquiry",
        package: parts.join("\n"),
        keywords: extractKnowledgeKeywords(core),
        attachments,
      }, includeWorkingState);
    }

    if (depth === 1) {
      const tasks = await loadOpenTasks(supabase, [{ col: "enquiry_id", val: contextId }]);
      appendSupplement(parts, tasks, [], [], null, []);
    }

    return {
      label: enquiry.name || enquiry.email || "Enquiry",
      package: parts.join("\n"),
      keywords: extractKnowledgeKeywords(core),
      attachments: EMPTY_KNOWLEDGE_LINKS,
    };
  }

  if (contextType === "prospect") {
    const loaded = await loadMergedOutreachRecord(supabase, contextId);
    if (!loaded) {
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: "Unknown prospect",
        package: "Prospect Finder record not found.",
        keywords: [],
        attachments: EMPTY_KNOWLEDGE_LINKS,
      }, includeWorkingState);
    }

    const { record, reviewNotes } = loaded;
    const core = buildOutreachContextSummary(record, reviewNotes);
    const parts = [core];

    if (depth >= 2) {
      const attachments = await loadAttachments(supabase, { col: "outreach_id", val: contextId });
      const notes = extractRecentNotes(reviewNotes);
      if (notes.length) parts.push("REVIEWER NOTES:", ...notes.map((n) => `• ${n}`));
      if (gaps.length) parts.push("GAPS:", ...gaps.map((g) => `• ${g}`));
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: record.organisation_name,
        package: parts.join("\n"),
        keywords: extractKnowledgeKeywords(core),
        attachments,
      }, includeWorkingState);
    }

    return {
      label: record.organisation_name,
      package: parts.join("\n"),
      keywords: extractKnowledgeKeywords(core),
      attachments: EMPTY_KNOWLEDGE_LINKS,
    };
  }

  if (contextType === "client") {
    const [contactRes, oppRes] = await Promise.all([
      supabase
        .from("engagement_contacts")
        .select(`*, organisation:organisation_id(id, name, industry)`)
        .eq("id", contextId)
        .maybeSingle(),
      supabase
        .from("engagement_opportunities")
        .select("*")
        .eq("primary_contact_id", contextId)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    const contact = contactRes.data;
    if (!contact) {
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: "Unknown client",
        package: "Account not found.",
        keywords: [],
        attachments: EMPTY_KNOWLEDGE_LINKS,
      }, includeWorkingState);
    }

    const opportunities = (oppRes.data ?? []) as EngagementOpportunity[];
    const outreachId = opportunities.find((o) => o.outreach_id)?.outreach_id ?? null;
    const loadedOutreach = outreachId ? await loadMergedOutreachRecord(supabase, outreachId) : null;
    const linkedOutreach = loadedOutreach?.record ?? null;
    const finderReviewNotes = loadedOutreach?.reviewNotes ?? null;

    const core = buildClientContextSummary(
      contact,
      opportunities,
      linkedOutreach,
      finderReviewNotes,
    );
    const fullName = `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`.trim();
    const parts = [core];

    if (depth >= 2) {
      const attachments = await loadAttachments(supabase, { col: "contact_id", val: contextId });
      const taskFilters: Array<{ col: string; val: string }> = [{ col: "contact_id", val: contextId }];
      if (contact.organisation_id) taskFilters.push({ col: "organisation_id", val: contact.organisation_id });
      for (const opp of opportunities.slice(0, 2)) taskFilters.push({ col: "opportunity_id", val: opp.id });
      const [tasks, activity] = await Promise.all([
        loadOpenTasks(supabase, taskFilters),
        loadRecentActivity(supabase, { col: "contact_id", val: contextId }),
      ]);
      const notes = extractRecentNotes(contact.notes);
      if (!contact.notes?.trim() && !finderReviewNotes?.trim()) gaps.push("Limited recorded notes on this account");
      appendSupplement(parts, tasks, activity, notes, formatFees(opportunities[0]), gaps);
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: fullName || "Client",
        package: parts.join("\n"),
        keywords: extractKnowledgeKeywords(core),
        attachments,
      }, includeWorkingState);
    }

    if (depth === 1) {
      const taskFilters: Array<{ col: string; val: string }> = [{ col: "contact_id", val: contextId }];
      if (contact.organisation_id) taskFilters.push({ col: "organisation_id", val: contact.organisation_id });
      const tasks = await loadOpenTasks(supabase, taskFilters);
      appendSupplement(parts, tasks, [], [], null, []);
    }

    return {
      label: fullName || "Client",
      package: parts.join("\n"),
      keywords: extractKnowledgeKeywords(core),
      attachments: EMPTY_KNOWLEDGE_LINKS,
    };
  }

  if (contextType === "outreach") {
    const merged = await loadMergedOutreachRecord(supabase, contextId);
    if (!merged) {
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: "Unknown outreach",
        package: "Outreach record not found.",
        keywords: [],
        attachments: EMPTY_KNOWLEDGE_LINKS,
      }, includeWorkingState);
    }

    const { record, reviewNotes } = merged;
    const core = buildOutreachContextSummary(record, reviewNotes);
    const parts = [core];

    if (depth >= 2) {
      const attachments = await loadAttachments(supabase, { col: "outreach_id", val: contextId });
      const notes = extractRecentNotes(reviewNotes);
      if (record.data_confidence === "Low") gaps.push("Research confidence is low — verify before outreach");
      if (notes.length) parts.push("REVIEWER NOTES:", ...notes.map((n) => `• ${n}`));
      if (gaps.length) parts.push("GAPS:", ...gaps.map((g) => `• ${g}`));
      return finalizeWithAccountState(supabase, contextType, contextId, {
        label: record.organisation_name,
        package: parts.join("\n"),
        keywords: extractKnowledgeKeywords(core),
        attachments,
      }, includeWorkingState);
    }

    return {
      label: record.organisation_name,
      package: parts.join("\n"),
      keywords: extractKnowledgeKeywords(core),
      attachments: EMPTY_KNOWLEDGE_LINKS,
    };
  }

  return finalizeWithAccountState(supabase, contextType, contextId, {
    label: contextType,
    package: `Context type: ${contextType} | ID: ${contextId}`,
    keywords: [],
    attachments: EMPTY_KNOWLEDGE_LINKS,
  }, includeWorkingState);
}
