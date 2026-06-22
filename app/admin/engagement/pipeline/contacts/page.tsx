"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Search, User } from "lucide-react";
import { type EngagementContact } from "@/lib/engagement/types";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<EngagementContact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("limit", "100");
    const res = await fetch(`/api/admin/engagement/contacts?${params}`);
    const json = await res.json() as { data: EngagementContact[] };
    setContacts(json.data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Pipeline</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111111]">Contacts</h1>
          <Link
            href="/admin/engagement/pipeline/contacts/new"
            className="flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            <Plus className="h-4 w-4" /> New contact
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts…"
            className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#063b32]"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : contacts.length === 0 ? (
          <div className="rounded-xl border border-[#111111]/10 py-16 text-center">
            <User className="mx-auto h-8 w-8 text-[#6f6b62]/40 mb-3" />
            <p className="text-sm font-semibold text-[#111111]">No contacts found</p>
            <Link
              href="/admin/engagement/pipeline/contacts/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              <Plus className="h-4 w-4" /> Add contact
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-[#6f6b62]">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_200px_200px_120px_40px] bg-[#f7f4ea] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                <span>Contact</span>
                <span>Organisation</span>
                <span>Email</span>
                <span>Status</span>
                <span />
              </div>
              <div className="divide-y divide-[#111111]/5">
                {contacts.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/engagement/pipeline/contacts/${c.id}`}
                    className="grid grid-cols-[1fr_200px_200px_120px_40px] items-center px-5 py-3.5 hover:bg-[#f7f4ea] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#111111] group-hover:text-[#063b32] transition-colors">
                        {c.first_name} {c.last_name}
                      </p>
                      {c.role && <p className="text-xs text-[#6f6b62]">{c.role}</p>}
                    </div>
                    <span className="text-sm text-[#111111]">{c.organisation?.name ?? "—"}</span>
                    <span className="text-sm text-[#6f6b62] truncate">{c.professional_email ?? "—"}</span>
                    <span>
                      {c.is_suppressed ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">Suppressed</span>
                      ) : c.do_not_contact ? (
                        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-600">DNC</span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">Active</span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#6f6b62] group-hover:text-[#063b32] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
