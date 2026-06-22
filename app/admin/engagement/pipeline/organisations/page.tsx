"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Search, Users } from "lucide-react";
import { AUDIENCE_TYPES, INDUSTRIES, ORG_SIZES, DIGITAL_MATURITY_LEVELS, type EngagementOrganisation } from "@/lib/engagement/types";

const maturityBadge: Record<string, string> = {
  "Mostly manual": "bg-red-50 text-red-600",
  "Basic digital tools but disconnected": "bg-orange-50 text-orange-600",
  "Established systems with inconsistent use": "bg-amber-50 text-amber-600",
  "Integrated systems with gaps": "bg-blue-50 text-blue-600",
  "Highly digital and optimisation-focused": "bg-emerald-50 text-emerald-700",
};

export default function OrganisationsPage() {
  const [search, setSearch] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [maturity, setMaturity] = useState("");
  const [orgs, setOrgs] = useState<EngagementOrganisation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (audienceType) params.set("audience", audienceType);
    if (industry) params.set("industry", industry);
    if (size) params.set("size", size);
    if (maturity) params.set("maturity", maturity);
    params.set("limit", "100");
    const res = await fetch(`/api/admin/engagement/organisations?${params}`);
    const json = await res.json() as { data: EngagementOrganisation[] };
    setOrgs(json.data || []);
    setLoading(false);
  }, [search, audienceType, industry, size, maturity]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Pipeline</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111111]">Organisations</h1>
          <Link
            href="/admin/engagement/pipeline/organisations/new"
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-4 w-4" /> New organisation
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Search + filters */}
        <div className="mb-5 flex gap-3 flex-wrap">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organisations…"
              className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
            <option value="">All types</option>
            {AUDIENCE_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
            <option value="">All sizes</option>
            {ORG_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={maturity} onChange={(e) => setMaturity(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
            <option value="">Any maturity</option>
            {DIGITAL_MATURITY_LEVELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : orgs.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <Users className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm font-semibold text-[#111111]">No organisations found</p>
            <p className="mt-1 text-sm text-[#6f6b62]">Try adjusting your filters or add a new one.</p>
            <Link
              href="/admin/engagement/pipeline/organisations/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> Add organisation
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-[#6f6b62]">{orgs.length} organisation{orgs.length !== 1 ? "s" : ""}</p>
            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_160px_160px_200px_40px] bg-[#f7f4ea] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                <span>Organisation</span>
                <span>Type</span>
                <span>Size</span>
                <span>Digital maturity</span>
                <span />
              </div>
              <div className="divide-y divide-[#111111]/5">
                {orgs.map((org) => (
                  <Link
                    key={org.id}
                    href={`/admin/engagement/pipeline/organisations/${org.id}`}
                    className="grid grid-cols-[1fr_160px_160px_200px_40px] items-center px-5 py-3.5 hover:bg-[#f7f4ea] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">
                        {org.name}
                      </p>
                      {org.industry && <p className="text-xs text-[#6f6b62]">{org.industry}</p>}
                      {org.town_city && <p className="text-xs text-[#6f6b62]">{org.town_city}</p>}
                    </div>
                    <span className="text-sm text-[#111111]">{org.audience_type ?? "—"}</span>
                    <span className="text-sm text-[#111111]">{org.size ?? "—"}</span>
                    <span>
                      {org.digital_maturity && org.digital_maturity !== "Unknown" ? (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${maturityBadge[org.digital_maturity] || "bg-gray-100 text-gray-600"}`}>
                          {org.digital_maturity}
                        </span>
                      ) : (
                        <span className="text-sm text-[#6f6b62]">—</span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#6f6b62] group-hover:text-[#063b32] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
