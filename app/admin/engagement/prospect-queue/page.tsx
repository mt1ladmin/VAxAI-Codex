"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Inbox,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { ProspectQueueEntry } from "@/lib/engagement/types";
import { INDUSTRIES, PROSPECT_QUEUE_STATUSES } from "@/lib/engagement/types";

const UK_REGIONS = [
  "London",
  "South East",
  "South West",
  "East of England",
  "East Midlands",
  "West Midlands",
  "North West",
  "North East",
  "Yorkshire and the Humber",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "Remote / UK-wide",
];

type ProspectForm = {
  raw_org_name: string;
  raw_contact_name: string;
  raw_email: string;
  raw_phone: string;
  raw_website: string;
  raw_industry: string;
  raw_location: string;
  raw_linkedin: string;
  raw_notes: string;
};

const EMPTY_FORM: ProspectForm = {
  raw_org_name: "",
  raw_contact_name: "",
  raw_email: "",
  raw_phone: "",
  raw_website: "",
  raw_industry: "",
  raw_location: "",
  raw_linkedin: "",
  raw_notes: "",
};

const FORM_FIELDS: Array<{ key: keyof ProspectForm; label: string; type?: string; multiline?: boolean }> = [
  { key: "raw_org_name", label: "Organisation" },
  { key: "raw_contact_name", label: "Contact name" },
  { key: "raw_email", label: "Email", type: "email" },
  { key: "raw_phone", label: "Phone", type: "tel" },
  { key: "raw_website", label: "Website", type: "url" },
  { key: "raw_industry", label: "Industry" },
  { key: "raw_location", label: "Location" },
  { key: "raw_linkedin", label: "LinkedIn", type: "url" },
  { key: "raw_notes", label: "Notes", multiline: true },
];

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-left text-sm text-[#111111] outline-none transition-colors hover:border-[#063b32]/40 focus:border-[#063b32]"
      >
        <span className={`truncate ${selected?.value ? "text-[#111111]" : "text-[#6f6b62]"}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6f6b62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-52 w-full min-w-[10rem] overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value || "__empty"}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[#f7f4ea] ${
                value === opt.value ? "bg-[#063b32]/8 font-semibold text-[#063b32]" : "text-[#111111]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProspectFormModal({
  title,
  initial,
  saving,
  error,
  onClose,
  onSave,
  onDelete,
  deleting,
}: {
  title: string;
  initial: ProspectForm;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (form: ProspectForm) => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => { setForm(initial); }, [initial]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <h2 className="text-base font-semibold text-[#111111]">{title}</h2>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3 max-h-[65vh] overflow-y-auto">
          {FORM_FIELDS.map(({ key, label, type, multiline }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[#6f6b62]">{label}</label>
              {multiline ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#111111]/15 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#063b32]"
                />
              ) : (
                <input
                  type={type || "text"}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#111111]/15 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#063b32]"
                />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#111111]/10 px-6 py-4">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting || saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(form)}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function entryToForm(e: ProspectQueueEntry): ProspectForm {
  return {
    raw_org_name: e.raw_org_name || e.organisation?.name || "",
    raw_contact_name: e.raw_contact_name || (e.contact ? `${e.contact.first_name} ${e.contact.last_name || ""}`.trim() : ""),
    raw_email: e.raw_email || e.contact?.professional_email || "",
    raw_phone: e.raw_phone || "",
    raw_website: e.raw_website || "",
    raw_industry: e.raw_industry || e.organisation?.industry || "",
    raw_location: e.raw_location || "",
    raw_linkedin: e.raw_linkedin || "",
    raw_notes: e.raw_notes || "",
  };
}

export default function ProspectQueuePage() {
  const [entries, setEntries] = useState<ProspectQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProspectQueueEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProspectQueueEntry | null>(null);
  const importRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/engagement/prospect-queue?${params}`);
    const j = await res.json() as { data: ProspectQueueEntry[] };
    setEntries(j.data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { void fetchQueue(); }, [fetchQueue]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (importRef.current && !importRef.current.contains(e.target as Node)) setShowImportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const industryOptions = useMemo(
    () => [{ value: "all", label: "All industries" }, ...INDUSTRIES.map((i) => ({ value: i, label: i }))],
    [],
  );

  const locationOptions = useMemo(
    () => [{ value: "all", label: "All locations" }, ...UK_REGIONS.map((r) => ({ value: r, label: r }))],
    [],
  );

  const statusOptions = useMemo(
    () => [{ value: "all", label: "All statuses" }, ...PROSPECT_QUEUE_STATUSES.map((s) => ({ value: s, label: s }))],
    [],
  );

  const filtered = useMemo(() => entries.filter((e) => {
    const industry = (e.raw_industry || e.organisation?.industry || "").toLowerCase();
    const location = (e.raw_location || "").toLowerCase();

    if (industryFilter !== "all" && !industry.includes(industryFilter.toLowerCase())) return false;
    if (locationFilter !== "all" && !location.includes(locationFilter.toLowerCase())) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.raw_org_name?.toLowerCase().includes(q) ||
      e.raw_contact_name?.toLowerCase().includes(q) ||
      e.raw_email?.toLowerCase().includes(q) ||
      e.raw_industry?.toLowerCase().includes(q) ||
      e.raw_location?.toLowerCase().includes(q) ||
      e.organisation?.name?.toLowerCase().includes(q) ||
      e.raw_notes?.toLowerCase().includes(q)
    );
  }), [entries, industryFilter, locationFilter, search]);

  const handleAdd = async (form: ProspectForm) => {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/admin/engagement/prospect-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json() as { error?: string };
    if (!res.ok) { setFormError(j.error || "Failed to save."); setSaving(false); return; }
    setShowAddModal(false);
    setSaving(false);
    showToast("Prospect added to queue");
    void fetchQueue();
  };

  const handleEdit = async (form: ProspectForm) => {
    if (!editingEntry) return;
    setSaving(true);
    setFormError(null);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${editingEntry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json() as { error?: string };
    if (!res.ok) { setFormError(j.error || "Failed to save."); setSaving(false); return; }
    setEditingEntry(null);
    setSaving(false);
    showToast("Prospect updated");
    void fetchQueue();
  };

  const handleDelete = async (entry: ProspectQueueEntry) => {
    setDeleting(true);
    const res = await fetch(`/api/admin/engagement/prospect-queue/${entry.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Could not remove prospect");
      setDeleting(false);
      return;
    }
    setConfirmDelete(null);
    setEditingEntry(null);
    setDeleting(false);
    showToast("Prospect removed");
    void fetchQueue();
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch(`/api/admin/engagement/prospect-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    void fetchQueue();
  };

  const syncFromStorage = async () => {
    setSyncing(true);
    setShowImportMenu(false);
    try {
      const res = await fetch("/api/admin/engagement/prospect-sync?mode=files", { method: "POST" });
      const j = await res.json() as { filesProcessed?: number; entriesCreated?: number; errors?: string[] };
      showToast(`Synced ${j.entriesCreated || 0} entries from ${j.filesProcessed || 0} files`);
      void fetchQueue();
    } catch {
      showToast("Sync failed — check bucket permissions");
    } finally {
      setSyncing(false);
    }
  };

  const runAiDedup = async () => {
    setSyncing(true);
    setShowImportMenu(false);
    try {
      const res = await fetch("/api/admin/engagement/prospect-sync?mode=ai", { method: "POST" });
      const j = await res.json() as { aiProcessed?: number };
      showToast(`AI check complete — ${j.aiProcessed || 0} processed`);
      void fetchQueue();
    } catch {
      showToast("AI dedup failed");
    } finally {
      setSyncing(false);
    }
  };

  const hasActiveFilters = statusFilter !== "all" || industryFilter !== "all" || locationFilter !== "all" || search.trim();

  return (
    <div className="min-h-screen bg-[#f7f4ea]/30">
      {showAddModal && (
        <ProspectFormModal
          title="Add to queue"
          initial={EMPTY_FORM}
          saving={saving}
          error={formError}
          onClose={() => { setShowAddModal(false); setFormError(null); }}
          onSave={handleAdd}
        />
      )}
      {editingEntry && !confirmDelete && (
        <ProspectFormModal
          title="Edit prospect"
          initial={entryToForm(editingEntry)}
          saving={saving}
          error={formError}
          onClose={() => { setEditingEntry(null); setFormError(null); }}
          onSave={handleEdit}
          onDelete={() => setConfirmDelete(editingEntry)}
          deleting={deleting}
        />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-[#111111]">Remove prospect?</h3>
            <p className="mt-2 text-sm text-[#6f6b62]">
              This will permanently remove{" "}
              <span className="font-medium text-[#111111]">
                {confirmDelete.raw_org_name || confirmDelete.organisation?.name || "this entry"}
              </span>{" "}
              from the queue.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(confirmDelete)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#063b32] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-10">
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prospects…"
              className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-[#063b32]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6b62] hover:text-[#111111]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Status"
            className="w-40"
          />
          <CustomSelect
            value={industryFilter}
            onChange={setIndustryFilter}
            options={industryOptions}
            placeholder="Industry"
            className="w-44"
          />
          <CustomSelect
            value={locationFilter}
            onChange={setLocationFilter}
            options={locationOptions}
            placeholder="Location"
            className="w-44"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setIndustryFilter("all");
                setLocationFilter("all");
              }}
              className="text-xs font-medium text-[#063b32] hover:underline"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div ref={importRef} className="relative">
              <button
                type="button"
                onClick={() => setShowImportMenu((v) => !v)}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#111111]/15 bg-white px-3 py-2.5 text-sm font-medium text-[#6f6b62] transition-colors hover:border-[#063b32]/30 hover:text-[#111111] disabled:opacity-50"
              >
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import
              </button>
              {showImportMenu && (
                <div className="absolute right-0 z-30 mt-1 w-56 rounded-xl border border-[#111111]/15 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => void syncFromStorage()}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#111111] hover:bg-[#f7f4ea]"
                  >
                    <RefreshCw className="h-4 w-4 text-[#6f6b62]" />
                    Sync from storage
                  </button>
                  <button
                    type="button"
                    onClick={() => void runAiDedup()}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#111111] hover:bg-[#f7f4ea]"
                  >
                    <MoreHorizontal className="h-4 w-4 text-[#6f6b62]" />
                    Run AI dedup check
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setFormError(null); setShowAddModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" />
              Add to queue
            </button>
          </div>
        </div>

        {/* Count */}
        <p className="mb-4 text-xs text-[#6f6b62]">
          {loading ? "Loading…" : `${filtered.length} prospect${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#111111]/10 bg-white py-20 text-sm text-[#6f6b62]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#111111]/10 bg-white py-20 text-center shadow-sm">
            <Inbox className="mx-auto mb-3 h-8 w-8 text-[#6f6b62]/30" />
            <p className="text-sm text-[#6f6b62]">No prospects match your filters.</p>
            <button
              type="button"
              onClick={() => { setFormError(null); setShowAddModal(true); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> Add to queue
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const orgName = e.organisation?.name || e.raw_org_name || "Unnamed organisation";
              const contactName = e.contact
                ? `${e.contact.first_name} ${e.contact.last_name || ""}`.trim()
                : e.raw_contact_name;
              const email = e.contact?.professional_email || e.raw_email;
              const industry = e.raw_industry || e.organisation?.industry;

              return (
                <div
                  key={e.id}
                  className="group rounded-2xl border border-[#111111]/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/engagement/prospect-queue/${e.id}`}
                          className="text-base font-semibold text-[#111111] hover:text-[#063b32]"
                        >
                          {orgName}
                        </Link>
                        {(e.duplicate_warning || e.previous_contact_warning) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                            <AlertTriangle className="h-3 w-3" />
                            {e.duplicate_warning ? "Duplicate" : "Previous contact"}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6f6b62]">
                        {contactName && <span>{contactName}</span>}
                        {email && <span>{email}</span>}
                        {e.raw_phone && <span>{e.raw_phone}</span>}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {industry && (
                          <span className="rounded-lg bg-[#f7f4ea] px-2.5 py-1 text-xs font-medium text-[#6f6b62]">
                            {industry}
                          </span>
                        )}
                        {e.raw_location && (
                          <span className="rounded-lg bg-[#f7f4ea] px-2.5 py-1 text-xs font-medium text-[#6f6b62]">
                            {e.raw_location}
                          </span>
                        )}
                        {e.next_action && (
                          <span className="rounded-lg border border-[#111111]/10 px-2.5 py-1 text-xs text-[#111111]">
                            Next: {e.next_action}
                            {e.next_action_date && (
                              <> · {new Date(e.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div className={updatingId === e.id ? "opacity-50 pointer-events-none" : ""}>
                        <CustomSelect
                          value={e.status}
                          onChange={(status) => void updateStatus(e.id, status)}
                          options={PROSPECT_QUEUE_STATUSES.map((s) => ({ value: s, label: s }))}
                          placeholder="Status"
                          className="w-44"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => { setFormError(null); setEditingEntry(e); }}
                        className="rounded-xl border border-[#111111]/15 p-2 text-[#6f6b62] transition-colors hover:border-[#063b32]/30 hover:text-[#063b32]"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDelete(e)}
                        className="rounded-xl border border-[#111111]/15 p-2 text-[#6f6b62] transition-colors hover:border-red-200 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <Link
                        href={`/admin/engagement/prospect-queue/${e.id}`}
                        className="rounded-xl border border-[#111111]/15 p-2 text-[#6f6b62] transition-colors hover:border-[#063b32]/30 hover:text-[#063b32]"
                        title="View details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}