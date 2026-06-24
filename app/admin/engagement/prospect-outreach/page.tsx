"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Filter,
  Inbox,
  Loader2,
  Save,
  Search,
  Send,
} from "lucide-react";
import { AddToProspectQueueModal } from "@/components/admin/AddToProspectQueueModal";
import { JourneyStageBanner } from "@/components/admin/JourneyStageBanner";
import { KnowledgeAttachPicker } from "@/components/admin/KnowledgeAttachPicker";
import { ProspectResearchPanel } from "@/components/admin/ProspectResearchPanel";
import { useSetAIContext } from "@/lib/ai-assistant-context";
import { buildOutreachContextSummary } from "@/lib/ai/context-builders";
import {
  PROSPECT_CATALOG_PAGE_LABEL,
  PROSPECT_WORKFLOW_PAGE_LABEL,
} from "@/lib/engagement/journey";
import type { ProspectOutreachMeta, ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import {
  NEED_SCORE_COLORS,
  OUTREACH_REGIONS,
} from "@/lib/engagement/prospect-outreach/types";

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
        className="flex w-full min-w-[140px] items-center justify-between rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-left text-sm"
      >
        <span className={selected ? "text-[#111111]" : "text-[#6f6b62]"}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-[#6f6b62] ${open ? "rotate-180" : ""}`} />
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

type OutreachRecord = ProspectOutreachRecord & { review_notes?: string | null };

export default function ProspectOutreachPage() {
  const [prospects, setProspects] = useState<OutreachRecord[]>([]);
  const [meta, setMeta] = useState<ProspectOutreachMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [needScore, setNeedScore] = useState("");
  const [confidence, setConfidence] = useState("");
  const [orgType, setOrgType] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<OutreachRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueModalProspects, setQueueModalProspects] = useState<ProspectOutreachRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (needScore) params.set("need_score", needScore);
    if (confidence) params.set("confidence", confidence);
    if (orgType) params.set("type", orgType);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/engagement/prospect-outreach?${params}`);
    const json = await res.json();
    setProspects(json.data || []);
    setMeta(json.meta || null);
    setLoading(false);
  }, [region, needScore, confidence, orgType, search]);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(
    () => prospects.find((p) => p.id === selectedId) ?? prospects[0] ?? null,
    [prospects, selectedId],
  );

  useEffect(() => {
    if (prospects.length && !selectedId) setSelectedId(prospects[0].id);
  }, [prospects, selectedId]);

  useEffect(() => {
    if (selected) {
      setDraft(selected);
      setReviewNotes(selected.review_notes || "");
    }
    setEditing(false);
  }, [selected?.id]);

  useSetAIContext(
    draft
      ? {
          type: "outreach",
          id: draft.id,
          label: draft.organisation_name,
          summary: buildOutreachContextSummary(draft, reviewNotes),
        }
      : null,
  );

  const highNeedCount = useMemo(() => prospects.filter((p) => p.need_score >= 4).length, [prospects]);

  const hasActiveFilters = Boolean(region || needScore || confidence || orgType || search.trim());
  const regionCounts = useMemo(() => {
    if (!meta) return {};
    return hasActiveFilters ? meta.filtered_by_region ?? {} : meta.by_region;
  }, [meta, hasActiveFilters]);

  async function saveReviewNotes() {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/engagement/prospect-outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outreach_id: draft.id, review_notes: reviewNotes }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setProspects((prev) =>
        prev.map((p) => (p.id === draft.id ? { ...p, review_notes: reviewNotes } : p)),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save notes");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdits() {
    if (!draft) return;
    setSaving(true);
    try {
      const { review_notes: _rn, ...overrides } = draft;
      const res = await fetch("/api/admin/engagement/prospect-outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outreach_id: draft.id,
          overrides,
          review_notes: reviewNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setProspects((prev) => prev.map((p) => (p.id === draft.id ? json.data : p)));
      setEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function openQueueModal(ids: string[]) {
    const items = prospects
      .filter((p) => ids.includes(p.id))
      .map((p) => ({
        ...p,
        review_notes: p.id === draft?.id ? reviewNotes : p.review_notes,
      }));
    setQueueModalProspects(items);
    setQueueModalOpen(true);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AddToProspectQueueModal
        open={queueModalOpen}
        prospects={queueModalProspects}
        onClose={() => setQueueModalOpen(false)}
        onAdded={() => {
          setQueueModalOpen(false);
          setSelectedIds(new Set());
          void load();
        }}
      />

      <div className="shrink-0 border-b border-[#111111]/10 bg-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62]">Client Engagement</p>
            <h1 className="mt-1 font-serif text-2xl text-[#111111]">{PROSPECT_CATALOG_PAGE_LABEL}</h1>
            {meta && (
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-serif text-3xl tabular-nums text-[#063b32]">
                  {meta.total_count.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-[#111111]">researched prospects</p>
              </div>
            )}
            <p className="mt-1 max-w-2xl text-sm text-[#6f6b62]">
              Researched charities and SMBs for admin reduction, AI training, automation, and virtual assistance.
              {meta && (
                <>
                  {meta.charity_count != null && meta.business_count != null && (
                    <> · {meta.charity_count} charities · {meta.business_count} businesses</>
                  )}
                  {meta.available_count != null && <> · {meta.available_count.toLocaleString()} available</>}
                  {meta.queued_count != null && meta.queued_count > 0 && (
                    <> · {meta.queued_count.toLocaleString()} in queue</>
                  )}
                  {hasActiveFilters && meta.filtered_count != null && (
                    <> · showing {meta.filtered_count.toLocaleString()} (filtered)</>
                  )}
                  <> · research date {meta.research_date}</>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/engagement/knowledge"
              className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#f7f4ea]"
            >
              <BookOpen className="h-4 w-4" /> Knowledge Hub
            </Link>
            <Link
              href="/admin/engagement/prospect-queue"
              className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#f7f4ea]"
            >
              <Inbox className="h-4 w-4" /> {PROSPECT_WORKFLOW_PAGE_LABEL}
            </Link>
          </div>
        </div>

        {meta && (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.charity_count != null && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                Charities: {meta.charity_count}
              </span>
            )}
            {meta.business_count != null && (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-900">
                Businesses: {meta.business_count}
              </span>
            )}
            {Object.entries(regionCounts).map(([r, n]) => (
              <span key={r} className="rounded-full bg-[#f7f4ea] px-3 py-1 text-xs font-medium text-[#063b32]">
                {r}: {n}
                {hasActiveFilters ? " shown" : ""}
              </span>
            ))}
            <span className="rounded-full bg-[#063b32]/10 px-3 py-1 text-xs font-medium text-[#063b32]">
              High need (4–5): {highNeedCount}
            </span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organisation, location, sector, decision maker…"
              className="w-full rounded-xl border border-[#111111]/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <Filter className="h-4 w-4 text-[#6f6b62]" />
          <CustomSelect
            value={region}
            onChange={setRegion}
            placeholder="All regions"
            options={[{ value: "", label: "All regions" }, ...OUTREACH_REGIONS.map((r) => ({ value: r, label: r }))]}
          />
          <CustomSelect
            value={needScore}
            onChange={setNeedScore}
            placeholder="All need scores"
            options={[
              { value: "", label: "All need scores" },
              ...["5", "4", "3", "2"].map((s) => ({ value: s, label: `Need ${s}` })),
            ]}
          />
          <CustomSelect
            value={confidence}
            onChange={setConfidence}
            placeholder="All confidence"
            options={[
              { value: "", label: "All confidence" },
              { value: "High", label: "High" },
              { value: "Medium", label: "Medium" },
              { value: "Low", label: "Low" },
            ]}
          />
          <CustomSelect
            value={orgType}
            onChange={setOrgType}
            placeholder="All types"
            options={[
              { value: "", label: "All types" },
              { value: "Charity", label: "Charities" },
              { value: "Business", label: "Businesses (SMB)" },
            ]}
          />
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => openQueueModal([...selectedIds])}
              className="inline-flex items-center gap-2 rounded-full bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Send className="h-4 w-4" />
              Add {selectedIds.size} to queue
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-[42%] min-w-[320px] overflow-auto border-r border-[#111111]/10 bg-[#f7f4ea]/40">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6f6b62]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ul className="divide-y divide-[#111111]/5">
              {prospects.map((p) => (
                <li key={p.id}>
                  <div className="flex items-start gap-2 px-4 py-3 hover:bg-white/80">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="mt-1.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`flex-1 text-left ${selectedId === p.id ? "opacity-100" : "opacity-90"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#111111]">{p.organisation_name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${NEED_SCORE_COLORS[p.need_score] || ""}`}>
                          {p.need_score}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#6f6b62]">
                        {p.organisation_type} · {p.location}
                      </p>
                      {p.decision_maker_name && (
                        <p className="mt-0.5 text-xs text-[#063b32]">{p.decision_maker_name}</p>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-white p-6">
          {!draft ? (
            <p className="text-[#6f6b62]">Select a prospect to view details.</p>
          ) : (
            <div className="max-w-3xl space-y-6">
              <JourneyStageBanner
                currentStage="outreach"
                hint="Use the VAxAI Assistant (floating widget) to review fit and draft notes before adding to queue."
              />

              <ProspectResearchPanel
                data={editing ? draft : selected!}
                editable={editing}
                onChange={setDraft}
              />

              <div className="rounded-xl border border-[#111111]/10 p-4 space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                  Reviewer notes (passed to {PROSPECT_WORKFLOW_PAGE_LABEL.toLowerCase()})
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  placeholder="Your verification checks, AI summary, or handoff notes for the outreach team…"
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveReviewNotes()}
                  className="text-xs font-semibold text-[#063b32] hover:underline disabled:opacity-50"
                >
                  Save review notes
                </button>
              </div>

              {selected && <KnowledgeAttachPicker outreachId={selected.id} />}

              <div className="flex flex-wrap gap-3">
                {editing ? (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveEdits()}
                      className="inline-flex items-center gap-2 rounded-full bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDraft(selected!); setEditing(false); }}
                      className="rounded-full border border-[#111111]/15 px-5 py-2.5 text-sm font-medium hover:bg-[#f7f4ea]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="rounded-full border border-[#111111]/15 px-5 py-2.5 text-sm font-medium hover:bg-[#f7f4ea]"
                    >
                      Edit details
                    </button>
                    <button
                      type="button"
                      onClick={() => openQueueModal([draft.id])}
                      className="inline-flex items-center gap-2 rounded-full bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      <Send className="h-4 w-4" /> Add to {PROSPECT_WORKFLOW_PAGE_LABEL}
                    </button>
                    <Link
                      href={`/admin/engagement/knowledge?tab=sectors&tags=${encodeURIComponent(draft.sector_tags.join(","))}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 px-5 py-2.5 text-sm font-medium hover:bg-[#f7f4ea]"
                    >
                      <BookOpen className="h-4 w-4" /> Sector guidance
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}