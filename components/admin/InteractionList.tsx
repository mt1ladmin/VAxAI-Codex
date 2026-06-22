"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Phone } from "lucide-react";
import type { EngagementInteraction } from "@/lib/engagement/types";

const typeColors: Record<string, string> = {
  prospecting: "bg-blue-100 text-blue-700",
  discovery: "bg-violet-100 text-violet-700",
  review: "bg-amber-100 text-amber-700",
  support: "bg-emerald-100 text-emerald-700",
  "follow-up": "bg-[#063b32]/10 text-[#063b32]",
  call: "bg-[#111111]/10 text-[#111111]",
};

type InteractionListProps = {
  interactions: EngagementInteraction[];
  loading?: boolean;
  emptyMessage?: string;
  showContact?: boolean;
};

export function InteractionList({
  interactions,
  loading = false,
  emptyMessage = "No call records yet.",
  showContact = false,
}: InteractionListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[#f7f4ea] animate-pulse" />
        ))}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 py-10 text-center">
        <Phone className="mx-auto mb-2 h-8 w-8 text-[#6f6b62]/30" />
        <p className="text-sm text-[#6f6b62]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {interactions.map((i) => {
        const contactName = i.contact
          ? `${i.contact.first_name}${i.contact.last_name ? ` ${i.contact.last_name}` : ""}`
          : null;
        const typeColor = typeColors[i.interaction_type] || "bg-[#111111]/10 text-[#111111]";

        return (
          <Link
            key={i.id}
            href={`/admin/engagement/interactions/${i.id}`}
            className="flex items-start gap-3 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/40 transition-colors group"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#063b32]/10">
              <Phone className="h-4 w-4 text-[#063b32]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${typeColor}`}>
                  {i.interaction_type}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#6f6b62]">
                  <Calendar className="h-3 w-3" />
                  {new Date(i.interaction_date).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {i.outcome && (
                  <span className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                    {i.outcome}
                  </span>
                )}
              </div>
              {showContact && contactName && (
                <p className="mt-0.5 text-xs text-[#6f6b62]">{contactName}</p>
              )}
              {i.summary && (
                <p className="mt-1 text-sm text-[#111111] line-clamp-2">{i.summary}</p>
              )}
              {i.commitments && (
                <p className="mt-1 text-xs text-[#6f6b62]">Next steps: {i.commitments}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#6f6b62]/40 group-hover:text-[#063b32] mt-2" />
          </Link>
        );
      })}
    </div>
  );
}