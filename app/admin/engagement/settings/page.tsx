"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Search, X } from "lucide-react";
import {
  type PricingRule, type EngagementScript, type Objection,
} from "@/lib/engagement/types";

import type { StudioTeamMember } from "@/lib/engagement/team-members";

type Tab = "pricing" | "team_members" | "scripts" | "objections";

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

type PricingDraft = {
  name: string;
  category: string;
  unit: string;
  description: string;
  band_low: string;
  band_expected: string;
  band_high: string;
};

function PricingCard({ rule, onSaved }: { rule: PricingRule; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<PricingDraft>({
    name: rule.name,
    category: rule.category,
    unit: rule.unit,
    description: rule.description ?? "",
    band_low: rule.band_low != null ? String(rule.band_low) : "",
    band_expected: rule.band_expected != null ? String(rule.band_expected) : "",
    band_high: rule.band_high != null ? String(rule.band_high) : "",
  });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/engagement/pricing/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name.trim(),
        category: draft.category.trim(),
        unit: draft.unit.trim(),
        description: draft.description.trim() || null,
        band_low: draft.band_low !== "" ? Number(draft.band_low) : null,
        band_expected: draft.band_expected !== "" ? Number(draft.band_expected) : null,
        band_high: draft.band_high !== "" ? Number(draft.band_high) : null,
      }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const cancel = () => {
    setDraft({
      name: rule.name,
      category: rule.category,
      unit: rule.unit,
      description: rule.description ?? "",
      band_low: rule.band_low != null ? String(rule.band_low) : "",
      band_expected: rule.band_expected != null ? String(rule.band_expected) : "",
      band_high: rule.band_high != null ? String(rule.band_high) : "",
    });
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="rounded-xl border border-[#111111]/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-[#111111]">{rule.name}</p>
            <p className="text-xs text-[#6f6b62]">{rule.category} · {rule.unit}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#063b32]">
                £{(rule.band_low ?? 0).toLocaleString()} – £{(rule.band_high ?? 0).toLocaleString()}
              </p>
              {rule.band_expected && (
                <p className="text-xs text-[#6f6b62]">Expected: £{rule.band_expected.toLocaleString()}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:border-[#063b32] hover:text-[#063b32] transition-colors"
            >
              Edit
            </button>
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
    );
  }

  return (
    <div className="rounded-xl border border-[#063b32]/30 p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Name</label>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32]" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Category</label>
          <input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32]" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Unit</label>
        <input value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
          className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32]" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Band low (£)</label>
          <input type="number" value={draft.band_low} onChange={(e) => setDraft((d) => ({ ...d, band_low: e.target.value }))}
            className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32]" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Expected (£)</label>
          <input type="number" value={draft.band_expected} onChange={(e) => setDraft((d) => ({ ...d, band_expected: e.target.value }))}
            className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32]" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Band high (£)</label>
          <input type="number" value={draft.band_high} onChange={(e) => setDraft((d) => ({ ...d, band_high: e.target.value }))}
            className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32]" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Description</label>
        <textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          rows={2}
          className="w-full rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm outline-none focus:border-[#063b32] resize-none" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={cancel} disabled={saving}
          className="flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
        <button type="button" onClick={() => void save()} disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("pricing");
  const [pricing, setPricing] = useState<PricingRule[]>([]);
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
    if (tab === "pricing") {
      const res = await fetch("/api/admin/engagement/pricing?limit=50");
      const json = await res.json() as { data: PricingRule[] };
      setPricing(dedup(json.data || []));
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

  const TABS: [Tab, string][] = [
    ["pricing", "Pricing bands"],
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
            {/* PRICING */}
            {tab === "pricing" && (
              <div>
                <p className="mb-4 text-sm text-[#6f6b62]">
                  Internal pricing bands used to generate indicative value estimates. Not shown to clients.
                </p>
                <div className="space-y-3">
                  {pricing.map((rule) => (
                    <PricingCard key={rule.id} rule={rule} onSaved={() => void load()} />
                  ))}
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
