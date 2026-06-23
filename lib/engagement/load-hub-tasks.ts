import type { EngagementOpportunity, EngagementTask } from "./types";

export async function fetchHubTasks(opts: {
  contactId?: string | null;
  organisationId?: string | null;
  opportunities?: EngagementOpportunity[];
}): Promise<{ open: EngagementTask[]; done: EngagementTask[] }> {
  const queries: Promise<Response>[] = [];
  if (opts.contactId) {
    queries.push(fetch(`/api/admin/engagement/tasks?contact_id=${opts.contactId}&limit=100`));
    queries.push(
      fetch(`/api/admin/engagement/tasks?contact_id=${opts.contactId}&status=done&limit=50`),
    );
  }
  if (opts.organisationId) {
    queries.push(
      fetch(`/api/admin/engagement/tasks?organisation_id=${opts.organisationId}&limit=100`),
    );
    queries.push(
      fetch(
        `/api/admin/engagement/tasks?organisation_id=${opts.organisationId}&status=done&limit=50`,
      ),
    );
  }
  for (const opp of opts.opportunities || []) {
    queries.push(fetch(`/api/admin/engagement/tasks?opportunity_id=${opp.id}&limit=50`));
    queries.push(
      fetch(`/api/admin/engagement/tasks?opportunity_id=${opp.id}&status=done&limit=30`),
    );
  }

  if (queries.length === 0) return { open: [], done: [] };

  const results = await Promise.all(queries.map((q) => q.then((r) => r.json())));
  const openMap = new Map<string, EngagementTask>();
  const doneMap = new Map<string, EngagementTask>();

  for (const j of results as Array<{ data?: EngagementTask[] }>) {
    for (const task of j.data || []) {
      if (task.status === "done") doneMap.set(task.id, task);
      else openMap.set(task.id, task);
    }
  }

  const byDue = (a: EngagementTask, b: EngagementTask) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  };

  return {
    open: [...openMap.values()].sort(byDue),
    done: [...doneMap.values()].sort(byDue),
  };
}