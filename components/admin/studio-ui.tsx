"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";
import FilingTab from "@/components/FilingTab";

/** Same wordmark as the public dark nav — designed for pine backgrounds. */
export const STUDIO_LOGO_SRC = "/vaxai-logo.png";

/**
 * Studio visual system — calm archive / admin workspace.
 * Main page titles use the public FilingTab label (green pill + rule line).
 */
export const studio = {
  page: "min-h-full bg-white",
  pagePad: "px-4 py-6 md:px-8 md:py-8",
  max: "mx-auto max-w-7xl",
  panel: "rounded-xl border border-pine-900/[0.08] bg-white",
  panelMuted: "rounded-xl border border-pine-900/[0.06] bg-pine-50/40",
  card: "rounded-xl border border-pine-900/[0.08] bg-white shadow-[0_1px_2px_rgba(18,36,40,0.04)]",
  cardQuiet: "rounded-xl border border-pine-900/[0.06] bg-white",
  cardPad: "p-4 md:p-5",
  eyebrow: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted",
  title: "text-xl font-semibold tracking-tight text-pine-900 md:text-2xl",
  subtitle: "mt-3 max-w-2xl text-sm leading-6 text-muted",
  label: "text-[10px] font-semibold uppercase tracking-[0.1em] text-muted",
  input:
    "w-full rounded-lg border border-pine-900/10 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/55 focus:border-pine-900/25 focus:ring-2 focus:ring-pine-900/[0.06]",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-pine-900 px-3.5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-pine-800 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-pine-900/12 bg-white px-3.5 py-2 text-sm font-semibold text-pine-900 transition-colors hover:bg-pine-50/80 hover:border-pine-900/20 disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-pine-50 hover:text-pine-900 disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50",
  chip: "inline-flex items-center gap-1.5 rounded-md border border-pine-900/10 bg-white px-2.5 py-1 text-[11px] font-medium text-pine-900",
  chipActive:
    "inline-flex items-center gap-1.5 rounded-md border border-pine-900/20 bg-pine-50 px-2.5 py-1 text-[11px] font-semibold text-pine-900",
  chipAccent:
    "inline-flex items-center gap-1.5 rounded-md bg-acid px-2.5 py-1 text-[11px] font-semibold text-ink",
  tableHead: "text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted",
  empty: "rounded-xl border border-dashed border-pine-900/12 bg-white px-6 py-14 text-center",
  sectionTitle: "text-sm font-semibold text-pine-900",
  muted: "text-sm text-muted",
  divider: "border-t border-pine-900/[0.07]",
  folderActive: "bg-pine-50 text-pine-900 border-l-2 border-l-pine-900",
  folderIdle: "text-muted hover:bg-pine-50/70 hover:text-pine-900 border-l-2 border-l-transparent",
} as const;

/**
 * Main Studio page heading — public FilingTab (green label + full-width rule).
 * `eyebrow` is accepted but ignored (no “Client engagement” strip).
 */
export function StudioPageHeader({
  title,
  description,
  info,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  info?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">
            <FilingTab>{title}</FilingTab>
          </div>
          {info ? <InfoTip text={info} /> : null}
        </div>
        {description ? <p className={studio.subtitle}>{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">{actions}</div> : null}
    </div>
  );
}

/** Exception-only help: small (i) control that opens a plain explanation. */
export function InfoTip({ text, label = "More about this" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="grid h-5 w-5 place-items-center rounded-full border border-pine-900/15 bg-white text-pine-700 transition-colors hover:border-pine-900/30 hover:bg-pine-50"
      >
        <Info className="h-3 w-3" strokeWidth={2.5} />
      </button>
      {open ? (
        <div
          id={id}
          role="dialog"
          className="absolute left-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-pine-900/10 bg-white p-3.5 text-left shadow-lift"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-pine-900">About this</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted hover:bg-pine-50"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">{text}</p>
        </div>
      ) : null}
    </div>
  );
}

export function StudioEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={studio.empty}>
      <p className="text-sm font-semibold text-pine-900">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StudioMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className={`${studio.card} px-4 py-3.5`}>
      <p className={studio.label}>{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-pine-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
