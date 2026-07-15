"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";

/** Current brand mark (dropped into public for Studio + site). */
export const STUDIO_LOGO_SRC = "/vaxai.jpg";

/** Shared Studio visual language — MT1L pine/cream, high contrast, no yellow chrome. */
export const studio = {
  page: "min-h-full bg-cream/40",
  pagePad: "px-4 py-6 md:px-8 md:py-8",
  max: "mx-auto max-w-7xl",
  card: "rounded-2xl border border-pine-900/10 bg-white shadow-sm",
  cardQuiet: "rounded-2xl border border-pine-900/8 bg-white",
  cardPad: "p-5 md:p-6",
  eyebrow: "text-[11px] font-bold uppercase tracking-[0.14em] text-pine-700",
  title: "text-2xl font-semibold tracking-tight text-pine-900 md:text-[1.65rem]",
  subtitle: "mt-1.5 max-w-2xl text-sm leading-6 text-muted",
  label: "text-[11px] font-semibold uppercase tracking-[0.1em] text-muted",
  input:
    "w-full rounded-xl border border-pine-900/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900/35 focus:ring-2 focus:ring-pine-900/8",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-pine-900 px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-800 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-pine-900/12 bg-white px-4 py-2.5 text-sm font-semibold text-pine-900 transition-colors hover:bg-cream disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-white hover:text-pine-900 disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50",
  chip: "inline-flex items-center gap-1.5 rounded-full border border-pine-900/10 bg-cream/80 px-2.5 py-1 text-[11px] font-semibold text-pine-900",
  chipActive: "inline-flex items-center gap-1.5 rounded-full border border-pine-900 bg-pine-900 px-2.5 py-1 text-[11px] font-semibold text-paper",
  tableHead: "text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted",
  empty: "rounded-2xl border border-dashed border-pine-900/15 bg-white px-6 py-14 text-center",
  sectionTitle: "text-sm font-semibold text-pine-900",
  muted: "text-sm text-muted",
  divider: "border-t border-pine-900/8",
} as const;

export function StudioPageHeader({
  eyebrow,
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className={studio.eyebrow}>{eyebrow}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className={studio.title}>{title}</h1>
          {info ? <InfoTip text={info} /> : null}
        </div>
        {description ? <p className={studio.subtitle}>{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
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
        className="grid h-5 w-5 place-items-center rounded-full border border-pine-900/20 bg-white text-pine-800 transition-colors hover:border-pine-900/40 hover:bg-cream"
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
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted hover:bg-cream"
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
