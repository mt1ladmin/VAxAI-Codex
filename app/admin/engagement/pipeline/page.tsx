"use client";

import { CheckSquare } from "lucide-react";
import { TasksListView } from "@/components/admin/TasksListView";

export default function TasksTrackerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#063b32]/10">
            <CheckSquare className="h-5 w-5 text-[#063b32]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#111111]">Tasks Tracker</h1>
            <p className="text-sm text-[#6f6b62]">
              Master task list across Prospect Queue and Website Enquiries
            </p>
          </div>
        </div>
      </div>
      <TasksListView embedded />
    </div>
  );
}