"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
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
import type { ReactNode } from "react";
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

type TriFilter = "all" | "yes" | "no";

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

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
      <div className="mt-0.5 text-sm text-[#111111]">{children}</div>
    </div>
  );
}

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
  const [nextActionFilter, setNextActionFilter] = useState<TriFilter>("all");
  const [opportunityFilter, setOpportunityFilter] = useState<TriFilter>("all");
  const [contactIdsWithOpportunity, setContactIdsWithOpportunity] = useState<Set<string>>(new Set());
  const [orgIdsWithOpportunity, setOrgIdsWithOpportunity] = useState<Set<string>>(new Set());
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const importRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    const [queueRes, oppRes] = await Promise.all([
      fetch(`/api/admin/engagement/prospect-queue?${params}`),
      fetch("/api/admin/engagement/opportunities?limit=500"),
    ]);
    const j = await queueRes.json() as { data: ProspectQueueEntry[] };
    const oppJson = await oppRes.json() as { data?: Array<{ organisation_id?: string | null; primary_contact_id?: string | null }> };
    const contactIds = new Set<string>();
    const orgIds = new Set<string>();
    for (const opp of oppJson.data || []) {
      if (opp.primary_contact_id) contactIds.add(opp.primary_contact_id);
      if (opp.organisation_id) orgIds.add(opp.organisation_id);
    }
    setContactIdsWithOpportunity(contactIds);
    setOrgIdsWithOpportunity(orgIds);
    setEntries(j.data || []);
    setSelected(new Set());
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

  const nextActionOptions = useMemo(
    () => [
      { value: "all", label: "Next action: all" },
      { value: "yes", label: "With next action" },
      { value: "no", label: "No next action" },
    ],
    [],
  );

  const opportunityOptions = useMemo(
    () => [
      { value: "all", label: "Opportunity: all" },
      { value: "yes", label: "Has opportunity" },
      { value: "no", label: "No opportunity" },
    ],
    [],
  );

  const entryHasOpportunity = useCallback((e: ProspectQueueEntry) => {
    return (
      (e.contact_id && contactIdsWithOpportunity.has(e.contact_id)) ||
      (e.organisation_id && orgIdsWithOpportunity.has(e.organisation_id))
    );
  }, [contactIdsWithOpportunity, orgIdsWithOpportunity]);

  const filtered = useMemo(() => entries.filter((e) => {
    const industry = (e.raw_industry || e.organisation?.industry || "").toLowerCase();
    const location = (e.raw_location || "").toLowerCase();

    if (industryFilter !== "all" && !industry.includes(industryFilter.toLowerCase())) return false;
    if (locationFilter !== "all" && !location.includes(locationFilter.toLowerCase())) return false;
    if (nextActionFilter === "yes" && !e.next_action) return false;
    if (nextActionFilter === "no" && e.next_action) return false;
    const hasOpportunity = entryHasOpportunity(e);
    if (opportunityFilter === "yes" && !hasOpportunity) return false;
    if (opportunityFilter === "no" && hasOpportunity) return false;

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
  }), [entries, industryFilter, locationFilter, nextActionFilter, opportunityFilter, search, entryHasOpportunity]);

  const metrics = useMemo(() => {
    const needsReview = filtered.filter((e) => e.status === "Needs review").length;
    const withNextAction = filtered.filter((e) => e.next_action).length;
    const withWarnings = filtered.filter((e) => e.duplicate_warning || e.previous_contact_warning).length;
    return {
      total: filtered.length,
      needsReview,
      withNextAction,
      withWarnings,
    };
  }, [filtered]);

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

  const hasActiveFilters =
    statusFilter !== "all" ||
    industryFilter !== "all" ||
    locationFilter !== "all" ||
    nextActionFilter !== "all" ||
    opportunityFilter !== "all" ||
    search.trim();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((e) => e.id)));
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    const res = await fetch("/api/admin/engagement/prospect-queue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    if (!res.ok) showToast("Could not delete selected prospects");
    else showToast(`Removed ${selected.size} prospect${selected.size !== 1 ? "s" : ""}`);
    setBulkDeleting(false);
    void fetchQueue();
  };

  return (
    <div className="min-h-screen bg-white">
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

      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Prospect Queue</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Imported and manually added prospects — review, contact, and convert.</p>
      </div>

      <div className="px-8 py-6">
        {/* Metrics */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#111111]/10 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Total</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#111111]">{loading ? "—" : metrics.total}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">Needs review</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-800">{loading ? "—" : metrics.needsReview}</p>
          </div>
          <div className="rounded-xl border border-[#111111]/10 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">With next action</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#063b32]">{loading ? "—" : metrics.withNextAction}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-700">With warnings</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-orange-800">{loading ? "—" : metrics.withWarnings}</p>
          </div>
        </div>

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
          <CustomSelect
            value={nextActionFilter}
            onChange={(v) => setNextActionFilter(v as TriFilter)}
            options={nextActionOptions}
            placeholder="Next action"
            className="w-44"
          />
          <CustomSelect
            value={opportunityFilter}
            onChange={(v) => setOpportunityFilter(v as TriFilter)}
            options={opportunityOptions}
            placeholder="Opportunity"
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
                setNextActionFilter("all");
                setOpportunityFilter("all");
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

        {/* Bulk actions + count */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6f6b62]">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => void bulkDelete()}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="grid h-8 w-8 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="ml-auto text-sm text-[#6f6b62]">
            {loading ? "Loading…" : `${filtered.length} prospect${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[#f7f4ea] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea] py-16 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-[#6f6b62]/30" />
            <p className="text-sm font-semibold text-[#111111]">No prospects match your filters</p>
            <button
              type="button"
              onClick={() => { setFormError(null); setShowAddModal(true); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> Add to queue
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-4 px-1 py-1">
              <button
                type="button"
                onClick={toggleAll}
                className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                  selected.size === filtered.length && filtered.length > 0
                    ? "border-[#063b32] bg-[#063b32]"
                    : "border-[#111111]/25 bg-white"
                }`}
              >
                {selected.size === filtered.length && filtered.length > 0 && <Check className="h-3 w-3 text-white" />}
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Select all</span>
            </div>
            {filtered.map((e) => {
              const orgName = e.organisation?.name || e.raw_org_name || "—";
              const contactName = e.contact
                ? `${e.contact.first_name} ${e.contact.last_name || ""}`.trim()
                : e.raw_contact_name;
              const email = e.contact?.professional_email || e.raw_email;
              const industry = e.raw_industry || e.organisation?.industry;

              return (
                <div
                  key={e.id}
                  className="flex items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => toggleSelect(e.id)}
                    className={`mt-3 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                      selected.has(e.id) ? "border-[#063b32] bg-[#063b32]" : "border-[#111111]/25 bg-white"
                    }`}
                  >
                    {selected.has(e.id) && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#063b32]/10">
                    <Inbox className="h-4 w-4 text-[#063b32]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <LabeledField label="Organisation">
                          <Link href={`/admin/engagement/prospect-queue/${e.id}`} className="font-semibold hover:text-[#063b32] hover:underline">
                            {orgName}
                          </Link>
                        </LabeledField>
                        <LabeledField label="Contact">{contactName || "—"}</LabeledField>
                        <LabeledField label="Email">
                          {email ? <a href={`mailto:${email}`} className="text-[#063b32] hover:underline">{email}</a> : "—"}
                        </LabeledField>
                        <LabeledField label="Phone">{e.raw_phone || "—"}</LabeledField>
                        <LabeledField label="Industry">{industry || "—"}</LabeledField>
                        <LabeledField label="Location">{e.raw_location || "—"}</LabeledField>
                        <LabeledField label="Status">
                          <div className={updatingId === e.id ? "opacity-50 pointer-events-none" : ""}>
                            <CustomSelect
                              value={e.status}
                              onChange={(status) => void updateStatus(e.id, status)}
                              options={PROSPECT_QUEUE_STATUSES.map((s) => ({ value: s, label: s }))}
                              placeholder="Status"
                              className="w-full max-w-[11rem]"
                            />
                          </div>
                        </LabeledField>
                        <LabeledField label="Next action">
                          {e.next_action ? (
                            <>
                              {e.next_action}
                              {e.next_action_date && (
                                <span className="block text-xs text-[#6f6b62]">
                                  {new Date(e.next_action_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                              )}
                            </>
                          ) : "—"}
                        </LabeledField>
                        {e.raw_notes && (
                          <div className="sm:col-span-2 lg:col-span-4">
                            <LabeledField label="Notes">
                              <span className="line-clamp-2 text-[#6f6b62]">{e.raw_notes}</span>
                            </LabeledField>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {(e.duplicate_warning || e.previous_contact_warning) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                            <AlertTriangle className="h-3 w-3" />
                            {e.duplicate_warning ? "Duplicate" : "Previous contact"}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setFormError(null); setEditingEntry(e); }}
                            className="rounded-md border border-[#111111]/15 p-2 text-[#6f6b62] hover:border-[#063b32]/30 hover:text-[#063b32]"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(e)}
                            className="rounded-md border border-[#111111]/15 p-2 text-[#6f6b62] hover:border-red-200 hover:text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/engagement/prospect-queue/${e.id}`}
                            className="rounded-md border border-[#111111]/15 p-2 text-[#6f6b62] hover:border-[#063b32]/30 hover:text-[#063b32]"
                            title="View details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
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