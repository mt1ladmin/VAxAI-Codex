"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { type SectorProfile } from "@/lib/engagement/types";

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-[#111111]">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#063b32]/40 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <div className="bg-[#f7f4ea] px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function SectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sector, setSector] = useState<SectorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/sectors/${id}`);
    if (!res.ok) { setLoading(false); return; }
    const json = await res.json() as { data: SectorProfile };
    setSector(json.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-12 text-center text-sm text-[#6f6b62]">Loading…</div>;
  if (!sector) return <div className="p-12 text-center text-sm text-red-600">Sector not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/knowledge" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Knowledge library
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Sector profile</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">{sector.name}</h1>
            {sector.description && (
              <p className="mt-1 text-sm text-[#6f6b62] max-w-2xl">{sector.description}</p>
            )}
            {sector.audience_types && sector.audience_types.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sector.audience_types.map((a) => (
                  <span key={a} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{a}</span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-6 space-y-4">
        {sector.common_operating_model && (
          <Section title="How this sector typically operates">
            <p className="text-sm text-[#111111]">{sector.common_operating_model}</p>
          </Section>
        )}

        {sector.common_admin_pressures && sector.common_admin_pressures.length > 0 && (
          <Section title="Common admin pressures">
            <List items={sector.common_admin_pressures} />
          </Section>
        )}

        {sector.typical_stakeholders && sector.typical_stakeholders.length > 0 && (
          <Section title="Typical stakeholders">
            <div className="flex flex-wrap gap-2">
              {sector.typical_stakeholders.map((s) => (
                <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {sector.common_systems && sector.common_systems.length > 0 && (
          <Section title="Common systems and tools">
            <div className="flex flex-wrap gap-2">
              {sector.common_systems.map((s) => (
                <span key={s} className="rounded-full bg-[#f7f4ea] px-3 py-1 text-xs font-semibold text-[#6f6b62]">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {sector.common_data_types && sector.common_data_types.length > 0 && (
          <Section title="Common data types">
            <List items={sector.common_data_types} />
          </Section>
        )}

        {sector.relevant_risk_areas && sector.relevant_risk_areas.length > 0 && (
          <Section title="Risk areas to be aware of">
            <div className="flex flex-wrap gap-2">
              {sector.relevant_risk_areas.map((r) => (
                <span key={r} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{r}</span>
              ))}
            </div>
          </Section>
        )}

        {sector.starting_language && (
          <Section title="Language to use when starting a conversation">
            <p className="text-sm text-[#111111] italic">&ldquo;{sector.starting_language}&rdquo;</p>
          </Section>
        )}

        {sector.questions_to_explore && sector.questions_to_explore.length > 0 && (
          <Section title="Questions to explore">
            <List items={sector.questions_to_explore} />
          </Section>
        )}

        {sector.common_objections && sector.common_objections.length > 0 && (
          <Section title="Common objections in this sector">
            <div className="space-y-2">
              {sector.common_objections.map((o, i) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-sm text-[#111111] italic">&ldquo;{o}&rdquo;</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {sector.potential_pathways && sector.potential_pathways.length > 0 && (
          <Section title="Potential service pathways">
            <List items={sector.potential_pathways} />
          </Section>
        )}

        {sector.evidence_sources && sector.evidence_sources.length > 0 && (
          <Section title="Evidence and sources">
            <ul className="space-y-1">
              {sector.evidence_sources.map((s, i) => (
                <li key={i} className="text-sm text-[#063b32] hover:underline">
                  {s.startsWith("http") ? (
                    <a href={s} target="_blank" rel="noopener noreferrer">{s}</a>
                  ) : s}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
