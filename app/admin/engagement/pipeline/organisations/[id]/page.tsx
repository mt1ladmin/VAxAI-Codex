"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Building2, ChevronDown, ChevronRight, Edit3,
  Mail, MessageSquare, Phone, Plus, Save, User
} from "lucide-react";
import {
  AUDIENCE_TYPES, INDUSTRIES, ORG_SIZES, DIGITAL_MATURITY_LEVELS,
  AI_CONFIDENCE_LEVELS, TRUST_RISK_CONTEXTS, DELIVERY_PREFS,
  STAGE_COLORS,
  type EngagementOrganisation, type EngagementContact,
  type EngagementOpportunity, type EngagementInteraction,
  type EngagementTask,
} from "@/lib/engagement/types";

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

const maturityBadge: Record<string, string> = {
  "Mostly manual": "bg-red-50 text-red-600",
  "Basic digital tools but disconnected": "bg-orange-50 text-orange-600",
  "Established systems with inconsistent use": "bg-amber-50 text-amber-600",
  "Integrated systems with gaps": "bg-blue-50 text-blue-600",
  "Highly digital and optimisation-focused": "bg-emerald-50 text-emerald-700",
};

const INTERACTION_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <User className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 bg-[#f7f4ea] hover:bg-[#f0ead8] transition-colors"
      >
        <span className="font-semibold text-[#111111] text-sm">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-[#6f6b62]" /> : <ChevronRight className="h-4 w-4 text-[#6f6b62]" />}
      </button>
      {open && <div className="p-5 bg-white">{children}</div>}
    </div>
  );
}

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<EngagementOrganisation | null>(null);
  const [contacts, setContacts] = useState<EngagementContact[]>([]);
  const [opps, setOpps] = useState<EngagementOpportunity[]>([]);
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [tasks, setTasks] = useState<EngagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EngagementOrganisation>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState<"brief" | "contacts" | "opportunities" | "interactions" | "tasks">("brief");

  const load = useCallback(async () => {
    setLoading(true);
    const [orgRes, cRes, oRes, iRes, tRes] = await Promise.all([
      fetch(`/api/admin/engagement/organisations/${id}`),
      fetch(`/api/admin/engagement/contacts?organisation_id=${id}&limit=50`),
      fetch(`/api/admin/engagement/opportunities?organisation_id=${id}&limit=50`),
      fetch(`/api/admin/engagement/interactions?organisation_id=${id}&limit=50`),
      fetch(`/api/admin/engagement/tasks?organisation_id=${id}&limit=50`),
    ]);
    const [oData, cData, oppData, intData, tData] = await Promise.all([
      orgRes.json() as Promise<{ data: EngagementOrganisation }>,
      cRes.json() as Promise<{ data: EngagementContact[] }>,
      oRes.json() as Promise<{ data: EngagementOpportunity[] }>,
      iRes.json() as Promise<{ data: EngagementInteraction[] }>,
      tRes.json() as Promise<{ data: EngagementTask[] }>,
    ]);
    setOrg(oData.data);
    setEditForm(oData.data);
    setContacts(cData.data || []);
    setOpps(oppData.data || []);
    setInteractions(intData.data || []);
    setTasks(tData.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    setSaving(true);
    setSaveError("");
    const res = await fetch(`/api/admin/engagement/organisations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setSaveError(j.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    const j = await res.json() as { data: EngagementOrganisation };
    setOrg(j.data);
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-sm text-[#6f6b62]">Loading…</div>;
  if (!org) return <div className="p-12 text-center text-sm text-red-600">Organisation not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline/organisations" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Organisations
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">{org.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {org.audience_type && <span className="text-sm text-[#6f6b62]">{org.audience_type}</span>}
              {org.industry && <span className="text-sm text-[#6f6b62]">· {org.industry}</span>}
              {org.town_city && <span className="text-sm text-[#6f6b62]">· {org.town_city}</span>}
              {org.digital_maturity && org.digital_maturity !== "Unknown" && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${maturityBadge[org.digital_maturity] || "bg-gray-100 text-gray-600"}`}>
                  {org.digital_maturity}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/admin/engagement/live-call?org=${id}`}
              className="flex items-center gap-2 rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#111111] hover:border-[#063b32] hover:text-[#063b32] transition-colors"
            >
              <Phone className="h-4 w-4" /> Live call
            </Link>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Edit3 className="h-4 w-4" /> {editing ? "Cancel edit" : "Edit"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#111111]/10 bg-white px-8">
        <div className="flex gap-1">
          {([
            ["brief", "Prospect brief"],
            ["contacts", `Contacts (${contacts.length})`],
            ["opportunities", `Opportunities (${opps.length})`],
            ["interactions", `Interactions (${interactions.length})`],
            ["tasks", `Tasks (${tasks.length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`-mb-px px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === key
                  ? "border-b-2 border-[#063b32] text-[#063b32]"
                  : "text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">

        {/* BRIEF TAB */}
        {activeTab === "brief" && (
          <div className="space-y-4">
            {editing && (
              <div className="mb-4 flex items-center gap-3">
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
                </button>
                <button onClick={() => { setEditing(false); setEditForm(org); }} className="text-sm text-[#6f6b62] hover:text-[#111111]">
                  Discard
                </button>
              </div>
            )}

            {/* A: Who they are */}
            <Section title="A — Who they are">
              {editing ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Name", key: "name" },
                    { label: "Audience type", key: "audience_type", options: AUDIENCE_TYPES },
                    { label: "Industry", key: "industry", options: INDUSTRIES },
                    { label: "Size", key: "size", options: ORG_SIZES },
                    { label: "Town / city", key: "town_city" },
                    { label: "Region", key: "region" },
                    { label: "Website", key: "website" },
                    { label: "Delivery preference", key: "delivery_preference", options: DELIVERY_PREFS },
                  ].map(({ label, key, options }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">{label}</label>
                      {options ? (
                        <select value={(editForm as Record<string, string>)[key] ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} className={inputClass}>
                          <option value="">—</option>
                          {options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type="text" value={(editForm as Record<string, string>)[key] ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} className={inputClass} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                  {[
                    ["Type", org.audience_type],
                    ["Industry", org.industry],
                    ["Size", org.size],
                    ["Location", [org.town_city, org.region].filter(Boolean).join(", ")],
                    ["Delivery", org.delivery_preference],
                    ["Website", org.website],
                    ["Charity no.", org.charity_number],
                    ["Company no.", org.company_number],
                    ["Source", org.source],
                  ].map(([label, val]) => val ? (
                    <div key={label as string}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label as string}</dt>
                      <dd className="mt-0.5 text-sm text-[#111111]">
                        {label === "Website" ? (
                          <a href={val as string} target="_blank" rel="noopener noreferrer" className="text-[#063b32] hover:underline">{val as string}</a>
                        ) : val as string}
                      </dd>
                    </div>
                  ) : null)}
                </dl>
              )}
              {org.description && !editing && (
                <p className="mt-4 text-sm text-[#6f6b62] border-t border-[#111111]/8 pt-4">{org.description}</p>
              )}
              {editing && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Description</label>
                  <textarea rows={3} value={editForm.description ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} />
                </div>
              )}
            </Section>

            {/* B: Digital context */}
            <Section title="B — Digital &amp; operational context">
              {editing ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Digital maturity", key: "digital_maturity", options: DIGITAL_MATURITY_LEVELS },
                    { label: "AI confidence", key: "ai_confidence", options: AI_CONFIDENCE_LEVELS },
                    { label: "Trust / risk context", key: "trust_risk_context", options: TRUST_RISK_CONTEXTS },
                  ].map(({ label, key, options }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">{label}</label>
                      <select value={(editForm as Record<string, string>)[key] ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} className={inputClass}>
                        <option value="">—</option>
                        {options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    ["Digital maturity", org.digital_maturity],
                    ["AI confidence", org.ai_confidence],
                    ["Trust / risk context", org.trust_risk_context],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label as string}</dt>
                      <dd className="mt-0.5 text-sm text-[#111111]">{(val as string) || "—"}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {(org.known_systems?.length ?? 0) > 0 && !editing && (
                <div className="mt-4 border-t border-[#111111]/8 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-2">Known systems</p>
                  <div className="flex flex-wrap gap-1.5">
                    {org.known_systems?.map((s) => (
                      <span key={s} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-xs font-semibold text-[#6f6b62]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* C: Known pain points */}
            <Section title="C — Known pain points" defaultOpen={false}>
              {(org.known_pain_points?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {org.known_pain_points?.map((pp) => (
                    <span key={pp} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{pp}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6f6b62]">No pain points recorded yet. Add notes during or after a call.</p>
              )}
              <Link href={`/admin/engagement/live-call?org=${id}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#063b32] hover:underline">
                <Phone className="h-3.5 w-3.5" /> Open live call assist
              </Link>
            </Section>

            {/* D: VAT observations */}
            <Section title="D — VAT observations" defaultOpen={false}>
              {opps.length === 0 ? (
                <p className="text-sm text-[#6f6b62]">VAT observations are captured within opportunities. Create an opportunity to start tracking value, alignment and trust signals.</p>
              ) : (
                <div className="space-y-4">
                  {opps.map((opp) => (
                    opp.vat_observations && Object.keys(opp.vat_observations).length > 0 ? (
                      <div key={opp.id}>
                        <p className="text-xs font-semibold text-[#6f6b62] mb-2">{opp.title}</p>
                        <div className="grid grid-cols-3 gap-3">
                          {(["value", "alignment", "trust"] as const).map((dim) => {
                            const obs = (opp.vat_observations as Record<string, string>)[dim];
                            if (!obs) return null;
                            return (
                              <div key={dim} className={`rounded-lg p-3 text-xs ${dim === "value" ? "bg-[#063b32]/8 text-[#063b32]" : dim === "alignment" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                                <p className="font-semibold uppercase tracking-[0.1em] text-[10px] mb-1">{dim}</p>
                                <p>{obs}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </Section>

            {/* E: Open opportunities summary */}
            <Section title="E — Opportunities" defaultOpen={false}>
              {opps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[#6f6b62] mb-3">No opportunities yet.</p>
                  <Link href={`/admin/engagement/pipeline/opportunities/new?org=${id}`} className="inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                    <Plus className="h-4 w-4" /> Add opportunity
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {opps.map((opp) => (
                    <Link key={opp.id} href={`/admin/engagement/pipeline/opportunities/${opp.id}`} className="flex items-center justify-between rounded-lg border border-[#111111]/10 px-4 py-3 hover:border-[#063b32]/30 hover:bg-[#f7f4ea] transition-all group">
                      <div>
                        <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32]">{opp.title}</p>
                        {opp.next_action && <p className="text-xs text-[#6f6b62]">{opp.next_action}</p>}
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>{opp.stage}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Section>

            {/* F: Notes */}
            <Section title="F — Internal notes" defaultOpen={false}>
              {editing ? (
                <textarea rows={5} value={editForm.notes ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Sensitivity context, relationship notes, anything useful…" className={inputClass} />
              ) : org.notes ? (
                <p className="text-sm text-[#111111] whitespace-pre-wrap">{org.notes}</p>
              ) : (
                <p className="text-sm text-[#6f6b62]">No notes yet.</p>
              )}
            </Section>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <div>
            <div className="mb-4 flex justify-end">
              <Link
                href={`/admin/engagement/pipeline/contacts/new?org=${id}`}
                className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
              >
                <Plus className="h-4 w-4" /> Add contact
              </Link>
            </div>
            {contacts.length === 0 ? (
              <div className="rounded-xl border border-[#111111]/10 py-12 text-center">
                <User className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
                <p className="text-sm text-[#6f6b62]">No contacts yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
                <div className="divide-y divide-[#111111]/5">
                  {contacts.map((c) => (
                    <Link key={c.id} href={`/admin/engagement/pipeline/contacts/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#f7f4ea] transition-colors group">
                      <div>
                        <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32]">{c.first_name} {c.last_name}</p>
                        {c.role && <p className="text-xs text-[#6f6b62]">{c.role}</p>}
                        {c.professional_email && <p className="text-xs text-[#6f6b62]">{c.professional_email}</p>}
                        {c.is_suppressed && <span className="inline-block mt-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Suppressed</span>}
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#6f6b62] group-hover:text-[#063b32]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* OPPORTUNITIES TAB */}
        {activeTab === "opportunities" && (
          <div>
            <div className="mb-4 flex justify-end">
              <Link href={`/admin/engagement/pipeline/opportunities/new?org=${id}`} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                <Plus className="h-4 w-4" /> Add opportunity
              </Link>
            </div>
            {opps.length === 0 ? (
              <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No opportunities yet.</div>
            ) : (
              <div className="space-y-3">
                {opps.map((opp) => (
                  <Link key={opp.id} href={`/admin/engagement/pipeline/opportunities/${opp.id}`} className="flex items-center justify-between rounded-xl border border-[#111111]/10 px-5 py-4 hover:border-[#063b32]/30 hover:shadow-sm transition-all group">
                    <div>
                      <p className="font-semibold text-[#111111] group-hover:text-[#063b32]">{opp.title}</p>
                      {opp.next_action && <p className="text-sm text-[#6f6b62] mt-0.5">{opp.next_action}</p>}
                      {(opp.indicative_value_low || opp.indicative_value_high) && (
                        <p className="text-xs font-semibold text-[#063b32] mt-1">
                          £{(opp.indicative_value_low ?? 0).toLocaleString()} – £{(opp.indicative_value_high ?? 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[opp.stage] || "bg-gray-100 text-gray-600"}`}>{opp.stage}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INTERACTIONS TAB */}
        {activeTab === "interactions" && (
          <div>
            <div className="mb-4 flex justify-end">
              <Link href={`/admin/engagement/live-call?org=${id}`} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]">
                <Phone className="h-4 w-4" /> Start call
              </Link>
            </div>
            {interactions.length === 0 ? (
              <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No interactions recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {interactions.map((i) => (
                  <div key={i.id} className="rounded-xl border border-[#111111]/10 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#f7f4ea] p-2 text-[#6f6b62]">
                          {INTERACTION_ICONS[i.interaction_type] ?? <MessageSquare className="h-3.5 w-3.5" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#111111] capitalize">{i.interaction_type}</p>
                          <p className="text-xs text-[#6f6b62]">{new Date(i.interaction_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      {i.outcome && <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{i.outcome}</span>}
                    </div>
                    {i.summary && <p className="mt-3 text-sm text-[#111111]">{i.summary}</p>}
                    {i.commitments && <p className="mt-2 text-xs text-[#6f6b62]"><span className="font-semibold">Commitments:</span> {i.commitments}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div>
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No tasks.</div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 rounded-xl border border-[#111111]/10 px-5 py-3.5">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-gray-300"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#111111]">{t.title}</p>
                      {t.due_date && (
                        <p className="text-xs text-[#6f6b62]">Due {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                      )}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${t.status === "done" ? "bg-emerald-100 text-emerald-700" : t.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
