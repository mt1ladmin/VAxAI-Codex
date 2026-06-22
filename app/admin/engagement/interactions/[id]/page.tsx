"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileText,
  Phone,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

type AiStructuredData = {
  call_summary?: string;
  confirmed_pain_points?: string[];
  possible_pain_points?: string[];
  agreed_next_steps?: string[];
  desired_outcomes?: string[];
  follow_up_tasks?: string[];
  possible_vaxai_support?: string[];
  trust_concerns?: string[];
  follow_up_draft?: string | null;
};

type InteractionDetail = {
  id: string;
  interaction_date: string;
  interaction_type: string;
  channel: string;
  direction: string;
  summary: string;
  full_notes: string | null;
  pain_point_ids: string[] | null;
  commitments: string | null;
  outcome: string;
  ai_structured_data: AiStructuredData | null;
  organisation: { id: string; name: string; industry?: string } | null;
  contact: { id: string; first_name: string; last_name: string | null; role?: string } | null;
};

export default function InteractionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ix, setIx] = useState<InteractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/engagement/interactions/${id}`)
      .then(r => r.json())
      .then((j: { data: InteractionDetail }) => setIx(j.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-white" />;
  if (!ix) return (
    <div className="px-8 py-16 text-center">
      <p className="text-sm text-[#6f6b62]">Interaction not found.</p>
    </div>
  );

  const ai = ix.ai_structured_data;
  const callDate = new Date(ix.interaction_date);

  const copyText = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/engagement/live-call?tab=call_records" className="text-[#6f6b62] hover:text-[#111111]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Call Records</p>
            <h1 className="mt-0.5 text-xl font-semibold text-[#111111]">
              {ix.contact ? `${ix.contact.first_name} ${ix.contact.last_name || ""}` : "Unknown contact"}
              {ix.organisation && <span className="text-[#6f6b62] font-normal"> · {ix.organisation.name}</span>}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-3xl">
        {/* Meta row */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[#6f6b62]">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {callDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-4 w-4" />
            {ix.interaction_type} call
          </span>
          {ix.outcome && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {ix.outcome}
            </span>
          )}
        </div>

        <div className="space-y-5">
          {/* Who */}
          <div className="rounded-xl border border-[#111111]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-3">Call details</p>
            <div className="grid grid-cols-2 gap-4">
              {ix.contact && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Contact</p>
                  <p className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-[#111111]">
                    <User className="h-3.5 w-3.5 text-[#063b32]" />
                    {ix.contact.first_name} {ix.contact.last_name || ""}
                    {ix.contact.role && <span className="font-normal text-[#6f6b62]">· {ix.contact.role}</span>}
                  </p>
                </div>
              )}
              {ix.organisation && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62]">Organisation</p>
                  <p className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-[#111111]">
                    <Building2 className="h-3.5 w-3.5 text-[#063b32]" />
                    {ix.organisation.name}
                    {ix.organisation.industry && <span className="font-normal text-[#6f6b62]">· {ix.organisation.industry}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI structured summary */}
          {ai && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-4 w-4 text-violet-600" />
                <p className="text-sm font-semibold text-violet-800">AI-structured summary</p>
              </div>

              {ai.call_summary && (
                <div className="mb-4 rounded-lg bg-white border border-violet-100 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-500 mb-1">Summary</p>
                  <p className="text-sm text-[#111111]">{ai.call_summary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!!ai.confirmed_pain_points?.length && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700 mb-1.5">
                      <Zap className="inline h-3 w-3 mr-1" />Confirmed pain points
                    </p>
                    {ai.confirmed_pain_points.map((p, i) => <p key={i} className="text-xs text-amber-800">· {p}</p>)}
                  </div>
                )}
                {!!ai.agreed_next_steps?.length && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 mb-1.5">
                      <CheckCircle2 className="inline h-3 w-3 mr-1" />Agreed next steps
                    </p>
                    {ai.agreed_next_steps.map((s, i) => <p key={i} className="text-xs text-emerald-800">· {s}</p>)}
                  </div>
                )}
                {!!ai.desired_outcomes?.length && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700 mb-1.5">Desired outcomes</p>
                    {ai.desired_outcomes.map((o, i) => <p key={i} className="text-xs text-blue-800">· {o}</p>)}
                  </div>
                )}
                {!!ai.follow_up_tasks?.length && (
                  <div className="rounded-lg bg-white border border-[#111111]/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6b62] mb-1.5">
                      <FileText className="inline h-3 w-3 mr-1" />Follow-up tasks
                    </p>
                    {ai.follow_up_tasks.map((t, i) => <p key={i} className="text-xs text-[#111111]">· {t}</p>)}
                  </div>
                )}
                {!!ai.possible_vaxai_support?.length && (
                  <div className="rounded-lg bg-[#063b32]/5 border border-[#063b32]/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#063b32] mb-1.5">
                      <Sparkles className="inline h-3 w-3 mr-1" />Possible VAxAI support
                    </p>
                    {ai.possible_vaxai_support.map((s, i) => <p key={i} className="text-xs text-[#063b32]">· {s}</p>)}
                  </div>
                )}
                {!!ai.trust_concerns?.length && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700 mb-1.5">
                      <AlertTriangle className="inline h-3 w-3 mr-1" />Trust / AI concerns
                    </p>
                    {ai.trust_concerns.map((c, i) => <p key={i} className="text-xs text-amber-800">· {c}</p>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Follow-up draft */}
          {ai?.follow_up_draft && (
            <div className="rounded-xl border border-[#063b32]/20 bg-[#063b32]/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[#063b32]">Follow-up draft</p>
                <button
                  onClick={() => copyText(ai.follow_up_draft!)}
                  className="flex items-center gap-1 text-xs text-[#063b32] hover:underline"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-[#111111] font-sans">{ai.follow_up_draft}</pre>
            </div>
          )}

          {/* Raw notes */}
          {ix.full_notes && (
            <details className="rounded-xl border border-[#111111]/10">
              <summary className="cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] hover:text-[#111111]">
                Raw call notes
              </summary>
              <div className="px-5 pb-5 pt-2">
                <pre className="whitespace-pre-wrap text-xs text-[#6f6b62] font-sans">{ix.full_notes}</pre>
              </div>
            </details>
          )}

          {/* Pain points */}
          {!!ix.pain_point_ids?.length && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62] mb-3">
                Pain points identified ({ix.pain_point_ids.length})
              </p>
              {ix.organisation && (
                <p className="text-xs text-[#6f6b62] mt-1">
                  Organisation: {ix.organisation.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
