"use client";

import { Loader2 } from "lucide-react";

type Action = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

type Props = {
  title: string;
  description?: string;
  action?: Action;
  secondaryAction?: Action;
};

const primaryClass =
  "inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50";
const secondaryClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 bg-white px-3.5 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]/80 disabled:opacity-50";

function ActionButton({ action, variant }: { action: Action; variant: "primary" | "secondary" }) {
  const className = variant === "primary" ? primaryClass : secondaryClass;
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className={className}
    >
      {action.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {action.label}
    </button>
  );
}

export function HubSectionHeader({ title, description, action, secondaryAction }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/30 px-4 py-3">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-[#111111]">{title}</p>
        {description ? <p className="text-xs text-[#6f6b62] leading-relaxed">{description}</p> : null}
      </div>
      {(action || secondaryAction) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {secondaryAction ? (
            <ActionButton action={secondaryAction} variant="secondary" />
          ) : null}
          {action ? (
            <ActionButton action={action} variant={action.variant ?? "primary"} />
          ) : null}
        </div>
      )}
    </div>
  );
}