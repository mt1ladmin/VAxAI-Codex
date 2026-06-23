export const CRM_HUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "opportunities", label: "Opportunities" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
  { id: "chat", label: "VAxAI Assistant" },
] as const;

export type CrmHubTab = (typeof CRM_HUB_TABS)[number]["id"];

export const CRM_HUB_TAB_IDS = new Set<string>(CRM_HUB_TABS.map((t) => t.id));