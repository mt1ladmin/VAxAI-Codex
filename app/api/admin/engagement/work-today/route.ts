import { PROSPECT_QUEUE_PATH, PROSPECT_FINDER_PATH } from "@/lib/engagement/journey";
import {
  buildFinderList,
  filterFinderList,
  loadCatalogRecords,
  loadOverrideMaps,
  loadTeamMembers,
} from "@/lib/engagement/prospect-finder/load-catalog";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("assigned_to") || "";
  const userEmail = searchParams.get("user_email") || "";
  const today = new Date().toISOString().split("T")[0];

  let resolvedMemberId = memberId;
  if (!resolvedMemberId && userEmail) {
    const { data: member } = await supabase
      .from("studio_team_members")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();
    resolvedMemberId = member?.id ?? "";
  }

  const [tasksRes, enqRes, queueRes] = await Promise.all([
    supabase
      .from("engagement_tasks")
      .select(
        "id, title, due_date, status, contact_id, outreach_id, enquiry_id, contact:contact_id(first_name, last_name), opportunity:opportunity_id(stage)",
      )
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(50),
    supabase
      .from("enquiries")
      .select("id, name, email, status, created_at")
      .in("status", ["Needs review", "new", "open", ""])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("engagement_opportunities")
      .select(
        "id, title, stage, next_action, primary_contact_id, assigned_team_member_id, primary_contact:primary_contact_id(id, first_name, last_name, organisation:organisation_id(name))",
      )
      .not("primary_contact_id", "is", null)
      .not("stage", "in", '("Lost","Not suitable")')
      .order("updated_at", { ascending: false })
      .limit(resolvedMemberId ? 30 : 12),
  ]);

  const tasks = (tasksRes.data ?? []).map((t) => {
    const rawContact = t.contact as unknown;
    const contact = (Array.isArray(rawContact) ? rawContact[0] : rawContact) as
      | { first_name: string; last_name: string | null }
      | null;
    const overdue = Boolean(t.due_date && t.due_date < today);
    let href = "/admin/engagement/pipeline";
    if (t.enquiry_id) href = `/admin/enquiries/${t.enquiry_id}`;
    else if (t.outreach_id) href = `/admin/engagement/prospect-outreach/${t.outreach_id}`;
    else if (t.contact_id) href = `${PROSPECT_QUEUE_PATH}/${t.contact_id}?tab=tasks`;
    return {
      id: t.id,
      title: t.title,
      due_date: t.due_date,
      overdue,
      href,
      contact_name: contact
        ? `${contact.first_name} ${contact.last_name ?? ""}`.trim()
        : null,
    };
  });

  const overdueTasks = tasks.filter((t) => t.overdue).slice(0, 3);
  const dueSoon = tasks.filter((t) => !t.overdue).slice(0, 3);

  let queueRecords = (queueRes.data ?? []).map((o) => {
    const rawContact = o.primary_contact as unknown;
    const contact = (Array.isArray(rawContact) ? rawContact[0] : rawContact) as {
      id: string;
      first_name: string;
      last_name: string | null;
      organisation?: { name: string } | { name: string }[] | null;
    } | null;
    const rawOrg = contact?.organisation;
    const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as { name: string } | null | undefined;
    return {
      contact_id: contact?.id ?? o.primary_contact_id,
      name: contact
        ? `${contact.first_name} ${contact.last_name ?? ""}`.trim()
        : "Unknown",
      organisation: org?.name ?? null,
      stage: o.stage,
      next_action: o.next_action,
      href: contact?.id ? `${PROSPECT_QUEUE_PATH}/${contact.id}` : PROSPECT_QUEUE_PATH,
    };
  });

  if (resolvedMemberId) {
    queueRecords = queueRecords.filter((r) => {
      const opp = queueRes.data?.find((o) => o.primary_contact_id === r.contact_id);
      return opp?.assigned_team_member_id === resolvedMemberId;
    });
  }
  queueRecords = queueRecords.slice(0, 3);

  const [{ overrides, rows }, members, catalog] = await Promise.all([
    loadOverrideMaps(supabase),
    loadTeamMembers(supabase),
    loadCatalogRecords(supabase),
  ]);
  const finderAll = buildFinderList(rows, overrides, members, catalog);
  const finderFiltered = filterFinderList(finderAll, {
    members,
    assigned_to: resolvedMemberId || undefined,
    unassigned: !resolvedMemberId,

  });

  const finderItems = finderFiltered
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      organisation_name: p.organisation_name,
      engagement_status: p.engagement_status,
      next_action: p.next_action,
      href: `${PROSPECT_FINDER_PATH}/${p.id}`,
    }));

  const newEnquiries = (enqRes.data ?? [])
    .filter((e) => !e.status || e.status === "Needs review" || e.status === "new" || e.status === "open")
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      name: e.name as string,
      status: (e.status as string) || "Needs review",
      href: `/admin/enquiries/${e.id}`,
    }));

  return NextResponse.json({
    data: {
      overdueTasks,
      dueSoonTasks: dueSoon,
      queueRecords,
      finderProspects: finderItems,
      newEnquiries,
    },
  });
}