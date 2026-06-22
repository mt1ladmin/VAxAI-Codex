"use client";

import { useState } from "react";
import { KnowledgeProfileModal, type KnowledgeProfileType } from "@/components/admin/KnowledgeProfileModal";
import type { PainPoint, Persona, SectorProfile } from "@/lib/engagement/types";

type ModalState =
  | { type: "sector"; data: SectorProfile }
  | { type: "persona"; data: Persona }
  | { type: "pain_point"; data: PainPoint };

function KnowledgeLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-[#063b32] hover:underline text-left"
    >
      {label}
    </button>
  );
}

type PrepKnowledgeSummaryProps = {
  sector?: SectorProfile | null;
  persona?: Persona | null;
  relevantPains?: PainPoint[];
  compact?: boolean;
};

export function PrepKnowledgeSummary({
  sector,
  persona,
  relevantPains = [],
  compact = false,
}: PrepKnowledgeSummaryProps) {
  const [modal, setModal] = useState<ModalState | null>(null);

  if (!sector && !persona && relevantPains.length === 0) return null;

  return (
    <>
      <KnowledgeProfileModal
        open={!!modal}
        onClose={() => setModal(null)}
        type={(modal?.type || "sector") as KnowledgeProfileType}
        sector={modal?.type === "sector" ? modal.data : null}
        persona={modal?.type === "persona" ? modal.data : null}
        painPoint={modal?.type === "pain_point" ? modal.data : null}
      />

      {sector && (
        <div className={compact ? "text-sm text-[#111111]" : "mb-3 pb-3 border-b border-[#111111]/10"}>
          {!compact && <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">SECTOR</p>}
          {compact ? (
            <p>
              <span className="font-medium">Sector:</span>{" "}
              <KnowledgeLink label={sector.name} onClick={() => setModal({ type: "sector", data: sector })} />
            </p>
          ) : (
            <KnowledgeLink label={sector.name} onClick={() => setModal({ type: "sector", data: sector })} />
          )}
          {!compact && sector.description && (
            <p className="text-sm mt-1 text-[#6f6b62] line-clamp-2">{sector.description}</p>
          )}
        </div>
      )}

      {persona && (
        <div className={compact ? "text-sm text-[#111111]" : "mb-3 pb-3 border-b border-[#111111]/10"}>
          {!compact && <p className="text-xs font-semibold text-[#6f6b62] mb-0.5">PERSONA</p>}
          {compact ? (
            <p>
              <span className="font-medium">Persona:</span>{" "}
              <KnowledgeLink
                label={persona.persona_name}
                onClick={() => setModal({ type: "persona", data: persona })}
              />
            </p>
          ) : (
            <KnowledgeLink
              label={`${persona.persona_name}${persona.typical_role ? ` — ${persona.typical_role}` : ""}`}
              onClick={() => setModal({ type: "persona", data: persona })}
            />
          )}
        </div>
      )}

      {relevantPains.length > 0 && (
        <div className={compact ? "text-sm text-[#111111]" : "mb-3 pb-3 border-b border-[#111111]/10"}>
          <p className={`font-semibold text-[#6f6b62] ${compact ? "font-medium text-[#111111] inline" : "text-xs mb-1"}`}>
            {compact ? (
              <span className="font-medium text-[#111111]">Pain points: </span>
            ) : (
              <>RELEVANT PAIN POINTS ({relevantPains.length})</>
            )}
          </p>
          <ul className={`space-y-1 ${compact ? "mt-0.5" : "text-sm"}`}>
            {relevantPains.map((pp) => (
              <li key={pp.id}>
                {compact ? "• " : "• "}
                <KnowledgeLink label={pp.title} onClick={() => setModal({ type: "pain_point", data: pp })} />
                {!compact && pp.plain_english_definition && (
                  <span className="text-[#6f6b62]"> — {pp.plain_english_definition.slice(0, 70)}{pp.plain_english_definition.length > 70 ? "…" : ""}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}