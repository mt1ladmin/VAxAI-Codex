"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { STAGE_COLORS } from "@/lib/engagement/types";

export function OpportunityStageSelect({
  value,
  stages,
  onChange,
  disabled = false,
  loading = false,
  dropUp = false,
  className = "",
}: {
  value: string;
  stages: readonly string[];
  onChange: (stage: string) => void;
  disabled?: boolean;
  loading?: boolean;
  dropUp?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerColor = STAGE_COLORS[value] || "bg-[#111111]/10 text-[#6f6b62]";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (stage: string) => {
    setOpen(false);
    if (stage !== value) onChange(stage);
  };

  return (
    <div ref={ref} className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen((v) => !v)}
        disabled={disabled || loading}
        className="flex items-center justify-between gap-1.5 rounded-full border border-[#111111]/10 bg-white px-2.5 py-1 text-left outline-none transition-colors hover:border-[#063b32]/30 disabled:cursor-not-allowed"
      >
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${triggerColor}`}>
          {value}
        </span>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-[#6f6b62]" />
        ) : (
          <ChevronDown className={`h-3 w-3 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && (
        <div
          className={`absolute right-0 z-50 max-h-64 w-56 overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => handleSelect(stage)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-[#f7f4ea] ${
                value === stage ? "bg-[#063b32]/8 font-semibold text-[#063b32]" : "text-[#111111]"
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${(STAGE_COLORS[stage] || "bg-gray-300").split(" ")[0]}`} />
              <span className="flex-1">{stage}</span>
              {value === stage && <Check className="h-3 w-3 shrink-0 text-[#063b32]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}