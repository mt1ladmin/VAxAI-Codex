import { Loader2 } from "lucide-react";

/** Lightweight loading state for CRM hub detail pages — avoids grey placeholder blocks. */
export function HubDetailSkeleton() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-[#6f6b62]" />
    </div>
  );
}

export function TasksListSkeleton() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-[#6f6b62]" />
    </div>
  );
}