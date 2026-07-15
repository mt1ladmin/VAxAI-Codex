"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  Mail,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  VA_APPLICANT_TYPE_LABELS,
  VA_APPROVED_STATUSES,
  VA_PIPELINE_STATUSES,
  VA_STATUS_COLORS,
  VA_STATUS_LABELS,
  type VaApplication,
  type VaApplicationStatus,
} from "@/lib/va-applications/constants";
import { emailComposeUrl } from "@/lib/engagement/email-links";
import { AppSelect } from "@/components/ui/AppSelect";

type TabId = "applications" | "approved";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function StatusBadge({ status }: { status: VaApplicationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${VA_STATUS_COLORS[status]}`}
    >
      {status === "approved" ? "Active" : VA_STATUS_LABELS[status]}
    </span>
  );
}

export default function VaApplicationsPage() {
  const [tab, setTab] = useState<TabId>("applications");
  const [rows, setRows] = useState<VaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/va-applications?tab=${tab}`);
    const json = (await res.json()) as { data?: VaApplication[] };
    setRows(json.data ?? []);
    setSelected(new Set());
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const statusOptions = useMemo(() => {
    const list = tab === "approved" ? VA_APPROVED_STATUSES : VA_PIPELINE_STATUSES;
    return [
      { value: "all", label: "Status: all" },
      ...list.map((s) => ({ value: s, label: VA_STATUS_LABELS[s] })),
    ];
  }, [tab]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q) ||
        (r.specialisms || []).some((s) => s.toLowerCase().includes(q)) ||
        (r.work_specialises_in || "").toLowerCase().includes(q) ||
        (r.availability_notes || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const metrics = useMemo(() => {
    if (tab === "applications") {
      return {
        total: rows.length,
        new: rows.filter((r) => r.status === "new").length,
        contacted: rows.filter((r) => r.status === "contacted").length,
        verified: rows.filter((r) => r.status === "verified").length,
      };
    }
    return {
      total: rows.length,
      approved: rows.filter((r) => r.status === "approved").length,
      joined: rows.filter((r) => r.status === "joined").length,
      early: rows.filter((r) => r.applicant_type === "early_career").length,
    };
  }, [rows, tab]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  async function setStatus(id: string, status: VaApplicationStatus) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/va-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) await load();
  }

  async function deleteSelected() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} application(s)? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch("/api/admin/va-applications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected] }),
    });
    setDeleting(false);
    await load();
  }

  function openOpportunityEmail() {
    const targets = filtered.filter((r) => selected.has(r.id));
    if (!targets.length) return;
    const emails = targets.map((t) => t.email).join(",");
    const subject = "VAxAI freelance opportunity";
    const url = emailComposeUrl(emails, { subject });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const quickActions: { status: VaApplicationStatus; label: string }[] =
    tab === "applications"
      ? [
          { status: "contacted", label: "Contacted" },
          { status: "verified", label: "Verified" },
          { status: "approved", label: "Approve" },
          { status: "not_suitable", label: "Not suitable" },
        ]
      : [
          { status: "joined", label: "Joined" },
          { status: "approved", label: "Active" },
          { status: "contacted", label: "Back to pipeline" },
        ];

  return (
    <div className="min-h-full bg-cream/40 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pine-700">
            Client engagement
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-pine-900">
            VAs
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">
            Review freelance applications, move people into the active VA pool, and keep availability
            ready for matching. Multi-select to email opportunities when you need cover.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#5F686A]">
          <Users className="h-4 w-4" />
          {loading ? "Loading…" : `${filtered.length} shown`}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl border border-pine-900/10 bg-white p-1">
        {(
          [
            { id: "applications" as const, label: "Applications", hint: "Pipeline" },
            { id: "approved" as const, label: "Active VAs", hint: "Talent pool" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setStatusFilter("all");
              setSearch("");
            }}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-pine-900 text-paper shadow-sm"
                : "text-muted hover:bg-cream"
            }`}
          >
            {t.label}
            <span className={`ml-2 text-[11px] font-medium ${tab === t.id ? "text-paper/70" : "text-muted"}`}>
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {tab === "applications" ? (
          <>
            <Metric label="In pipeline" value={metrics.total} />
            <Metric label="New" value={metrics.new ?? 0} />
            <Metric label="Contacted" value={metrics.contacted ?? 0} />
            <Metric label="Verified" value={metrics.verified ?? 0} />
          </>
        ) : (
          <>
            <Metric label="In pool" value={metrics.total} />
            <Metric label="Active" value={metrics.approved ?? 0} />
            <Metric label="Joined" value={metrics.joined ?? 0} />
            <Metric label="Early career" value={metrics.early ?? 0} />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F686A]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, specialism, availability…"
              className="w-full rounded-xl border border-pine-900/12 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pine-900/40"
            />
          </div>
          <div className="w-full sm:w-48">
            <AppSelect
              size="sm"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="rounded-lg border border-pine-900/15 bg-white px-3 py-2 text-xs font-semibold text-pine-900 hover:bg-[#F5F8F8]"
          >
            {selected.size === filtered.length && filtered.length > 0 ? "Clear selection" : "Select all"}
          </button>
          <button
            type="button"
            disabled={!selected.size}
            onClick={openOpportunityEmail}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1B343A] disabled:opacity-40"
            title="Open email to selected freelancers about an opportunity"
          >
            <Mail className="h-3.5 w-3.5" />
            Email opportunity ({selected.size})
          </button>
          <button
            type="button"
            disabled={!selected.size || deleting}
            onClick={() => void deleteSelected()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        </div>
      </div>

      {/* Future AI note */}
      <p className="mt-3 text-xs leading-5 text-[#5F686A]/90">
        Tip: select multiple cards to email an opportunity. Later, the floating AI on this page will be able
        to recommend who might fit a project description; you still choose who to contact.
      </p>

      {/* Cards grid */}
      {loading ? (
        <div className="mt-12 flex justify-center text-[#5F686A]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-pine-900/15 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-pine-900">No applications here yet</p>
          <p className="mt-2 text-sm text-[#5F686A]">
            {tab === "applications"
              ? "New submissions from the Work with VAxAI page will appear as cards here."
              : "Approve applicants to move them into your talent pool."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((app) => {
            const isSelected = selected.has(app.id);
            return (
              <article
                key={app.id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
                  isSelected ? "border-[#122428] ring-2 ring-[#122428]/20" : "border-pine-900/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSelect(app.id)}
                    className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                      isSelected
                        ? "border-[#122428] bg-[#122428] text-white"
                        : "border-pine-900/25 bg-white"
                    }`}
                    aria-label={isSelected ? "Deselect" : "Select"}
                  >
                    {isSelected ? <Check className="h-3 w-3" /> : null}
                  </button>

                  <Link href={`/admin/va-applications/${app.id}`} className="flex min-w-0 flex-1 gap-3">
                    {app.photo_url ? (
                      <img
                        src={app.photo_url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-pine-900 text-sm font-bold text-white">
                        {initials(app.full_name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-pine-900 group-hover:underline">
                          {app.full_name}
                        </h2>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#5F686A]">{app.email}</p>
                      <p className="mt-1 text-[11px] font-medium text-pine-900/70">
                        {VA_APPLICANT_TYPE_LABELS[app.applicant_type]}
                        {app.location ? ` · ${app.location}` : ""}
                      </p>
                    </div>
                  </Link>
                </div>

                {(app.specialisms?.length ?? 0) > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {app.specialisms.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[#F5F8F8] px-2 py-0.5 text-[10px] font-semibold text-pine-900"
                      >
                        {s}
                      </span>
                    ))}
                    {app.specialisms.length > 4 ? (
                      <span className="text-[10px] font-semibold text-[#5F686A]">
                        +{app.specialisms.length - 4}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 rounded-xl bg-[#F5F8F8]/80 px-3 py-2 text-xs text-[#5F686A]">
                  <span className="font-semibold text-pine-900">Availability: </span>
                  {app.availability_hours_per_week || "—"}
                  {app.availability_notes ? ` · ${app.availability_notes}` : ""}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-pine-900/08 pt-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      disabled={updatingId === app.id || app.status === action.status}
                      onClick={() => void setStatus(app.id, action.status)}
                      className="rounded-md border border-pine-900/12 bg-white px-2 py-1 text-[10px] font-semibold text-pine-900 hover:bg-[#F5F8F8] disabled:opacity-40"
                    >
                      {action.label}
                    </button>
                  ))}
                  <Link
                    href={`/admin/va-applications/${app.id}`}
                    className="ml-auto rounded-md bg-pine-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-pine-800"
                  >
                    Open
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-pine-900/10 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-pine-900">{value}</p>
    </div>
  );
}
