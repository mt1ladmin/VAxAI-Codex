"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

type A11yState = {
  simplified: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  dyslexiaFriendly: boolean;
};

const DEFAULTS: A11yState = {
  simplified: false,
  largeText: false,
  reduceMotion: false,
  dyslexiaFriendly: false,
};

const CLASS_MAP: Record<keyof A11yState, string> = {
  simplified: "simplified-mode",
  largeText: "large-text",
  reduceMotion: "reduce-motion",
  dyslexiaFriendly: "dyslexia-friendly",
};

const STORAGE_KEY = "vaxai-a11y";

function load(): A11yState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<A11yState>) };
  } catch {
    return DEFAULTS;
  }
}

function applyClasses(state: A11yState) {
  const { classList } = document.documentElement;
  for (const [key, cls] of Object.entries(CLASS_MAP)) {
    classList.toggle(cls, state[key as keyof A11yState]);
  }
}

const OPTIONS: {
  key: keyof A11yState;
  label: string;
  description: string;
}[] = [
  {
    key: "simplified",
    label: "Simplified (B&W)",
    description: "Removes colour and decorative elements",
  },
  {
    key: "largeText",
    label: "Larger text",
    description: "Increases font size across the page",
  },
  {
    key: "reduceMotion",
    label: "Reduce motion",
    description: "Stops animations and transitions",
  },
  {
    key: "dyslexiaFriendly",
    label: "Dyslexia-friendly",
    description: "Wider letter and word spacing",
  },
];

export default function SimplifiedModeToggle() {
  const [state, setState] = useState<A11yState>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = load();
    setState(saved);
    applyClasses(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function toggle(key: keyof A11yState) {
    setState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      applyClasses(next);
      return next;
    });
  }

  const anyActive = Object.values(state).some(Boolean);

  return (
    <div ref={panelRef} className="simplified-toggle fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Panel */}
      {open && (
        <div className="w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_40px_rgba(17,17,17,0.14)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Accessibility</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-6 w-6 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close accessibility panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {OPTIONS.map(({ key, label, description }) => {
              const active = state[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active ? "bg-[#063b32] text-white" : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  {/* Toggle pill */}
                  <span
                    className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
                      active
                        ? "border-white/30 bg-white/25"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full transition-transform ${
                        active
                          ? "translate-x-4 bg-white"
                          : "translate-x-0.5 bg-gray-400"
                      }`}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold leading-tight ${active ? "text-white" : "text-gray-900"}`}>
                      {label}
                    </span>
                    <span className={`mt-0.5 block text-[11px] leading-snug ${active ? "text-white/70" : "text-gray-400"}`}>
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_14px_35px_rgba(17,17,17,0.18)] transition ${
          anyActive
            ? "border-[#063b32] bg-[#063b32] text-white"
            : "border-gray-200 bg-white text-gray-800"
        }`}
        aria-expanded={open}
        aria-label="Open accessibility options"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">
          {anyActive ? "Accessibility on" : "Accessibility"}
        </span>
      </button>
    </div>
  );
}
