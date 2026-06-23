"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { CreateOpportunityModal } from "@/components/admin/CreateOpportunityModal";
import type { EngagementOpportunity } from "@/lib/engagement/types";

type SourceTab = "enquiry" | "queue";
type LinkResult = { id: string; label: string; sublabel: string; source: SourceTab };

function NewOpportunityLinker() {
  const router = useRouter();
  const [sourceTab, setSourceTab] = useState<SourceTab>("enquiry");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<LinkResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<LinkResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [defaults, setDefaults] = useState<{
    title?: string;
    enquiry_id?: string | null;
    queue_id?: string | null;
    organisation_id?: string | null;
    primary_contact_id?: string | null;
  }>({});

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const q = search.trim().toLowerCase();
    const t = setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          if (sourceTab === "enquiry") {
            const res = await fetch("/api/admin/enquiries");
            const j = await res.json() as { data?: Array<{ id: string; name: string; email: string; support_type: string }> };
            setResults(
              (j.data || [])
                .filter((e) =>
                  e.name.toLowerCase().includes(q) ||
                  e.email.toLowerCase().includes(q) ||
                  e.support_type.toLowerCase().includes(q),
                )
                .slice(0, 8)
                .map((e) => ({
                  id: e.id,
                  label: e.name,
                  sublabel: `${e.email} · ${e.support_type}`,
                  source: "enquiry" as const,
                })),
            );
          } else {
            const res = await fetch("/api/admin/engagement/prospect-queue?limit=200");
            const j = await res.json() as { data?: Array<{
              id: string;
              raw_org_name: string | null;
              raw_contact_name: string | null;
              raw_email: string | null;
              organisation?: { name: string } | null;
            }> };
            setResults(
              (j.data || [])
                .filter((e) => {
                  const org = (e.organisation?.name || e.raw_org_name || "").toLowerCase();
                  const contact = (e.raw_contact_name || "").toLowerCase();
                  const email = (e.raw_email || "").toLowerCase();
                  return org.includes(q) || contact.includes(q) || email.includes(q);
                })
                .slice(0, 8)
                .map((e) => ({
                  id: e.id,
                  label: e.organisation?.name || e.raw_org_name || "Unknown org",
                  sublabel: [e.raw_contact_name, e.raw_email].filter(Boolean).join(" · ") || "Prospect queue",
                  source: "queue" as const,
                })),
            );
          }
        } finally {
          setSearching(false);
        }
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [search, sourceTab]);

  const openModalFor = async (result: LinkResult) => {
    setSelected(result);
    if (result.source === "enquiry") {
      const res = await fetch(`/api/admin/enquiries/${result.id}`);
      const j = await res.json() as { data?: { name: string; support_type: string; contact_id: string | null; organisation_id: string | null } };
      const e = j.data;
      setDefaults({
        title: e ? `${e.name} — ${e.support_type}`.slice(0, 120) : result.label,
        enquiry_id: result.id,
        organisation_id: e?.organisation_id ?? null,
        primary_contact_id: e?.contact_id ?? null,
      });
    } else {
      const res = await fetch(`/api/admin/engagement/prospect-queue/${result.id}`);
      const j = await res.json() as { data?: { organisation_id: string | null; contact_id: string | null; raw_org_name: string | null; organisation?: { name: string } | null } };
      const q = j.data;
      const org = q?.organisation?.name || q?.raw_org_name || result.label;
      setDefaults({
        title: `${org} — opportunity`.slice(0, 120),
        queue_id: result.id,
        organisation_id: q?.organisation_id ?? null,
        primary_contact_id: q?.contact_id ?? null,
      });
    }
    setShowModal(true);
  };

  const onCreated = (opp: EngagementOpportunity) => {
    router.push(`/admin/engagement/pipeline/opportunities/${opp.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="rounded-2xl border border-[#111111]/10 bg-white p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#111111]">Link to a record</h2>
          <p className="mt-1 text-sm text-[#6f6b62]">
            Every opportunity must be connected to a website enquiry or prospect queue item.
          </p>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-[#111111]/15">
          {([
            ["enquiry", "Website enquiries", MessageSquare],
            ["queue", "Prospect queue", Inbox],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setSourceTab(key); setResults([]); setSearch(""); }}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                sourceTab === key ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={sourceTab === "enquiry" ? "Search enquiries by name or email…" : "Search prospect queue by org or contact…"}
            className="w-full rounded-xl border border-[#111111]/15 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
          />
        </div>

        {searching && (
          <p className="flex items-center gap-1.5 text-xs text-[#6f6b62]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
          </p>
        )}

        {results.length > 0 && (
          <div className="rounded-lg border border-[#111111]/10 overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => void openModalFor(r)}
                className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-[#f7f4ea] border-b border-[#111111]/5 last:border-0"
              >
                <span className="text-sm font-semibold text-[#111111]">{r.label}</span>
                <span className="text-xs text-[#6f6b62]">{r.sublabel}</span>
              </button>
            ))}
          </div>
        )}

        {search.trim() && !searching && results.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
            <p className="text-sm font-semibold text-amber-900">No matching records found</p>
            <p className="text-xs text-amber-800">
              Create a {sourceTab === "enquiry" ? "website enquiry" : "prospect queue item"} first, then return here to link your opportunity.
            </p>
            <div className="flex flex-wrap gap-2">
              {sourceTab === "enquiry" ? (
                <Link
                  href="/admin/enquiries"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                >
                  <Plus className="h-3.5 w-3.5" /> Go to website enquiries
                </Link>
              ) : (
                <Link
                  href="/admin/engagement/prospect-queue"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42]"
                >
                  <Plus className="h-3.5 w-3.5" /> Go to prospect queue
                </Link>
              )}
            </div>
          </div>
        )}

        {!search.trim() && (
          <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/40 p-5">
            <p className="text-xs text-[#6f6b62]">
              Don&apos;t have a record yet?{" "}
              <Link href="/admin/enquiries" className="font-semibold text-[#063b32] hover:underline">Add an enquiry</Link>
              {" or "}
              <Link href="/admin/engagement/prospect-queue" className="font-semibold text-[#063b32] hover:underline">add to prospect queue</Link>
              , then search above to connect.
            </p>
          </div>
        )}
      </div>

      <CreateOpportunityModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={onCreated}
        contextLabel={selected ? `${selected.source === "enquiry" ? "Website enquiry" : "Prospect queue"} — ${selected.label}` : undefined}
        defaults={defaults}
        pipelineOnly
      />
    </div>
  );
}

export default function NewOpportunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <Link href="/admin/engagement/pipeline?tab=opportunities" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#6f6b62] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Opportunities tracker
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">New opportunity</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">Connect to an enquiry or prospect queue record before creating the opportunity.</p>
      </div>
      <Suspense fallback={<div className="p-8 text-sm text-[#6f6b62]">Loading…</div>}>
        <NewOpportunityLinker />
      </Suspense>
    </div>
  );
}