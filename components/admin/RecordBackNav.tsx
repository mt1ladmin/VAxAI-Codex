"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
  backLabel: string;
  title?: string;
  actions?: React.ReactNode;
};

export function RecordBackNav({ href, backLabel, title, actions }: Props) {
  return (
    <div className="border-b border-[#111111]/8 bg-white px-8 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#6f6b62] transition-colors hover:text-[#111111]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
          {title ? (
            <>
              <span className="hidden h-4 w-px shrink-0 bg-[#111111]/10 sm:block" aria-hidden />
              <h1 className="truncate text-base font-semibold text-[#111111]">{title}</h1>
            </>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}