"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { RecordBackNav } from "@/components/admin/RecordBackNav";
import type { PainPoint, VatPrompt } from "@/lib/engagement/types";

type PainPointDetail = Omit<PainPoint, "synonyms"> & {
  vat_prompts?: VatPrompt[];
  synonyms?: { id: string; phrase: string }[];
};

export default function PainPointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pp, setPp] = useState<PainPointDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/engagement/pain-points/${id}`);
    const json = await res.json() as { data: PainPointDetail };
    setPp(json.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const vatByDimension = (dim: "value" | "alignment" | "trust") =>
    (pp?.vat_prompts || []).filter((v) => v.dimension === dim);

  const dimLabel = { value: "Value", trust: "Trust", alignment: "Alignment" };
  const dimColor = {
    value: "bg-acid/50 border-acid/60 text-ink",
    alignment: "bg-pine-100 border-pine-200 text-pine-800",
    trust: "bg-pine-50 border-pine-900/15 text-pine-900",
  };

  if (loading) return <div className="p-8 text-sm text-[#5F686A]">Loading…</div>;
  if (!pp) return <div className="p-8 text-sm text-[#5F686A]">Pain point not found.</div>;

  const Section = ({
    title, icon, id: sid, children,
  }: { title: string; icon: React.ReactNode; id: string; children: React.ReactNode }) => {
    const open = expandedSection === sid;
    return (
      <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
        <button
          onClick={() => setExpandedSection(open ? null : sid)}
          className="flex w-full items-center justify-between px-5 py-4 bg-white hover:bg-pine-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-[#122428]">{icon}</span>
            <span className="font-semibold text-[#111111] text-sm">{title}</span>
          </div>
          {open ? <ChevronDown className="h-4 w-4 text-[#5F686A]" /> : <ChevronRight className="h-4 w-4 text-[#5F686A]" />}
        </button>
        {open && <div className="border-t border-[#111111]/10 bg-white px-5 py-4">{children}</div>}
      </div>
    );
  };

  const List = ({ items }: { items: string[] | null | undefined }) => (
    <ul className="space-y-1.5">
      {(items || []).map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[#5F686A]">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#122428]" />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-white">
      <RecordBackNav
        href="/admin/engagement/pain-points"
        backLabel="Pain points"
        title={pp.title}
      />
      <div className="border-b border-[#111111]/8 bg-white px-8 pb-5 pt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#122428]">
          {pp.category}
        </span>
        {pp.plain_english_definition ? (
          <p className="mt-1.5 max-w-2xl text-sm text-[#5F686A]">{pp.plain_english_definition}</p>
        ) : null}
      </div>

      <div className="px-8 py-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-[#D8FC2E] bg-[#D8FC2E]/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111] mb-3">
              Key prompts
            </p>
            {pp.natural_questions?.slice(0, 1).map((q, i) => (
              <div key={i} className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5F686A] mb-1">
                  Natural next question
                </p>
                <p className="text-sm font-semibold text-[#111111]">&ldquo;{q}&rdquo;</p>
              </div>
            ))}
            {vatByDimension("value")[0] && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5F686A] mb-1">
                  VTA — Value
                </p>
                <p className="text-sm text-[#111111]">{vatByDimension("value")[0].prompt}</p>
              </div>
            )}
            {pp.risk_sensitivity && (
              <div className="flex items-start gap-2 mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700">{pp.risk_sensitivity}</p>
              </div>
            )}
          </div>

          {/* Possible pathways */}
          {pp.recommendation_pathways && pp.recommendation_pathways.length > 0 && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111] mb-3">
                Possible pathways
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pp.recommendation_pathways.map((path, i) => (
                  <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5F686A]">
                    {path}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Relevant sectors */}
          {pp.relevant_sectors && pp.relevant_sectors.length > 0 && (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111] mb-2">
                Common in
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pp.relevant_sectors.map((s, i) => (
                  <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          {pp.last_reviewed && (
            <p className="text-xs text-[#5F686A]">
              Last reviewed: {new Date(pp.last_reviewed).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {pp.content_owner && ` · ${pp.content_owner}`}
            </p>
          )}
        </div>

        {/* Right: full playbook */}
        <div className="lg:col-span-2 space-y-3">
          {/* What a person may say */}
          {pp.what_person_says?.length ? (
            <Section title="What a person may say" icon={<MessageSquare className="h-4 w-4" />} id="says">
              <div className="flex flex-wrap gap-2">
                {pp.what_person_says.map((s, i) => (
                  <span key={i} className="rounded-full border border-[#122428]/20 bg-[#122428]/5 px-3 py-1.5 text-sm text-[#122428]">
                    &ldquo;{s}&rdquo;
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {/* What this could mean */}
          {pp.what_this_means?.length ? (
            <Section title="What this could mean" icon={<Lightbulb className="h-4 w-4" />} id="means">
              <List items={pp.what_this_means} />
            </Section>
          ) : null}

          {/* What not to assume */}
          {pp.what_not_assume?.length ? (
            <Section title="What not to assume" icon={<Shield className="h-4 w-4" />} id="assume">
              <List items={pp.what_not_assume} />
            </Section>
          ) : null}

          {/* Common root causes */}
          {pp.common_root_causes?.length ? (
            <Section title="Common root causes" icon={<Target className="h-4 w-4" />} id="causes">
              <List items={pp.common_root_causes} />
            </Section>
          ) : null}

          {/* Natural discovery questions */}
          {pp.natural_questions?.length ? (
            <Section title="Natural discovery questions" icon={<MessageSquare className="h-4 w-4" />} id="questions">
              <div className="space-y-2">
                {pp.natural_questions.map((q, i) => (
                  <div key={i} className="rounded-lg bg-white px-4 py-3">
                    <p className="text-sm text-[#111111]">&ldquo;{q}&rdquo;</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {/* Quick improvements */}
          {pp.quick_improvements?.length ? (
            <Section title="Quick process improvements" icon={<Zap className="h-4 w-4" />} id="quick">
              <List items={pp.quick_improvements} />
            </Section>
          ) : null}

          {/* Existing tool opportunities */}
          {pp.existing_tool_opps?.length ? (
            <Section title="Existing tool opportunities" icon={<CheckCircle2 className="h-4 w-4" />} id="tools">
              <List items={pp.existing_tool_opps} />
            </Section>
          ) : null}

          {/* Human VA responsibilities */}
          {pp.human_va_responsibilities?.length ? (
            <Section title="Human VA responsibilities" icon={<Users className="h-4 w-4" />} id="va">
              <List items={pp.human_va_responsibilities} />
              {pp.tasks_remain_human?.length ? (
                <>
                  <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">
                    Should remain human-led
                  </p>
                  <List items={pp.tasks_remain_human} />
                </>
              ) : null}
            </Section>
          ) : null}

          {/* Possible AI */}
          {pp.possible_ai?.length ? (
            <Section title="Possible AI assistance" icon={<Lightbulb className="h-4 w-4" />} id="ai">
              <List items={pp.possible_ai} />
            </Section>
          ) : null}

          {/* VTA prompts */}
          {(["value", "trust", "alignment"] as const).some((d) => vatByDimension(d).length > 0) && (
            <Section title="VTA prompts — Value, Trust and Alignment" icon={<Target className="h-4 w-4" />} id="vat">
              <div className="space-y-4">
                {(["value", "trust", "alignment"] as const).map((dim) => {
                  const prompts = vatByDimension(dim);
                  if (!prompts.length) return null;
                  return (
                    <div key={dim}>
                      <div className={`mb-2 inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold ${dimColor[dim]}`}>
                        {dimLabel[dim]}
                      </div>
                      <div className="space-y-1.5">
                        {prompts.map((v) => (
                          <p key={v.id} className="text-sm text-[#5F686A]">· {v.prompt}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Measures of improvement */}
          {pp.measures_improvement?.length ? (
            <Section title="Measures of improvement" icon={<CheckCircle2 className="h-4 w-4" />} id="measures">
              <List items={pp.measures_improvement} />
            </Section>
          ) : null}

          {/* Explanation to prospect */}
          {pp.explanation_to_prospect && (
            <Section title="Suggested explanation to prospect" icon={<MessageSquare className="h-4 w-4" />} id="explain">
              <div className="rounded-lg border border-[#122428]/20 bg-[#122428]/5 p-4">
                <p className="text-sm text-[#122428] italic">&ldquo;{pp.explanation_to_prospect}&rdquo;</p>
              </div>
            </Section>
          )}

          {/* Related pain points */}
          {pp.related_pain_point_ids?.length ? (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111] mb-3">
                Related pain points
              </p>
              <div className="flex flex-wrap gap-2">
                {pp.related_pain_point_ids.map((rid) => (
                  <Link
                    key={rid}
                    href={`/admin/engagement/pain-points/${rid}`}
                    className="flex items-center gap-1 rounded-full border border-[#111111]/10 px-3 py-1.5 text-sm text-[#111111] hover:border-[#122428]/30 hover:bg-pine-50"
                  >
                    <Zap className="h-3 w-3 text-amber-500" />
                    Related
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Synonyms */}
          {(pp as PainPointDetail).synonyms?.length ? (
            <div className="rounded-xl border border-[#111111]/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111] mb-2">
                <BookOpen className="inline h-3.5 w-3.5 mr-1" />
                Also searched as
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(pp as PainPointDetail).synonyms?.map((s) => (
                  <span key={s.id} className="rounded-full bg-white px-2.5 py-1 text-xs text-[#5F686A]">
                    {s.phrase}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>


    </div>
  );
}
