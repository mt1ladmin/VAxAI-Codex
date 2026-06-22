"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import type { PainPoint, Persona, SectorProfile } from "@/lib/engagement/types";

export type KnowledgeProfileType = "sector" | "persona" | "pain_point";

type KnowledgeProfileModalProps = {
  open: boolean;
  onClose: () => void;
  type: KnowledgeProfileType;
  sector?: SectorProfile | null;
  persona?: Persona | null;
  painPoint?: PainPoint | null;
};

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[#111111]/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-white px-4 py-3 text-left hover:bg-[#f7f4ea]/60"
      >
        <span className="text-sm font-semibold text-[#111111]">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-[#6f6b62]" /> : <ChevronRight className="h-4 w-4 text-[#6f6b62]" />}
      </button>
      {open && <div className="border-t border-[#111111]/10 px-4 py-3">{children}</div>}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-[#111111]">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#063b32]/40" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectorContent({ sector }: { sector: SectorProfile }) {
  return (
    <div className="space-y-3">
      {sector.description && (
        <p className="text-sm text-[#6f6b62]">{sector.description}</p>
      )}
      {sector.audience_types && sector.audience_types.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sector.audience_types.map((a) => (
            <span key={a} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{a}</span>
          ))}
        </div>
      )}
      {sector.common_operating_model && (
        <AccordionSection title="How this sector typically operates" defaultOpen>
          <p className="text-sm text-[#111111]">{sector.common_operating_model}</p>
        </AccordionSection>
      )}
      {sector.common_admin_pressures && sector.common_admin_pressures.length > 0 && (
        <AccordionSection title="Common admin pressures">
          <BulletList items={sector.common_admin_pressures} />
        </AccordionSection>
      )}
      {sector.typical_stakeholders && sector.typical_stakeholders.length > 0 && (
        <AccordionSection title="Typical stakeholders">
          <div className="flex flex-wrap gap-2">
            {sector.typical_stakeholders.map((s) => (
              <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{s}</span>
            ))}
          </div>
        </AccordionSection>
      )}
      {sector.common_systems && sector.common_systems.length > 0 && (
        <AccordionSection title="Common systems and tools">
          <div className="flex flex-wrap gap-2">
            {sector.common_systems.map((s) => (
              <span key={s} className="rounded-full bg-[#f7f4ea] px-3 py-1 text-xs font-semibold text-[#6f6b62]">{s}</span>
            ))}
          </div>
        </AccordionSection>
      )}
      {sector.starting_language && (
        <AccordionSection title="Starting language">
          <p className="text-sm italic text-[#111111]">&ldquo;{sector.starting_language}&rdquo;</p>
        </AccordionSection>
      )}
      {sector.questions_to_explore && sector.questions_to_explore.length > 0 && (
        <AccordionSection title="Questions to explore">
          <BulletList items={sector.questions_to_explore} />
        </AccordionSection>
      )}
      {sector.common_objections && sector.common_objections.length > 0 && (
        <AccordionSection title="Common objections">
          <div className="space-y-2">
            {sector.common_objections.map((o, i) => (
              <p key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-sm italic text-[#111111]">&ldquo;{o}&rdquo;</p>
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
}

function PersonaContent({ persona }: { persona: Persona }) {
  return (
    <div className="space-y-3">
      {persona.typical_role && (
        <p className="text-sm text-[#6f6b62]">{persona.typical_role}</p>
      )}
      {persona.goals && persona.goals.length > 0 && (
        <AccordionSection title="Goals" defaultOpen>
          <BulletList items={persona.goals} />
        </AccordionSection>
      )}
      {persona.pressures && persona.pressures.length > 0 && (
        <AccordionSection title="Pressures">
          <BulletList items={persona.pressures} />
        </AccordionSection>
      )}
      {persona.likely_concerns && persona.likely_concerns.length > 0 && (
        <AccordionSection title="Likely concerns">
          <BulletList items={persona.likely_concerns} />
        </AccordionSection>
      )}
      {persona.useful_questions && persona.useful_questions.length > 0 && (
        <AccordionSection title="Useful questions">
          <BulletList items={persona.useful_questions} />
        </AccordionSection>
      )}
      {persona.language_to_avoid && persona.language_to_avoid.length > 0 && (
        <AccordionSection title="Language to avoid">
          <BulletList items={persona.language_to_avoid} />
        </AccordionSection>
      )}
    </div>
  );
}

function PainPointContent({ painPoint }: { painPoint: PainPoint }) {
  return (
    <div className="space-y-3">
      {painPoint.plain_english_definition && (
        <p className="text-sm text-[#6f6b62]">{painPoint.plain_english_definition}</p>
      )}
      {painPoint.what_person_says && painPoint.what_person_says.length > 0 && (
        <AccordionSection title="What the person says" defaultOpen>
          <BulletList items={painPoint.what_person_says} />
        </AccordionSection>
      )}
      {painPoint.what_this_means && painPoint.what_this_means.length > 0 && (
        <AccordionSection title="What this means">
          <BulletList items={painPoint.what_this_means} />
        </AccordionSection>
      )}
      {painPoint.natural_questions && painPoint.natural_questions.length > 0 && (
        <AccordionSection title="Natural questions">
          <BulletList items={painPoint.natural_questions} />
        </AccordionSection>
      )}
      {painPoint.what_not_assume && painPoint.what_not_assume.length > 0 && (
        <AccordionSection title="What not to assume">
          <BulletList items={painPoint.what_not_assume} />
        </AccordionSection>
      )}
      {painPoint.quick_improvements && painPoint.quick_improvements.length > 0 && (
        <AccordionSection title="Quick improvements">
          <BulletList items={painPoint.quick_improvements} />
        </AccordionSection>
      )}
      {painPoint.common_objections && painPoint.common_objections.length > 0 && (
        <AccordionSection title="Common objections">
          <div className="space-y-2">
            {painPoint.common_objections.map((o, i) => (
              <p key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-sm italic text-[#111111]">&ldquo;{o}&rdquo;</p>
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
}

export function KnowledgeProfileModal({
  open,
  onClose,
  type,
  sector,
  persona,
  painPoint,
}: KnowledgeProfileModalProps) {
  if (!open) return null;

  const title =
    type === "sector" ? sector?.name :
    type === "persona" ? persona?.persona_name :
    painPoint?.title;

  const subtitle =
    type === "sector" ? "Sector profile" :
    type === "persona" ? "Persona" :
    painPoint?.category;

  const typeLabel =
    type === "sector" ? "Sector" :
    type === "persona" ? "Persona" :
    "Pain point";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#111111]/10 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#111111]/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">{typeLabel}</p>
            <h2 className="mt-0.5 text-xl font-semibold text-[#111111]">{title || "Profile"}</h2>
            {subtitle && type !== "sector" && (
              <p className="mt-0.5 text-sm text-[#6f6b62]">{subtitle}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#6f6b62] hover:bg-[#f7f4ea]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {type === "sector" && sector && <SectorContent sector={sector} />}
          {type === "persona" && persona && <PersonaContent persona={persona} />}
          {type === "pain_point" && painPoint && <PainPointContent painPoint={painPoint} />}
        </div>
      </div>
    </div>
  );
}