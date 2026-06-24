"use client";

import { useEffect, useState } from "react";
import { Briefcase, Check, Loader2, X } from "lucide-react";
import { CONVERTED_SOURCE_STATUS, CLIENT_SERVICE_STAGES } from "@/lib/engagement/client-stages";
import {
  ADVANCE_ACTION_LABEL,
  ADVANCE_MODAL_SUBTITLE,
  ADVANCE_MODAL_TITLE,
  ADVANCE_STATUS_HINT,
  PRE_SALES_STATUS,
  canAdvanceToClientWork,
} from "@/lib/engagement/journey";

type Props = {
  open: boolean;
  onClose: () => void;
  onConverted: (contactId: string) => void;
  sourceType: "enquiry" | "queue";
  sourceId: string;
  sourceLabel: string;
  sourceStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  supportType?: string;
  existingContactId: string | null;
  existingOrgId: string | null;
};

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

export function ConvertToClientModal({
  open,
  onClose,
  onConverted,
  sourceType,
  sourceId,
  sourceLabel,
  sourceStatus,
  contactName,
  contactEmail,
  contactPhone,
  supportType = "",
  existingContactId,
  existingOrgId,
}: Props) {
  const nameParts = contactName.trim().split(/\s+/);
  const defaultFirst = nameParts[0] ?? contactName;
  const defaultLast = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [email, setEmail] = useState(contactEmail);
  const [phone, setPhone] = useState(contactPhone ?? "");
  const [role, setRole] = useState("");
  const [orgName, setOrgName] = useState(contactName);
  const [serviceTitle, setServiceTitle] = useState("");
  const [stage, setStage] = useState("Onboarding planned");
  const [valueLow, setValueLow] = useState("");
  const [valueHigh, setValueHigh] = useState("");
  const [desiredOutcomes, setDesiredOutcomes] = useState("");
  const [agreedPathway, setAgreedPathway] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const parts = contactName.trim().split(/\s+/);
    const first = parts[0] ?? contactName;
    const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
    setFirstName(first);
    setLastName(last);
    setEmail(contactEmail);
    setPhone(contactPhone ?? "");
    setRole("");
    setOrgName(contactName);
    setServiceTitle(
      `${supportType || "Client services"} — ${first}${last ? ` ${last}` : ""}`.slice(0, 120),
    );
    setStage("Onboarding planned");
    setValueLow("");
    setValueHigh("");
    setDesiredOutcomes("");
    setAgreedPathway("");
    setServiceNotes("");
    setError("");
  }, [
    open,
    contactName,
    contactEmail,
    contactPhone,
    supportType,
  ]);

  const closeSourceRecord = async () => {
    if (sourceType === "enquiry") {
      await fetch(`/api/admin/enquiries/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: CONVERTED_SOURCE_STATUS,
          last_action: "Advanced to client work",
          last_action_date: new Date().toISOString(),
        }),
      });
    } else {
      await fetch(`/api/admin/engagement/prospect-queue/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: CONVERTED_SOURCE_STATUS,
          last_action: "Advanced to client work",
          last_action_date: new Date().toISOString(),
        }),
      });
    }
  };

  const handleSubmit = async () => {
    if (!serviceTitle.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      let contactId = existingContactId;
      let orgId = existingOrgId;
      const contactSource = sourceType === "enquiry" ? "website_enquiry" : "prospect_queue";

      if (!contactId) {
        const orgRes = await fetch("/api/admin/engagement/organisations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orgName.trim() || contactName,
            source: contactSource,
            status: "Client",
          }),
        });
        const orgJson = (await orgRes.json()) as { data?: { id: string }; error?: string };
        if (!orgRes.ok || !orgJson.data) throw new Error(orgJson.error ?? "Failed to create organisation");
        orgId = orgJson.data.id;

        const contactRes = await fetch("/api/admin/engagement/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName.trim() || defaultFirst,
            last_name: lastName.trim() || null,
            professional_email: email.trim() || contactEmail,
            phone: phone.trim() || null,
            role: role.trim() || null,
            organisation_id: orgId,
            contact_source: contactSource,
          }),
        });
        const contactJson = (await contactRes.json()) as { data?: { id: string }; error?: string };
        if (!contactRes.ok || !contactJson.data) throw new Error(contactJson.error ?? "Failed to create contact");
        contactId = contactJson.data.id;

        if (sourceType === "enquiry") {
          await fetch(`/api/admin/enquiries/${sourceId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contact_id: contactId,
              organisation_id: orgId,
            }),
          });
        } else {
          await fetch(`/api/admin/engagement/prospect-queue/${sourceId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contact_id: contactId,
              organisation_id: orgId,
            }),
          });
        }
      }

      const oppPayload: Record<string, unknown> = {
        title: serviceTitle.trim(),
        primary_contact_id: contactId,
        organisation_id: orgId ?? null,
        stage,
        desired_outcomes: desiredOutcomes.trim() || null,
        recommended_pathway: agreedPathway.trim() || null,
        indicative_value_low: valueLow ? parseFloat(valueLow) : null,
        indicative_value_high: valueHigh ? parseFloat(valueHigh) : null,
        notes: serviceNotes.trim() || null,
      };
      if (sourceType === "enquiry") oppPayload.enquiry_id = sourceId;
      else oppPayload.queue_id = sourceId;

      const oppRes = await fetch("/api/admin/engagement/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oppPayload),
      });
      const oppJson = (await oppRes.json()) as { data?: { id: string }; error?: string };
      if (!oppRes.ok || !oppJson.data) throw new Error(oppJson.error ?? "Failed to create service record");

      await closeSourceRecord();

      await fetch("/api/admin/ai/chat/link-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType: "client",
          contextId: contactId,
          linkedContextType: sourceType === "enquiry" ? "enquiry" : "prospect",
          linkedContextId: sourceId,
        }),
      });

      const parentKey = sourceType === "enquiry" ? "enquiry_id" : "queue_id";
      const attachRes = await fetch(
        `/api/admin/engagement/knowledge-attachments?${parentKey}=${sourceId}`,
      );
      const attachJson = (await attachRes.json()) as {
        data?: {
          sector_ids: string[];
          persona_ids: string[];
          pain_point_ids: string[];
        } | null;
      };
      if (attachJson.data) {
        await fetch("/api/admin/engagement/knowledge-attachments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact_id: contactId,
            sector_ids: attachJson.data.sector_ids,
            persona_ids: attachJson.data.persona_ids,
            pain_point_ids: attachJson.data.pain_point_ids,
          }),
        });
      }

      onConverted(contactId!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const sourceName = sourceType === "enquiry" ? "enquiry" : "prospect queue item";
  const advanceAllowed = canAdvanceToClientWork(sourceStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#063b32]">
              <Briefcase className="h-4 w-4 text-[#f5f274]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111111]">{ADVANCE_MODAL_TITLE}</h2>
              <p className="text-xs text-[#6f6b62]">
                {ADVANCE_MODAL_SUBTITLE} Linked to {sourceName}: <span className="font-semibold">{sourceLabel}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-[#111111]/15 text-[#6f6b62] hover:bg-[#f7f4ea]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {existingContactId ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-[#063b32]" />
              <p className="text-sm font-semibold text-[#063b32]">
                CRM contact already linked — the client record will be attached to them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Contact details</p>
                <p className="mt-0.5 text-xs text-[#6f6b62]">Pre-filled from the source record — edit before saving.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Role / job title</label>
                  <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Operations Manager" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Organisation name</label>
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Prospect/Client service record</p>
              <p className="mt-0.5 text-xs text-[#6f6b62]">Record what has been agreed — defaults to Onboarding planned.</p>
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">
                Service / package name <span className="text-red-500">*</span>
              </label>
              <input value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#6f6b62] mb-1">Client status</label>
                <select value={stage} onChange={(e) => setStage(e.target.value)} className={inputClass}>
                  {CLIENT_SERVICE_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Fee from (£)</label>
                  <input type="number" min="0" value={valueLow} onChange={(e) => setValueLow(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Fee to (£)</label>
                  <input type="number" min="0" value={valueHigh} onChange={(e) => setValueHigh(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">What they need / desired outcomes</label>
              <p className="mb-1 text-[10px] text-[#6f6b62]">What has been agreed with the client — leave blank if not yet confirmed.</p>
              <textarea
                value={desiredOutcomes}
                onChange={(e) => setDesiredOutcomes(e.target.value)}
                rows={3}
                placeholder="e.g. Weekly admin support, invoice chasing, CRM setup…"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">Agreed scope / pathway</label>
              <textarea value={agreedPathway} onChange={(e) => setAgreedPathway(e.target.value)} rows={3} placeholder="e.g. Discovery → proposal → onboarding" className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">Additional notes</label>
              <textarea value={serviceNotes} onChange={(e) => setServiceNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
          </div>

          {!advanceAllowed && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Current status: <span className="font-semibold">{sourceStatus || "—"}</span>.
              {" "}{ADVANCE_STATUS_HINT}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#111111]/10 bg-[#f7f4ea]/60 px-6 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-[#6f6b62]">
            Requires status <span className="font-semibold">{PRE_SALES_STATUS}</span>. The {sourceName} will be marked Closed after advancing.
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || !serviceTitle.trim() || !advanceAllowed}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
              {submitting ? "Advancing…" : ADVANCE_ACTION_LABEL}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}