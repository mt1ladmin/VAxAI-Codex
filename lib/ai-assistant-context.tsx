'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AIContextType = 'enquiry' | 'prospect' | 'client' | 'general';

export interface AIContext {
  type: AIContextType;
  id: string;
  label: string;
  summary?: string;
}

interface AIAssistantContextValue {
  /** Context currently driving the floating widget */
  context: AIContext;
  /** Context inferred from the page the user is viewing */
  pageContext: AIContext;
  /** True when the user picked a different account via search */
  isManualOverride: boolean;
  /** True when a chat session is open and should persist across navigation/refresh */
  hasActiveChat: boolean;
  setContext: (ctx: AIContext) => void;
  setPageContext: (ctx: AIContext) => void;
  setManualContext: (ctx: AIContext) => void;
  clearManualOverride: () => void;
  markChatActive: () => void;
  markChatInactive: () => void;
  resetToPageContext: () => void;
}

const DEFAULT_CONTEXT: AIContext = {
  type: 'general',
  id: 'general',
  label: 'General',
};

const STORAGE_KEYS = {
  manualOverride: 'vaxai-widget-manual-override',
  activeChat: 'vaxai-widget-active-chat',
  widgetOpen: 'vaxai-widget-open',
} as const;

function contextsEqual(a: AIContext, b: AIContext): boolean {
  return a.type === b.type && a.id === b.id;
}

function readStoredContext(key: string): AIContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIContext;
    if (!parsed?.type || !parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredContext(key: string, ctx: AIContext | null) {
  if (typeof window === 'undefined') return;
  try {
    if (!ctx) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(ctx));
    }
  } catch {
    /* ignore quota errors */
  }
}

function readBool(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(key) === '1';
}

function writeBool(key: string, value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      sessionStorage.setItem(key, '1');
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

export function AIAssistantContextProvider({ children }: { children: ReactNode }) {
  const [pageContext, setPageContextState] = useState<AIContext>(DEFAULT_CONTEXT);
  const [widgetContext, setWidgetContext] = useState<AIContext>(DEFAULT_CONTEXT);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const hydratedRef = useRef(false);
  const isManualOverrideRef = useRef(false);
  const hasActiveChatRef = useRef(false);

  useEffect(() => {
    isManualOverrideRef.current = isManualOverride;
  }, [isManualOverride]);

  useEffect(() => {
    hasActiveChatRef.current = hasActiveChat;
  }, [hasActiveChat]);

  // Restore widget state once on mount (survives page refresh)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const storedManual = readStoredContext(STORAGE_KEYS.manualOverride);
    const storedActiveChat = readStoredContext(STORAGE_KEYS.activeChat);
    const widgetWasOpen = readBool(STORAGE_KEYS.widgetOpen);

    if (storedManual) {
      setWidgetContext(storedManual);
      setIsManualOverride(true);
      setHasActiveChat(true);
    } else if (widgetWasOpen && storedActiveChat) {
      setWidgetContext(storedActiveChat);
      setHasActiveChat(true);
    }
  }, []);

  const applyWidgetContext = useCallback(
    (ctx: AIContext, options?: { manual?: boolean; activeChat?: boolean }) => {
      setWidgetContext(ctx);
      if (options?.manual !== undefined) {
        setIsManualOverride(options.manual);
        writeStoredContext(STORAGE_KEYS.manualOverride, options.manual ? ctx : null);
      }
      if (options?.activeChat !== undefined) {
        setHasActiveChat(options.activeChat);
        writeStoredContext(STORAGE_KEYS.activeChat, options.activeChat ? ctx : null);
      }
    },
    []
  );

  const setPageContext = useCallback((ctx: AIContext) => {
    setPageContextState(ctx);

    // Follow the page account unless the user manually picked another or has an active chat
    if (!isManualOverrideRef.current && !hasActiveChatRef.current) {
      setWidgetContext(ctx);
    }
  }, []);

  const setContext = useCallback(
    (ctx: AIContext) => {
      applyWidgetContext(ctx, { activeChat: hasActiveChat });
    },
    [applyWidgetContext, hasActiveChat]
  );

  const setManualContext = useCallback(
    (ctx: AIContext) => {
      applyWidgetContext(ctx, { manual: true, activeChat: true });
    },
    [applyWidgetContext]
  );

  const clearManualOverride = useCallback(() => {
    setIsManualOverride(false);
    writeStoredContext(STORAGE_KEYS.manualOverride, null);
    setWidgetContext(pageContext);
    writeStoredContext(STORAGE_KEYS.activeChat, hasActiveChat ? pageContext : null);
  }, [pageContext, hasActiveChat]);

  const markChatActive = useCallback(() => {
    setHasActiveChat(true);
    writeStoredContext(STORAGE_KEYS.activeChat, widgetContext);
  }, [widgetContext]);

  const markChatInactive = useCallback(() => {
    setHasActiveChat(false);
    writeStoredContext(STORAGE_KEYS.activeChat, null);
    setIsManualOverride(false);
    writeStoredContext(STORAGE_KEYS.manualOverride, null);
  }, []);

  const resetToPageContext = useCallback(() => {
    setIsManualOverride(false);
    setHasActiveChat(false);
    writeStoredContext(STORAGE_KEYS.manualOverride, null);
    writeStoredContext(STORAGE_KEYS.activeChat, null);
    setWidgetContext(pageContext);
  }, [pageContext]);

  const value = useMemo(
    () => ({
      context: widgetContext,
      pageContext,
      isManualOverride,
      hasActiveChat,
      setContext,
      setPageContext,
      setManualContext,
      clearManualOverride,
      markChatActive,
      markChatInactive,
      resetToPageContext,
    }),
    [
      widgetContext,
      pageContext,
      isManualOverride,
      hasActiveChat,
      setContext,
      setPageContext,
      setManualContext,
      clearManualOverride,
      markChatActive,
      markChatInactive,
      resetToPageContext,
    ]
  );

  return (
    <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>
  );
}

export function useAIAssistantContext() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) {
    throw new Error('useAIAssistantContext must be used within AIAssistantContextProvider');
  }
  return ctx;
}

/** Detail pages call this to register the account on the current page (no-op without the widget provider) */
export function useSetAIContext(context: AIContext | null) {
  const ctx = useContext(AIAssistantContext);
  const setPageContext = ctx?.setPageContext;

  useEffect(() => {
    if (!setPageContext) return;
    if (context) {
      setPageContext(context);
    } else {
      setPageContext(DEFAULT_CONTEXT);
    }
  }, [context?.type, context?.id, context?.label, context?.summary, setPageContext]);
}

/** Persist whether the floating widget panel is open (for refresh restore) */
export function usePersistWidgetOpen(isOpen: boolean) {
  useEffect(() => {
    writeBool(STORAGE_KEYS.widgetOpen, isOpen);
  }, [isOpen]);
}

export { contextsEqual, STORAGE_KEYS };