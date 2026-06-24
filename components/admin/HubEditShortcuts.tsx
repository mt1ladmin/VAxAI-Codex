"use client";

import { ArrowRight, BookOpen, ClipboardList, FileText, FlaskConical, Shield } from "lucide-react";

export type HubEditShortcut = {
  id: string;
  label: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  hasContent?: boolean;
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  research: FlaskConical,
  vaxai_support: Shield,
  engagement_guide: BookOpen,
  tasks: ClipboardList,
  notes: FileText,
};

type Props = {
  shortcuts: HubEditShortcut[];
};

export function HubEditShortcuts({ shortcuts }: Props) {
  if (!shortcuts.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
        Sections
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => {
          const Icon = ICONS[item.id] ?? FileText;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="group rounded-xl border border-[#111111]/10 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#063b32]/25 hover:bg-[#f7f4ea]/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#063b32]/8 text-[#063b32]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111]">{item.label}</p>
                    <p className="mt-0.5 text-xs text-[#6f6b62] leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {item.hasContent ? (
                  <span className="shrink-0 rounded-full bg-[#063b32]/10 px-2 py-0.5 text-[10px] font-semibold text-[#063b32]">
                    ✓
                  </span>
                ) : null}
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#063b32] group-hover:underline">
                {item.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}