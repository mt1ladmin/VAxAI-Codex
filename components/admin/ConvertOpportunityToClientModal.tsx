"use client";

import { useEffect, useState } from "react";
import { Briefcase, Check, Loader2, X } from "lucide-react";
import type { EngagementOpportunity } from "@/lib/engagement/types";

const inputClass =
  "w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32] transition-colors";

export function ConvertOpportunityToClientModal({
  open,
  onClose,
  onConverted,
  opportunity,
}: {
  open: boolean;
  onClose: () => void;
  onConverted: (opportunity: EngagementOpportunity) => void;
  opportunity: EngagementOpportunity;
}) {
  const contactName = opportunity.primary_contact
    ? `${opportunity.primary_contact.first_name} ${opportunity.primary_contact.last_name ?? ""}`.trim()
    : "";
  const orgName = opportunity.organisation?.name ?? "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [organisationName, setOrganisationName] = useState(orgName || opportunity.title);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFirstName(contactName.split(" ")[0] ?? "");
    setLastName(contactName.split(" ").slice(1).join(" "));
    setOrganisationName(orgName || opportunity.title);
    setError("");
  }, [open, contactName, orgName, opportunity.title]);

  if (!open) return null;

  const save = async () => {
    setSubmitting(true);
    setError("");
    try {
      let contactId = opportunity.primary_contact_id;
      let organisationId = opportunity.organisation_id;

      if (!contactId) {
        if (!firstName.trim()) {
          setError("Contact first name is required.");
          setSubmitting(false);
          return;
        }

        if (!organisationId) {
          const orgRes = await fetch("/api/admin/engagement/organisations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: organisationName.trim() || opportunity.title,
              source: "pipeline_opportunity",
              status: "Client",
            }),
          });
          const orgJson = (await orgRes.json()) as { data?: { id: string }; error?: string };
          if (!orgRes.ok || !orgJson.data) throw new Error(orgJson.error ?? "Failed to create organisation");
          organisationId = orgJson.data.id;
        }

        const contactRes = await fetch("/api/admin/engagement/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim() || null,
            professional_email: email.trim() || null,
            phone: phone.trim() || null,
            role: role.trim() || null,
            organisation_id: organisationId,
            contact_source: "pipeline_opportunity",
          }),
        });
        const contactJson = (await contactRes.json()) as { data?: { id: string }; error?: string };
        if (!contactRes.ok || !contactJson.data) throw new Error(contactJson.error ?? "Failed to create contact");
        contactId = contactJson.data.id;
      }

      const res = await fetch(`/api/admin/engagement/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "Active client",
          primary_contact_id: contactId,
          organisation_id: organisationId,
        }),
      });
      const j = (await res.json()) as { data?: EngagementOpportunity; error?: string };
      if (!res.ok || !j.data) throw new Error(j.error ?? "Failed to convert opportunity");
      onConverted(j.data);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#111111]/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#063b32]">
              <Briefcase className="h-4 w-4 text-[#f5f274]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111111]">Convert to client</h2>
              <p className="text-xs text-[#6f6b62]">{opportunity.title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f6b62] hover:text-[#111111]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {opportunity.primary_contact_id ? (
            <div className="flex items-start gap-2 rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-[#063b32] mt-0.5" />
              <p className="text-sm text-[#111111]">
                This will set the opportunity to <span className="font-semibold">Active client</span> and link it to{" "}
                <span className="font-semibold">{contactName || "the existing contact"}</span> on their client profile.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#6f6b62]">
                Create a CRM contact for this opportunity, then mark it as an active client service record.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-[#6f6b62]">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-[#6f6b62]">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-[#6f6b62]">Organisation</label>
                <input value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-[#6f6b62]">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-[#6f6b62]">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-[#6f6b62]">Role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#111111]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-[#111111]/15 px-4 py-2 text-sm font-medium text-[#6f6b62] hover:bg-[#f7f4ea] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
            Convert to client
          </button>
        </div>
      </div>
    </div>
  );
}