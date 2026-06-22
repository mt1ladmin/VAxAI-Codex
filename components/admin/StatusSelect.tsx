"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  PROSPECT_QUEUE_STATUSES,
  PROSPECT_QUEUE_STATUS_COLORS,
} from "@/lib/engagement/types";

type StatusSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

function statusDotClass(status: string) {
  return PROSPECT_QUEUE_STATUS_COLORS[status]?.split(" ")[0] || "bg-gray-300";
}

export function StatusSelect({
  value,
  onChange,
  disabled = false,
  loading = false,
  className = "",
}: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerColor =
    PROSPECT_QUEUE_STATUS_COLORS[value] || "bg-[#111111]/10 text-[#6f6b62]";

  const handleSelect = (status: string) => {
    setOpen(false);
    if (status !== value) onChange(status);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen((v) => !v)}
        disabled={disabled || loading}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-[#111111]/15 bg-white px-3 py-2.5 text-left text-sm outline-none transition-colors hover:border-[#063b32]/40 focus:border-[#063b32] disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${triggerColor}`}
        >
          {value || "Select status"}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#6f6b62]" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full min-w-[12rem] overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {PROSPECT_QUEUE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleSelect(status)}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${
                value === status ? "bg-[#063b32]/8 font-semibold text-[#063b32]" : "text-[#111111]"
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(status)}`} />
              <span className="flex-1">{status}</span>
              {value === status && <Check className="h-3.5 w-3.5 shrink-0 text-[#063b32]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}