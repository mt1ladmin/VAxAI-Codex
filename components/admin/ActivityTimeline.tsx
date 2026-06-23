"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";
import { ChatActivityList } from "@/components/admin/ChatActivityList";
import {
  ACTIVITY_EVENT_DOT,
  fetchActivityLog,
  type ActivityLogEntry,
} from "@/lib/engagement/activity-log";
import { opportunityDetailPath } from "@/lib/engagement/opportunity-nav";
import { STAGE_COLORS } from "@/lib/engagement/types";

type SeedEvent = {
  title: string;
  detail?: string;
  created_at: string;
  dotClass?: string;
};

type Props = {
  enquiryId?: string;
  queueId?: string;
  contactId?: string;
  chatContextType?: "enquiry" | "prospect" | "client";
  chatContextId?: string;
  refreshKey?: number;
  seedEvents?: SeedEvent[];
  emptyMessage?: string;
};

export function ActivityTimeline({
  enquiryId,
  queueId,
  contactId,
  chatContextType,
  chatContextId,
  refreshKey = 0,
  seedEvents = [],
  emptyMessage = "No activity yet. Status changes, notes, and pipeline moves will appear here.",
}: Props) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchActivityLog({ enquiryId, queueId, contactId })
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enquiryId, queueId, contactId, refreshKey]);

  const hasContent =
    seedEvents.length > 0 ||
    entries.length > 0 ||
    Boolean(chatContextType && chatContextId);

  return (
    <div className="space-y-3">
      {seedEvents.map((event, i) => (
        <div
          key={`seed-${i}`}
          className="flex gap-3 rounded-lg border border-[#111111]/10 bg-[#f7f4ea]/40 px-4 py-3"
        >
          <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${event.dotClass ?? "bg-[#063b32]"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#111111]">{event.title}</p>
            <p className="text-xs text-[#6f6b62]">
              {new Date(event.created_at).toLocaleString("en-GB")}
            </p>
            {event.detail && (
              <p className="mt-1 text-sm text-[#6f6b62] whitespace-pre-wrap">{event.detail}</p>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-[#6f6b62]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
        </p>
      )}

      {!loading &&
        entries.map((entry) => {
          const oppId = entry.opportunity_id;
          const stage = entry.metadata?.stage as string | undefined;
          const returnPath = enquiryId
            ? `/admin/enquiries/${enquiryId}?tab=activity`
            : queueId
              ? `/admin/engagement/prospect-queue/${queueId}?tab=activity`
              : contactId
                ? `/admin/clients/${contactId}?tab=activity`
                : undefined;

          const inner = (
            <>
              <div
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  ACTIVITY_EVENT_DOT[entry.event_type] ?? "bg-[#6f6b62]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#111111]">{entry.title}</p>
                <p className="text-xs text-[#6f6b62]">
                  {new Date(entry.created_at).toLocaleString("en-GB")}
                </p>
                {entry.detail && (
                  <p className="mt-1 text-sm text-[#6f6b62] whitespace-pre-wrap">{entry.detail}</p>
                )}
                {stage && (
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      STAGE_COLORS[stage as keyof typeof STAGE_COLORS] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stage}
                  </span>
                )}
              </div>
              {oppId && returnPath && (
                <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-[#6f6b62]" />
              )}
            </>
          );

          if (oppId && returnPath) {
            return (
              <Link
                key={entry.id}
                href={opportunityDetailPath(oppId, {
                  returnTo: returnPath,
                  returnLabel: "Activity",
                })}
                className="flex w-full gap-3 rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-3 hover:bg-amber-50"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={entry.id}
              className="flex gap-3 rounded-lg border border-[#111111]/10 px-4 py-3"
            >
              {inner}
            </div>
          );
        })}

      {chatContextType && chatContextId && (
        <ChatActivityList
          contextType={chatContextType}
          contextId={chatContextId}
          refreshKey={refreshKey}
        />
      )}

      {!loading && !hasContent && (
        <p className="text-sm text-[#6f6b62]/60 py-4 text-center">{emptyMessage}</p>
      )}
    </div>
  );
}