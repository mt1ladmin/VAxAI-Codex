"use client";

import { TasksListView } from "@/components/admin/TasksListView";

export default function TasksTrackerPage() {
  return (
    <div className="min-h-full bg-cream/40">
      <TasksListView embedded showPageHeader />
    </div>
  );
}