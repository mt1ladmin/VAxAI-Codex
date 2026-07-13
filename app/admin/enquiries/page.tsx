"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { AppSelect } from "@/components/ui/AppSelect";
import {
  ENQUIRY_STATUS_COLORS,
  ENQUIRY_STATUS_OPTIONS,
  ENQUIRY_STATUSES,
  enquiryStatusLabel,
  isUnreviewedEnquiry,
} from "@/lib/enquiries/constants";

type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  support_type: string;
  preferred_contact: string;
  telephone: string | null;
  details: string;
  wants_discovery_call: boolean;
  status: string;
  connected_post_id: string | null;
  connected_post_title: string | null;
  next_action: string | null;
  next_action_date: string | null;
  last_action: string | null;
  last_action_date: string | null;
  assigned_team_member_id: string | null;
  assigned_team_member_name: string | null;
  is_client: boolean;
  follow_up_task_title: string | null;
  source: string | null;
  organisation?: { id: string; name: string } | null;
  posts?: { id: string; title: string; slug: string } | null;
};

type DateFilter = "all" | "today" | "3days" | "7days" | "30days";
type DiscoveryFilter = "all" | "yes" | "no";
type SourceFilter = "all" | "Website enquiry" | "Email" | "Direct approach" | "Phone" | "Event" | "Other";

const SOURCE_FILTER_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Source: all" },
  { value: "Website enquiry", label: "Website enquiry" },
  { value: "Email", label: "Email" },
  { value: "Direct approach", label: "Direct approach" },
  { value: "Phone", label: "Phone" },
  { value: "Event", label: "Event" },
  { value: "Other", label: "Other" },
];

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Date received: all" },
  { value: "today", label: "Today" },
  { value: "3days", label: "Last 3 days" },
  { value: "7days", label: "Past 7 days" },
  { value: "30days", label: "Past 30 days" },
];

const DISCOVERY_FILTER_OPTIONS: { value: DiscoveryFilter; label: string }[] = [
  { value: "all", label: "Discovery call: all" },
  { value: "yes", label: "Discovery call: yes" },
  { value: "no", label: "Discovery call: no" },
];

const SUPPORT_TYPES = [
  "Admin Review",
  "Admin Support",
  "Access to Work",
  "General enquiry",
];

const SUPPORT_TYPE_OPTIONS = [
  { value: "all", label: "Support type: all" },
  ...SUPPORT_TYPES.map((t) => ({ value: t, label: t })),
];

const PREFERRED_CONTACT_OPTIONS = ["Email", "Telephone"];

const SOURCE_OPTIONS = ["Email", "Direct approach", "Phone", "Event", "Other"] as const;

const BLANK_ENQUIRY_FORM = {
  name: "",
  email: "",
  support_type: "General enquiry",
  details: "",
  preferred_contact: "Email",
  telephone: "",
  wants_discovery_call: false,
  source: "Email",
  source_other: "",
};

function statusTone(status: string): string {
  if (status === "Opportunity identified") return "text-emerald-700 font-medium";
  if (status === "Conversation held") return "text-sky-700 font-medium";
  if (status === "Follow up required") return "text-amber-700 font-medium";
  if (status === "Contact attempted") return "text-blue-700";
  if (status === "Not suitable" || status === "No response") return "text-[#6f6b62]";
  return "text-[#6f6b62]";
}

