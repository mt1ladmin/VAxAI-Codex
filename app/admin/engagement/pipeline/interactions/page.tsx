"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Archive, Mail, MessageSquare, Phone, Trash2, User, X } from "lucide-react";
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
  const [showArchived, setShowArchived] = useState(false);
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (showArchived) params.set("archived", "true");
    params.set("limit", "100");
    const res = await fetch(`/api/admin/engagement/interactions?${params}`);
    const json = await res.json() as { data: EngagementInteraction[] };
    setInteractions(json.data || []);
    setLoading(false);
  }, [type, showArchived]);

  useEffect(() => { load(); }, [load]);

  const archive = async (id: string) => {
    await fetch(`/api/admin/engagement/interactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: "archived" }),
    });
    load();
  };

  const deleteInteraction = async (id: string) => {
    setDeleting(true);
    await fetch(`/api/admin/engagement/interactions/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    setDeleting(false);
    load();
  };

  const visible = showArchived
    ? interactions
    : interactions.filter((i) => i.outcome !== "archived");

  const archivedCount = interactions.filter((i) => i.outcome === "archived").length;

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
        <div className="mb-5 flex items-center gap-3">
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
          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                showArchived
                  ? "border-[#063b32] bg-[#063b32]/5 text-[#063b32]"
                  : "border-[#111111]/15 text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm text-[#6f6b62]">No interactions recorded yet.</p>
            <Link href="/admin/engagement/live-call" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#063b32] hover:underline">
              <Phone className="h-4 w-4" /> Start a call
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#6f6b62]">{visible.length} interaction{visible.length !== 1 ? "s" : ""}</p>
            {visible.map((i) => (
              <div
                key={i.id}
                className={`rounded-xl border border-[#111111]/10 p-5 transition-opacity ${i.outcome === "archived" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`rounded-full p-2 shrink-0 ${TYPE_COLORS[i.interaction_type] || "bg-gray-50 text-gray-600"}`}>
                      {TYPE_ICONS[i.interaction_type] ?? <MessageSquare className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#111111] capitalize">{i.interaction_type}</p>
                        {i.channel && i.channel !== i.interaction_type && (
                          <span className="text-xs text-[#6f6b62]">via {i.channel}</span>
                        )}
                        <span className="text-xs text-[#6f6b62]">
                          {new Date(i.interaction_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {i.outcome === "archived" && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Archived</span>
                        )}
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

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {i.outcome !== "archived" && (
                      <button
                        onClick={() => archive(i.id)}
                        title="Archive"
                        className="rounded-lg p-1.5 text-[#6f6b62] hover:bg-[#f7f4ea] hover:text-[#111111] transition-colors"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(i.id)}
                      title="Delete"
                      className="rounded-lg p-1.5 text-[#6f6b62] hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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

                {/* Inline delete confirmation */}
                {confirmDelete === i.id && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                    <p className="text-sm text-red-700 flex-1">Permanently delete this interaction?</p>
                    <button
                      onClick={() => deleteInteraction(i.id)}
                      disabled={deleting}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
