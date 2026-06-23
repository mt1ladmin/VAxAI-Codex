"use client";

import { createContext, useContext, type ReactNode } from "react";
import { isPlatformAdmin, type StudioRole } from "@/lib/studio-access";

type StudioAccessValue = {
  role: StudioRole;
  isPlatformAdmin: boolean;
  canUseAiAssistant: boolean;
};

const StudioAccessContext = createContext<StudioAccessValue | null>(null);

export function StudioAccessProvider({
  role,
  children,
}: {
  role: StudioRole;
  children: ReactNode;
}) {
  const admin = isPlatformAdmin(role);
  return (
    <StudioAccessContext.Provider
      value={{
        role,
        isPlatformAdmin: admin,
        canUseAiAssistant: admin,
      }}
    >
      {children}
    </StudioAccessContext.Provider>
  );
}

export function useStudioAccess(): StudioAccessValue {
  const ctx = useContext(StudioAccessContext);
  if (!ctx) {
    throw new Error("useStudioAccess must be used within StudioAccessProvider");
  }
  return ctx;
}