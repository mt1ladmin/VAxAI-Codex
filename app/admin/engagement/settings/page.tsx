"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Copy, Search } from "lucide-react";
import {
  RECOMMENDATION_LABELS,
  type RecommendationRule, type PricingRule, type VatPrompt,
  type EngagementScript, type Objection,
} from "@/lib/engagement/types";

import type { StudioTeamMember } from "@/lib/engagement/team-members";

type Tab = "rec_rules" | "pricing" | "vat_prompts" | "team_members" | "scripts" | "objections";

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-purple-50 text-purple-700",
  linkedin: "bg-sky-50 text-sky-700",
  phone: "bg-blue-50 text-blue-700",
  "in-person": "bg-amber-50 text-amber-700",
  general: "bg-gray-100 text-gray-600",
};

function copyToClipboard(text: string, setCopied: (id: string) => void, id: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  });
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("rec_rules");
  const [recRules, setRecRules] = useState<RecommendationRule[]>([]);
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [vatPrompts, setVatPrompts] = useState<VatPrompt[]>([]);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [scripts, setScripts] = useState<EngagementScript[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [category, setCategory] = useState("");
  const [copied, setCopied] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  function dedup<T extends { id: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
  }

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "rec_rules") {
      const res = await fetch("/api/admin/engagement/rec-rules?limit=100");
      const json = await res.json() as { data: RecommendationRule[] };
      setRecRules(dedup(json.data || []));
    } else if (tab === "pricing") {
      const res = await fetch("/api/admin/engagement/pricing?limit=50");
      const json = await res.json() as { data: PricingRule[] };
      setPricing(dedup(json.data || []));
    } else if (tab === "vat_prompts") {
      const res = await fetch("/api/admin/engagement/vat-prompts?limit=200");
      const json = await res.json() as { data: VatPrompt[] };
      setVatPrompts(dedup(json.data || []));
    } else if (tab === "team_members") {
      const res = await fetch("/api/admin/engagement/team-members?active_only=false");
      const json = await res.json() as { data: StudioTeamMember[] };
      setTeamMembers(dedup(json.data || []));
    } else if (tab === "scripts") {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (channel) params.set("channel", channel);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/engagement/scripts?${params}`);
      const json = await res.json() as { data: EngagementScript[] };
      setScripts(dedup(json.data || []));
    } else if (tab === "objections") {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/engagement/objections?${params}`);
      const json = await res.json() as { data: Objection[] };
      setObjections(dedup(json.data || []));
    }
    setLoading(false);
  }, [tab, search, channel, category]);

  useEffect(() => {
    const t = setTimeout(() => { void load(); }, tab === "scripts" || tab === "objections" ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, tab]);

  useEffect(() => {
    if (tab === "scripts" || tab === "objections") searchRef.current?.focus();
  }, [tab]);

  const toggleRuleStatus = async (rule: RecommendationRule) => {
    const newStatus = rule.status === "active" ? "inactive" : "active";
    await fetch(`/api/admin/engagement/rec-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    void load();
  };

  const TABS: [Tab, string][] = [
    ["rec_rules", "Recommendation rules"],
    ["pricing", "Pricing bands"],
    ["vat_prompts", "VAT prompts"],
    ["team_members", "Team members"],
    ["scripts", "Scripts & blocks"],
    ["objections", "Objections"],
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">
          Platform admin: recommendation rules, pricing bands, VAT prompts, team members, and approved outreach templates.
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-[#111111]/10 mb-6">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setSearch("");
                setChannel("");
                setCategory("");
              }}
              className={`-mb-px px-5 py-2.5 text-sm font-semibold transition-colors ${
                tab === key ? "border-b-2 border-[#063b32] text-[#063b32]" : "text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : (
          <>
            {/* RECOMMENDATION RULES */}
            {tab === "rec_rules" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Deterministic rules that drive recommendations. Rules with a risk gate block AI pathways.
                </p>
                <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
                  <div className="grid grid-cols-[1fr_180px_100px_120px_80px] bg-[#f7f4ea] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                    <span>Rule</span>
                    <span>Type</span>
                    <span>Priority</span>
                    <span>Risk gate</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-[#111111]/5">
                    {recRules.map((rule) => (
                      <div key={rule.id} className="grid grid-cols-[1fr_180px_100px_120px_80px] items-center px-5 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">{rule.title}</p>
                          {rule.reason && <p className="text-xs text-[#6f6b62] line-clamp-1">{rule.reason}</p>}
                        </div>
                        <span className="text-xs text-[#111111]">{RECOMMENDATION_LABELS[rule.recommendation_type] ?? rule.recommendation_type}</span>
                        <span className="text-sm text-[#6f6b62]">{rule.priority}</span>
                        <span>
                          {rule.risk_gate ? (
                            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">
                              <AlertTriangle className="h-3 w-3" /> Risk gate
                            </span>
                          ) : (
                            <span className="text-xs text-[#6f6b62]">—</span>
                          )}
                        </span>
                        <button
                          onClick={() => toggleRuleStatus(rule)}
                          className={`rounded-full px-3 py-0.5 text-[10px] font-semibold transition-colors ${
                            rule.status === "active"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {rule.status}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRICING */}
            {tab === "pricing" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Internal pricing bands used to generate indicative value estimates. Not shown to clients.
                </p>
                <div className="space-y-3">
                  {pricing.map((rule) => (
                    <div key={rule.id} className="rounded-xl border border-[#111111]/10 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#111111]">{rule.name}</p>
                          <p className="text-xs text-[#6f6b62]">{rule.category} · {rule.unit}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-[#063b32]">
                            £{(rule.band_low ?? 0).toLocaleString()} – £{(rule.band_high ?? 0).toLocaleString()}
                          </p>
                          {rule.band_expected && (
                            <p className="text-xs text-[#6f6b62]">Expected: £{rule.band_expected.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      {rule.description && <p className="mt-2 text-sm text-[#6f6b62]">{rule.description}</p>}
                      {rule.inclusions && rule.inclusions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {rule.inclusions.map((inc) => (
                            <span key={inc} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{inc}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VAT PROMPTS */}
            {tab === "vat_prompts" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Prompts used during calls to explore value, alignment and trust. Displayed in the Live Call Assist.
                </p>
                <div className="space-y-4">
                  {(["value", "alignment", "trust"] as const).map((dim) => {
                    const dimPrompts = vatPrompts.filter((p) => p.dimension === dim);
                    return (
                      <div key={dim} className="rounded-xl border border-[#111111]/10 overflow-hidden">
                        <div className={`px-5 py-3 ${dim === "value" ? "bg-[#063b32]/8" : dim === "alignment" ? "bg-blue-50" : "bg-amber-50"}`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${dim === "value" ? "text-[#063b32]" : dim === "alignment" ? "text-blue-700" : "text-amber-700"}`}>
                            {dim} — {dimPrompts.length} prompts
                          </p>
                        </div>
                        <div className="divide-y divide-[#111111]/5">
                          {dimPrompts.map((p) => (
                            <div key={p.id} className="flex items-start gap-4 px-5 py-3.5">
                              <div className="flex-1">
                                <p className="text-sm text-[#111111]">{p.prompt}</p>
                                {p.context_tags && p.context_tags.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {p.context_tags.map((tag) => (
                                      <span key={tag} className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] text-[#6f6b62]">{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${p.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEAM MEMBERS */}
            {tab === "team_members" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Manage assignable team members for Prospect Finder and tasks. Inactive members keep existing assignments but cannot be selected for new work.
                </p>
                <div className="mb-4 flex gap-2">
                  <input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="New team member name"
                    className="flex-1 rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                  />
                  <button
                    type="button"
                    disabled={!newMemberName.trim()}
                    onClick={async () => {
                      await fetch("/api/admin/engagement/team-members", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ display_name: newMemberName.trim() }),
                      });
                      setNewMemberName("");
                      void load();
                    }}
                    className="rounded-xl bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Add member
                  </button>
                </div>
                <div className="rounded-xl border border-[#111111]/10 overflow-hidden divide-y divide-[#111111]/5">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                      <input
                        defaultValue={member.display_name}
                        onBlur={async (e) => {
                          const name = e.target.value.trim();
                          if (!name || name === member.display_name) return;
                          await fetch(`/api/admin/engagement/team-members/${member.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ display_name: name }),
                          });
                          void load();
                        }}
                        className="min-w-[140px] flex-1 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm"
                      />
                      <input
                        defaultValue={member.user_email || ""}
                        placeholder="Email (optional, for My prospects)"
                        onBlur={async (e) => {
                          const email = e.target.value.trim();
                          if (email === (member.user_email || "")) return;
                          await fetch(`/api/admin/engagement/team-members/${member.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_email: email || null }),
                          });
                          void load();
                        }}
                        className="min-w-[200px] flex-1 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/engagement/team-members/${member.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ is_active: !member.is_active }),
                          });
                          void load();
                        }}
                        className={`rounded-full px-3 py-0.5 text-[10px] font-semibold ${
                          member.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCRIPTS */}
            {tab === "scripts" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Approved outreach scripts and message blocks for email, LinkedIn, phone, and in-person channels.
                </p>
                <div className="flex gap-3 mb-5">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search scripts…"
                      className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                    />
                  </div>
                  <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
                    <option value="">All channels</option>
                    {["email", "linkedin", "phone", "in-person", "general"].map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {scripts.length === 0 ? (
                  <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No scripts found.</div>
                ) : (
                  <div className="space-y-3">
                    {scripts.map((s) => (
                      <div key={s.id} className="rounded-xl border border-[#111111]/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-[#111111]">{s.title}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${CHANNEL_COLORS[s.channel] || "bg-gray-100 text-gray-600"}`}>
                                {s.channel}
                              </span>
                              {s.block_type && (
                                <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{s.block_type}</span>
                              )}
                              {s.tone && (
                                <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{s.tone}</span>
                              )}
                              {s.audience_type && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">{s.audience_type}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(s.content, setCopied, s.id)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                              copied === s.id
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32] hover:text-[#063b32]"
                            }`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copied === s.id ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="rounded-lg bg-[#f7f4ea] px-4 py-3">
                          <p className="text-sm text-[#111111] whitespace-pre-wrap">{s.content}</p>
                        </div>
                        {s.last_reviewed && (
                          <p className="mt-2 text-[10px] text-[#6f6b62]">
                            Reviewed {new Date(s.last_reviewed).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                            {s.content_owner ? ` by ${s.content_owner}` : ""}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OBJECTIONS */}
            {tab === "objections" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Approved objection handling responses. Copy the response directly into your outreach.
                </p>
                <div className="flex gap-3 mb-5">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search objections…"
                      className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
                    />
                  </div>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
                    <option value="">All categories</option>
                    {["Cost", "Trust", "Relevance", "Timing", "AI concerns", "Process", "General"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {objections.length === 0 ? (
                  <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No objections found.</div>
                ) : (
                  <div className="space-y-3">
                    {objections.map((o) => (
                      <div key={o.id} className="rounded-xl border border-[#111111]/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {o.category && (
                                <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{o.category}</span>
                              )}
                              {o.tone && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">{o.tone}</span>
                              )}
                            </div>
                            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 mb-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700 mb-1">Objection</p>
                              <p className="text-sm text-[#111111] italic">&ldquo;{o.objection}&rdquo;</p>
                            </div>
                            <div className="rounded-lg bg-[#063b32]/5 border border-[#063b32]/15 px-4 py-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#063b32] mb-1">Response</p>
                              <p className="text-sm text-[#111111]">{o.response}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(o.response, setCopied, o.id)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                              copied === o.id
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32] hover:text-[#063b32]"
                            }`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copied === o.id ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
