"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PROSPECT_QUEUE_STAGE_GROUPS } from "@/lib/engagement/prospect-queue-stages";
import { PROSPECT_FINDER_PATH, PROSPECT_QUEUE_PATH } from "@/lib/engagement/journey";
import { STAGE_COLORS } from "@/lib/engagement/types";

type ClientOpportunity = {
  id: string;
  title: string;
  stage: string;
  indicative_value_low: number | null;
  indicative_value_high: number | null;
};

type Client = {
  id: string;
  first_name: string;
  last_name: string | null;
  role: string | null;
  professional_email: string | null;
  phone: string | null;
  updated_at: string;
  organisation: { id: string; name: string; industry: string | null } | null;
  client_opportunities: ClientOpportunity[];
  primary_stage: string;
  primary_service: string | null;
  primary_next_action: string | null;
  assigned_team_member: { id: string; display_name: string } | null;
  has_overdue_tasks: boolean;
};

type ValueMetric = { low: number; high: number; display: string | null };

type Metrics = {
  total: number;
  totalTasks: number;
  overdueTasks: number;
  pipelineValueAll: ValueMetric;
  pipelineValueActive: ValueMetric;
};

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
      <div className="mt-0.5 text-sm text-[#111111]">{children}</div>
    </div>
  );
}

const STAGE_FILTERS = [...PROSPECT_QUEUE_STAGE_GROUPS];

