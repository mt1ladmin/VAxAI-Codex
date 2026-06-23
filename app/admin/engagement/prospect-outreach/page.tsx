"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  User,
} from "lucide-react";
import type { ProspectOutreachMeta, ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import {
  CONFIDENCE_COLORS,
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

function formatRevenue(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  return `£${n.toLocaleString("en-GB")}`;
}

export default function ProspectOutreachPage() {
  const [prospects, setProspects] = useState<ProspectOutreachRecord[]>([]);
  const [meta, setMeta] = useState<ProspectOutreachMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [queueing, setQueueing] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [needScore, setNeedScore] = useState("");
  const [confidence, setConfidence] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (needScore) params.set("need_score", needScore);
    if (confidence) params.set("confidence", confidence);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/engagement/prospect-outreach?${params}`);
    const json = await res.json();
    setProspects(json.data || []);
    setMeta(json.meta || null);
    setLoading(false);
  }, [region, needScore, confidence, search]);

  useEffect(() => { load(); }, [load]);

  const selected = useMemo(
    () => prospects.find((p) => p.id === selectedId) ?? prospects[0] ?? null,
    [prospects, selectedId],
  );

  useEffect(() => {
    if (prospects.length && !selectedId) setSelectedId(prospects[0].id);
  }, [prospects, selectedId]);

  const highNeedCount = useMemo(() => prospects.filter((p) => p.need_score >= 4).length, [prospects]);

  async function addToQueue(ids: string[]) {
    setQueueing(true);
    try {
      const res = await fetch("/api/admin/engagement/prospect-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      alert(`Added ${json.count} prospect(s) to the queue.`);
      setSelectedIds(new Set());
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add to queue");
    } finally {
      setQueueing(false);
    }
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
      <div className="shrink-0 border-b border-[#111111]/10 bg-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62]">Client Engagement</p>
            <h1 className="mt-1 font-serif text-2xl text-[#111111]">Prospect outreach</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6f6b62]">
              Researched prospects for VAxAI admin support and AI/automation training.
              {meta ? ` ${meta.total_count} organisations · research date ${meta.research_date}.` : ""}
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
              <Inbox className="h-4 w-4" /> Prospect Queue
            </Link>
          </div>
        </div>

        {meta && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(meta.by_region).map(([r, n]) => (
              <span key={r} className="rounded-full bg-[#f7f4ea] px-3 py-1 text-xs font-medium text-[#063b32]">
                {r}: {n}
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
          {selectedIds.size > 0 && (
            <button
              type="button"
              disabled={queueing}
              onClick={() => addToQueue([...selectedIds])}
              className="inline-flex items-center gap-2 rounded-full bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {queueing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
          {!selected ? (
            <p className="text-[#6f6b62]">Select a prospect to view details.</p>
          ) : (
            <div className="max-w-3xl space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl text-[#111111]">{selected.organisation_name}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${NEED_SCORE_COLORS[selected.need_score]}`}>
                    Need {selected.need_score}/5
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CONFIDENCE_COLORS[selected.data_confidence]}`}>
                    {selected.data_confidence}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#6f6b62]">
                  {selected.organisation_type} · {selected.location}, {selected.region}
                  {selected.priority_region === "secondary" && " · secondary focus"}
                  {selected.priority_region === "deprioritized" && " · deprioritized"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#111111]/10 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Decision maker</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-[#063b32]" />
                    {selected.decision_maker_name || "Not captured"}
                    {selected.decision_maker_role && (
                      <span className="font-normal text-[#6f6b62]">— {selected.decision_maker_role}</span>
                    )}
                  </p>
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="mt-2 flex items-center gap-2 text-sm text-[#063b32] hover:underline">
                      <Mail className="h-4 w-4" /> {selected.email}
                    </a>
                  )}
                  {selected.phone && (
                    <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-2 text-sm text-[#063b32] hover:underline">
                      <Phone className="h-4 w-4" /> {selected.phone}
                    </a>
                  )}
                </div>
                <div className="rounded-xl border border-[#111111]/10 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Organisation</p>
                  <p className="mt-1 text-sm">Employees: {selected.employees ?? "—"}</p>
                  <p className="text-sm">Revenue: {formatRevenue(selected.annual_revenue_gbp)}</p>
                  {selected.revenue_basis && <p className="mt-1 text-xs text-[#6f6b62]">{selected.revenue_basis}</p>}
                  {selected.website && (
                    <a
                      href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-[#063b32] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#111111]/10 bg-[#063b32]/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#063b32]">Why high admin / AI need</p>
                <p className="mt-2 text-sm leading-relaxed text-[#111111]">{selected.need_rationale}</p>
              </div>

              {selected.engagement_approach && (
                <div className="rounded-xl border border-[#111111]/10 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">How to approach</p>
                  <p className="mt-2 text-sm leading-relaxed">{selected.engagement_approach}</p>
                </div>
              )}

              {(selected.sector_tags.length > 0 || selected.pain_point_tags.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {selected.sector_tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#f7f4ea] px-3 py-1 text-xs text-[#063b32]">{t}</span>
                  ))}
                  {selected.pain_point_tags.map((t) => (
                    <span key={t} className="rounded-full border border-[#111111]/15 px-3 py-1 text-xs text-[#6f6b62]">{t}</span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={queueing}
                  onClick={() => addToQueue([selected.id])}
                  className="inline-flex items-center gap-2 rounded-full bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4" /> Add to Prospect Queue
                </button>
                <Link
                  href={`/admin/engagement/knowledge?tab=sectors`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#111111]/15 px-5 py-2.5 text-sm font-medium hover:bg-[#f7f4ea]"
                >
                  <BookOpen className="h-4 w-4" /> Sector guidance
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {(selected.financial_source_url || selected.contact_source_url) && (
                <div className="text-xs text-[#6f6b62]">
                  <p className="font-semibold uppercase tracking-wider">Sources</p>
                  {selected.financial_source_url && (
                    <a href={selected.financial_source_url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-[#063b32] hover:underline">
                      Financial: {selected.financial_source_url}
                    </a>
                  )}
                  {selected.contact_source_url && (
                    <a href={selected.contact_source_url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-[#063b32] hover:underline">
                      Contact: {selected.contact_source_url}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}