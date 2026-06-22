"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import { type EngagementInteraction } from "@/lib/engagement/types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <User className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
  linkedin: <MessageSquare className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  call: "bg-blue-50 text-blue-600",
  email: "bg-purple-50 text-purple-600",
  meeting: "bg-amber-50 text-amber-700",
  message: "bg-emerald-50 text-emerald-600",
  linkedin: "bg-sky-50 text-sky-600",
};

export default function InteractionsPage() {
  const [type, setType] = useState("");
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    params.set("limit", "100");
    const res = await fetch(`/api/admin/engagement/interactions?${params}`);
    const json = await res.json() as { data: EngagementInteraction[] };
    setInteractions(json.data || []);
    setLoading(false);
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Pipeline</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111111]">Interactions</h1>
          <Link
            href="/admin/engagement/live-call"
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Phone className="h-4 w-4" /> Start call
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="mb-5">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          >
            <option value="">All types</option>
            {["call", "email", "meeting", "message", "linkedin", "event", "other"].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : interactions.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm text-[#6f6b62]">No interactions recorded yet.</p>
            <Link href="/admin/engagement/live-call" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#063b32] hover:underline">
              <Phone className="h-4 w-4" /> Start a call
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#6f6b62]">{interactions.length} interaction{interactions.length !== 1 ? "s" : ""}</p>
            {interactions.map((i) => (
              <div key={i.id} className="rounded-xl border border-[#111111]/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`rounded-full p-2 ${TYPE_COLORS[i.interaction_type] || "bg-gray-50 text-gray-600"}`}>
                      {TYPE_ICONS[i.interaction_type] ?? <MessageSquare className="h-3.5 w-3.5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#111111] capitalize">{i.interaction_type}</p>
                        {i.channel && i.channel !== i.interaction_type && (
                          <span className="text-xs text-[#6f6b62]">via {i.channel}</span>
                        )}
                        <span className="text-xs text-[#6f6b62]">
                          {new Date(i.interaction_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {i.organisation && (
                        <Link href={`/admin/engagement/pipeline/organisations/${i.organisation.id}`} className="text-xs text-[#063b32] hover:underline">
                          {i.organisation.name}
                        </Link>
                      )}
                      {i.contact && (
                        <span className="ml-2 text-xs text-[#6f6b62]">
                          · {i.contact.first_name} {i.contact.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {i.outcome && (
                    <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62] shrink-0">
                      {i.outcome}
                    </span>
                  )}
                </div>

                {i.summary && (
                  <p className="mt-3 text-sm text-[#111111]">{i.summary}</p>
                )}

                {i.commitments && (
                  <div className="mt-2 rounded-lg bg-[#f5f274]/30 border border-[#f5f274] px-3 py-2">
                    <p className="text-xs font-semibold text-[#111111]">Commitments</p>
                    <p className="text-xs text-[#6f6b62]">{i.commitments}</p>
                  </div>
                )}

                {i.follow_up_date && (
                  <p className="mt-2 text-xs text-[#6f6b62]">
                    Follow up: {new Date(i.follow_up_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
