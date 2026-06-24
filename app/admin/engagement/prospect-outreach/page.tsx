"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { FINDER_ENGAGEMENT_STATUSES } from "@/lib/engagement/engagement-status";
import { BulkArchiveProspectsModal } from "@/components/admin/BulkArchiveProspectsModal";
import { PROSPECT_FINDER_LABEL, PROSPECT_QUEUE_LABEL, prospectQueueDetailPath } from "@/lib/engagement/journey";
import { useStudioAccessOptional } from "@/lib/studio-access-context";
import type { ProspectFinderListItem } from "@/lib/engagement/prospect-finder/types";
import type { ProspectOutreachMeta } from "@/lib/engagement/prospect-outreach/types";
import { OUTREACH_REGIONS } from "@/lib/engagement/prospect-outreach/types";
import type { StudioTeamMember } from "@/lib/engagement/team-members";
import { useUserEmail } from "@/lib/user-email-context";

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-[130px] items-center justify-between rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-left text-sm"
      >
        <span className={selected ? "text-[#111111]" : "text-[#6f6b62]"}>{selected?.label || placeholder}</span>
        <ChevronRight className={`h-4 w-4 text-[#6f6b62] transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[#111111]/15 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value || "__all"}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f7f4ea]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function statusTone(status: string): string {
  if (status === "In prospect queue") return "text-[#063b32] font-medium";
  if (status === "Opportunity identified") return "text-[#111111] font-medium";
  if (status === "Not progressing") return "text-[#6f6b62]";
  if (status === "Not assigned") return "text-[#6f6b62]";
  return "text-[#111111]";
}

export default function ProspectFinderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = useUserEmail();

  const [prospects, setProspects] = useState<ProspectFinderListItem[]>([]);
  const [meta, setMeta] = useState<ProspectOutreachMeta | null>(null);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const studioAccess = useStudioAccessOptional();
  const isPlatformAdmin = studioAccess?.isPlatformAdmin ?? true;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const search = searchParams.get("q") || "";
  const region = searchParams.get("region") || "";
  const needScore = searchParams.get("need_score") || "";
  const confidence = searchParams.get("confidence") || "";
  const orgType = searchParams.get("type") || "";
  const assignedTo = searchParams.get("assigned_to") || "";
  const engagementStatus = searchParams.get("engagement_status") || "";
  const myProspects = searchParams.get("my_prospects") === "true";
  const unassigned = searchParams.get("unassigned") === "true";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      if (!("page" in updates)) params.delete("page");
      router.push(`/admin/engagement/prospect-outreach?${params.toString()}`);
    },
    [router, searchParams],
  );

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", "50");
    if (region) params.set("region", region);
    if (needScore) params.set("need_score", needScore);
    if (confidence) params.set("confidence", confidence);
    if (orgType) params.set("type", orgType);
    if (search) params.set("q", search);
    if (assignedTo) params.set("assigned_to", assignedTo);
    if (engagementStatus) params.set("engagement_status", engagementStatus);
    if (myProspects) {
      params.set("my_prospects", "true");
      if (userEmail) params.set("user_email", userEmail);
    }
    if (unassigned) params.set("unassigned", "true");

    const res = await fetch(`/api/admin/engagement/prospect-outreach?${params}`);
    const json = await res.json();
    setProspects(json.data || []);
    setMeta(json.meta || null);
    setTeamMembers(json.team_members || []);
    if (!opts?.silent) setLoading(false);
  }, [
    page,
    region,
    needScore,
    confidence,
    orgType,
    search,
    assignedTo,
    engagementStatus,
    myProspects,
    unassigned,
    userEmail,
  ]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const timer = setInterval(() => { void load({ silent: true }); }, 30_000);
    const onFocus = () => { void load({ silent: true }); };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (!selectedIds.size || !isPlatformAdmin) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/engagement/prospect-outreach", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outreach_ids: [...selectedIds] }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedIds(new Set());
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = meta?.total_pages ?? 1;
  const hasActiveFilters = Boolean(
    region || needScore || confidence || orgType || search.trim() || assignedTo || engagementStatus || myProspects || unassigned,
  );

  const memberOptions = useMemo(
    () => [{ value: "", label: "All assignees" }, ...teamMembers.map((m) => ({ value: m.id, label: m.display_name }))],
    [teamMembers],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#111111]/10 bg-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62]">Client Engagement</p>
            <h1 className="mt-1 font-serif text-2xl text-[#111111]">{PROSPECT_FINDER_LABEL}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6f6b62]">
              Research catalog — assign owners and qualify fit. Active engagement starts only after moving to {PROSPECT_QUEUE_LABEL}.
            </p>
          </div>
        </div>

        {meta ? (
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Total researched</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#111111]">{meta.total_count.toLocaleString()}</p>
            </div>
            {hasActiveFilters ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Matching filters</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#111111]">{(meta.filtered_count ?? 0).toLocaleString()}</p>
              </div>
            ) : null}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Unassigned</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#111111]">{(meta.unassigned_count ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">In Prospect Queue</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#063b32]">{(meta.in_queue_count ?? 0).toLocaleString()}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "My prospects", params: { my_prospects: "true", unassigned: null, engagement_status: null } },
            { label: "Unassigned", params: { unassigned: "true", my_prospects: null, engagement_status: null } },
            { label: "Ready to move", params: { engagement_status: "Opportunity identified", unassigned: null, my_prospects: null } },
            { label: `In ${PROSPECT_QUEUE_LABEL}`, params: { engagement_status: "In prospect queue", unassigned: null, my_prospects: null } },
          ].map((view) => (
            <button
              key={view.label}
              type="button"
              onClick={() => updateParams(view.params)}
              className="rounded-full border border-[#111111]/15 px-3 py-1 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              {view.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => updateParams({ q: e.target.value || null })}
              placeholder="Search organisation, sector, location, assignee…"
              className="w-full rounded-xl border border-[#111111]/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <Filter className="h-4 w-4 text-[#6f6b62]" />
          <CustomSelect
            value={region}
            onChange={(v) => updateParams({ region: v || null })}
            placeholder="All regions"
            options={[{ value: "", label: "All regions" }, ...OUTREACH_REGIONS.map((r) => ({ value: r, label: r }))]}
          />
          <CustomSelect
            value={needScore}
            onChange={(v) => updateParams({ need_score: v || null })}
            placeholder="All need"
            options={[
              { value: "", label: "All need scores" },
              ...["5", "4", "3", "2"].map((s) => ({ value: s, label: `Need ${s}` })),
            ]}
          />
          <CustomSelect
            value={assignedTo}
            onChange={(v) => updateParams({ assigned_to: v || null, my_prospects: null })}
            placeholder="All assignees"
            options={memberOptions}
          />
          <CustomSelect
            value={engagementStatus}
            onChange={(v) => updateParams({ engagement_status: v || null })}
            placeholder="All statuses"
            options={[
              { value: "", label: "All statuses" },
              ...FINDER_ENGAGEMENT_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <button
            type="button"
            onClick={() => updateParams({
              my_prospects: myProspects ? null : "true",
              assigned_to: null,
              unassigned: null,
            })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              myProspects ? "border-[#063b32] bg-[#063b32] text-white" : "border-[#111111]/15 text-[#6f6b62] hover:bg-[#f7f4ea]"
            }`}
          >
            My prospects
          </button>
          <button
            type="button"
            onClick={() => updateParams({ unassigned: unassigned ? null : "true", my_prospects: null })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              unassigned ? "border-[#063b32] bg-[#063b32] text-white" : "border-[#111111]/15 text-[#6f6b62] hover:bg-[#f7f4ea]"
            }`}
          >
            Unassigned
          </button>
          {isPlatformAdmin && selectedIds.size > 0 && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => setShowArchiveModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Archive {selectedIds.size} selected
            </button>
          )}
        </div>
      </div>

      <BulkArchiveProspectsModal
        open={showArchiveModal}
        count={selectedIds.size}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={bulkDelete}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6f6b62]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 border-b border-[#111111]/10 bg-[#f7f4ea]/90 backdrop-blur-sm">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                {isPlatformAdmin && <th className="w-10 px-3 py-3" />}
                <th className="px-6 py-3 font-semibold">Organisation</th>
                <th className="px-3 py-3 font-semibold">Sector</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold">Fit</th>
                <th className="px-3 py-3 font-semibold">Assigned to</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/5">
              {prospects.map((p) => {
                const backQs = searchParams.toString();
                const href = `/admin/engagement/prospect-outreach/${p.id}${backQs ? `?back=${encodeURIComponent(backQs)}` : ""}`;
                return (
                  <tr key={p.id} className="group hover:bg-[#f7f4ea]/40">
                    {isPlatformAdmin && (
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-[#111111]/20"
                        />
                      </td>
                    )}
                    <td className="px-6 py-3.5">
                      <Link href={href} className="font-medium text-[#111111] group-hover:text-[#063b32]">
                        {p.organisation_name}
                      </Link>
                      {p.days_since_touch != null && p.days_since_touch >= 14 && !p.in_prospect_queue && (
                        <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">
                          {p.days_since_touch}d idle
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-[#6f6b62]">{p.sector_label}</td>
                    <td className="px-3 py-3.5 text-[#6f6b62]">{p.location}</td>
                    <td className="px-3 py-3.5">
                      <span className="tabular-nums text-[#111111]">{p.need_score}</span>
                      <span className="ml-1 text-xs text-[#6f6b62]">{p.priority_label}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      {p.assigned_team_member_name ? (
                        <span className="inline-flex items-center gap-1 text-[#111111]">
                          <User className="h-3.5 w-3.5 text-[#6f6b62]" />
                          {p.assigned_team_member_name}
                        </span>
                      ) : (
                        <span className="text-[#6f6b62]">—</span>
                      )}
                    </td>
                    <td className={`px-3 py-3.5 text-xs ${statusTone(p.engagement_status)}`}>
                      {p.engagement_status}
                    </td>
                    <td className="max-w-[220px] px-6 py-3.5 text-xs text-[#6f6b62]">
                      {p.in_prospect_queue && p.pipeline_contact_id ? (
                        <Link
                          href={prospectQueueDetailPath(p.pipeline_contact_id)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-[#063b32] hover:underline"
                        >
                          Open in {PROSPECT_QUEUE_LABEL}
                        </Link>
                      ) : (
                        <span className="truncate block">{p.next_action || "—"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[#111111]/10 bg-white px-6 py-3 text-sm">
        <p className="text-[#6f6b62]">
          Page {page} of {totalPages}
          {meta?.filtered_count != null ? ` · ${meta.filtered_count.toLocaleString()} results` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="inline-flex items-center gap-1 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="inline-flex items-center gap-1 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}