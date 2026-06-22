import type { EngagementOpportunity, EngagementTask } from "@/lib/engagement/types";

export const CLOSED_WON = ["Won", "Onboarding", "Active client"] as const;
export const CLOSED_OTHER = ["Lost", "Not suitable"] as const;

export type TaskFilter =
  | "all"
  | "has_open_tasks"
  | "no_open_tasks"
  | "overdue"
  | "due_7d"
  | "due_30d"
  | "no_due_date";

export type NextActionFilter = "all" | "has_next_action" | "no_next_action";

export type DueDateFilter = "all" | "overdue" | "due_7d" | "due_30d" | "no_due_date" | "due_today";

export const TASK_FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "has_open_tasks", label: "Has open tasks" },
  { value: "no_open_tasks", label: "No open tasks" },
  { value: "overdue", label: "Overdue tasks" },
  { value: "due_7d", label: "Due in 7 days" },
  { value: "due_30d", label: "Due in 30 days" },
  { value: "no_due_date", label: "Open, no due date" },
];

export const NEXT_ACTION_FILTER_OPTIONS: { value: NextActionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "has_next_action", label: "Has next action" },
  { value: "no_next_action", label: "No next action" },
];

export const DUE_DATE_FILTER_OPTIONS: { value: DueDateFilter; label: string }[] = [
  { value: "all", label: "All due dates" },
  { value: "overdue", label: "Overdue" },
  { value: "due_today", label: "Due today" },
  { value: "due_7d", label: "Due in 7 days" },
  { value: "due_30d", label: "Due in 30 days" },
  { value: "no_due_date", label: "No due date" },
];

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function openTasksForOpp(oppId: string, tasks: EngagementTask[]): EngagementTask[] {
  return tasks.filter((t) => t.opportunity_id === oppId && t.status !== "done");
}

export function matchesTaskFilter(oppId: string, filter: TaskFilter, tasks: EngagementTask[]): boolean {
  if (filter === "all") return true;

  const open = openTasksForOpp(oppId, tasks);
  const today = startOfDay(new Date());
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  switch (filter) {
    case "has_open_tasks":
      return open.length > 0;
    case "no_open_tasks":
      return open.length === 0;
    case "overdue":
      return open.some((t) => t.due_date && startOfDay(new Date(t.due_date)) < today);
    case "due_7d":
      return open.some((t) => {
        if (!t.due_date) return false;
        const due = startOfDay(new Date(t.due_date));
        return due >= today && due <= in7;
      });
    case "due_30d":
      return open.some((t) => {
        if (!t.due_date) return false;
        const due = startOfDay(new Date(t.due_date));
        return due >= today && due <= in30;
      });
    case "no_due_date":
      return open.some((t) => !t.due_date);
    default:
      return true;
  }
}

export function matchesNextActionFilter(opp: EngagementOpportunity, filter: NextActionFilter): boolean {
  if (filter === "all") return true;
  const hasNextAction = Boolean(opp.next_action?.trim());
  return filter === "has_next_action" ? hasNextAction : !hasNextAction;
}

export function matchesDueDateFilter(task: EngagementTask, filter: DueDateFilter): boolean {
  if (filter === "all") return true;

  const today = startOfDay(new Date());
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  if (filter === "no_due_date") return !task.due_date;

  if (!task.due_date) return false;
  const due = startOfDay(new Date(task.due_date));

  switch (filter) {
    case "overdue":
      return due < today;
    case "due_today":
      return due.getTime() === today.getTime();
    case "due_7d":
      return due >= today && due <= in7;
    case "due_30d":
      return due >= today && due <= in30;
    default:
      return true;
  }
}

export function formatOpportunityValue(opp: EngagementOpportunity): string | null {
  if (!opp.indicative_value_low && !opp.indicative_value_high) return null;
  const low = opp.indicative_value_low ?? 0;
  const high = opp.indicative_value_high;
  if (high && high !== low) return `£${low.toLocaleString()}–£${high.toLocaleString()}`;
  return `£${low.toLocaleString()}`;
}

export function computePipelineStats(opps: EngagementOpportunity[]) {
  const open = opps.filter(
    (o) => !["Lost", "Not suitable", "Won", "Onboarding", "Active client"].includes(o.stage),
  );
  const won = opps.filter((o) => CLOSED_WON.includes(o.stage as (typeof CLOSED_WON)[number]));
  const pipelineValue = open.reduce(
    (s, o) => s + (o.indicative_value_high ?? o.indicative_value_low ?? 0),
    0,
  );
  return { openCount: open.length, wonCount: won.length, pipelineValue, totalCount: opps.length };
}

export function isOpenOpportunity(opp: EngagementOpportunity): boolean {
  return !["Lost", "Not suitable", "Won", "Onboarding", "Active client"].includes(opp.stage);
}