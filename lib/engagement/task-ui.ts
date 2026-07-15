export const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-acid",
  low: "bg-pine-200",
};

export const STATUS_BADGE: Record<string, string> = {
  todo: "bg-white text-muted border border-pine-900/12",
  in_progress: "bg-pine-100 text-pine-900",
  done: "bg-acid/70 text-ink",
};

export const DEFAULT_TASK_FORM = {
  title: "",
  priority: "medium",
  due_date: "",
  task_type: "follow_up",
  notes: "",
  assigned_team_member_id: "",
};
