"use client";

import { Pencil } from "lucide-react";

export type HubTabItem = {
  id: string;
  label: string;
  /** Shows a pencil hint — tab supports editing. */
  editable?: boolean;
};

type Props = {
  tabs: readonly HubTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  badge?: (tabId: string) => React.ReactNode;
};

export function HubTabNav({ tabs, activeTab, onChange, badge }: Props) {
  return (
    <div className="border-b border-[#111111]/10 px-8">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-[#063b32] text-[#063b32]"
                  : "border-transparent text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {tab.editable ? (
                  <Pencil
                    className={`h-3 w-3 ${active ? "text-[#063b32]/70" : "text-[#6f6b62]/50"}`}
                    aria-hidden
                  />
                ) : null}
                {badge?.(tab.id)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}