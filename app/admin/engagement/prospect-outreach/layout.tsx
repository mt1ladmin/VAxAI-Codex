import { Suspense } from "react";

export default function ProspectOutreachLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex items-center justify-center py-16 text-sm text-[#6f6b62]">Loading…</div>}>{children}</Suspense>;
}