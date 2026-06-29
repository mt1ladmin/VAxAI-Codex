"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioTeamMember } from "@/lib/engagement/team-members";

export default function SettingsPage() {
  const [teamMembers, setTeamMembers] = useState<StudioTeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/engagement/team-members?active_only=false");
    const json = await res.json() as { data: StudioTeamMember[] };
    const seen = new Set<string>();
    setTeamMembers((json.data || []).filter((member) => (
      seen.has(member.id) ? false : (seen.add(member.id), true)
    )));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#6f6b62]">
          Manage the team members available for assignments across Client Engagement.
        </p>
      </div>

      <div className="px-8 py-6">
        <p className="mb-4 text-sm text-[#6f6b62]">
          Inactive members keep existing assignments but cannot be selected for new work.
        </p>
        <div className="mb-4 flex gap-2">
          <input
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="New team member name"
            className="flex-1 rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          />
          <button
            type="button"
            disabled={!newMemberName.trim()}
            onClick={async () => {
              await fetch("/api/admin/engagement/team-members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ display_name: newMemberName.trim() }),
              });
              setNewMemberName("");
              void load();
            }}
            className="rounded-xl bg-[#063b32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add member
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#111111]/10 divide-y divide-[#111111]/5">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <input
                  defaultValue={member.display_name}
                  onBlur={async (e) => {
                    const name = e.target.value.trim();
                    if (!name || name === member.display_name) return;
                    await fetch(`/api/admin/engagement/team-members/${member.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ display_name: name }),
                    });
                    void load();
                  }}
                  className="min-w-[140px] flex-1 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm"
                />
                <input
                  defaultValue={member.user_email || ""}
                  placeholder="Email (optional, for My prospects)"
                  onBlur={async (e) => {
                    const email = e.target.value.trim();
                    if (email === (member.user_email || "")) return;
                    await fetch(`/api/admin/engagement/team-members/${member.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ user_email: email || null }),
                    });
                    void load();
                  }}
                  className="min-w-[200px] flex-1 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/admin/engagement/team-members/${member.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ is_active: !member.is_active }),
                    });
                    void load();
                  }}
                  className={`rounded-full px-3 py-0.5 text-[10px] font-semibold ${
                    member.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {member.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