function matchesDateFilter(e: Enquiry, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const diffMs = Date.now() - new Date(e.created_at).getTime();
  const diffDays = diffMs / 86_400_000;
  if (filter === "today") return diffDays < 1;
  if (filter === "3days") return diffDays < 3;
  if (filter === "7days") return diffDays < 7;
  if (filter === "30days") return diffDays < 30;
  return true;
}

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilter>("all");
  const [supportTypeFilter, setSupportTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const [assigneeMenuId, setAssigneeMenuId] = useState<string | null>(null);
  const [nextActionPopupId, setNextActionPopupId] = useState<string | null>(null);
  const [nextActionDraft, setNextActionDraft] = useState("");
  const [savingNextAction, setSavingNextAction] = useState(false);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...BLANK_ENQUIRY_FORM });

  const load = useCallback(async () => {
    setLoading(true);
    const [enqRes, membersRes] = await Promise.all([
      fetch(`/api/admin/enquiries?status=all`).then((r) => r.json() as Promise<{ data: Enquiry[] }>),
      fetch("/api/admin/engagement/team-members").then((r) => r.json() as Promise<{ data: StudioTeamMember[] }>),
    ]);
    setEnquiries(enqRes.data ?? []);
    setTeamMembers(membersRes.data ?? []);
    setSelected(new Set());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => enquiries.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (!matchesDateFilter(e, dateFilter)) return false;
    if (discoveryFilter === "yes" && !e.wants_discovery_call) return false;
    if (discoveryFilter === "no" && e.wants_discovery_call) return false;
    if (supportTypeFilter !== "all" && e.support_type !== supportTypeFilter) return false;
    if (sourceFilter !== "all") {
      const src = e.source ?? "";
      if (sourceFilter === "Other") {
        const known = ["Website enquiry", "Email", "Direct approach", "Phone", "Event"];
        if (known.includes(src) || !src) return false;
      } else {
        if (src !== sourceFilter) return false;
      }
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.support_type.toLowerCase().includes(q) ||
      (e.organisation?.name || "").toLowerCase().includes(q) ||
      (e.next_action || "").toLowerCase().includes(q) ||
      (e.assigned_team_member_name || "").toLowerCase().includes(q)
    );
  }), [enquiries, search, statusFilter, dateFilter, discoveryFilter, supportTypeFilter]);

  const metrics = useMemo(() => ({
    total: enquiries.length,
    haveTasks: enquiries.filter((e) => !!e.follow_up_task_title).length,
    conversationHeld: enquiries.filter((e) => e.status === "Conversation held").length,
    followUpRequired: enquiries.filter((e) => e.status === "Follow up required").length,
    opportunityIdentified: enquiries.filter((e) => e.status === "Opportunity identified").length,
    isClient: enquiries.filter((e) => e.is_client).length,
  }), [enquiries]);

  const hasActiveFilters =
    dateFilter !== "all" ||
    discoveryFilter !== "all" ||
    supportTypeFilter !== "all" ||
    sourceFilter !== "all" ||
    search.trim().length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) setSelected(new Set());
    else setSelected(new Set(filtered.map((e) => e.id)));
  };

  const doDelete = async (ids: string[]) => {
    setDeleting(true);
    try {
      await fetch("/api/admin/enquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      void load();
    } finally {
      setDeleting(false);
    }
  };

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} enquir${selected.size === 1 ? "y" : "ies"}?`)) return;
    await doDelete([...selected]);
    setSelected(new Set());
  };

  const deleteSingle = async (id: string, name: string) => {
    if (!confirm(`Delete enquiry from "${name}"?`)) return;
    await doDelete([id]);
  };

  const patchEnquiry = useCallback(async (id: string, updates: Record<string, unknown>) => {
    const assigneeName = updates.assigned_team_member_id !== undefined
      ? (teamMembers.find((m) => m.id === updates.assigned_team_member_id)?.display_name ?? null)
      : undefined;
    setEnquiries((prev) => prev.map((e) => e.id !== id ? e : {
      ...e,
      ...(updates.status !== undefined ? { status: updates.status as string } : {}),
      ...(assigneeName !== undefined ? { assigned_team_member_id: updates.assigned_team_member_id as string | null, assigned_team_member_name: assigneeName } : {}),
      ...(updates.next_action !== undefined ? { next_action: updates.next_action as string | null } : {}),
    }));
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const j = await res.json() as { error?: string; hint?: string };
      window.alert(j.hint ? `${j.error}\n\n${j.hint}` : (j.error || "Failed to update"));
      void load();
    }
  }, [teamMembers, load]);

  const updateStatus = async (id: string, status: string) => {
    setStatusMenuId(null);
    await patchEnquiry(id, { status });
  };

  const createEnquiry = async () => {
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.details.trim()) return;
    setSavingAdd(true);
    const res = await fetch("/api/admin/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name,
        email: addForm.email,
        support_type: addForm.support_type,
        details: addForm.details,
        preferred_contact: addForm.preferred_contact,
        telephone: addForm.preferred_contact === "Telephone" ? addForm.telephone : null,
        wants_discovery_call: addForm.wants_discovery_call,
        source: addForm.source === "Other" ? (addForm.source_other.trim() || "Other") : addForm.source,
      }),
    });
    const json = await res.json() as { data?: { id: string }; error?: string };
    setSavingAdd(false);
    if (!res.ok || !json.data?.id) {
      window.alert(json.error || "Failed to create enquiry");
      return;
    }
    setShowAddModal(false);
    setAddForm({ ...BLANK_ENQUIRY_FORM });
    router.push(`/admin/enquiries/${json.data.id}`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#111111]/10 bg-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62]">Client Engagement</p>
            <h1 className="mt-1 font-serif text-2xl text-[#111111]">Enquiries</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6f6b62]">
              Inbound interest — qualify against VAxAI wraparound support.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-4 w-4" /> Add enquiry
          </button>
        </div>

        {/* Metrics */}
        {!loading && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-[#6f6b62]">Total</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#111111]">{metrics.total.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-[#6f6b62]">Have tasks</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#111111]">{metrics.haveTasks.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter("Conversation held")}
              className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50"
            >
              <p className="text-xs font-semibold text-sky-700">Conversation held</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-sky-800">{metrics.conversationHeld.toLocaleString()}</p>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Follow up required")}
              className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50"
            >
              <p className="text-xs font-semibold text-amber-700">Follow up required</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-amber-800">{metrics.followUpRequired.toLocaleString()}</p>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Opportunity identified")}
              className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <p className="text-xs font-semibold text-emerald-700">Opportunity identified</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-800">{metrics.opportunityIdentified.toLocaleString()}</p>
            </button>
          </div>
        )}

        {!loading && metrics.isClient > 0 && (
          <div className="mt-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5">
              <span className="text-xs font-semibold text-purple-800">Clients logged</span>
              <span className="text-sm font-bold tabular-nums text-purple-900">{metrics.isClient}</span>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, details, organisation…"
              className="w-full rounded-xl border border-[#111111]/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <Filter className="h-4 w-4 shrink-0 text-[#6f6b62]" />
          <FilterSelect
            value={dateFilter}
            onChange={(v) => setDateFilter(v as DateFilter)}
            options={DATE_FILTER_OPTIONS}
          />
          <FilterSelect
            value={sourceFilter}
            onChange={(v) => setSourceFilter(v as SourceFilter)}
            options={SOURCE_FILTER_OPTIONS}
          />
          <FilterSelect
            value={discoveryFilter}
            onChange={(v) => setDiscoveryFilter(v as DiscoveryFilter)}
            options={DISCOVERY_FILTER_OPTIONS}
          />
          <FilterSelect
            value={supportTypeFilter}
            onChange={setSupportTypeFilter}
            options={SUPPORT_TYPE_OPTIONS}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={ENQUIRY_STATUSES.map((s) => ({ value: s.key, label: s.label }))}
          />
          {(hasActiveFilters || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDateFilter("all");
                setDiscoveryFilter("all");
                setSupportTypeFilter("all");
                setSourceFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs font-medium text-[#063b32] hover:underline"
            >
              Clear filters
            </button>
          )}
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6f6b62]">{selected.size} selected</span>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void bulkDelete()}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Deleting…" : `Delete ${selected.size} selected`}
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="grid h-7 w-7 place-items-center rounded-full border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        {loading && enquiries.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#6f6b62]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 border-b border-[#111111]/10 bg-[#f7f4ea]/90 backdrop-blur-sm">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                <th className="w-10 px-3 py-3">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`grid h-4 w-4 place-items-center rounded border ${
                      selected.size === filtered.length && filtered.length > 0
                        ? "border-[#063b32] bg-[#063b32]"
                        : "border-[#111111]/25 bg-white"
                    }`}
                  >
                    {selected.size === filtered.length && filtered.length > 0 && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 font-semibold">Contact</th>
                <th className="px-3 py-3 font-semibold">Organisation</th>
                <th className="px-3 py-3 font-semibold">Support type</th>
                <th className="px-3 py-3 font-semibold">Assigned to</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Next action</th>
                <th className="px-3 py-3 font-semibold">Received</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-[#6f6b62]">
                    {enquiries.length === 0 ? "No enquiries yet." : "No enquiries match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="group hover:bg-[#f7f4ea]/40">
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={(ev) => { ev.stopPropagation(); toggleSelect(e.id); }}
                        className={`grid h-4 w-4 place-items-center rounded border ${
                          selected.has(e.id) ? "border-[#063b32] bg-[#063b32]" : "border-[#111111]/25 bg-white"
                        }`}
                      >
                        {selected.has(e.id) && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>
                    <td className="px-6 py-3.5">
                      <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-[#111111] hover:text-[#063b32]">
                        {e.name}
                      </Link>
                      {e.is_client && (
                        <span className="ml-2 rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-800">
                          Client
                        </span>
                      )}
                      <p className="truncate text-[11px] text-[#6f6b62]">{e.email}</p>
                    </td>
                    <td className="px-3 py-3.5 text-[#6f6b62]">{e.organisation?.name || "—"}</td>
                    <td className="px-3 py-3.5">
                      <span className="text-xs text-[#111111]">
                        {e.support_type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); setAssigneeMenuId(assigneeMenuId === e.id ? null : e.id); setStatusMenuId(null); }}
                          className="flex items-center gap-1 text-sm hover:opacity-70"
                        >
                          {e.assigned_team_member_name ? (
                            <>
                              <User className="h-3.5 w-3.5 text-[#6f6b62]" />
                              <span className="text-[#111111]">{e.assigned_team_member_name}</span>
                            </>
                          ) : (
                            <span className="text-[#6f6b62]">—</span>
                          )}
                          <ChevronDown className="h-3 w-3 text-[#6f6b62] opacity-50" />
                        </button>
                        {assigneeMenuId === e.id && (
                          <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[#111111]/10 bg-white shadow-lg">
                            <button
                              type="button"
                              onClick={() => { void patchEnquiry(e.id, { assigned_team_member_id: null }); setAssigneeMenuId(null); }}
                              className="w-full px-3 py-2 text-left text-xs text-[#6f6b62] hover:bg-[#f7f4ea]"
                            >
                              Unassigned
                            </button>
                            {teamMembers.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => { void patchEnquiry(e.id, { assigned_team_member_id: m.id }); setAssigneeMenuId(null); }}
                                className="w-full px-3 py-2 text-left text-xs text-[#111111] hover:bg-[#f7f4ea]"
                              >
                                {m.display_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); setStatusMenuId(statusMenuId === e.id ? null : e.id); setAssigneeMenuId(null); }}
                          className={`flex items-center gap-0.5 text-xs hover:opacity-70 ${statusTone(e.status)}`}
                        >
                          {enquiryStatusLabel(e.status)}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </button>
                        {statusMenuId === e.id && (
                          <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[#111111]/10 bg-white shadow-lg">
                            <button
                              type="button"
                              onClick={() => void updateStatus(e.id, "")}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[#f7f4ea] ${
                                isUnreviewedEnquiry(e.status) ? "font-semibold text-[#063b32]" : "text-[#6f6b62]"
                              }`}
                            >
                              <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                              Needs review
                            </button>
                            {ENQUIRY_STATUS_OPTIONS.map((s) => (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => void updateStatus(e.id, s.key)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[#f7f4ea]"
                              >
                                <span className={`h-2 w-2 shrink-0 rounded-full ${(ENQUIRY_STATUS_COLORS[s.key] ?? "").split(" ")[0]}`} />
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[200px] px-6 py-3.5 text-xs text-[#6f6b62]">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setNextActionPopupId(e.id);
                          setNextActionDraft(e.next_action || "");
                          setStatusMenuId(null);
                          setAssigneeMenuId(null);
                        }}
                        className="block w-full truncate text-left hover:text-[#063b32]"
                      >
                        {e.next_action || <span className="text-[#6f6b62]/50">Add next action…</span>}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs text-[#6f6b62]">
                      {new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {e.source && (
                        <p className="mt-0.5 text-[10px] text-[#6f6b62]/70">{e.source}</p>
                      )}
                      {e.wants_discovery_call && (
                        <span className="mt-0.5 inline-block rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold text-sky-700">DC</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={(ev) => { ev.preventDefault(); void deleteSingle(e.id, e.name); }}
                        className="opacity-0 group-hover:opacity-100 grid h-6 w-6 place-items-center rounded text-[#6f6b62] hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-opacity"
                        title="Delete enquiry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      <div className="flex shrink-0 items-center border-t border-[#111111]/10 bg-white px-6 py-3 text-sm">
        <p className="text-[#6f6b62]">
          {filtered.length.toLocaleString()} {filtered.length === 1 ? "enquiry" : "enquiries"}
          {filtered.length !== enquiries.length && ` · ${enquiries.length.toLocaleString()} total`}
        </p>
      </div>

      {(statusMenuId || assigneeMenuId) && (
        <div className="fixed inset-0 z-10" onClick={() => { setStatusMenuId(null); setAssigneeMenuId(null); }} />
      )}

      {nextActionPopupId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setNextActionPopupId(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="border-b border-[#111111]/10 px-5 py-4">
              <p className="text-sm font-semibold text-[#111111]">Next action</p>
              <p className="mt-0.5 text-xs text-[#6f6b62]">Saving will overwrite the previous next action note.</p>
            </div>
            <div className="p-5">
              <textarea
                value={nextActionDraft}
                onChange={(e) => setNextActionDraft(e.target.value)}
                rows={4}
                placeholder="Describe the next action…"
                className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-5 py-4">
              <button
                type="button"
                onClick={() => setNextActionPopupId(null)}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNextAction}
                onClick={async () => {
                  if (!nextActionPopupId) return;
                  setSavingNextAction(true);
                  await patchEnquiry(nextActionPopupId, { next_action: nextActionDraft || null });
                  setSavingNextAction(false);
                  setNextActionPopupId(null);
                }}
                className="rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {savingNextAction ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add enquiry modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAddModal(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-lg rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-enquiry-title"
          >
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
              <h2 id="add-enquiry-title" className="text-base font-semibold text-[#111111]">New enquiry</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#111111]">Full name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#111111]">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#111111]">Support type <span className="text-red-500">*</span></label>
                <AppSelect
                  value={addForm.support_type}
                  onChange={(v) => setAddForm((f) => ({ ...f, support_type: v }))}
                  options={SUPPORT_TYPES.map((t) => ({ value: t, label: t }))}
                  size="sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#111111]">Details <span className="text-red-500">*</span></label>
                <textarea
                  value={addForm.details}
                  onChange={(e) => setAddForm((f) => ({ ...f, details: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  placeholder="What are they looking for help with?"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#111111]">Preferred contact</label>
                  <AppSelect
                    value={addForm.preferred_contact}
                    onChange={(v) => setAddForm((f) => ({ ...f, preferred_contact: v }))}
                    options={PREFERRED_CONTACT_OPTIONS.map((o) => ({ value: o, label: o }))}
                    size="sm"
                  />
                </div>
                {addForm.preferred_contact === "Telephone" && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#111111]">Telephone</label>
                    <input
                      type="tel"
                      value={addForm.telephone}
                      onChange={(e) => setAddForm((f) => ({ ...f, telephone: e.target.value }))}
                      className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                      placeholder="+44 7700 900000"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#111111]">How did they get in touch?</label>
                <AppSelect
                  value={addForm.source}
                  onChange={(v) => setAddForm((f) => ({ ...f, source: v, source_other: "" }))}
                  options={SOURCE_OPTIONS.map((s) => ({ value: s, label: s }))}
                  size="sm"
                />
                {addForm.source === "Other" && (
                  <input
                    type="text"
                    value={addForm.source_other}
                    onChange={(e) => setAddForm((f) => ({ ...f, source_other: e.target.value }))}
                    placeholder="Describe how they got in touch…"
                    className="mt-2 w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  />
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={addForm.wants_discovery_call}
                  onChange={(e) => setAddForm((f) => ({ ...f, wants_discovery_call: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#111111]/25 accent-[#063b32]"
                />
                <span className="text-sm text-[#111111]">Discovery call requested</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void createEnquiry()}
                  disabled={savingAdd || !addForm.name.trim() || !addForm.email.trim() || !addForm.details.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                >
                  {savingAdd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {savingAdd ? "Saving…" : "Create enquiry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
