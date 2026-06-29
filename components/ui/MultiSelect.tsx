"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

// MultiSelect — white background multi-select dropdown.
// Selected values are shown as removable chips on the trigger button.

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
  size = "md",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  };

  const remove = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== opt));
  };

  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-xs min-h-[2rem]" : "px-4 py-2.5 text-sm min-h-[2.875rem]";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-[#111111]/15 bg-white text-left outline-none transition-colors hover:border-[#063b32]/40 focus:border-[#063b32] ${sizeClasses}`}
      >
        {values.length === 0 ? (
          <span className="flex-1 text-[#6f6b62]">{placeholder}</span>
        ) : (
          <>
            {values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-full bg-[#063b32]/10 px-2 py-0.5 text-xs font-semibold text-[#063b32]"
              >
                {v}
                <button
                  type="button"
                  onClick={(e) => remove(v, e)}
                  className="grid h-3.5 w-3.5 place-items-center rounded-full hover:bg-[#063b32]/20"
                  aria-label={`Remove ${v}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <span className="flex-1" />
          </>
        )}
        <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 mt-1 max-h-64 min-w-full overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg"
        >
          {options.map((opt) => {
            const selected = values.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(opt)}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${selected ? "bg-[#063b32]/8 font-semibold text-[#063b32]" : "text-[#111111]"}`}
              >
                <span className="flex-1">{opt}</span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0 text-[#063b32]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
