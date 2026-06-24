"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import {
  ADVANCE_STATUS_HINT,
  JOURNEY_STAGES,
  PRE_SALES_SIGNAL_HINT,
  PRE_SALES_STATUS,
  canAdvanceToClientWork,
  canMoveToPreSales,
  type JourneyStageId,
} from "@/lib/engagement/journey";

type Props = {
  currentStage: JourneyStageId;
  /** Finder / enquiry workflow status (legacy inbound records). */
  status?: string;
};

export function JourneyStageBanner({ currentStage, status }: Props) {
  const currentIndex = JOURNEY_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="rounded-xl border border-[#111111]/8 bg-white p-4 shadow-sm space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62]">
        Client journey
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {JOURNEY_STAGES.map((stage, i) => {
          const active = stage.id === currentStage;
          const done = i < currentIndex;
          return (
            <div key={stage.id} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-[#6f6b62]/50" />}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  active
                    ? "bg-[#063b32] text-white"
                    : done
                      ? "bg-[#063b32]/15 text-[#063b32]"
                      : "bg-white border border-[#111111]/15 text-[#6f6b62]"
                }`}
              >
                {done && <CheckCircle className="inline h-3 w-3 mr-1 -mt-0.5" />}
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      {currentStage === "finder" && status && canMoveToPreSales(status) && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {PRE_SALES_SIGNAL_HINT}
        </p>
      )}
      {currentStage === "finder" && status && !canAdvanceToClientWork(status) && !canMoveToPreSales(status) && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Qualify fit and assign an owner. {ADVANCE_STATUS_HINT}
        </p>
      )}
      {currentStage === "finder" && status === PRE_SALES_STATUS && (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Ready to promote — use Move to Prospect Queue when scope and owner are confirmed.
        </p>
      )}
      {currentStage === "finder" && (
        <Link
          href="/admin/engagement/knowledge?tab=sectors"
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-semibold text-[#063b32] hover:underline"
        >
          Open Knowledge Hub for sector guidance →
        </Link>
      )}
    </div>
  );
}