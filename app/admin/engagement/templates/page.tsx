"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Search } from "lucide-react";
import { type EngagementScript, type Objection } from "@/lib/engagement/types";

type Tab = "scripts" | "objections";

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-purple-50 text-purple-700",
  linkedin: "bg-sky-50 text-sky-700",
  phone: "bg-blue-50 text-blue-700",
  "in-person": "bg-amber-50 text-amber-700",
  general: "bg-gray-100 text-gray-600",
};

function copyToClipboard(text: string, setCopied: (id: string) => void, id: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  });
}

export default function TemplatesPage() {
  const [tab, setTab] = useState<Tab>("scripts");
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [category, setCategory] = useState("");
  const [scripts, setScripts] = useState<EngagementScript[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "scripts") {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (channel) params.set("channel", channel);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/engagement/scripts?${params}`);
      const json = await res.json() as { data: EngagementScript[] };
      setScripts(json.data || []);
    } else {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/engagement/objections?${params}`);
      const json = await res.json() as { data: Objection[] };
      setObjections(json.data || []);
    }
    setLoading(false);
  }, [tab, search, channel, category]);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => { inputRef.current?.focus(); }, [tab]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Templates</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Approved outreach scripts, message blocks and objection responses.</p>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#111111]/10 mb-6">
          {([["scripts", "Scripts & blocks"], ["objections", "Objections"]] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearch(""); setChannel(""); setCategory(""); }}
              className={`-mb-px px-5 py-2.5 text-sm font-semibold transition-colors ${
                tab === key ? "border-b-2 border-[#063b32] text-[#063b32]" : "text-[#6f6b62] hover:text-[#111111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "scripts" ? "Search scripts…" : "Search objections…"}
              className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          {tab === "scripts" && (
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
              <option value="">All channels</option>
              {["email", "linkedin", "phone", "in-person", "general"].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          )}
          {tab === "objections" && (
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
              <option value="">All categories</option>
              {["Cost", "Trust", "Relevance", "Timing", "AI concerns", "Process", "General"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : (
          <>
            {/* SCRIPTS */}
            {tab === "scripts" && (
              scripts.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No scripts found.</div>
              ) : (
                <div className="space-y-3">
                  {scripts.map((s) => (
                    <div key={s.id} className="rounded-xl border border-[#111111]/10 bg-white p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-[#111111]">{s.title}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${CHANNEL_COLORS[s.channel] || "bg-gray-100 text-gray-600"}`}>
                              {s.channel}
                            </span>
                            {s.block_type && (
                              <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                                {s.block_type}
                              </span>
                            )}
                            {s.tone && (
                              <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                                {s.tone}
                              </span>
                            )}
                            {s.audience_type && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                {s.audience_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(s.content, setCopied, s.id)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                            copied === s.id
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32] hover:text-[#063b32]"
                          }`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copied === s.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="rounded-lg bg-[#f7f4ea] px-4 py-3">
                        <p className="text-sm text-[#111111] whitespace-pre-wrap">{s.content}</p>
                      </div>
                      {s.last_reviewed && (
                        <p className="mt-2 text-[10px] text-[#6f6b62]">
                          Reviewed {new Date(s.last_reviewed).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                          {s.content_owner ? ` by ${s.content_owner}` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* OBJECTIONS */}
            {tab === "objections" && (
              objections.length === 0 ? (
                <div className="rounded-xl border border-[#111111]/10 py-12 text-center text-sm text-[#6f6b62]">No objections found.</div>
              ) : (
                <div className="space-y-3">
                  {objections.map((o) => (
                    <div key={o.id} className="rounded-xl border border-[#111111]/10 bg-white p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {o.category && (
                              <span className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-[10px] font-semibold text-[#6f6b62]">{o.category}</span>
                            )}
                            {o.tone && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">{o.tone}</span>
                            )}
                          </div>
                          <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700 mb-1">Objection</p>
                            <p className="text-sm text-[#111111] italic">&ldquo;{o.objection}&rdquo;</p>
                          </div>
                          <div className="rounded-lg bg-[#063b32]/5 border border-[#063b32]/15 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#063b32] mb-1">Response</p>
                            <p className="text-sm text-[#111111]">{o.response}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(o.response, setCopied, o.id)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                            copied === o.id
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32] hover:text-[#063b32]"
                          }`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copied === o.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
