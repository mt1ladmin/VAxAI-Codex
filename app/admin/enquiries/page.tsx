"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FilterSelect } from "@/components/admin/FilterSelect";
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
  organisation?: { id: string; name: string } | null;
  posts?: { id: string; title: string; slug: string } | null;
};

type TriFilter = "all" | "yes" | "no";

const NEXT_ACTION_FILTER_OPTIONS = [
  { value: "all" as const, label: "Next action: all" },
  { value: "yes" as const, label: "With next action" },
  { value: "no" as const, label: "No next action" },
];

const DISCOVERY_CALL_FILTER_OPTIONS = [
  { value: "all" as const, label: "Discovery call: all" },
  { value: "yes" as const, label: "Discovery call requested" },
  { value: "no" as const, label: "No discovery call" },
];


function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
      <div className="mt-0.5 text-sm text-[#111111]">{children}</div>
    </div>
  );
}

const SUPPORT_TYPES = [
  "Assessment",
  "Assessment + Strategy & Implementation",
  "Assessment + Ongoing Support",
  "Access to Work",
  "General enquiry",
];

const PREFERRED_CONTACT_OPTIONS = ["Email", "Telephone"];

const BLANK_ENQUIRY_FORM = {
  name: "",
  email: "",
  support_type: "General enquiry",
  details: "",
  preferred_contact: "Email",
  telephone: "",
  wants_discovery_call: false,
};

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [nextActionFilter, setNextActionFilter] = useState<TriFilter>("all");
  const [discoveryCallFilter, setDiscoveryCallFilter] = useState<TriFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...BLANK_ENQUIRY_FORM });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries?status=${statusFilter}`);
    const json = await res.json() as { data: Enquiry[] };
    setEnquiries(json.data ?? []);
    setSelected(new Set());
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { void fetch_(); }, [fetch_]);

  const filtered = useMemo(() => enquiries.filter((e) => {
    if (nextActionFilter === "yes" && !e.next_action) return false;
    if (nextActionFilter === "no" && e.next_action) return false;
    if (discoveryCallFilter === "yes" && !e.wants_discovery_call) return false;
    if (discoveryCallFilter === "no" && e.wants_discovery_call) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.support_type.toLowerCase().includes(q) ||
      (e.next_action || "").toLowerCase().includes(q) ||
      (e.last_action || "").toLowerCase().includes(q)
    );
  }), [enquiries, search, nextActionFilter, discoveryCallFilter]);

  const hasActiveFilters =
    nextActionFilter !== "all" ||
    discoveryCallFilter !== "all" ||
    search.trim().length > 0;

  const metrics = useMemo(() => ({
    total: filtered.length,
    needsReview: filtered.filter((e) => isUnreviewedEnquiry(e.status)).length,
    conversationHeld: filtered.filter((e) => e.status === "Conversation held").length,
    followUpRequired: filtered.filter((e) => e.status === "Follow up required").length,
    opportunityIdentified: filtered.filter((e) => e.status === "Opportunity identified").length,
    isClient: filtered.filter((e) => e.is_client).length,
  }), [filtered]);

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
    if (!confirm(`Delete ${selected.size} enquir${selected.size === 1 ? "y" : "ies"}?`)) return;
    await fetch("/api/admin/enquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    void fetch_();
  };

  const deleteSingle = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    void fetch_();
  };

  const updateStatus = async (id: string, status: string) => {
    setStatusMenuId(null);
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const j = await res.json() as { error?: string; hint?: string };
      window.alert(j.hint ? `${j.error}\n\n${j.hint}` : (j.error || "Failed to update status"));
      return;
    }
    void fetch_();
  };

  const createEnquiry = async () => {
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.details.trim()) return;
    setSavingAdd(true);
    const res = await fetch("/api/admin/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addForm,
        telephone: addForm.preferred_contact === "Telephone" ? addForm.telephone : null,
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
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Website Enquiries</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">
              Inbound interest — qualify against VAxAI wraparound support, workflow review, training, and virtual assistance.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Metrics */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-[#111111]/10 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Total</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#111111]">{loading ? "—" : metrics.total}</p>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("needs_review")}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">Needs review</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-700">{loading ? "—" : metrics.needsReview}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Conversation held")}
            className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Conversation held</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-800">{loading ? "—" : metrics.conversationHeld}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Follow up required")}
            className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-left transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-700">Follow up required</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-orange-800">{loading ? "—" : metrics.followUpRequired}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Opportunity identified")}
            className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">Opportunity identified</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-teal-800">{loading ? "—" : metrics.opportunityIdentified}</p>
          </button>
        </div>
        {!loading && metrics.isClient > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5">
              <span className="text-xs font-semibold text-purple-800">Clients logged</span>
              <span className="text-sm font-bold tabular-nums text-purple-900">{metrics.isClient}</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[12rem] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries…"
              className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#063b32]"
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
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={ENQUIRY_STATUSES.map((s) => ({ value: s.key, label: s.label }))}
          />
          <FilterSelect
            value={nextActionFilter}
            onChange={setNextActionFilter}
            options={NEXT_ACTION_FILTER_OPTIONS}
          />
          <FilterSelect
            value={discoveryCallFilter}
            onChange={setDiscoveryCallFilter}
            options={DISCOVERY_CALL_FILTER_OPTIONS}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setNextActionFilter("all");
                setDiscoveryCallFilter("all");
              }}
              className="text-xs font-medium text-[#063b32] hover:underline"
            >
              Clear filters
            </button>
          )}
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6f6b62]">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => void bulkDelete()}
                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
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
            {filtered.length} enquir{filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-[#f7f4ea] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea] py-16 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#6f6b62]/30" />
            <p className="text-sm font-semibold text-[#111111]">No enquiries yet</p>
            <p className="mt-1 text-xs text-[#6f6b62]">Submissions from the website contact form will appear here.</p>
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
              const postId = e.connected_post_id || e.posts?.id || null;
              const postTitle = e.connected_post_title || e.posts?.title || null;

              return (
                <div
                  key={e.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/enquiries/${e.id}`)}
                  onKeyDown={(ev) => { if (ev.key === "Enter") router.push(`/admin/enquiries/${e.id}`); }}
                  className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={(ev) => { ev.stopPropagation(); toggleSelect(e.id); }}
                    className={`mt-3 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                      selected.has(e.id) ? "border-[#063b32] bg-[#063b32]" : "border-[#111111]/25 bg-white"
                    }`}
                  >
                    {selected.has(e.id) && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#063b32]/10">
                    <MessageSquare className="h-4 w-4 text-[#063b32]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <LabeledField label="Contact">
                          <span className="font-semibold">{e.name}</span>
                          <a
                            href={`mailto:${e.email}`}
                            onClick={(ev) => ev.stopPropagation()}
                            className="mt-0.5 block text-xs text-[#063b32] hover:underline"
                          >
                            {e.email}
                          </a>
                        </LabeledField>
                        <LabeledField label="Received">
                          <span className="flex items-center gap-1 text-[#6f6b62]">
                            <Calendar className="h-3 w-3" />
                            {new Date(e.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </LabeledField>
                        <LabeledField label="Assigned to">
                          {e.assigned_team_member_name ? (
                            <span className="text-[#111111]">{e.assigned_team_member_name}</span>
                          ) : (
                            <span className="text-[#6f6b62]">—</span>
                          )}
                        </LabeledField>
                        <LabeledField label="Organisation">{e.organisation?.name || "—"}</LabeledField>
                        <LabeledField label="Support type">
                          <span className="inline-block rounded-full bg-[#f5f274]/80 px-2 py-0.5 text-xs font-semibold text-[#111111]">
                            {e.support_type}
                          </span>
                        </LabeledField>
                        <LabeledField label="Next action">
                          <span className="text-[#6f6b62]">{e.follow_up_task_title || "—"}</span>
                        </LabeledField>
                        {e.is_client && (
                          <LabeledField label="Client">
                            <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">Now a client</span>
                          </LabeledField>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2" onClick={(ev) => ev.stopPropagation()}>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setStatusMenuId(statusMenuId === e.id ? null : e.id)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ENQUIRY_STATUS_COLORS[isUnreviewedEnquiry(e.status) ? "" : e.status] ?? "bg-[#111111]/10 text-[#6f6b62]"}`}
                          >
                            {enquiryStatusLabel(e.status)}
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {statusMenuId === e.id && (
                            <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-[#111111]/10 bg-white shadow-lg">
                              {ENQUIRY_STATUS_OPTIONS.map((s) => (
                                <button
                                  key={s.key}
                                  type="button"
                                  onClick={() => void updateStatus(e.id, s.key)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea]"
                                >
                                  <span className={`h-2 w-2 rounded-full ${ENQUIRY_STATUS_COLORS[s.key]?.split(" ")[0]}`} />
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => void deleteSingle(e.id)}
                          className="rounded-md border border-[#111111]/15 p-2 text-[#6f6b62] hover:border-red-200 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/enquiries/${e.id}`}
                          onClick={(ev) => ev.stopPropagation()}
                          className="rounded-md border border-[#111111]/15 p-2 text-[#6f6b62] hover:border-[#063b32]/30 hover:text-[#063b32]"
                          title="View details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {statusMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setStatusMenuId(null)} />
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAddModal(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
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
                <select
                  value={addForm.support_type}
                  onChange={(e) => setAddForm((f) => ({ ...f, support_type: e.target.value }))}
                  className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                >
                  {SUPPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
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
                  <select
                    value={addForm.preferred_contact}
                    onChange={(e) => setAddForm((f) => ({ ...f, preferred_contact: e.target.value }))}
                    className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  >
                    {PREFERRED_CONTACT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
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
              <label className="flex items-center gap-2.5 cursor-pointer">
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
                  className="rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                >
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