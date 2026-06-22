"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Search, Users } from "lucide-react";
import {
  AUDIENCE_TYPES, DIGITAL_MATURITY_LEVELS, INDUSTRIES, ORG_SIZES,
  type SectorProfile, type EngagementOrganisation,
} from "@/lib/engagement/types";

export default function ProfileExplorer() {
  const [audienceType, setAudienceType] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [maturity, setMaturity] = useState("");
  const [orgSearch, setOrgSearch] = useState("");
  const [orgs, setOrgs] = useState<EngagementOrganisation[]>([]);
  const [sectors, setSectors] = useState<SectorProfile[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [activeTab, setActiveTab] = useState<"organisations" | "sectors">("organisations");

  const loadOrgs = useCallback(async () => {
    setLoadingOrgs(true);
    const params = new URLSearchParams();
    if (orgSearch) params.set("q", orgSearch);
    if (industry) params.set("industry", industry);
    if (audienceType) params.set("audience", audienceType);
    if (size) params.set("size", size);
    const res = await fetch(`/api/admin/engagement/organisations?${params}&limit=30`);
    const json = await res.json() as { data: EngagementOrganisation[] };
    setOrgs(json.data || []);
    setLoadingOrgs(false);
  }, [orgSearch, industry, audienceType, size]);

  const loadSectors = useCallback(async () => {
    setLoadingSectors(true);
    const params = new URLSearchParams();
    if (industry) params.set("q", industry);
    const res = await fetch(`/api/admin/engagement/sectors?${params}`);
    const json = await res.json() as { data: SectorProfile[] };
    setSectors(json.data || []);
    setLoadingSectors(false);
  }, [industry]);

  useEffect(() => {
    const t = setTimeout(() => loadOrgs(), 300);
    return () => clearTimeout(t);
  }, [loadOrgs]);

  useEffect(() => { loadSectors(); }, [loadSectors]);

  const maturityBadge: Record<string, string> = {
    "Mostly manual": "bg-red-50 text-red-600",
    "Basic digital tools but disconnected": "bg-orange-50 text-orange-600",
    "Established systems with inconsistent use": "bg-amber-50 text-amber-600",
    "Integrated systems with gaps": "bg-blue-50 text-blue-600",
    "Highly digital and optimisation-focused": "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Profile Explorer</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">
          Prepare for a prospect — filter by audience, industry and context to get relevant guidance.
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">
              Audience type
            </label>
            <select
              value={audienceType}
              onChange={(e) => setAudienceType(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">All types</option>
              {AUDIENCE_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">All industries</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">
              Size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">All sizes</option>
              {ORG_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">
              Digital maturity
            </label>
            <select
              value={maturity}
              onChange={(e) => setMaturity(e.target.value)}
              className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option value="">Any maturity</option>
              {DIGITAL_MATURITY_LEVELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#111111]/10 mb-6">
          {[
            { key: "organisations" as const, label: "Organisations" },
            { key: "sectors" as const, label: "Sector profiles" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`-mb-px px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === key
                  ? "border-b-2 border-[#063b32] text-[#063b32]"
                  : "text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "organisations" && (
          <>
            {/* Org search + add */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                <input
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder="Search organisations…"
                  className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                />
              </div>
              <Link
                href="/admin/engagement/pipeline/organisations/new"
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
              >
                <Plus className="h-4 w-4" /> New organisation
              </Link>
            </div>

            {loadingOrgs ? (
              <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
            ) : orgs.length === 0 ? (
              <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
                <Users className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
                <p className="text-sm font-semibold text-[#111111]">No organisations found</p>
                <p className="mt-1 text-sm text-[#6f6b62]">Add one to start preparing a prospect brief.</p>
                <Link
                  href="/admin/engagement/pipeline/organisations/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
                >
                  <Plus className="h-4 w-4" /> Add organisation
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {orgs.map((org) => (
                  <Link
                    key={org.id}
                    href={`/admin/engagement/pipeline/organisations/${org.id}`}
                    className="rounded-xl border border-[#111111]/10 bg-white p-5 hover:border-[#063b32]/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors truncate">
                          {org.name}
                        </p>
                        {org.audience_type && (
                          <p className="mt-0.5 text-xs text-[#6f6b62]">{org.audience_type}</p>
                        )}
                        {org.industry && (
                          <p className="text-xs text-[#6f6b62]">{org.industry}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#6f6b62] group-hover:text-[#063b32] transition-colors mt-0.5" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {org.size && org.size !== "Unknown" && (
                        <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                          {org.size}
                        </span>
                      )}
                      {org.digital_maturity && org.digital_maturity !== "Unknown" && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${maturityBadge[org.digital_maturity] || "bg-gray-100 text-gray-600"}`}>
                          {org.digital_maturity}
                        </span>
                      )}
                      {org.town_city && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">
                          {org.town_city}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "sectors" && (
          <>
            {loadingSectors ? (
              <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
            ) : sectors.length === 0 ? (
              <div className="rounded-xl border border-[#111111]/10 py-16 text-center text-sm text-[#6f6b62]">
                No sector profiles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sectors
                  .filter((s) => !audienceType || s.audience_types?.includes(audienceType))
                  .filter((s) => !industry || s.name.toLowerCase().includes(industry.toLowerCase()))
                  .map((sector) => (
                    <Link
                      key={sector.id}
                      href={`/admin/engagement/knowledge/sectors/${sector.id}`}
                      className="rounded-xl border border-[#111111]/10 bg-white p-5 hover:border-[#063b32]/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">
                          {sector.name}
                        </p>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#6f6b62] group-hover:text-[#063b32] transition-colors mt-0.5" />
                      </div>
                      {sector.description && (
                        <p className="text-sm text-[#6f6b62] line-clamp-2">{sector.description}</p>
                      )}
                      {sector.audience_types && sector.audience_types.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {sector.audience_types.slice(0, 3).map((a) => (
                            <span key={a} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                      {sector.common_admin_pressures && sector.common_admin_pressures.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">
                            Common pressures
                          </p>
                          <p className="text-xs text-[#6f6b62] line-clamp-2">
                            {sector.common_admin_pressures.slice(0, 3).join(" · ")}
                          </p>
                        </div>
                      )}
                    </Link>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
