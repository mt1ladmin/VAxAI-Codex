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
  status?: string;
  hint?: string;
};

export function JourneyStageBanner({ currentStage, status, hint }: Props) {
  const currentIndex = JOURNEY_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/50 p-4 space-y-3">
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
      <p className="text-sm text-[#6f6b62]">
        {JOURNEY_STAGES[currentIndex]?.description}
        {hint ? ` ${hint}` : ""}
      </p>
      {currentStage === "queue" && status && canMoveToPreSales(status) && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {PRE_SALES_SIGNAL_HINT}
        </p>
      )}
      {currentStage === "queue" && status && !canAdvanceToClientWork(status) && !canMoveToPreSales(status) && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Make contact and record progress. {ADVANCE_STATUS_HINT}
        </p>
      )}
      {currentStage === "pre_sales" && (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Pre-sales pipeline is active (status: {PRE_SALES_STATUS}). Track discovery and proposals on the Opportunities tab, then advance to client work once there is agreement to proceed.
        </p>
      )}
      {currentStage === "outreach" && (
        <Link
          href="/admin/engagement/knowledge?tab=sectors"
          className="inline-flex text-xs font-semibold text-[#063b32] hover:underline"
        >
          Open Knowledge Hub for sector guidance →
        </Link>
      )}
    </div>
  );
}