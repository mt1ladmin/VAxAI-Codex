"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import {
  RECOMMENDATION_LABELS,
  type RecommendationRule, type PricingRule, type VatPrompt,
} from "@/lib/engagement/types";

import type { StudioTeamMember } from "@/lib/engagement/team-members";

type Tab = "rec_rules" | "pricing" | "vat_prompts" | "team_members";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("rec_rules");
  const [recRules, setRecRules] = useState<RecommendationRule[]>([]);
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [vatPrompts, setVatPrompts] = useState<VatPrompt[]>([]);
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "rec_rules") {
      const res = await fetch("/api/admin/engagement/rec-rules?limit=100");
      const json = await res.json() as { data: RecommendationRule[] };
      setRecRules(json.data || []);
    } else if (tab === "pricing") {
      const res = await fetch("/api/admin/engagement/pricing?limit=50");
      const json = await res.json() as { data: PricingRule[] };
      setPricing(json.data || []);
    } else if (tab === "vat_prompts") {
      const res = await fetch("/api/admin/engagement/vat-prompts?limit=200");
      const json = await res.json() as { data: VatPrompt[] };
      setVatPrompts(json.data || []);
    } else {
      const res = await fetch("/api/admin/engagement/team-members?active_only=false");
      const json = await res.json() as { data: StudioTeamMember[] };
      setTeamMembers(json.data || []);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const toggleRuleStatus = async (rule: RecommendationRule) => {
    const newStatus = rule.status === "active" ? "inactive" : "active";
    await fetch(`/api/admin/engagement/rec-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">
          Platform admin: recommendation rules, pricing bands, and VAT prompts that shape service-fit guidance across Studio.
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#111111]/10 mb-6">
          {([
            ["rec_rules", "Recommendation rules"],
            ["pricing", "Pricing bands"],
            ["vat_prompts", "VAT prompts"],
            ["team_members", "Team members"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
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

            {tab === "team_members" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Manage assignable team members for Prospect Finder, Prospect Queue, and tasks. Inactive members keep existing assignments but cannot be selected for new work.
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
          </>
        )}
      </div>
    </div>
  );
}
