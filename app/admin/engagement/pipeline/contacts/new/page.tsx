"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft } from "lucide-react";

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

function NewContactForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("org") ?? "";

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "",
    professional_email: "",
    phone: "",
    linkedin_url: "",
    preferred_channel: "",
    contact_source: "",
    contact_basis: "",
    notes: "",
    organisation_id: orgId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.first_name.trim()) { setError("First name is required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/engagement/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setError(j.error ?? "Failed to save.");
      setSaving(false);
      return;
    }
    const j = await res.json() as { data: { id: string } };
    if (orgId) {
      router.push(`/admin/engagement/pipeline/organisations/${orgId}`);
    } else {
      router.push(`/admin/engagement/pipeline/contacts/${j.data.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">First name <span className="text-red-500">*</span></label>
            <input type="text" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="e.g. Sarah" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Last name</label>
            <input type="text" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="e.g. Jones" className={inputClass} />
          </div>
        </div>

        {[
          { label: "Role / job title", key: "role", placeholder: "e.g. Operations Manager" },
          { label: "Professional email", key: "professional_email", placeholder: "e.g. sarah@example.com", type: "email" },
          { label: "Phone", key: "phone", placeholder: "e.g. 07700 900000", type: "tel" },
          { label: "LinkedIn URL", key: "linkedin_url", placeholder: "https://linkedin.com/in/…", type: "url" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">{label}</label>
            <input type={type ?? "text"} value={(form as Record<string, string>)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inputClass} />
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Preferred channel</label>
          <select value={form.preferred_channel} onChange={(e) => set("preferred_channel", e.target.value)} className={inputClass}>
            <option value="">— select —</option>
            {["Email", "Phone", "LinkedIn", "In person", "Video call", "No preference"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Contact basis (GDPR)</label>
          <select value={form.contact_basis} onChange={(e) => set("contact_basis", e.target.value)} className={inputClass}>
            <option value="">— select —</option>
            {["Legitimate interest", "Consent given", "Existing relationship", "Public professional info", "Referral"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">How found / source</label>
          <input type="text" value={form.contact_source} onChange={(e) => set("contact_source", e.target.value)} placeholder="e.g. LinkedIn search, event, referral from…" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Anything useful to remember about this person…" className={inputClass} />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-[#063b32] py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60">
          {saving ? "Saving…" : "Save contact"}
        </button>
        <Link href={orgId ? `/admin/engagement/pipeline/organisations/${orgId}` : "/admin/engagement/pipeline/contacts"} className="rounded-lg border border-[#111111]/15 px-5 py-2.5 text-sm font-semibold text-[#6f6b62] hover:text-[#111111]">
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default function NewContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline/contacts" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Contacts
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">New contact</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Add a person to your pipeline. Email addresses are checked against the suppression list.</p>
      </div>
      <Suspense fallback={<div className="p-8 text-sm text-[#6f6b62]">Loading…</div>}>
        <NewContactForm />
      </Suspense>
    </div>
  );
}
