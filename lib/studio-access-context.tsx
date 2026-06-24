"use client";

import { createContext, useContext, type ReactNode } from "react";
import { isPlatformAdmin, type StudioRole } from "@/lib/studio-access";

type StudioAccessValue = {
  role: StudioRole;
  isPlatformAdmin: boolean;
  /** Floating widget — platform admins only */
  canUseAiAssistant: boolean;
  /** CRM hub chat tab on prospect queue — all studio members */
  canUseProspectQueueAi: boolean;
  /** Never on website enquiries */
  canUseEnquiryAi: boolean;
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
        canUseProspectQueueAi: true,
        canUseEnquiryAi: true,
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

export function useStudioAccessOptional(): StudioAccessValue | null {
  return useContext(StudioAccessContext);
}