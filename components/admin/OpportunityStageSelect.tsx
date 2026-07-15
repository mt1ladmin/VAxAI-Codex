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
  const triggerColor = STAGE_COLORS[value] || "bg-[#111111]/10 text-[#5F686A]";

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
        className="flex items-center justify-between gap-1.5 rounded-full border border-[#111111]/10 bg-white px-2.5 py-1 text-left outline-none transition-colors hover:border-[#122428]/30 disabled:cursor-not-allowed"
      >
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${triggerColor}`}>
          {value}
        </span>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-[#5F686A]" />
        ) : (
          <ChevronDown className={`h-3 w-3 text-[#5F686A] transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 max-h-64 w-full min-w-[12rem] overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => handleSelect(stage)}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F8F8] ${
                value === stage ? "bg-[#122428]/8 font-semibold text-[#122428]" : "text-[#111111]"
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${(STAGE_COLORS[stage] || "bg-gray-300").split(" ")[0]}`} />
              <span className="flex-1">{stage}</span>
              {value === stage && <Check className="h-3.5 w-3.5 shrink-0 text-[#122428]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}