"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Sparkles, X } from "lucide-react";
import { ProspectResearchPanel } from "@/components/admin/ProspectResearchPanel";
import { PROSPECT_WORKFLOW_PAGE_LABEL } from "@/lib/engagement/journey";
import { snapshotToQueueFields } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { OUTREACH_REGIONS } from "@/lib/engagement/prospect-outreach/types";

type FinderResult = {
  prospect: ProspectOutreachRecord;
  duplicates: Array<{ source: string; name: string; reason: string; score: number }>;
  isLikelyDuplicate: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export function ProspectFinderAiModal({ open, onClose, onAdded }: Props) {
  const [brief, setBrief] = useState("");
  const [region, setRegion] = useState("");
  const [orgType, setOrgType] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<FinderResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [draft, setDraft] = useState<ProspectOutreachRecord | null>(null);

  if (!open) return null;

  const active = draft ?? results[activeIndex]?.prospect ?? null;
  const activeMeta = results[activeIndex];

  const resetResults = () => {
    setResults([]);
    setDraft(null);
    setActiveIndex(0);
    setError("");
  };

  const runSearch = async () => {
    setLoading(true);
    setError("");
    resetResults();
    try {
      const res = await fetch("/api/admin/engagement/prospect-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          region: region || undefined,
          org_type: orgType || undefined,
          industry: industry || undefined,
          count: 2,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Research failed");
      const data = (json.data ?? []) as FinderResult[];
      if (!data.length) throw new Error("No prospects found — try a broader brief.");
      setResults(data);
      setDraft(data[0].prospect);
      setActiveIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research failed");
    } finally {
      setLoading(false);
    }
  };

  const addToFinder = async () => {
    if (!active) return;
    setAdding(true);
    setError("");
    try {
      const fields = snapshotToQueueFields(active, "Added via AI Prospect Finder");
      const res = await fetch("/api/admin/engagement/prospect-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          status: "Needs review",
          tags: [...(fields.tags ?? []), "ai-finder"],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not add prospect");
      onAdded();
      onClose();
      setBrief("");
      resetResults();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add prospect");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">Find prospects with AI</h2>
            <p className="text-xs text-[#6f6b62]">
              Researches new UK charities and SMBs using the catalog methodology, with duplicate checking.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6f6b62]">What are you looking for?</label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={3}
                placeholder="e.g. Norfolk charities with 10–50 staff struggling with manual admin…"
                className="w-full resize-none rounded-xl border border-[#111111]/15 px-4 py-2.5 text-sm outline-none focus:border-[#063b32]"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                >
                  <option value="">Any priority region</option>
                  {OUTREACH_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Organisation type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                >
                  <option value="">Charity or business</option>
                  <option value="Charity">Charity</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6f6b62]">Industry / sector</label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. healthcare, retail"
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={loading || brief.trim().length < 10}
              onClick={() => void runSearch()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Researching…" : "Find prospects"}
            </button>
          </div>

          {results.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {results.map((r, i) => (
                <button
                  key={r.prospect.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(i);
                    setDraft(r.prospect);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    i === activeIndex ? "bg-[#063b32] text-white" : "bg-[#f7f4ea] text-[#063b32]"
                  }`}
                >
                  {r.prospect.organisation_name}
                </button>
              ))}
            </div>
          ) : null}

          {activeMeta?.duplicates?.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
              <p className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                Possible duplicates detected
              </p>
              {activeMeta.duplicates.map((d) => (
                <p key={`${d.source}-${d.name}`} className="text-xs text-amber-700">
                  {d.name} — {d.reason} (score {d.score})
                </p>
              ))}
            </div>
          ) : null}

          {active ? (
            <ProspectResearchPanel data={active} editable onChange={(next) => setDraft(next)} />
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
          >
            Cancel
          </button>
          {active ? (
            <button
              type="button"
              disabled={adding || activeMeta?.isLikelyDuplicate}
              onClick={() => void addToFinder()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Add to {PROSPECT_WORKFLOW_PAGE_LABEL}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}