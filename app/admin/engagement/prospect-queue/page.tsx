"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Inbox,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { ProspectQueueEntry } from "@/lib/engagement/types";
import { PROSPECT_QUEUE_STATUSES, PROSPECT_QUEUE_STATUS_COLORS } from "@/lib/engagement/types";

// ----------------------------------------------------------------
// Add Prospect Modal
// ----------------------------------------------------------------
function AddProspectModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    raw_org_name: "", raw_contact_name: "", raw_email: "", raw_phone: "",
    raw_website: "", raw_industry: "", raw_location: "", raw_linkedin: "", raw_notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/engagement/prospect-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json() as { error?: string };
    if (!res.ok) { setError(j.error || "Failed to save."); setSaving(false); return; }
    onSaved();
    onClose();
  };

  const fields: Array<{ key: keyof typeof form; label: string; type?: string }> = [
    { key: "raw_org_name", label: "Organisation name" },
    { key: "raw_contact_name", label: "Contact name" },
    { key: "raw_email", label: "Email", type: "email" },
    { key: "raw_phone", label: "Phone", type: "tel" },
    { key: "raw_website", label: "Website", type: "url" },
    { key: "raw_industry", label: "Industry" },
    { key: "raw_location", label: "Location" },
    { key: "raw_linkedin", label: "LinkedIn URL" },
    { key: "raw_notes", label: "Notes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Add prospect manually</h2>
          <button onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 max-h-[65vh] overflow-y-auto">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">{label}</label>
              {key === "raw_notes" ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-none"
                />
              ) : (
                <input
                  type={type || "text"}
                  value={form[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="border-t border-[#111111]/10 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Add to queue"}
          </button>
          <button onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main page
// ----------------------------------------------------------------
export default function ProspectQueuePage() {
  const [entries, setEntries] = useState<ProspectQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const fetchQueue = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/engagement/prospect-queue?${params}`);
    const j = await res.json() as { data: ProspectQueueEntry[] };
    setEntries(j.data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    fetchQueue();
  };

  const filtered = entries.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.raw_org_name?.toLowerCase().includes(q) ||
      e.raw_contact_name?.toLowerCase().includes(q) ||
      e.raw_email?.toLowerCase().includes(q) ||
      e.raw_industry?.toLowerCase().includes(q) ||
      e.raw_location?.toLowerCase().includes(q) ||
      e.organisation?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      {showAddModal && (
        <AddProspectModal onClose={() => setShowAddModal(false)} onSaved={fetchQueue} />
      )}

      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-[#111111]">Prospect Queue</h1>
            <p className="mt-1 text-sm text-[#6f6b62]">Review and manage your prospect work queue.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-4 w-4" /> Add manually
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              statusFilter === "all" ? "bg-[#063b32] text-white" : "border border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32]/30"
            }`}
          >
            All
          </button>
          {PROSPECT_QUEUE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-[#063b32] text-white"
                  : "border border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32]/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospects…"
            className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6b62]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[#6f6b62]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/40 py-16 text-center">
            <Inbox className="mx-auto h-8 w-8 text-[#6f6b62]/30 mb-2" />
            <p className="text-sm text-[#6f6b62]">No prospects found.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f7f4ea] border-b border-[#111111]/10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Organisation</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Contact</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Industry / Location</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Next action</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6f6b62]">Flags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const orgName = e.organisation?.name || e.raw_org_name || "—";
                  const contactName = e.contact
                    ? `${e.contact.first_name} ${e.contact.last_name || ""}`.trim()
                    : e.raw_contact_name || "—";
                  const email = e.contact?.professional_email || e.raw_email;
                  const industry = e.raw_industry || e.organisation?.industry || null;
                  const statusColor = PROSPECT_QUEUE_STATUS_COLORS[e.status] || "bg-gray-100 text-gray-500";

                  return (
                    <tr key={e.id} className="border-t border-[#111111]/5 hover:bg-[#f7f4ea]/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#111111]">{orgName}</p>
                        {e.raw_website && (
                          <a href={e.raw_website.startsWith("http") ? e.raw_website : `https://${e.raw_website}`} target="_blank" rel="noreferrer" className="text-xs text-[#063b32] hover:underline">
                            {e.raw_website}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#111111]">{contactName}</p>
                        {email && <p className="text-xs text-[#6f6b62]">{email}</p>}
                        {e.raw_phone && <p className="text-xs text-[#6f6b62]">{e.raw_phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-[#6f6b62]">
                        {industry && <p>{industry}</p>}
                        {e.raw_location && <p className="text-xs">{e.raw_location}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={e.status}
                            onChange={(ev) => updateStatus(e.id, ev.target.value)}
                            disabled={updatingId === e.id}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer appearance-none pr-6 ${statusColor}`}
                          >
                            {PROSPECT_QUEUE_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-60" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {e.next_action ? (
                          <div>
                            <p className="text-xs text-[#111111]">{e.next_action}</p>
                            {e.next_action_date && (
                              <p className="text-[10px] text-[#6f6b62]">
                                {new Date(e.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#6f6b62]/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {e.duplicate_warning && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                              <AlertTriangle className="h-3 w-3" /> Possible duplicate
                            </span>
                          )}
                          {e.previous_contact_warning && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                              Previous contact
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-[#6f6b62]">
          Showing {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
          {statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}
          {search ? ` matching "${search}"` : ""}.
        </p>
      </div>
    </div>
  );
}
