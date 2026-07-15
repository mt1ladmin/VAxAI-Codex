"use client";

import { Plus } from "lucide-react";

type Props = {
  onAddNote: () => void;
  onAddTask: () => void;
};

const actionClass =
  "flex items-center gap-1.5 rounded-lg border border-[#111111]/12 bg-white px-3.5 py-2 text-sm font-semibold text-[#111111] shadow-sm transition-colors hover:bg-[#F5F8F8]/80";

export function HubQuickActions({ onAddNote, onAddTask }: Props) {
  return (
    <>
      <button type="button" onClick={onAddNote} className={actionClass}>
        <Plus className="h-4 w-4" />
        Note
      </button>
      <button type="button" onClick={onAddTask} className={actionClass}>
        <Plus className="h-4 w-4" />
        Task
      </button>
    </>
  );
}