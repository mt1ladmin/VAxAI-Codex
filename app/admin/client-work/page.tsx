"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CheckSquare,
  ChevronRight,
  Mail,
  Phone,
  PoundSterling,
  Search,
  Users,
} from "lucide-react";
import { STAGE_COLORS } from "@/lib/engagement/types";

type ClientOpportunity = {
  id: string;
  title: string;
  stage: string;
  indicative_value_low: number | null;
  indicative_value_high: number | null;
};

type Client = {
  id: string;
  first_name: string;
  last_name: string | null;
  role: string | null;
  professional_email: string | null;
  phone: string | null;
  updated_at: string;
  organisation: { id: string; name: string; industry: string | null } | null;
  client_opportunities: ClientOpportunity[];
  primary_stage: string;
  primary_service: string | null;
};

type ValueMetric = { low: number; high: number; display: string | null };

type Metrics = {
  total: number;
  totalTasks: number;
  overdueTasks: number;
  pipelineValueAll: ValueMetric;
  pipelineValueActive: ValueMetric;
};

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
      <div className="mt-0.5 text-sm text-[#111111]">{children}</div>
    </div>
  );
}

const STAGE_FILTERS = [
  { value: "", label: "All clients" },
  { value: "Won", label: "Won" },
  { value: "Onboarding planned", label: "Onboarding planned" },
  { value: "Invoices sent", label: "Invoices sent" },
  { value: "Onboarding in progress", label: "Onboarding" },
  { value: "Active client", label: "Active clients" },
];

function formatValue(low: number | null, high: number | null) {
  if (!low && !high) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
  if (low && high && low !== high) return `${fmt(low)} – ${fmt(high)}`;
  if (low) return fmt(low);
  if (high) return fmt(high);
  return null;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    totalTasks: 0,
    overdueTasks: 0,
    pipelineValueAll: { low: 0, high: 0, display: null },
    pipelineValueActive: { low: 0, high: 0, display: null },
  });
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stageFilter) params.set("stage", stageFilter);
    const res = await fetch(`/api/admin/client-work?${params.toString()}`);
    const json = (await res.json()) as { data: Client[]; metrics: Metrics };
    setClients(json.data || []);
    setMetrics(
      json.metrics || {
        total: 0,
        totalTasks: 0,
        overdueTasks: 0,
        pipelineValueAll: { low: 0, high: 0, display: null },
        pipelineValueActive: { low: 0, high: 0, display: null },
      },
    );
    setLoading(false);
  }, [stageFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${c.first_name} ${c.last_name ?? ""}`.toLowerCase();
    return (
      name.includes(q) ||
      c.professional_email?.toLowerCase().includes(q) ||
      c.organisation?.name.toLowerCase().includes(q) ||
      c.primary_service?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Client Work</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Converted prospects and active clients — services, tasks, and full engagement history.</p>
      </div>

      {/* Metrics */}
      <div className="border-b border-[#111111]/10 px-8 py-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#063b32]/10">
              <Users className="h-4 w-4 text-[#063b32]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#111111]">{metrics.total}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Total clients</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-50">
              <CheckSquare className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#111111]">{metrics.totalTasks}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Open tasks</p>
            </div>
          </div>
          {metrics.overdueTasks > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{metrics.overdueTasks}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Overdue tasks</p>
              </div>
            </div>
          )}
          {metrics.pipelineValueAll.display && (
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#063b32]/10">
                <PoundSterling className="h-4 w-4 text-[#063b32]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#111111]">{metrics.pipelineValueAll.display}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Pipeline value (all)</p>
              </div>
            </div>
          )}
          {metrics.pipelineValueActive.display && (
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50">
                <PoundSterling className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#111111]">{metrics.pipelineValueActive.display}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Pipeline value (active)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, org…"
              className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <div className="flex overflow-hidden rounded-xl border border-[#111111]/15">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStageFilter(f.value)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  stageFilter === f.value
                    ? "bg-[#063b32] text-white"
                    : "bg-white text-[#6f6b62] hover:bg-[#f7f4ea]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="ml-auto text-sm text-[#6f6b62]">
            {filtered.length} client{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-[#f7f4ea] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea] py-16 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-[#6f6b62]/30" />
            <p className="text-sm font-semibold text-[#111111]">No client work records yet</p>
            <p className="mt-1 text-xs text-[#6f6b62]">
              Advance opportunities from Prospect Queue when agreement to proceed is confirmed.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => {
              const fullName = `${c.first_name}${c.last_name ? ` ${c.last_name}` : ""}`;
              const initials = `${c.first_name[0] ?? ""}${c.last_name?.[0] ?? ""}`.toUpperCase();
              const stageColor = STAGE_COLORS[c.primary_stage] ?? "bg-gray-100 text-gray-600";
              const value = c.client_opportunities[0]
                ? formatValue(
                    c.client_opportunities[0].indicative_value_low,
                    c.client_opportunities[0].indicative_value_high
                  )
                : null;

              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/client-work/${c.id}`)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") router.push(`/admin/client-work/${c.id}`);
                  }}
                  className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#063b32] text-sm font-bold text-[#f5f274]">
                    {initials || <Briefcase className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <LabeledField label="Name">
                          <span className="font-semibold">{fullName}</span>
                        </LabeledField>
                        <LabeledField label="Organisation">
                          {c.organisation ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-[#6f6b62]" />
                              {c.organisation.name}
                            </span>
                          ) : (
                            <span className="text-[#6f6b62]">—</span>
                          )}
                        </LabeledField>
                        {c.professional_email && (
                          <LabeledField label="Email">
                            <a
                              href={`mailto:${c.professional_email}`}
                              onClick={(ev) => ev.stopPropagation()}
                              className="flex items-center gap-1 text-[#063b32] hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {c.professional_email}
                            </a>
                          </LabeledField>
                        )}
                        {c.phone && (
                          <LabeledField label="Phone">
                            <a
                              href={`tel:${c.phone}`}
                              onClick={(ev) => ev.stopPropagation()}
                              className="flex items-center gap-1 text-[#063b32] hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {c.phone}
                            </a>
                          </LabeledField>
                        )}
                        {c.role && (
                          <LabeledField label="Role">{c.role}</LabeledField>
                        )}
                        {c.primary_service && (
                          <LabeledField label="Service">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-[#6f6b62]" />
                              {c.primary_service}
                            </span>
                          </LabeledField>
                        )}
                        {value && (
                          <LabeledField label="Value">
                            <span className="font-semibold text-[#063b32]">{value}</span>
                          </LabeledField>
                        )}
                        {c.client_opportunities.length > 1 && (
                          <LabeledField label="Services">
                            <span className="text-[#6f6b62]">{c.client_opportunities.length} service records</span>
                          </LabeledField>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stageColor}`}>
                          {c.primary_stage}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#6f6b62]/40 group-hover:text-[#063b32] transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
