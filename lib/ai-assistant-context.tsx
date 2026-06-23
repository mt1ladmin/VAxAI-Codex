"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AIContextType = "enquiry" | "client" | "prospect" | null;

export type AIAssistantContext = {
  type: AIContextType;
  id: string | null;
  label: string | null;
  summary: string | null; // tier-1 text built from page data
};

type ContextValue = {
  context: AIAssistantContext;
  setContext: (ctx: AIAssistantContext) => void;
  clearContext: () => void;
};

const Ctx = createContext<ContextValue>({
  context: { type: null, id: null, label: null, summary: null },
  setContext: () => {},
  clearContext: () => {},
});

export function AIAssistantContextProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<AIAssistantContext>({
    type: null,
    id: null,
    label: null,
    summary: null,
  });

  const setContext = (ctx: AIAssistantContext) => setContextState(ctx);
  const clearContext = () => setContextState({ type: null, id: null, label: null, summary: null });

  return <Ctx.Provider value={{ context, setContext, clearContext }}>{children}</Ctx.Provider>;
}

export function useAIAssistantContext() {
  return useContext(Ctx);
}

// Hook for detail pages to auto-set the AI context when data is available
export function useSetAIContext(ctx: AIAssistantContext | null) {
  const { setContext, clearContext } = useContext(Ctx);
  useEffect(() => {
    if (ctx?.type && ctx?.id) {
      setContext(ctx);
    }
    return () => {
      // Don't clear on unmount — context persists until next page sets it
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.type, ctx?.id, ctx?.label, ctx?.summary]);
}
