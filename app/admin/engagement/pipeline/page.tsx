"use client";

import { TasksListView } from "@/components/admin/TasksListView";

export default function TasksTrackerPage() {
  return (
    <div className="min-h-screen bg-white">
      <TasksListView embedded showPageHeader />
    </div>
  );
}