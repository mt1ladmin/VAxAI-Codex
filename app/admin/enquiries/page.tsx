"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Check, ChevronDown, ChevronRight, MessageSquare, Search, Trash2, X } from "lucide-react";
import {
  ENQUIRY_STATUS_COLORS,
  ENQUIRY_STATUS_OPTIONS,
  enquiryStatusLabel,
} from "@/lib/enquiries/constants";
import { PROSPECT_QUEUE_STATUSES } from "@/lib/engagement/types";

type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  support_type: string;
  preferred_contact: string;
  telephone: string | null;
  details: string;
  wants_discovery_call: boolean;
  status: string;
  connected_post_id: string | null;
  connected_post_title: string | null;
};

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{label}</p>
      <div className="mt-0.5 text-sm text-[#111111]">{children}</div>
    </div>
  );
}

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries?status=${statusFilter}`);
    const json = await res.json() as { data: Enquiry[] };
    setEnquiries(json.data ?? []);
    setSelected(new Set());
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { void fetch_(); }, [fetch_]);

  const filtered = enquiries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.details.toLowerCase().includes(q);
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((e) => e.id)));
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} enquir${selected.size === 1 ? "y" : "ies"}?`)) return;
    await fetch("/api/admin/enquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    void fetch_();
  };

  const deleteSingle = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    void fetch_();
  };

  const updateStatus = async (id: string, status: string) => {
    setStatusMenuId(null);
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void fetch_();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Website Enquiries</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Contact form submissions — track status and manage each enquiry.</p>
      </div>

      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#111111]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] outline-none focus:border-[#063b32]"
          >
            <option value="all">All statuses</option>
            {PROSPECT_QUEUE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries…"
              className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6f6b62]">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => void bulkDelete()}
                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="grid h-8 w-8 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="ml-auto text-sm text-[#6f6b62]">
            {filtered.length} enquir{filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[#f7f4ea] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea] py-16 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#6f6b62]/30" />
            <p className="text-sm font-semibold text-[#111111]">No enquiries yet</p>
            <p className="mt-1 text-xs text-[#6f6b62]">Submissions from the website contact form will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-4 px-1 py-1">
              <button
                type="button"
                onClick={toggleAll}
                className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                  selected.size === filtered.length && filtered.length > 0
                    ? "border-[#063b32] bg-[#063b32]"
                    : "border-[#111111]/25 bg-white"
                }`}
              >
                {selected.size === filtered.length && filtered.length > 0 && <Check className="h-3 w-3 text-white" />}
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Select all</span>
            </div>

            {filtered.map((e) => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/enquiries/${e.id}`)}
                onKeyDown={(ev) => { if (ev.key === "Enter") router.push(`/admin/enquiries/${e.id}`); }}
                className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/50 transition-colors group"
              >
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); toggleSelect(e.id); }}
                  className={`mt-3 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                    selected.has(e.id) ? "border-[#063b32] bg-[#063b32]" : "border-[#111111]/25 bg-white"
                  }`}
                >
                  {selected.has(e.id) && <Check className="h-3 w-3 text-white" />}
                </button>

                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#063b32]/10">
                  <MessageSquare className="h-4 w-4 text-[#063b32]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <LabeledField label="Name">
                        <span className="font-semibold">{e.name}</span>
                      </LabeledField>
                      <LabeledField label="Email">
                        <a
                          href={`mailto:${e.email}`}
                          onClick={(ev) => ev.stopPropagation()}
                          className="text-[#063b32] hover:underline"
                        >
                          {e.email}
                        </a>
                      </LabeledField>
                      <LabeledField label="Telephone">{e.telephone || "—"}</LabeledField>
                      <LabeledField label="Query type">
                        <span className="rounded-full bg-[#f5f274]/80 px-2 py-0.5 text-xs font-semibold text-[#111111] inline-block">
                          {e.support_type}
                        </span>
                      </LabeledField>
                      <LabeledField label="Discovery call">
                        {e.wants_discovery_call ? (
                          <span className="rounded-full bg-[#063b32] px-2 py-0.5 text-xs font-semibold text-[#f5f274] inline-block">Yes — requested</span>
                        ) : (
                          <span className="text-[#6f6b62]">No</span>
                        )}
                      </LabeledField>
                      <LabeledField label="Preferred contact">{e.preferred_contact || "—"}</LabeledField>
                      <LabeledField label="Received">
                        <span className="flex items-center gap-1 text-[#6f6b62]">
                          <Calendar className="h-3 w-3" />
                          {new Date(e.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </LabeledField>
                      {e.connected_post_title && (
                        <LabeledField label="Related post">
                          {e.connected_post_id ? (
                            <Link
                              href={`/admin/posts/${e.connected_post_id}`}
                              onClick={(ev) => ev.stopPropagation()}
                              className="text-[#063b32] hover:underline"
                            >
                              {e.connected_post_title}
                            </Link>
                          ) : (
                            e.connected_post_title
                          )}
                        </LabeledField>
                      )}
                      <div className="sm:col-span-2 lg:col-span-4">
                        <LabeledField label="Description">
                          <p className="whitespace-pre-wrap text-[#6f6b62] leading-relaxed">{e.details || "—"}</p>
                        </LabeledField>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2" onClick={(ev) => ev.stopPropagation()}>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setStatusMenuId(statusMenuId === e.id ? null : e.id)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ENQUIRY_STATUS_COLORS[e.status] ?? "bg-[#111111]/10 text-[#6f6b62]"}`}
                        >
                          {enquiryStatusLabel(e.status)}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {statusMenuId === e.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-[#111111]/10 bg-white shadow-lg">
                            {ENQUIRY_STATUS_OPTIONS.map((s) => (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => void updateStatus(e.id, s.key)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea]"
                              >
                                <span className={`h-2 w-2 rounded-full ${ENQUIRY_STATUS_COLORS[s.key]?.split(" ")[0]}`} />
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteSingle(e.id)}
                        className="rounded-md border border-[#111111]/15 p-2 text-[#6f6b62] hover:border-red-200 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-[#6f6b62]/40 group-hover:text-[#063b32] transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {statusMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setStatusMenuId(null)} />
      )}
    </div>
  );
}