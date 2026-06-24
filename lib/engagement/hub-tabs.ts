export const CRM_HUB_TABS = [
  { id: "overview", label: "Overview", editable: false },
  { id: "research", label: "Research", editable: true },
  { id: "vaxai_support", label: "VAxAI support", editable: false },
  { id: "engagement_guide", label: "Engagement guide", editable: true },
  { id: "tasks", label: "Tasks", editable: true },
  { id: "notes", label: "Notes", editable: true },
] as const;

/** Enquiry records before full Prospect Queue promotion. */
export const CRM_HUB_TABS_PRE_CLIENT = [
  { id: "overview", label: "Overview", editable: false },
  { id: "tasks", label: "Tasks", editable: true },
  { id: "notes", label: "Notes", editable: true },
] as const;

export type CrmHubTab = (typeof CRM_HUB_TABS)[number]["id"];
export type PreClientHubTab = (typeof CRM_HUB_TABS_PRE_CLIENT)[number]["id"];

export const CRM_HUB_TAB_IDS = new Set<string>(CRM_HUB_TABS.map((t) => t.id));
export const CRM_HUB_TAB_IDS_PRE_CLIENT = new Set<string>(
  CRM_HUB_TABS_PRE_CLIENT.map((t) => t.id),
);

export function getCrmHubTabs() {
  return CRM_HUB_TABS;
}