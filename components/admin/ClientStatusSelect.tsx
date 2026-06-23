"use client";

import { CLIENT_SERVICE_STAGES } from "@/lib/engagement/client-stages";
import { STAGE_COLORS } from "@/lib/engagement/types";

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

export function ClientStatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (stage: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
      >
        {CLIENT_SERVICE_STAGES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[value] ?? "bg-gray-100 text-gray-600"}`}
      >
        {value}
      </span>
    </div>
  );
}