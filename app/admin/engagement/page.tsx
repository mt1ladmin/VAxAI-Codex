"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Phone,
  Plus,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { STAGE_COLORS } from "@/lib/engagement/types";

type Task = {
  id: string; title: string; due_date: string | null; priority: string;
  organisation?: { name: string } | null;
  contact?: { first_name: string; last_name: string | null } | null;
};
type Opportunity = { id: string; title: string; stage: string; organisation?: { name: string } | null };
type PainPoint = { id: string; title: string; category: string; slug: string | null };

export default function EngagementOverview() {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("everything");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string; type: string; title: string; description: string | null; tags: string[];
  }>>([]);
  const [searching, setSearching] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [commonPainPoints, setCommonPainPoints] = useState<PainPoint[]>([]);

  useEffect(() => {
    fetch("/api/admin/engagement/tasks?limit=5")
      .then((r) => r.json())
      .then((j) => setTasks(j.data || []));
    fetch("/api/admin/engagement/opportunities?limit=8")
      .then((r) => r.json())
      .then((j) => setOpportunities(j.data || []));
    fetch("/api/admin/engagement/pain-points?limit=8")
      .then((r) => r.json())
      .then((j) => setCommonPainPoints(j.data || []));
  }, []);

  const doSearch = useCallback(async (q: string, mode: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/admin/engagement/search?q=${encodeURIComponent(q)}&mode=${mode}`);
    const json = await res.json() as { data: typeof searchResults };
    setSearchResults(json.data || []);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search, searchMode), 300);
    return () => clearTimeout(t);
  }, [search, searchMode, doSearch]);

  const typeHref = (r: { type: string; id: string }) => {
    if (r.type === "pain_point") return `/admin/engagement/pain-points/${r.id}`;
    if (r.type === "organisation") return `/admin/engagement/pipeline/organisations/${r.id}`;
    if (r.type === "contact") return `/admin/engagement/pipeline/contacts/${r.id}`;
    if (r.type === "opportunity") return `/admin/engagement/pipeline/opportunities/${r.id}`;
    if (r.type === "sector") return `/admin/engagement/knowledge?type=sector&id=${r.id}`;
    return `/admin/engagement/knowledge`;
  };

  const typeBadge: Record<string, string> = {
    pain_point: "bg-amber-100 text-amber-700",
    organisation: "bg-blue-100 text-blue-700",
    contact: "bg-purple-100 text-purple-700",
    opportunity: "bg-teal-100 text-teal-700",
    sector: "bg-indigo-100 text-indigo-700",
    script: "bg-[#063b32]/10 text-[#063b32]",
  };
  const typeLabel: Record<string, string> = {
    pain_point: "Pain point", organisation: "Organisation",
    contact: "Contact", opportunity: "Opportunity",
    sector: "Sector profile", script: "Script/Template",
  };

  const stageGroups = opportunities.reduce<Record<string, Opportunity[]>>((acc, o) => {
    (acc[o.stage] ??= []).push(o);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Client Engagement</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">
          Use a profile when you know who you are approaching. Use a pain point when the conversation starts with a problem.
        </p>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Global search */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-[#111111]/15 bg-white px-4 py-3 shadow-sm focus-within:border-[#063b32]">
            <Search className="h-5 w-5 shrink-0 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a sector, organisation, contact or pain point…"
              className="flex-1 bg-transparent text-sm outline-none text-[#111111] placeholder:text-[#6f6b62]"
            />
            {searching && <span className="text-xs text-[#6f6b62]">Searching…</span>}
          </div>
          {/* Search mode pills */}
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {["everything","profiles","pain_points","crm","knowledge"].map((m) => (
              <button
                key={m}
                onClick={() => setSearchMode(m)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  searchMode === m
                    ? "bg-[#063b32] text-white"
                    : "bg-[#f7f4ea] text-[#6f6b62] hover:bg-[#111111]/10"
                }`}
              >
                {m === "everything" ? "Everything" : m === "pain_points" ? "Pain points" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          {/* Search results dropdown */}
          {searchResults.length > 0 && search && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-[#111111]/10 bg-white shadow-lg overflow-hidden">
              {searchResults.slice(0, 10).map((r) => (
                <Link
                  key={r.id}
                  href={typeHref(r)}
                  onClick={() => setSearch("")}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#f7f4ea] transition-colors border-b border-[#111111]/5 last:border-0"
                >
                  <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadge[r.type] || "bg-gray-100 text-gray-600"}`}>
                    {typeLabel[r.type] || r.type}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{r.title}</p>
                    {r.description && <p className="text-xs text-[#6f6b62] truncate">{r.description}</p>}
                  </div>
                </Link>
              ))}
              {searchResults.length > 10 && (
                <p className="px-4 py-2 text-xs text-[#6f6b62]">+{searchResults.length - 10} more results</p>
              )}
            </div>
          )}
          {search && searchResults.length === 0 && !searching && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-[#111111]/10 bg-white shadow-lg px-4 py-3 text-sm text-[#6f6b62]">
              No results for &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

        {/* Primary actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/admin/engagement/profile-explorer"
            className="group flex items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-6 hover:border-[#063b32]/30 hover:shadow-sm transition-all"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#063b32]/10 text-[#063b32] group-hover:bg-[#063b32] group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[#111111]">Prepare for a prospect</p>
              <p className="mt-1 text-sm text-[#6f6b62]">Sector, profile and communication guidance</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#063b32]">
                Open Profile Explorer <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/admin/engagement/pain-points"
            className="group flex items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-6 hover:border-[#063b32]/30 hover:shadow-sm transition-all"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[#111111]">Help with a pain point</p>
              <p className="mt-1 text-sm text-[#6f6b62]">Search a phrase from the conversation</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                Open Pain Point Navigator <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/admin/engagement/live-call"
            className="group flex items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-6 hover:border-[#063b32]/30 hover:shadow-sm transition-all"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[#111111]">Start live call mode</p>
              <p className="mt-1 text-sm text-[#6f6b62]">Notes, guidance and pain-point chips</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                Open Live Call Assist <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's follow-ups */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#111111]">Follow-ups due</h2>
              <Link href="/admin/engagement/pipeline/tasks" className="text-xs text-[#063b32] hover:underline">
                All tasks
              </Link>
            </div>
            <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
              {tasks.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#6f6b62]">
                  No follow-ups scheduled. Add the next action so contacts do not fall through the gaps.
                </div>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} className="border-b border-[#111111]/5 px-4 py-3 last:border-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{t.title}</p>
                    {(t.organisation || t.contact) && (
                      <p className="mt-0.5 text-xs text-[#6f6b62] truncate">
                        {t.contact ? `${t.contact.first_name} ${t.contact.last_name || ""}`.trim() : t.organisation?.name}
                      </p>
                    )}
                    {t.due_date && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6f6b62]">
                        <Calendar className="h-3 w-3" />
                        {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
            <Link
              href="/admin/engagement/pipeline/tasks"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#063b32]/30 py-2.5 text-sm font-semibold text-[#063b32] hover:bg-[#f7f4ea] transition-colors"
            >
              <Plus className="h-4 w-4" /> Add task
            </Link>
          </div>

          {/* Opportunities by stage */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#111111]">Open opportunities</h2>
              <Link href="/admin/engagement/pipeline/opportunities" className="text-xs text-[#063b32] hover:underline">
                Full pipeline
              </Link>
            </div>
            <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
              {Object.keys(stageGroups).length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#6f6b62]">
                  No open opportunities yet.{" "}
                  <Link href="/admin/engagement/pipeline/opportunities" className="text-[#063b32] underline">
                    Add one
                  </Link>
                </div>
              ) : (
                Object.entries(stageGroups).map(([stage, opps]) => (
                  <div key={stage} className="border-b border-[#111111]/5 px-4 py-3 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[stage] || "bg-gray-100 text-gray-600"}`}>
                        {stage}
                      </span>
                      <span className="text-xs text-[#6f6b62]">{opps.length}</span>
                    </div>
                    <div className="space-y-1">
                      {opps.map((o) => (
                        <Link
                          key={o.id}
                          href={`/admin/engagement/pipeline/opportunities/${o.id}`}
                          className="flex items-center justify-between text-sm text-[#111111] hover:text-[#063b32]"
                        >
                          <span className="truncate">{o.title}</span>
                          {o.organisation && (
                            <span className="ml-2 shrink-0 text-xs text-[#6f6b62]">{o.organisation.name}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick links — common pain points */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#111111]">Common pain points</h2>
            <Link href="/admin/engagement/pain-points" className="text-xs text-[#063b32] hover:underline">
              All pain points
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonPainPoints.map((pp) => (
              <Link
                key={pp.id}
                href={`/admin/engagement/pain-points/${pp.id}`}
                className="flex items-center gap-1.5 rounded-full border border-[#111111]/10 bg-white px-3.5 py-1.5 text-sm text-[#111111] hover:border-[#063b32]/30 hover:bg-[#f7f4ea] transition-colors"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                {pp.title}
              </Link>
            ))}
            <Link
              href="/admin/engagement/pain-points"
              className="flex items-center gap-1.5 rounded-full border border-dashed border-[#063b32]/30 px-3.5 py-1.5 text-sm text-[#063b32] hover:bg-[#f7f4ea] transition-colors"
            >
              <Search className="h-3 w-3" />
              Search all
            </Link>
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Knowledge Library", href: "/admin/engagement/knowledge", icon: BookOpen, desc: "Playbooks, sectors and scripts" },
            { label: "Organisations", href: "/admin/engagement/pipeline/organisations", icon: Users, desc: "Organisation records" },
            { label: "Contacts", href: "/admin/engagement/pipeline/contacts", icon: Users, desc: "Contact records" },
            { label: "Interactions", href: "/admin/engagement/pipeline/interactions", icon: CheckCircle2, desc: "Call and contact log" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea] transition-colors"
            >
              <item.icon className="h-5 w-5 text-[#063b32]" />
              <p className="mt-2 text-sm font-semibold text-[#111111]">{item.label}</p>
              <p className="mt-0.5 text-xs text-[#6f6b62]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
