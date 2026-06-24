import { Suspense } from "react";

export default function ProspectOutreachLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}