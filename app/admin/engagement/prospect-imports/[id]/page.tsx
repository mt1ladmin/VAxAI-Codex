"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight,
  ExternalLink, FileText, Loader2, RefreshCw, X,
} from "lucide-react";
import {
  type ProspectImportBatch, type ProspectQueueEntry,
  PROSPECT_QUEUE_STATUSES,
} from "@/lib/engagement/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewing: "bg-blue-100 text-blue-700",
  imported: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
};

const QUEUE_STATUS_COLORS: Record<string, string> = {
  "Needs review": "bg-amber-100 text-amber-700",
  "Ready to contact": "bg-blue-100 text-blue-700",
  "Contact planned": "bg-blue-100 text-blue-700",
  "Contact attempted": "bg-purple-100 text-purple-700",
  "No response": "bg-gray-100 text-gray-600",
  "Conversation held": "bg-teal-100 text-teal-700",
  "Follow-up required": "bg-orange-100 text-orange-700",
  "Opportunity": "bg-emerald-100 text-emerald-700",
  "Not suitable": "bg-red-100 text-red-600",
  "Do not contact": "bg-red-200 text-red-700",
  "Closed": "bg-gray-200 text-gray-600",
};

export default function ImportBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<ProspectImportBatch | null>(null);
  const [entries, setEntries] = useState<ProspectQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingBatchStatus, setUpdatingBatchStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [batchRes, queueRes] = await Promise.all([
      fetch(`/api/admin/engagement/prospect-imports/${id}`),
      fetch(`/api/admin/engagement/prospect-queue?batch_id=${id}&limit=500`),
    ]);
    const [batchJson, queueJson] = await Promise.all([
      batchRes.json() as Promise<{ data: ProspectImportBatch }>,
      queueRes.json() as Promise<{ data: ProspectQueueEntry[] }>,
    ]);
    setBatch(batchJson.data || null);
    setEntries(queueJson.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateBatchStatus = async (status: ProspectImportBatch["status"]) => {
    if (!batch) return;
    setUpdatingBatchStatus(true);
    await fetch(`/api/admin/engagement/prospect-imports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBatch((b) => b ? { ...b, status } : b);
    setUpdatingBatchStatus(false);
  };

  const filtered = entries.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.raw_org_name?.toLowerCase().includes(q) ||
        e.raw_contact_name?.toLowerCase().includes(q) ||
        e.raw_email?.toLowerCase().includes(q) ||
        e.raw_phone?.toLowerCase().includes(q) ||
        false
      );
    }
    return true;
  });

  // Tally counts by status
  const statusCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const warningCount = entries.filter((e) => e.duplicate_warning || e.previous_contact_warning).length;

  if (loading) return <div className="p-12 text-center text-sm text-[#6f6b62]">Loading…</div>;
  if (!batch) return <div className="p-12 text-center text-sm text-red-600">Import batch not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/prospect-imports" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Prospect Imports
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#6f6b62]" />
              <h1 className="text-2xl font-semibold text-[#111111]">{batch.filename}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[batch.status] || "bg-gray-100 text-gray-600"}`}>
                {batch.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#6f6b62]">
              Uploaded {new Date(batch.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              {" · "}{batch.row_count ?? 0} rows · {batch.imported_count} imported
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-2 text-sm text-[#6f6b62] hover:text-[#111111] transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {batch.status !== "imported" && (
              <button
                onClick={() => void updateBatchStatus("imported")}
                disabled={updatingBatchStatus}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {updatingBatchStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Mark imported
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-[#111111]/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Total</p>
            <p className="mt-1 text-2xl font-bold text-[#111111]">{entries.length}</p>
          </div>
          <div className="rounded-xl border border-[#111111]/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Needs review</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{statusCounts["Needs review"] || 0}</p>
          </div>
          <div className="rounded-xl border border-[#111111]/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Opportunity</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{statusCounts["Opportunity"] || 0}</p>
          </div>
          <div className="rounded-xl border border-[#111111]/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Warnings</p>
            <p className="mt-1 text-2xl font-bold text-red-500">{warningCount}</p>
          </div>
        </div>

        {/* Warnings banner */}
        {warningCount > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              {warningCount} {warningCount === 1 ? "entry has" : "entries have"} a duplicate or prior-contact warning — review them before reaching out.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors"
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter("")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!statusFilter ? "bg-[#063b32] text-white" : "bg-[#f7f4ea] text-[#6f6b62] hover:text-[#111111]"}`}
            >
              All ({entries.length})
            </button>
            {PROSPECT_QUEUE_STATUSES.map((s) => {
              const count = statusCounts[s] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#063b32] text-white" : "bg-[#f7f4ea] text-[#6f6b62] hover:text-[#111111]"}`}
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Queue entries table */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <p className="text-sm text-[#6f6b62]">No entries match your filters.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
            <div className="divide-y divide-[#111111]/5">
              {filtered.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/admin/engagement/prospect-queue/${entry.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f4ea] transition-colors group"
                >
                  {/* Warning indicator */}
                  <div className="shrink-0 w-5">
                    {(entry.duplicate_warning || entry.previous_contact_warning) && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] truncate">
                        {entry.raw_org_name || entry.raw_contact_name || <span className="text-[#6f6b62] italic">Unnamed</span>}
                      </p>
                      {entry.raw_contact_name && entry.raw_org_name && (
                        <span className="text-xs text-[#6f6b62] truncate">{entry.raw_contact_name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      {entry.raw_email && <span className="text-xs text-[#6f6b62]">{entry.raw_email}</span>}
                      {entry.raw_phone && <span className="text-xs text-[#6f6b62]">{entry.raw_phone}</span>}
                      {entry.raw_industry && <span className="text-xs text-[#6f6b62]">{entry.raw_industry}</span>}
                      {entry.raw_location && <span className="text-xs text-[#6f6b62]">{entry.raw_location}</span>}
                    </div>
                    {entry.duplicate_warning && (
                      <p className="mt-1 text-[10px] text-amber-600 font-semibold">{entry.duplicate_warning}</p>
                    )}
                    {entry.previous_contact_warning && (
                      <p className="mt-0.5 text-[10px] text-orange-600 font-semibold">{entry.previous_contact_warning}</p>
                    )}
                  </div>

                  {/* Status & CRM links */}
                  <div className="shrink-0 flex items-center gap-3">
                    {entry.organisation && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] bg-[#063b32]/8 rounded-full px-2 py-0.5">
                        <ExternalLink className="h-3 w-3" /> CRM
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${QUEUE_STATUS_COLORS[entry.status] || "bg-gray-100 text-gray-600"}`}>
                      {entry.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#6f6b62] group-hover:text-[#063b32]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Column mapping summary */}
        {batch.column_mapping && Object.keys(batch.column_mapping).length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Column mapping used</h2>
            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7f4ea] border-b border-[#111111]/10">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">CSV column</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Mapped to</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/5">
                  {Object.entries(batch.column_mapping).map(([col, field]) => (
                    <tr key={col} className="hover:bg-[#f7f4ea]/50">
                      <td className="px-4 py-2.5 text-[#111111] font-mono text-xs">{col}</td>
                      <td className="px-4 py-2.5 text-[#6f6b62] text-xs">
                        {field ? (
                          <span className="rounded bg-[#f7f4ea] px-2 py-0.5 font-semibold text-[#063b32]">{field}</span>
                        ) : (
                          <span className="text-[#6f6b62]/50 italic">skipped</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {batch.notes && (
          <div className="mt-6 rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">Notes</p>
            <p className="text-sm text-[#111111] whitespace-pre-wrap">{batch.notes}</p>
          </div>
        )}

        {/* Dismiss controls */}
        <div className="mt-8 flex gap-3">
          {batch.status === "imported" ? (
            <button
              onClick={() => void updateBatchStatus("reviewing")}
              disabled={updatingBatchStatus}
              className="flex items-center gap-2 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm text-[#6f6b62] hover:text-[#111111] disabled:opacity-60"
            >
              <X className="h-4 w-4" /> Reopen batch
            </button>
          ) : null}
          {batch.status !== "failed" && batch.status !== "imported" && (
            <button
              onClick={() => void updateBatchStatus("failed")}
              disabled={updatingBatchStatus}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Mark as failed
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
