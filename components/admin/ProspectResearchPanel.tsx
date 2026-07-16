"use client";

import type React from "react";
import { ExternalLink, Mail, Phone, User } from "lucide-react";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { formatRevenue } from "@/lib/engagement/prospect-outreach/snapshot";
import { ServiceFitPanel } from "@/components/admin/ServiceFitPanel";

const inputClass =
  "w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#122428]";

type PatchFn = (partial: Partial<ProspectOutreachRecord>) => void;

function Field({
  label,
  value,
  editable,
  onChange,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  if (!editable) {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">{label}</p>
        <p className="mt-1 text-sm text-[#111111] whitespace-pre-wrap">{value || "—"}</p>
      </div>
    );
  }
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

export function ProspectProfileHeader({
  data,
  editable,
  onChange,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onChange?: PatchFn;
}) {
  const patch = (partial: Partial<ProspectOutreachRecord>) => onChange?.(partial);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {editable ? (
          <input
            value={data.organisation_name}
            onChange={(e) => patch({ organisation_name: e.target.value })}
            className="font-serif text-lg text-[#111111] rounded-xl border border-[#111111]/15 px-3 py-1.5 outline-none focus:border-[#122428] w-full"
          />
        ) : (
          <h2 className="font-serif text-lg text-[#111111]">{data.organisation_name}</h2>
        )}
      </div>
      <p className="text-xs text-[#5F686A]">
        {data.organisation_type} · {data.location}, {data.region}
      </p>
    </div>
  );
}

export function ProspectOrganisationCard({
  data,
  editable,
  onChange,
}: {
  data: ProspectOutreachRecord & { sector_label?: string };
  editable?: boolean;
  onChange?: PatchFn;
}) {
  const patch = (partial: Partial<ProspectOutreachRecord>) => onChange?.(partial);

  return (
    <div className="rounded-xl border border-[#111111]/10 p-4 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Organisation</p>
      {editable ? (
        <>
          <Field label="Location" value={data.location} editable onChange={(v) => patch({ location: v })} />
          <Field label="Website" value={data.website} editable type="url" onChange={(v) => patch({ website: v })} />
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Employees"
              value={data.employees?.toString() ?? ""}
              editable
              onChange={(v) => patch({ employees: v ? parseInt(v, 10) : null })}
            />
            <Field
              label="Revenue (£)"
              value={data.annual_revenue_gbp?.toString() ?? ""}
              editable
              onChange={(v) => patch({ annual_revenue_gbp: v ? parseInt(v.replace(/,/g, ""), 10) : null })}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-[#111111]">{data.sector_label || data.organisation_type}</p>
          <p className="text-sm text-[#5F686A]">{data.location}, {data.region}</p>
          <p className="text-sm">Employees: {data.employees ?? "—"}</p>
          <p className="text-sm">Revenue: {formatRevenue(data.annual_revenue_gbp)}</p>
          {data.revenue_basis && <p className="text-xs text-[#5F686A]">{data.revenue_basis}</p>}
          {data.website && (
            <a
              href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#122428] hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Website
            </a>
          )}
        </>
      )}
    </div>
  );
}

export function ProspectDecisionMakerCard({
  data,
  editable,
  onChange,
  headerAction,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onChange?: PatchFn;
  headerAction?: React.ReactNode;
}) {
  const patch = (partial: Partial<ProspectOutreachRecord>) => onChange?.(partial);

  return (
    <div className="rounded-xl border border-[#111111]/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Decision maker</p>
        {headerAction}
      </div>
      {editable ? (
        <>
          <Field
            label="Name"
            value={data.decision_maker_name}
            editable
            onChange={(v) => patch({ decision_maker_name: v })}
          />
          <Field
            label="Role"
            value={data.decision_maker_role}
            editable
            onChange={(v) => patch({ decision_maker_role: v })}
          />
          <Field label="Email" value={data.email} editable type="email" onChange={(v) => patch({ email: v })} />
          <Field label="Phone" value={data.phone} editable type="tel" onChange={(v) => patch({ phone: v })} />
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-medium text-[#111111]">
            <User className="h-4 w-4 shrink-0 text-[#122428]" />
            {data.decision_maker_name || "Not captured"}
            {data.decision_maker_role && (
              <span className="font-normal text-[#5F686A]">— {data.decision_maker_role}</span>
            )}
          </p>
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-[#122428] hover:underline">
              <Mail className="h-4 w-4" /> {data.email}
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-sm text-[#122428] hover:underline">
              <Phone className="h-4 w-4" /> {data.phone}
            </a>
          )}
        </>
      )}
    </div>
  );
}

export function ProspectResearchEvidenceCard({
  data,
  editable,
  onChange,
}: {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onChange?: PatchFn;
}) {
  return (
    <div className="rounded-xl border border-[#111111]/10 bg-[#122428]/5 p-4">
      <Field
        label="Research evidence"
        value={data.need_rationale}
        editable={editable}
        multiline
        onChange={(v) => onChange?.({ need_rationale: v })}
      />
    </div>
  );
}

export function ProspectTagList({ data }: { data: ProspectOutreachRecord }) {
  const sectorTags = data.sector_tags ?? [];
  const painTags = data.pain_point_tags ?? [];
  if (!sectorTags.length && !painTags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {sectorTags.map((t) => (
        <span key={t} className="rounded-full bg-white px-3 py-1 text-xs text-[#122428]">{t}</span>
      ))}
      {painTags.map((t) => (
        <span key={t} className="rounded-full border border-[#111111]/15 px-3 py-1 text-xs text-[#5F686A]">{t}</span>
      ))}
    </div>
  );
}

type Props = {
  data: ProspectOutreachRecord;
  editable?: boolean;
  onChange?: (next: ProspectOutreachRecord) => void;
  compact?: boolean;
};

export function ProspectResearchPanel({ data, editable, onChange, compact }: Props) {
  const patch = (partial: Partial<ProspectOutreachRecord>) => {
    onChange?.({ ...data, ...partial });
  };

  return (
    <div className="space-y-5">
      <ProspectProfileHeader data={data} editable={editable} onChange={patch} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ProspectDecisionMakerCard data={data} editable={editable} onChange={patch} />
        <ProspectOrganisationCard data={data} editable={editable} onChange={patch} />
      </div>

      <ServiceFitPanel data={data} compact={compact} />
      <ProspectResearchEvidenceCard data={data} editable={editable} onChange={patch} />

      {!compact && (data.engagement_approach || editable) && (
        <div className="rounded-xl border border-[#111111]/10 p-4">
          <Field
            label="Engagement approach notes"
            value={data.engagement_approach}
            editable={editable}
            multiline
            onChange={(v) => patch({ engagement_approach: v })}
          />
        </div>
      )}

      <ProspectTagList data={data} />

      {!compact && (data.financial_source_url || data.contact_source_url) && (
        <div className="text-xs text-[#5F686A]">
          <p className="font-semibold uppercase tracking-wider">Sources</p>
          {data.financial_source_url && (
            <a href={data.financial_source_url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-[#122428] hover:underline">
              Financial: {data.financial_source_url}
            </a>
          )}
          {data.contact_source_url && (
            <a href={data.contact_source_url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-[#122428] hover:underline">
              Contact: {data.contact_source_url}
            </a>
          )}
        </div>
      )}
    </div>
  );
}