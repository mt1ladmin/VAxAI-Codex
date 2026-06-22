"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";

type Interaction = {
  id: string;
  interaction_date: string;
  interaction_type: string;
  channel: string;
  summary: string;
  outcome: string;
  pain_point_ids: string[] | null;
  ai_structured_data: Record<string, unknown> | null;
  organisation: { id: string; name: string } | null;
  contact: { id: string; first_name: string; last_name: string | null } | null;
};

const typeColors: Record<string, string> = {
  prospecting: "bg-blue-100 text-blue-700",
  discovery: "bg-violet-100 text-violet-700",
  review: "bg-amber-100 text-amber-700",
  support: "bg-emerald-100 text-emerald-700",
  "follow-up": "bg-[#063b32]/10 text-[#063b32]",
  call: "bg-[#111111]/10 text-[#111111]",
};

export function CallRecordsContent({ onStartCall }: { onStartCall?: () => void }) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/engagement/interactions?limit=${limit}&offset=${page * limit}`)
      .then((r) => r.json())
      .then((j: { data: Interaction[]; count: number }) => {
        setInteractions(j.data || []);
        setTotal(j.count || 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#6f6b62]">{total} interaction{total !== 1 ? "s" : ""} recorded</p>
        {onStartCall && (
          <button
            onClick={onStartCall}
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Phone className="h-4 w-4" /> Start a call
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#f7f4ea] animate-pulse" />
          ))}
        </div>
      ) : interactions.length === 0 ? (
        <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea] py-16 text-center">
          <Phone className="mx-auto h-10 w-10 text-[#6f6b62]/30 mb-3" />
          <p className="text-sm font-semibold text-[#111111]">No call records yet</p>
          <p className="mt-1 text-xs text-[#6f6b62]">Saved call records will appear here after you complete a live call.</p>
          {onStartCall ? (
            <button
              onClick={onStartCall}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Phone className="h-4 w-4" /> Start your first call
            </button>
          ) : (
            <Link
              href="/admin/engagement/live-call"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Phone className="h-4 w-4" /> Start your first call
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {interactions.map((ix) => (
              <Link
                key={ix.id}
                href={`/admin/engagement/interactions/${ix.id}`}
                className="flex items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/50 transition-colors group"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#063b32]/10">
                  <Phone className="h-4 w-4 text-[#063b32]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#111111]">
                          {ix.contact
                            ? `${ix.contact.first_name} ${ix.contact.last_name || ""}`
                            : "Unknown contact"}
                        </p>
                        {ix.organisation && (
                          <span className="text-xs text-[#6f6b62]">· {ix.organisation.name}</span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${typeColors[ix.interaction_type] || typeColors.call}`}>
                          {ix.interaction_type}
                        </span>
                        {ix.ai_structured_data && (
                          <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                            <Sparkles className="h-2.5 w-2.5" /> AI structured
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#6f6b62] line-clamp-2">{ix.summary || "No summary recorded"}</p>

                      <div className="mt-2 flex items-center gap-4 text-[10px] text-[#6f6b62]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ix.interaction_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ix.interaction_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {ix.pain_point_ids?.length ? (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" />
                            {ix.pain_point_ids.length} pain point{ix.pain_point_ids.length !== 1 ? "s" : ""}
                          </span>
                        ) : null}
                        {(ix.ai_structured_data as Record<string, string[]> | null)?.agreed_next_steps?.length ? (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {(ix.ai_structured_data as Record<string, string[]>).agreed_next_steps.length} next step{(ix.ai_structured_data as Record<string, string[]>).agreed_next_steps.length !== 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-[#6f6b62]/40 group-hover:text-[#063b32] mt-1 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {total > limit && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-[#6f6b62]">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}