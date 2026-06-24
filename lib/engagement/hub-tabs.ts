export const CRM_HUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks & next actions" },
  { id: "client_work", label: "Client work" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
] as const;

export type CrmHubTab = (typeof CRM_HUB_TABS)[number]["id"];

export const CRM_HUB_TAB_IDS = new Set<string>(CRM_HUB_TABS.map((t) => t.id));

export function getCrmHubTabs() {
  return CRM_HUB_TABS;
}