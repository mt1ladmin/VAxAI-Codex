"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Search } from "lucide-react";

type Subscriber = {
  email: string;
  name: string | null;
  source: string;
  subscribed_at: string;
};

const SOURCE_LABELS: Record<string, string> = {
  footer: "Footer",
  popup: "Popup",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/newsletter");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load subscribers");
      setSubscribers(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.name?.toLowerCase().includes(q) ?? false) ||
        s.source.toLowerCase().includes(q),
    );
  }, [subscribers, search]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111111]">Newsletter</h1>
          <p className="mt-1 text-sm text-[#5F686A]">
            Email addresses collected from the VAxAI site footer and sign-up popup.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F686A]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribers…"
            className="w-full rounded-lg border border-[#111111]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#122428]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[#5F686A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading subscribers…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#111111]/15 bg-white px-6 py-16 text-center">
          <Mail className="mx-auto h-8 w-8 text-[#5F686A]/50" />
          <p className="mt-3 text-sm font-medium text-[#111111]">
            {search ? "No subscribers match your search" : "No subscribers yet"}
          </p>
          <p className="mt-1 text-sm text-[#5F686A]">
            Sign-ups from the footer and popup will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#111111]/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#111111]/10 bg-white text-xs font-semibold uppercase tracking-[0.12em] text-[#5F686A]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="hidden px-4 py-3 sm:table-cell">Name</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/8 bg-white">
              {filtered.map((s) => (
                <tr key={s.email} className="hover:bg-pine-50">
                  <td className="px-4 py-3 font-medium text-[#111111]">{s.email}</td>
                  <td className="hidden px-4 py-3 text-[#5F686A] sm:table-cell">{s.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-[#122428]/8 px-2.5 py-0.5 text-xs font-medium text-[#122428]">
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5F686A]">{formatDate(s.subscribed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-[#111111]/10 bg-white px-4 py-2.5 text-xs text-[#5F686A]">
            {filtered.length} subscriber{filtered.length === 1 ? "" : "s"}
            {search && subscribers.length !== filtered.length ? ` (of ${subscribers.length} total)` : ""}
          </div>
        </div>
      )}
    </div>
  );
}