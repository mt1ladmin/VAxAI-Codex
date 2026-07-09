"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// AppSelect — always white background, custom chevron, consistent across all browsers.
// Use this instead of native <select> to prevent OS-default grey backgrounds.

type Option = { value: string; label: string };

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  /** Pass to size to match surrounding inputs */
  size?: "sm" | "md";
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  size = "md",
  name,
  required,
  disabled,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder ?? value;
  const isEmpty = !value && !selected;

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-3 text-sm";

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Hidden input for form serialisation */}
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-[#111111]/15 bg-white text-left font-normal outline-none transition-colors hover:border-[#122428]/40 focus:border-[#122428] disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses} ${isEmpty ? "text-[#6f6b62]" : "text-[#111111]"}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 min-w-full overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg"
        >
          {placeholder && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => { setOpen(false); onChange(""); }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F8F8] ${!value ? "bg-[#122428]/8 font-semibold text-[#122428]" : "text-[#6f6b62]"}`}
            >
              <span className="flex-1">{placeholder}</span>
              {!value && <Check className="h-3.5 w-3.5 shrink-0 text-[#122428]" />}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { setOpen(false); onChange(opt.value); }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F8F8] ${opt.value === value ? "bg-[#122428]/8 font-semibold text-[#122428]" : "text-[#111111]"}`}
            >
              <span className="flex-1">{opt.label}</span>
              {opt.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-[#122428]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
