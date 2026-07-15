"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isUnreviewedEnquiry } from "@/lib/enquiries/constants";
import {
  AlertCircle,
  ArrowRight,
  Users,
  Send,
  Zap,
} from "lucide-react";
import { PROSPECT_FINDER_LABEL } from "@/lib/engagement/journey";
import { useUserEmail } from "@/lib/user-email-context";

type WorkToday = {
  overdueTasks: Array<{ id: string; title: string; due_date: string | null; href: string; contact_name: string | null }>;
  dueSoonTasks: Array<{ id: string; title: string; due_date: string | null; href: string; contact_name: string | null }>;
  finderProspects: Array<{ id: string; organisation_name: string; engagement_status: string; next_action: string | null; href: string }>;
  newEnquiries: Array<{ id: string; name: string; status: string; href: string }>;
};

type PostItem = { id: string; title: string; status: string; scheduled_at?: string | null; content_type: string };

type Stats = {
  newEnquiries: number;
  overdueTasks: number;
  openTasks: number;
  recentPosts: PostItem[];
  upcomingPosts: PostItem[];
  loading: boolean;
};

function AlertPill({ count, label, href, color }: { count: number; label: string; href: string; color: string }) {
  if (count === 0) return null;
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80 ${color}`}>
      <AlertCircle className="h-3.5 w-3.5" />
      {count} {label}
    </Link>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#111111]/10 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#111111]/5 px-5 py-3.5 bg-[#F5F8F8]/50">
        <h2 className="text-sm font-semibold text-[#111111]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function EngagementOverview() {
  const userEmail = useUserEmail();
  const [workToday, setWorkToday] = useState<WorkToday | null>(null);
  const [workLoading, setWorkLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    newEnquiries: 0,
    overdueTasks: 0,
    openTasks: 0,
    recentPosts: [],
    upcomingPosts: [],
    loading: true,
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      fetch("/api/admin/engagement/tasks?limit=100").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/enquiries?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/posts?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([taskRes, enqRes, postRes]) => {
      const taskData = (taskRes.data || []) as Array<{ due_date: string | null; status: string }>;
      const enqData = (enqRes.data || []) as { status?: string }[];
      const postData = (postRes.data || []) as PostItem[];

      const isUpcoming = (p: PostItem) => !!p.scheduled_at && p.status !== "published" && p.scheduled_at > now;

      setStats({
        newEnquiries: enqData.filter((e) => isUnreviewedEnquiry(e.status as string)).length,
        overdueTasks: taskData.filter((t) => t.due_date && t.due_date < today && t.status !== "done").length,
        openTasks: taskData.filter((t) => t.status !== "done").length,
        recentPosts: postData.slice(0, 5),
        upcomingPosts: postData
          .filter(isUpcoming)
          .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""))
          .slice(0, 5),
        loading: false,
      });
    });
  }, []);

  useEffect(() => {
    setWorkLoading(true);
    const params = new URLSearchParams();
    if (userEmail) params.set("user_email", userEmail);
    fetch(`/api/admin/engagement/work-today?${params}`)
      .then((r) => r.json())
      .then((j) => setWorkToday(j.data || null))
      .finally(() => setWorkLoading(false));
  }, [userEmail]);

  const now = new Date().toISOString();

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-[#111111]/10 px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#111111]">Overview</h1>
            <p className="mt-0.5 text-sm text-[#5F686A]">
              Prospect assessment, outreach, enquiries, tasks, and Knowledge Hub — aligned to VAxAI wraparound support.
            </p>
          </div>

        </div>
        {!stats.loading && (stats.overdueTasks > 0 || stats.newEnquiries > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <AlertPill count={stats.overdueTasks} label="overdue task(s)" href="/admin/engagement/pipeline" color="bg-red-100 text-red-700" />
            <AlertPill count={stats.newEnquiries} label="new enquiry(ies)" href="/admin/enquiries" color="bg-blue-100 text-blue-700" />
          </div>
        )}
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {stats.loading
            ? [1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
                  <div className="h-3 w-20 rounded bg-[#F5F8F8]" />
                  <div className="mt-3 h-8 w-12 rounded bg-[#F5F8F8]/80" />
                </div>
              ))
            : [
                { label: "Tasks overdue", value: stats.overdueTasks, href: "/admin/engagement/pipeline", color: "text-red-600" },
                { label: "New enquiries", value: stats.newEnquiries, href: "/admin/enquiries", color: "text-blue-600" },
              ].map(({ label, value, href, color }) => (
                <Link key={label} href={href} className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3 hover:border-[#122428]/30 transition-colors">
                  <p className="text-xs font-semibold text-[#5F686A]">{label}</p>
                  <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                </Link>
              ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Overdue tasks"
            action={<Link href="/admin/engagement/pipeline" className="text-xs font-semibold text-[#122428] hover:underline">View all</Link>}
          >
            {workLoading ? (
              <p className="px-5 py-4 text-sm text-[#5F686A]">Loading…</p>
            ) : !workToday?.overdueTasks.length ? (
              <p className="px-5 py-4 text-sm text-[#5F686A]">None — good.</p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {workToday.overdueTasks.map((t) => (
                  <Link key={t.id} href={t.href} className="block px-5 py-3 hover:bg-red-50/40">
                    <p className="text-sm font-semibold text-[#111111] truncate">{t.title}</p>
                    {t.contact_name && <p className="mt-0.5 text-xs text-[#5F686A] truncate">{t.contact_name}</p>}
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="New enquiries"
            action={<Link href="/admin/enquiries" className="text-xs font-semibold text-[#122428] hover:underline">View all</Link>}
          >
            {workLoading ? (
              <p className="px-5 py-4 text-sm text-[#5F686A]">Loading…</p>
            ) : !workToday?.newEnquiries.length ? (
              <p className="px-5 py-4 text-sm text-[#5F686A]">Inbox clear.</p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {workToday.newEnquiries.map((e) => (
                  <Link key={e.id} href={e.href} className="block px-5 py-3 hover:bg-[#F5F8F8]/50">
                    <p className="text-sm font-semibold text-[#111111] truncate">{e.name}</p>
                    <p className="mt-0.5 text-xs text-[#5F686A] truncate">{e.status}</p>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: PROSPECT_FINDER_LABEL, desc: "Researched organisations — assign, qualify, and move opportunities to the queue", href: "/admin/engagement/prospect-outreach", icon: Send },
            { label: "Prepare for a prospect", desc: "Sectors, personas, objections, and VAT-informed prompts to help you prepare for a conversation", href: "/admin/engagement/knowledge", icon: Users },
            { label: "Knowledge library", desc: "Full playbook — pain points, scripts, pricing bands, and approved outreach blocks", href: "/admin/engagement/knowledge", icon: Zap },
          ].map(({ label, desc, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-[#111111]/10 bg-white px-4 py-3.5 hover:border-[#122428]/25 hover:bg-[#F5F8F8]/40 transition-colors">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#122428]/8 text-[#122428]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111111]">{label}</p>
                <p className="text-xs text-[#5F686A]">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#5F686A]/40" />
            </Link>
          ))}
        </div>


        <p className="text-sm font-semibold text-[#111111]">Content & publishing</p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard
            title="Recent posts"
            action={<Link href="/admin/posts" className="text-xs font-semibold text-[#122428] hover:underline">All posts</Link>}
          >
            {stats.loading ? (
              <p className="px-5 py-6 text-sm text-[#5F686A]">Loading…</p>
            ) : stats.recentPosts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#5F686A]">
                No posts yet. <Link href="/admin/posts/new" className="text-[#122428] underline">Write one</Link>
              </p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {stats.recentPosts.map((p) => {
                  const statusColor =
                    p.status === "published" ? "bg-emerald-100 text-emerald-700"
                    : p.status === "scheduled" ? "bg-blue-100 text-blue-700"
                    : "bg-[#F5F8F8] text-[#5F686A]";
                  return (
                    <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#F5F8F8]/50 transition-colors">
                      <span className="text-sm font-semibold text-[#111111] truncate">{p.title}</span>
                      <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusColor}`}>{p.status}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Upcoming posts"
            action={<Link href="/admin/calendar" className="text-xs font-semibold text-[#122428] hover:underline">Calendar</Link>}
          >
            {stats.loading ? (
              <p className="px-5 py-6 text-sm text-[#5F686A]">Loading…</p>
            ) : stats.upcomingPosts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#5F686A]">
                No upcoming scheduled posts. <Link href="/admin/posts/new" className="text-[#122428] underline">Schedule one</Link>
              </p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {stats.upcomingPosts.map((p) => {
                  const isSocial = (p.content_type || "").toLowerCase().includes("social");
                  return (
                    <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#F5F8F8]/50 transition-colors">
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-[#111111] truncate">{p.title}</span>
                        <span className="text-[10px] text-[#5F686A]">{isSocial ? "Social" : "Blog"}</span>
                      </div>
                      {p.scheduled_at && (
                        <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          {new Date(p.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}