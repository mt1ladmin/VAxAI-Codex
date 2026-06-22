"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Edit3, Mail, Phone, Save } from "lucide-react";
import { type EngagementContact, type EngagementInteraction } from "@/lib/engagement/types";

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<EngagementContact | null>(null);
  const [interactions, setInteractions] = useState<EngagementInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<EngagementContact>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, iRes] = await Promise.all([
      fetch(`/api/admin/engagement/contacts/${id}`),
      fetch(`/api/admin/engagement/interactions?contact_id=${id}&limit=30`),
    ]);
    const [cData, iData] = await Promise.all([
      cRes.json() as Promise<{ data: EngagementContact }>,
      iRes.json() as Promise<{ data: EngagementInteraction[] }>,
    ]);
    setContact(cData.data);
    setForm(cData.data);
    setInteractions(iData.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    setSaving(true);
    setSaveError("");
    const res = await fetch(`/api/admin/engagement/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setSaveError(j.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    const j = await res.json() as { data: EngagementContact };
    setContact(j.data);
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-sm text-[#6f6b62]">Loading…</div>;
  if (!contact) return <div className="p-12 text-center text-sm text-red-600">Contact not found.</div>;

  const fullName = `${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline/contacts" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Contacts
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">{fullName}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
              {contact.role && <span className="text-sm text-[#6f6b62]">{contact.role}</span>}
              {contact.organisation && (
                <Link href={`/admin/engagement/pipeline/organisations/${contact.organisation.id}`} className="flex items-center gap-1 text-sm text-[#063b32] hover:underline">
                  <Building2 className="h-3.5 w-3.5" /> {contact.organisation.name}
                </Link>
              )}
              {contact.is_suppressed && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">Suppressed</span>}
              {contact.do_not_contact && <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-600">Do not contact</span>}
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Edit3 className="h-4 w-4" /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-6">
        {/* Contact info */}
        <div className="mb-6 rounded-xl border border-[#111111]/10 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-4">Contact details</h2>

          {editing ? (
            <div className="space-y-4">
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "First name", key: "first_name" },
                  { label: "Last name", key: "last_name" },
                  { label: "Role", key: "role" },
                  { label: "Professional email", key: "professional_email" },
                  { label: "Phone", key: "phone" },
                  { label: "LinkedIn URL", key: "linkedin_url" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs text-[#6f6b62] mb-1">{label}</label>
                    <input
                      type="text"
                      value={(form as Record<string, string>)[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-[#6f6b62] mb-1">Notes</label>
                <textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setForm(contact); }} className="text-sm text-[#6f6b62]">Discard</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ["Email", contact.professional_email, "email"],
                ["Phone", contact.phone, "phone"],
                ["LinkedIn", contact.linkedin_url, "url"],
                ["Preferred channel", contact.preferred_channel, ""],
                ["Contact basis", contact.contact_basis, ""],
                ["Source", contact.contact_source, ""],
              ].map(([label, val, type]) => val ? (
                <div key={label as string}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label as string}</dt>
                  <dd className="mt-0.5 text-sm text-[#111111]">
                    {type === "email" ? (
                      <a href={`mailto:${val}`} className="flex items-center gap-1 text-[#063b32] hover:underline">
                        <Mail className="h-3.5 w-3.5" /> {val as string}
                      </a>
                    ) : type === "phone" ? (
                      <a href={`tel:${val}`} className="flex items-center gap-1 text-[#063b32] hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {val as string}
                      </a>
                    ) : type === "url" ? (
                      <a href={val as string} target="_blank" rel="noopener noreferrer" className="text-[#063b32] hover:underline truncate block">{val as string}</a>
                    ) : val as string}
                  </dd>
                </div>
              ) : null)}
            </div>
          )}

          {contact.notes && !editing && (
            <div className="mt-4 border-t border-[#111111]/8 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1">Notes</p>
              <p className="text-sm text-[#111111] whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>

        {/* Interactions */}
        <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#f7f4ea]">
            <h2 className="text-sm font-semibold text-[#111111]">Interactions ({interactions.length})</h2>
            <Link href={`/admin/engagement/live-call?contact=${id}`} className="flex items-center gap-1.5 text-xs font-semibold text-[#063b32] hover:underline">
              <Phone className="h-3.5 w-3.5" /> Start call
            </Link>
          </div>
          {interactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6f6b62]">No interactions recorded.</div>
          ) : (
            <div className="divide-y divide-[#111111]/5">
              {interactions.map((i) => (
                <div key={i.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-semibold text-[#111111] capitalize">{i.interaction_type}</span>
                    <span className="text-xs text-[#6f6b62]">{new Date(i.interaction_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {i.outcome && <span className="rounded-full bg-[#f7f4ea] px-2 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{i.outcome}</span>}
                  </div>
                  {i.summary && <p className="text-sm text-[#111111]">{i.summary}</p>}
                  {i.commitments && <p className="mt-1 text-xs text-[#6f6b62]">Commitments: {i.commitments}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
