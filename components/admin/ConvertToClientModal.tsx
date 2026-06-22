"use client";

import { useState } from "react";
import { Briefcase, Check, Loader2, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConverted: () => void;
  enquiryId: string;
  enquiryName: string;
  enquiryEmail: string;
  enquiryPhone: string | null;
  enquirySupportType: string;
  enquiryDetails: string;
  existingContactId: string | null;
  existingOrgId: string | null;
};

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

export function ConvertToClientModal({
  open,
  onClose,
  onConverted,
  enquiryId,
  enquiryName,
  enquiryEmail,
  enquiryPhone,
  enquirySupportType,
  enquiryDetails,
  existingContactId,
  existingOrgId,
}: Props) {
  const nameParts = enquiryName.trim().split(/\s+/);
  const defaultFirst = nameParts[0] ?? enquiryName;
  const defaultLast = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [email, setEmail] = useState(enquiryEmail);
  const [phone, setPhone] = useState(enquiryPhone ?? "");
  const [role, setRole] = useState("");
  const [orgName, setOrgName] = useState(enquiryName);

  const [serviceTitle, setServiceTitle] = useState(
    `${enquirySupportType} — ${defaultFirst}${defaultLast ? ` ${defaultLast}` : ""}`.slice(0, 120)
  );
  const [stage, setStage] = useState("Active client");
  const [valueLow, setValueLow] = useState("");
  const [valueHigh, setValueHigh] = useState("");
  const [desiredOutcomes, setDesiredOutcomes] = useState(enquiryDetails);
  const [agreedPathway, setAgreedPathway] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!serviceTitle.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      let contactId = existingContactId;
      let orgId = existingOrgId;

      if (!contactId) {
        // Create organisation
        const orgRes = await fetch("/api/admin/engagement/organisations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orgName.trim() || enquiryName,
            source: "website_enquiry",
            status: "Client",
          }),
        });
        const orgJson = (await orgRes.json()) as { data?: { id: string }; error?: string };
        if (!orgRes.ok || !orgJson.data) throw new Error(orgJson.error ?? "Failed to create organisation");
        orgId = orgJson.data.id;

        // Create contact
        const contactRes = await fetch("/api/admin/engagement/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName.trim() || defaultFirst,
            last_name: lastName.trim() || null,
            professional_email: email.trim() || enquiryEmail,
            phone: phone.trim() || null,
            role: role.trim() || null,
            organisation_id: orgId,
            contact_source: "website_enquiry",
          }),
        });
        const contactJson = (await contactRes.json()) as { data?: { id: string }; error?: string };
        if (!contactRes.ok || !contactJson.data) throw new Error(contactJson.error ?? "Failed to create contact");
        contactId = contactJson.data.id;

        // Link contact + org back to the enquiry
        await fetch(`/api/admin/enquiries/${enquiryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact_id: contactId,
            organisation_id: orgId,
            last_action: "Converted to client",
            last_action_date: new Date().toISOString(),
          }),
        });
      }

      // Create the client service/opportunity record
      const oppRes = await fetch("/api/admin/engagement/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: serviceTitle.trim(),
          primary_contact_id: contactId,
          organisation_id: orgId ?? null,
          enquiry_id: enquiryId,
          stage,
          desired_outcomes: desiredOutcomes.trim() || null,
          recommended_pathway: agreedPathway.trim() || null,
          indicative_value_low: valueLow ? parseFloat(valueLow) : null,
          indicative_value_high: valueHigh ? parseFloat(valueHigh) : null,
          notes: serviceNotes.trim() || null,
        }),
      });
      const oppJson = (await oppRes.json()) as { data?: { id: string }; error?: string };
      if (!oppRes.ok || !oppJson.data) throw new Error(oppJson.error ?? "Failed to create service record");

      onConverted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#063b32]">
              <Briefcase className="h-4 w-4 text-[#f5f274]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111111]">Convert to client</h2>
              <p className="text-xs text-[#6f6b62]">
                Linked to enquiry from <span className="font-semibold">{enquiryName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#111111]/15 text-[#6f6b62] hover:bg-[#f7f4ea]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Contact section */}
          {existingContactId ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-[#063b32]" />
              <p className="text-sm font-semibold text-[#063b32]">
                CRM contact already linked — the service record will be attached to them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                  Contact details
                </p>
                <p className="mt-0.5 text-xs text-[#6f6b62]">
                  Pre-filled from the enquiry — edit as needed before creating the CRM record.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Last name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Role / job title</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Operations Manager"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Organisation name</label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-[#111111]/8" />

          {/* Service section */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Service details
              </p>
              <p className="mt-0.5 text-xs text-[#6f6b62]">
                Describe the service or package they are signing up for.
              </p>
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">
                Service / package name <span className="text-red-500">*</span>
              </label>
              <input
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="e.g. Monthly VA Support — Administration Package"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#6f6b62] mb-1">Client status</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className={inputClass}
                >
                  <option value="Won">Won</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Active client">Active client</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Fee from (£)</label>
                  <input
                    type="number"
                    min="0"
                    value={valueLow}
                    onChange={(e) => setValueLow(e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6f6b62] mb-1">Fee to (£)</label>
                  <input
                    type="number"
                    min="0"
                    value={valueHigh}
                    onChange={(e) => setValueHigh(e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">
                What they need / desired outcomes
              </label>
              <textarea
                value={desiredOutcomes}
                onChange={(e) => setDesiredOutcomes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">
                What we&apos;re delivering / agreed scope
              </label>
              <textarea
                value={agreedPathway}
                onChange={(e) => setAgreedPathway(e.target.value)}
                placeholder="Describe the agreed scope of work and deliverables…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#6f6b62] mb-1">Additional notes</label>
              <textarea
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="Any other relevant details…"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#111111]/10 bg-[#f7f4ea]/60 px-6 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-[#6f6b62]">
            {existingContactId
              ? "A new service record will be created and linked to this enquiry."
              : "A CRM contact and service record will be created, linked to this enquiry."}
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || !serviceTitle.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Briefcase className="h-4 w-4" />
              )}
              {submitting ? "Converting…" : "Convert to client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
