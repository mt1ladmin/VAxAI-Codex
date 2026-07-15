"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { AppSelect } from "@/components/ui/AppSelect";
import { emailComposeUrl } from "@/lib/engagement/email-links";
import {
  VA_APPLICANT_TYPE_LABELS,
  VA_APPLICATION_STATUSES,
  VA_INSURANCE_LABELS,
  VA_SELF_EMPLOYED_LABELS,
  VA_STATUS_COLORS,
  VA_STATUS_LABELS,
  type VaApplication,
  type VaApplicationStatus,
} from "@/lib/va-applications/constants";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5F686A]">{label}</p>
      <div className="mt-1.5 text-sm leading-6 text-pine-900">{children}</div>
    </div>
  );
}

export default function VaApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const [app, setApp] = useState<VaApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/va-applications/${id}`);
    const json = (await res.json()) as { data?: VaApplication; error?: string };
    if (!res.ok || !json.data) {
      setError(json.error || "Not found");
      setApp(null);
      setLoading(false);
      return;
    }
    setApp(json.data);
    setAdminNotes(json.data.admin_notes || "");
    setAvailabilityHours(json.data.availability_hours_per_week || "");
    setAvailabilityNotes(json.data.availability_notes || "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch(`/api/admin/va-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { data?: VaApplication; error?: string };
    setSaving(false);
    if (res.ok && json.data) {
      setApp(json.data);
      setAdminNotes(json.data.admin_notes || "");
      setAvailabilityHours(json.data.availability_hours_per_week || "");
      setAvailabilityNotes(json.data.availability_notes || "");
    } else {
      setError(json.error || "Update failed");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this application permanently?")) return;
    await fetch(`/api/admin/va-applications/${id}`, { method: "DELETE" });
    router.push("/admin/va-applications");
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#5F686A]" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-700">{error || "Application not found"}</p>
        <Link href="/admin/va-applications" className="mt-4 inline-flex text-sm font-semibold text-pine-900">
          ← Back to VAs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <Link
        href="/admin/va-applications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-pine-900"
      >
        <ArrowLeft className="h-4 w-4" />
        VAs
      </Link>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Profile card */}
        <div className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="rounded-2xl border border-pine-900/10 bg-white p-5">
            <ImageUpload
              value={app.photo_url || ""}
              onChange={(url) => void patch({ photo_url: url || null })}
              label="Profile photo"
              circular
              aspectClass="aspect-square"
            />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-pine-900">{app.full_name}</h1>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${VA_STATUS_COLORS[app.status]}`}
            >
              {VA_STATUS_LABELS[app.status]}
            </span>
            <p className="mt-2 text-xs font-medium text-[#5F686A]">
              {VA_APPLICANT_TYPE_LABELS[app.applicant_type]}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a
                href={emailComposeUrl(app.email, { subject: `VAxAI — ${app.full_name}` })}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-pine-900 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {app.email}
              </a>
              {app.telephone ? (
                <a href={`tel:${app.telephone}`} className="flex items-center gap-2 text-pine-900 hover:underline">
                  <Phone className="h-3.5 w-3.5" />
                  {app.telephone}
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-pine-900/10 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5F686A]">Status</p>
            <div className="mt-2">
              <AppSelect
                value={app.status}
                onChange={(v) => void patch({ status: v })}
                options={VA_APPLICATION_STATUSES.map((s) => ({
                  value: s,
                  label: VA_STATUS_LABELS[s],
                }))}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(
                [
                  "contacted",
                  "verified",
                  "approved",
                  "joined",
                  "not_suitable",
                ] as VaApplicationStatus[]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={saving || app.status === s}
                  onClick={() => void patch({ status: s })}
                  className="rounded-md border border-pine-900/12 px-2 py-1 text-[10px] font-semibold text-pine-900 hover:bg-[#F5F8F8] disabled:opacity-40"
                >
                  {VA_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {app.last_action ? (
              <p className="mt-3 text-[11px] leading-5 text-[#5F686A]">
                Last: {app.last_action}
                {app.last_action_date
                  ? ` · ${new Date(app.last_action_date).toLocaleString("en-GB")}`
                  : ""}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void handleDelete()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete application
          </button>
        </div>

        {/* Full submission */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-2xl border border-pine-900/10 bg-white p-6">
            <h2 className="text-base font-semibold text-pine-900">Full submission</h2>
            <p className="mt-1 text-xs text-[#5F686A]">
              Submitted {new Date(app.created_at).toLocaleString("en-GB")}
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field label="Location">{app.location || "—"}</Field>
              <Field label="UK-based">{app.uk_based ? "Yes" : "No"}</Field>
              <Field label="Self-employment">
                {VA_SELF_EMPLOYED_LABELS[app.self_employed_status]}
              </Field>
              <Field label="Business insurance">
                {VA_INSURANCE_LABELS[app.has_business_insurance]}
              </Field>
              <Field label="Can prove identity">{app.can_prove_identity ? "Yes" : "No"}</Field>
              <Field label="Sectors / interests">{app.sectors_interests || "—"}</Field>
            </div>

            <div className="mt-6">
              <Field label="Specialisms">
                {(app.specialisms?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {app.specialisms.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[#F5F8F8] px-2.5 py-1 text-xs font-semibold text-pine-900"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </Field>
            </div>

            <div className="mt-6 space-y-5">
              <Field label="Work they specialise in">
                <p className="whitespace-pre-wrap">{app.work_specialises_in || "—"}</p>
              </Field>
              <Field label="AI systems & automations knowledge">
                <p className="whitespace-pre-wrap">{app.ai_knowledge || "—"}</p>
              </Field>
              <Field label="Cover note">
                <p className="whitespace-pre-wrap">{app.cover_note || "—"}</p>
              </Field>
            </div>

            <div className="mt-6 rounded-xl border border-pine-900/10 bg-[#F5F8F8]/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5F686A]">CV</p>
              {app.cv_url ? (
                <a
                  href={app.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#122428] hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {app.cv_file_name || "Download CV"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="mt-2 text-sm text-[#5F686A]">No CV on file</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-pine-900/10 bg-white p-6">
            <h2 className="text-base font-semibold text-pine-900">Availability & profile</h2>
            <p className="mt-1 text-xs text-[#5F686A]">
              Keep this up to date for matching. More profile fields can be added later without redesigning
              the cards.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5F686A]">Hours per week</label>
                <input
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(e.target.value)}
                  className="w-full rounded-xl border border-pine-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-pine-900/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5F686A]">Availability notes</label>
                <input
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                  className="w-full rounded-xl border border-pine-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-pine-900/40"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void patch({
                  availability_hours_per_week: availabilityHours || null,
                  availability_notes: availabilityNotes || null,
                  last_action: "Availability updated",
                })
              }
              className="mt-3 rounded-lg bg-pine-900 px-3 py-2 text-xs font-semibold text-white hover:bg-pine-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save availability"}
            </button>
          </div>

          <div className="rounded-2xl border border-pine-900/10 bg-white p-6">
            <h2 className="text-base font-semibold text-pine-900">Internal notes</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-xl border border-pine-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-pine-900/40"
              placeholder="Interview notes, client fit, follow-ups…"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void patch({
                  admin_notes: adminNotes || null,
                  last_action: "Notes updated",
                })
              }
              className="mt-3 rounded-lg bg-pine-900 px-3 py-2 text-xs font-semibold text-white hover:bg-pine-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
