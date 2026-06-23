import type { EngagementOpportunity } from "@/lib/engagement/types";

export type LinkedNextActionSource = "enquiry" | "queue" | "opportunity";

export type LinkedNextAction = {
  key: string;
  source: LinkedNextActionSource;
  sourceId: string;
  sourceLabel: string;
  title: string;
  dueDate: string | null;
};

type EnquiryLike = {
  id: string;
  next_action?: string | null;
  next_action_date?: string | null;
};

type QueueLike = {
  id: string;
  next_action?: string | null;
  next_action_date?: string | null;
  raw_org_name?: string | null;
};

type OppLike = Pick<EngagementOpportunity, "id" | "title" | "next_action" | "expected_decision_date">;

export function collectLinkedNextActions(opts: {
  enquiry?: EnquiryLike | null;
  queue?: QueueLike | null;
  opportunities?: OppLike[];
}): LinkedNextAction[] {
  const items: LinkedNextAction[] = [];

  if (opts.enquiry?.next_action?.trim()) {
    items.push({
      key: `enquiry:${opts.enquiry.id}`,
      source: "enquiry",
      sourceId: opts.enquiry.id,
      sourceLabel: "Website enquiry",
      title: opts.enquiry.next_action.trim(),
      dueDate: opts.enquiry.next_action_date?.split("T")[0] ?? null,
    });
  }

  if (opts.queue?.next_action?.trim()) {
    items.push({
      key: `queue:${opts.queue.id}`,
      source: "queue",
      sourceId: opts.queue.id,
      sourceLabel: opts.queue.raw_org_name?.trim() || "Prospect queue",
      title: opts.queue.next_action.trim(),
      dueDate: opts.queue.next_action_date?.split("T")[0] ?? null,
    });
  }

  for (const opp of opts.opportunities ?? []) {
    if (!opp.next_action?.trim()) continue;
    items.push({
      key: `opportunity:${opp.id}`,
      source: "opportunity",
      sourceId: opp.id,
      sourceLabel: opp.title,
      title: opp.next_action.trim(),
      dueDate: opp.expected_decision_date?.split("T")[0] ?? null,
    });
  }

  return items;
}

export function countOpenWorkItems(
  openTasks: { id: string }[],
  linkedNextActions: LinkedNextAction[],
): number {
  return openTasks.length + linkedNextActions.length;
}

export async function patchLinkedNextAction(
  item: LinkedNextAction,
  payload: { title: string; dueDate: string | null },
): Promise<void> {
  if (item.source === "enquiry") {
    const res = await fetch(`/api/admin/enquiries/${item.sourceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        next_action: payload.title.trim() || null,
        next_action_date: payload.dueDate || null,
      }),
    });
    if (!res.ok) throw new Error("Failed to update enquiry next action");
    return;
  }

  if (item.source === "queue") {
    const res = await fetch(`/api/admin/engagement/prospect-queue/${item.sourceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        next_action: payload.title.trim() || null,
        next_action_date: payload.dueDate || null,
      }),
    });
    if (!res.ok) throw new Error("Failed to update prospect next action");
    return;
  }

  const res = await fetch(`/api/admin/engagement/opportunities/${item.sourceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      next_action: payload.title.trim() || null,
      expected_decision_date: payload.dueDate || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to update opportunity next action");
}

export async function clearLinkedNextAction(item: LinkedNextAction): Promise<void> {
  await patchLinkedNextAction(item, { title: "", dueDate: null });
}