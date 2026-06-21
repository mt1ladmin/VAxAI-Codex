"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, Search, Trash2, X } from "lucide-react";

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

const STATUSES = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "no_reply", label: "No reply" },
  { key: "following_up", label: "Following up" },
  { key: "met", label: "Met" },
  { key: "completed", label: "Completed" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  no_reply: "bg-amber-100 text-amber-700",
  following_up: "bg-yellow-100 text-yellow-800",
  met: "bg-teal-100 text-teal-700",
  completed: "bg-[#063b32]/10 text-[#063b32]",
};

function statusLabel(s: string) {
  return STATUSES.find((x) => x.key === s)?.label ?? s;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries?status=${activeTab}`);
    const json = await res.json() as { data: Enquiry[] };
    setEnquiries(json.data ?? []);
    setSelected(new Set());
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const filtered = enquiries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.details.toLowerCase().includes(q);
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
    fetch_();
  };

  const deleteSingle = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    fetch_();
  };

  const updateStatus = async (id: string, status: string) => {
    setStatusMenuId(null);
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetch_();
  };

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = s.key === "all" ? enquiries.length : enquiries.filter((e) => e.status === s.key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Enquiries</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Contact form submissions — track status and manage each enquiry.</p>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-1 border-b border-[#111111]/10 pb-0">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={`relative -mb-px px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === s.key
                  ? "border-b-2 border-[#063b32] text-[#063b32]"
                  : "text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {s.label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === s.key ? "bg-[#063b32] text-white" : "bg-[#111111]/10 text-[#6f6b62]"
              }`}>
                {counts[s.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries…"
              className="w-full rounded-md border border-[#111111]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6f6b62]">{selected.size} selected</span>
              <button
                onClick={bulkDelete}
                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete selected
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="grid h-8 w-8 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="ml-auto text-sm text-[#6f6b62]">
            {filtered.length} enquir{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-[#111111]/10 bg-white py-16 text-center text-sm text-[#6f6b62]">
            No enquiries yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-[#111111]/10 bg-white">
            {/* Header row */}
            <div className="flex items-center gap-4 border-b border-[#111111]/10 px-4 py-3">
              <button
                onClick={toggleAll}
                className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                  selected.size === filtered.length && filtered.length > 0
                    ? "border-[#063b32] bg-[#063b32]"
                    : "border-[#111111]/25 bg-white"
                }`}
              >
                {selected.size === filtered.length && filtered.length > 0 && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Name / Contact</span>
              <span className="ml-auto text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Status</span>
            </div>

            {filtered.map((e) => (
              <div key={e.id} className="border-b border-[#111111]/8 last:border-0">
                {/* Row */}
                <div className="flex items-start gap-4 px-4 py-4">
                  <button
                    onClick={() => toggleSelect(e.id)}
                    className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                      selected.has(e.id) ? "border-[#063b32] bg-[#063b32]" : "border-[#111111]/25 bg-white"
                    }`}
                  >
                    {selected.has(e.id) && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#111111]">{e.name}</span>
                      <span className="rounded-full bg-[#f5f274]/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#111111]">
                        {e.support_type}
                      </span>
                      {e.wants_discovery_call && (
                        <span className="rounded-full bg-[#063b32] px-2.5 py-0.5 text-[10px] font-semibold text-[#f5f274]">
                          Discovery call
                        </span>
                      )}
                    </div>
                    <a href={`mailto:${e.email}`} className="mt-0.5 block text-sm text-[#063b32] underline">
                      {e.email}
                    </a>
                    {e.telephone && <p className="text-sm text-[#6f6b62]">{e.telephone}</p>}
                    {e.connected_post_title && (
                      <a
                        href={e.connected_post_id ? `/admin/posts/${e.connected_post_id}` : "#"}
                        className="mt-1 flex items-center gap-1 text-xs text-[#063b32] underline"
                      >
                        Re: {e.connected_post_title}
                      </a>
                    )}

                    <button
                      onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                      className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#6f6b62] hover:text-[#111111]"
                    >
                      {expandedId === e.id ? "Hide details" : "View details"}
                      <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === e.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {/* Status menu */}
                    <div className="relative">
                      <button
                        onClick={() => setStatusMenuId(statusMenuId === e.id ? null : e.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[e.status] ?? "bg-[#111111]/10 text-[#6f6b62]"}`}
                      >
                        {statusLabel(e.status)}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {statusMenuId === e.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-[#111111]/10 bg-white shadow-lg">
                          {STATUSES.filter((s) => s.key !== "all").map((s) => (
                            <button
                              key={s.key}
                              onClick={() => updateStatus(e.id, s.key)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f7f4ea]"
                            >
                              <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[s.key]?.split(" ")[0]}`} />
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSingle(e.id)}
                      className="grid h-7 w-7 place-items-center rounded-md text-[#6f6b62] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === e.id && (
                  <div className="border-t border-[#111111]/8 bg-gray-50 px-12 py-4">
                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Contact via</p>
                        <p className="mt-1 text-[#111111]">{e.preferred_contact}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Support type</p>
                        <p className="mt-1 text-[#111111]">{e.support_type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Discovery call</p>
                        <p className="mt-1 text-[#111111]">{e.wants_discovery_call ? "Requested" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Received</p>
                        <p className="mt-1 text-[#111111]">
                          {new Date(e.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Message</p>
                    <p className="mt-2 whitespace-pre-wrap rounded-md bg-white p-4 text-sm leading-6 text-[#6f6b62]">
                      {e.details}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close status menus */}
      {statusMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setStatusMenuId(null)} />
      )}
    </div>
  );
}
