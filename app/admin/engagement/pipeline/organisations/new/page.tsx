"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  AUDIENCE_TYPES, INDUSTRIES, ORG_SIZES, DIGITAL_MATURITY_LEVELS,
  AI_CONFIDENCE_LEVELS, TRUST_RISK_CONTEXTS, DELIVERY_PREFS,
} from "@/lib/engagement/types";

type Field = {
  label: string;
  key: string;
  type?: "text" | "textarea" | "select" | "url";
  options?: readonly string[];
  placeholder?: string;
  required?: boolean;
};

const FIELDS: Field[] = [
  { label: "Organisation name", key: "name", required: true, placeholder: "e.g. Greenways Community Trust" },
  { label: "Audience type", key: "audience_type", type: "select", options: AUDIENCE_TYPES },
  { label: "Industry", key: "industry", type: "select", options: INDUSTRIES },
  { label: "Size", key: "size", type: "select", options: ORG_SIZES },
  { label: "Website", key: "website", type: "url", placeholder: "https://…" },
  { label: "Town / city", key: "town_city", placeholder: "e.g. Manchester" },
  { label: "Region", key: "region", placeholder: "e.g. North West" },
  { label: "Postcode area", key: "postcode_area", placeholder: "e.g. M1" },
  { label: "Delivery preference", key: "delivery_preference", type: "select", options: DELIVERY_PREFS },
  { label: "Digital maturity", key: "digital_maturity", type: "select", options: DIGITAL_MATURITY_LEVELS },
  { label: "AI confidence", key: "ai_confidence", type: "select", options: AI_CONFIDENCE_LEVELS },
  { label: "Trust / risk context", key: "trust_risk_context", type: "select", options: TRUST_RISK_CONTEXTS },
  { label: "Charity number", key: "charity_number", placeholder: "e.g. 1234567" },
  { label: "Company number", key: "company_number", placeholder: "e.g. 01234567" },
  { label: "Source / how found", key: "source", placeholder: "e.g. LinkedIn, referral, event" },
  { label: "Description / context notes", key: "description", type: "textarea", placeholder: "Anything useful to remember about this organisation…" },
  { label: "Internal notes", key: "notes", type: "textarea", placeholder: "e.g. sensitivity context, who knows them…" },
];

const inputClass = "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

export default function NewOrgPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.name?.trim()) { setError("Organisation name is required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/engagement/organisations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setError(j.error ?? "Failed to save. Please try again.");
      setSaving(false);
      return;
    }
    const j = await res.json() as { data: { id: string } };
    router.push(`/admin/engagement/pipeline/organisations/${j.data.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline/organisations" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Organisations
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">New organisation</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Add a prospect, client or contact organisation to your pipeline.</p>
      </div>

      <div className="mx-auto max-w-2xl px-8 py-8">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-1.5">
                {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className={inputClass}
                />
              ) : f.type === "select" ? (
                <select
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">— select —</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === "url" ? "url" : "text"}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#063b32] py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : "Save organisation"}
          </button>
          <Link
            href="/admin/engagement/pipeline/organisations"
            className="rounded-lg border border-[#111111]/15 px-5 py-2.5 text-sm font-semibold text-[#6f6b62] hover:text-[#111111] hover:border-[#111111]/30 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
