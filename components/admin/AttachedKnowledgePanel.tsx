"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown } from "lucide-react";
import {
  fetchKnowledgeAttachments,
  hasKnowledgeLinks,
  type KnowledgeLinkIds,
} from "@/lib/engagement/knowledge-links";

type ResolvedItem = { id: string; label: string; href: string };

export function AttachedKnowledgePanel({
  outreachId,
  queueId,
  enquiryId,
  contactId,
  refreshKey = 0,
}: {
  outreachId?: string;
  queueId?: string;
  enquiryId?: string;
  contactId?: string;
  refreshKey?: number;
}) {
  const [open, setOpen] = useState(true);
  const [links, setLinks] = useState<KnowledgeLinkIds | null>(null);
  const [sectors, setSectors] = useState<ResolvedItem[]>([]);
  const [personas, setPersonas] = useState<ResolvedItem[]>([]);
  const [painPoints, setPainPoints] = useState<ResolvedItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await fetchKnowledgeAttachments({ outreachId, queueId, enquiryId, contactId });
      if (cancelled) return;
      if (!data || !hasKnowledgeLinks(data)) {
        setLinks(null);
        return;
      }
      setLinks(data);
      const [sRes, pRes, ppRes] = await Promise.all([
        data.sector_ids.length
          ? fetch(`/api/admin/engagement/sectors?limit=100`).then((r) => r.json())
          : Promise.resolve({ data: [] }),
        data.persona_ids.length
          ? fetch(`/api/admin/engagement/personas?limit=100`).then((r) => r.json())
          : Promise.resolve({ data: [] }),
        data.pain_point_ids.length
          ? fetch(`/api/admin/engagement/pain-points?limit=100`).then((r) => r.json())
          : Promise.resolve({ data: [] }),
      ]);
      if (cancelled) return;
      const sectorSet = new Set(data.sector_ids);
      const personaSet = new Set(data.persona_ids);
      const ppSet = new Set(data.pain_point_ids);
      setSectors(
        (sRes.data ?? [])
          .filter((s: { id: string }) => sectorSet.has(s.id))
          .map((s: { id: string; name: string }) => ({
            id: s.id,
            label: s.name,
            href: `/admin/engagement/knowledge/sectors/${s.id}`,
          })),
      );
      setPersonas(
        (pRes.data ?? [])
          .filter((p: { id: string }) => personaSet.has(p.id))
          .map((p: { id: string; persona_name: string }) => ({
            id: p.id,
            label: p.persona_name,
            href: `/admin/engagement/knowledge?tab=personas`,
          })),
      );
      setPainPoints(
        (ppRes.data ?? [])
          .filter((p: { id: string }) => ppSet.has(p.id))
          .map((p: { id: string; title: string }) => ({
            id: p.id,
            label: p.title,
            href: `/admin/engagement/pain-points/${p.id}`,
          })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [outreachId, queueId, enquiryId, contactId, refreshKey]);

  if (!links) return null;

  return (
    <div className="rounded-xl border border-[#063b32]/15 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[#063b32]/5 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#063b32]">
          <BookOpen className="h-4 w-4" />
          Attached guidance
        </span>
        <ChevronDown className={`h-4 w-4 text-[#063b32] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 px-4 py-3 text-sm">
          {sectors.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Sectors</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {sectors.map((s) => (
                  <Link key={s.id} href={s.href} className="rounded-full bg-white border border-[#111111]/10 px-2.5 py-0.5 text-xs font-medium text-[#063b32] hover:underline">
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {personas.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Personas</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {personas.map((p) => (
                  <Link key={p.id} href={p.href} className="rounded-full bg-white border border-[#111111]/10 px-2.5 py-0.5 text-xs font-medium text-[#063b32] hover:underline">
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {painPoints.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Pain points</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {painPoints.map((p) => (
                  <Link key={p.id} href={p.href} className="rounded-full bg-white border border-[#111111]/10 px-2.5 py-0.5 text-xs font-medium text-[#063b32] hover:underline">
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}