function formatValue(low: number | null, high: number | null) {
  if (!low && !high) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
  if (low && high && low !== high) return `${fmt(low)} – ${fmt(high)}`;
  if (low) return fmt(low);
  if (high) return fmt(high);
  return null;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    totalTasks: 0,
    overdueTasks: 0,
    pipelineValueAll: { low: 0, high: 0, display: null },
    pipelineValueActive: { low: 0, high: 0, display: null },
  });
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [newForm, setNewForm] = useState({ first_name: "", last_name: "", role: "", professional_email: "", phone: "" });

  const createNewContact = async () => {
    if (!newForm.first_name.trim()) return;
    setSavingNew(true);
    const contactRes = await fetch("/api/admin/engagement/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: newForm.first_name.trim(),
        last_name: newForm.last_name.trim() || null,
        role: newForm.role.trim() || null,
        professional_email: newForm.professional_email.trim() || null,
        phone: newForm.phone.trim() || null,
      }),
    });
    if (!contactRes.ok) { setSavingNew(false); return; }
    const { data: contact } = await contactRes.json() as { data: { id: string } };
    await fetch("/api/admin/engagement/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primary_contact_id: contact.id,
        title: `${newForm.first_name.trim()}${newForm.last_name.trim() ? ` ${newForm.last_name.trim()}` : ""} opportunity`,
        stage: "Identified",
      }),
    });
    setSavingNew(false);
    setShowNewModal(false);
    setNewForm({ first_name: "", last_name: "", role: "", professional_email: "", phone: "" });
    router.push(`/admin/engagement/prospect-queue/${contact.id}`);
  };

  const toggleSelect = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    "stopPropagation" in e && e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeSelected = async () => {
    setDeletingSelected(true);
    await Promise.all(
      [...selected].map((contactId) =>
        fetch("/api/admin/engagement/prospect-queue", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact_id: contactId }),
        }),
      ),
    );
    setDeletingSelected(false);
    setSelected(new Set());
    setShowDeleteConfirm(false);
    void load();
  };

  const load = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setLoading(true);
    }
    const params = new URLSearchParams();
    if (stageFilter) params.set("stage", stageFilter);
    const res = await fetch(`/api/admin/engagement/prospect-queue?${params.toString()}`);
    const json = (await res.json()) as { data: Client[]; metrics: Metrics };
    setClients(json.data || []);
    setMetrics(
      json.metrics || {
        total: 0,
        totalTasks: 0,
        overdueTasks: 0,
        pipelineValueAll: { low: 0, high: 0, display: null },
        pipelineValueActive: { low: 0, high: 0, display: null },
      },
    );
    hasLoadedRef.current = true;
    setLoading(false);
  }, [stageFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${c.first_name} ${c.last_name ?? ""}`.toLowerCase();
    return (
      name.includes(q) ||
      c.professional_email?.toLowerCase().includes(q) ||
      c.organisation?.name.toLowerCase().includes(q) ||
      c.primary_service?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Prospect Queue</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">
              Live engagements — update pipeline stage and next action on each record. Nothing is active here until promoted from Finder or Enquiries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-4 w-4" /> New contact
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {loading && clients.length === 0
            ? [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
                  <div className="h-3 w-20 rounded bg-[#f7f4ea]" />
                  <div className="mt-3 h-8 w-12 rounded bg-[#f7f4ea]/80" />
                </div>
              ))
            : (
              <>
                <div className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-[#6f6b62]">Active engagements</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#111111]">{metrics.total}</p>
                </div>
                <Link
                  href="/admin/engagement/pipeline"
                  className="rounded-xl border border-[#063b32]/15 bg-[#063b32]/5 px-4 py-3 transition-colors hover:border-[#063b32]/25 hover:bg-[#063b32]/8"
                >
                  <p className="text-xs font-semibold text-[#063b32]/80">Open tasks</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#063b32]">{metrics.totalTasks}</p>
                </Link>
                <Link
                  href="/admin/engagement/pipeline"
                  className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 transition-colors hover:border-red-300 hover:bg-red-50"
                >
                  <p className="text-xs font-semibold text-red-700">Tasks overdue</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-red-600">{metrics.overdueTasks}</p>
                </Link>
                {metrics.pipelineValueAll.display ? (
                  <div className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-[#6f6b62]">Pipeline value (all)</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-[#111111]">{metrics.pipelineValueAll.display}</p>
                  </div>
                ) : null}
                {metrics.pipelineValueActive.display ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                    <p className="text-xs font-semibold text-emerald-700">Pipeline value (active)</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-800">{metrics.pipelineValueActive.display}</p>
                  </div>
                ) : null}
              </>
            )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, org…"
              className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStageFilter(f.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  stageFilter === f.value
                    ? "bg-[#063b32] text-white"
                    : "border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove {selected.size} from queue
            </button>
          )}
          <p className="ml-auto text-sm text-[#6f6b62]">
            {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {/* List */}
        {loading && clients.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#6f6b62]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white py-16 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-[#6f6b62]/30" />
            <p className="text-sm font-semibold text-[#111111]">No engagements in the queue</p>
            <p className="mt-1 text-xs text-[#6f6b62]">
              Promote qualified prospects from Prospect Finder or website enquiries.
            </p>
            <a
              href={`${PROSPECT_FINDER_PATH}?unassigned=true`}
              className="mt-4 inline-flex rounded-full bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              Open Prospect Finder
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => {
              const fullName = `${c.first_name}${c.last_name ? ` ${c.last_name}` : ""}`;
              const initials = `${c.first_name[0] ?? ""}${c.last_name?.[0] ?? ""}`.toUpperCase();
              const stageColor = STAGE_COLORS[c.primary_stage] ?? "bg-gray-100 text-gray-600";
              const value = c.client_opportunities[0]
                ? formatValue(
                    c.client_opportunities[0].indicative_value_low,
                    c.client_opportunities[0].indicative_value_high
                  )
                : null;

              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`${PROSPECT_QUEUE_PATH}/${c.id}`)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") router.push(`${PROSPECT_QUEUE_PATH}/${c.id}`);
                  }}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition-colors group ${
                    selected.has(c.id)
                      ? "border-red-200 bg-red-50/30"
                      : "border-[#111111]/10 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/50"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={(e) => toggleSelect(c.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 cursor-pointer rounded border-[#111111]/20 accent-[#063b32]"
                    />
                  </div>
                  {/* Avatar */}
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#063b32] text-sm font-bold text-[#f5f274]">
                    {initials || <Briefcase className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <LabeledField label="Name">
                          <span className="font-semibold">{fullName}</span>
                        </LabeledField>
                        <LabeledField label="Organisation">
                          {c.organisation ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-[#6f6b62]" />
                              {c.organisation.name}
                            </span>
                          ) : (
                            <span className="text-[#6f6b62]">—</span>
                          )}
                        </LabeledField>
                        {c.professional_email && (
                          <LabeledField label="Email">
                            <a
                              href={`mailto:${c.professional_email}`}
                              onClick={(ev) => ev.stopPropagation()}
                              className="flex items-center gap-1 text-[#063b32] hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {c.professional_email}
                            </a>
                          </LabeledField>
                        )}
                        {c.phone && (
                          <LabeledField label="Phone">
                            <a
                              href={`tel:${c.phone}`}
                              onClick={(ev) => ev.stopPropagation()}
                              className="flex items-center gap-1 text-[#063b32] hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {c.phone}
                            </a>
                          </LabeledField>
                        )}
                        {c.role && (
                          <LabeledField label="Role">{c.role}</LabeledField>
                        )}
                        {value && (
                          <LabeledField label="Value">
                            <span className="font-semibold text-[#063b32]">{value}</span>
                          </LabeledField>
                        )}
                        {c.client_opportunities.length > 1 && (
                          <LabeledField label="Services">
                            <span className="text-[#6f6b62]">{c.client_opportunities.length} service records</span>
                          </LabeledField>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2 max-w-[200px]">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stageColor}`}>
                          {c.primary_stage}
                        </span>
                        {c.assigned_team_member && (
                          <span className="text-[10px] text-[#6f6b62]">{c.assigned_team_member.display_name}</span>
                        )}
                        {c.primary_next_action && (
                          <span className="text-[10px] text-[#111111] truncate max-w-full" title={c.primary_next_action}>
                            → {c.primary_next_action}
                          </span>
                        )}
                        {c.has_overdue_tasks && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            Overdue tasks
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#6f6b62]/40 group-hover:text-[#063b32] transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111111]">Remove from queue?</h2>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded-lg p-1 hover:bg-[#f7f4ea]"><X className="h-4 w-4 text-[#6f6b62]" /></button>
            </div>
            <p className="text-sm text-[#6f6b62]">
              This will mark {selected.size === 1 ? "this contact's" : `${selected.size} contacts'`} active opportunities as Lost and remove {selected.size === 1 ? "them" : "them all"} from the queue. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
                Cancel
              </button>
              <button type="button" onClick={() => void removeSelected()} disabled={deletingSelected} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deletingSelected ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm removal
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111111]">New contact</h2>
              <button type="button" onClick={() => setShowNewModal(false)} className="rounded-lg p-1 hover:bg-[#f7f4ea]"><X className="h-4 w-4 text-[#6f6b62]" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">First name *</label>
                  <input value={newForm.first_name} onChange={(e) => setNewForm((f) => ({ ...f, first_name: e.target.value }))} className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" autoFocus placeholder="First name" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Last name</label>
                  <input value={newForm.last_name} onChange={(e) => setNewForm((f) => ({ ...f, last_name: e.target.value }))} className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Role</label>
                <input value={newForm.role} onChange={(e) => setNewForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" placeholder="e.g. CEO, Operations Manager" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Email</label>
                <input type="email" value={newForm.professional_email} onChange={(e) => setNewForm((f) => ({ ...f, professional_email: e.target.value }))} className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62] mb-1">Phone</label>
                <input type="tel" value={newForm.phone} onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]" placeholder="+44..." />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewModal(false)} className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Cancel</button>
              <button type="button" onClick={() => void createNewContact()} disabled={!newForm.first_name.trim() || savingNew} className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50">
                {savingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
