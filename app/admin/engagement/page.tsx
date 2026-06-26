"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Users,
  Send,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  PROSPECT_FINDER_LABEL,
} from "@/lib/engagement/journey";
import { useUserEmail } from "@/lib/user-email-context";

type WorkToday = {
  overdueTasks: Array<{ id: string; title: string; due_date: string | null; href: string; contact_name: string | null }>;
  dueSoonTasks: Array<{ id: string; title: string; due_date: string | null; href: string; contact_name: string | null }>;
  finderProspects: Array<{ id: string; organisation_name: string; engagement_status: string; next_action: string | null; href: string }>;
  newEnquiries: Array<{ id: string; name: string; status: string; href: string }>;
};

type ClientItem = { id: string; organisation_name: string; client_note: string | null };


type PainPoint = { id: string; title: string; category: string; slug: string | null };
type PostItem = { id: string; title: string; status: string; scheduled_at?: string | null; content_type: string };

type Stats = {
  pendingQueue: number;
  newEnquiries: number;
  overdueTasks: number;
  openTasks: number;
  recentInsightPosts: PostItem[];
  upcomingSocialPosts: PostItem[];
  upcomingBlogPosts: PostItem[];
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
      <div className="flex items-center justify-between border-b border-[#111111]/5 px-5 py-3.5 bg-[#f7f4ea]/50">
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
  const [showContent, setShowContent] = useState(false);

  const [commonPainPoints, setCommonPainPoints] = useState<PainPoint[]>([]);
  const [recentClients, setRecentClients] = useState<ClientItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    pendingQueue: 0,
    newEnquiries: 0,
    overdueTasks: 0,
    openTasks: 0,
    recentInsightPosts: [],
    upcomingSocialPosts: [],
    upcomingBlogPosts: [],
    loading: true,
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    fetch("/api/admin/engagement/pain-points?limit=8")
      .then((r) => r.json())
      .then((j) => setCommonPainPoints(j.data || []));

    fetch("/api/admin/engagement/prospect-outreach?is_client=true&page_size=10")
      .then((r) => r.json())
      .then((j: { data?: ClientItem[] }) => setRecentClients(j.data ?? []))
      .catch(() => {});

    Promise.all([
      fetch("/api/admin/engagement/tasks?limit=100").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/engagement/prospect-outreach?page_size=1").then((r) => r.json()).catch(() => ({ meta: {} })),
      fetch("/api/admin/enquiries?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/posts?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([taskRes, finderRes, enqRes, postRes]) => {
      const taskData = (taskRes.data || []) as Array<{ due_date: string | null; status: string }>;
      const finderMeta = (finderRes.meta || {}) as { unassigned_count?: number };
      const enqData = (enqRes.data || []) as { status?: string }[];
      const postData = (postRes.data || []) as PostItem[];

      const isSocial = (p: PostItem) => (p.content_type || "").toLowerCase().includes("social");
      const isScheduled = (p: PostItem) => !!p.scheduled_at && p.status !== "published";

      setStats({
        pendingQueue: finderMeta.unassigned_count ?? 0,
        newEnquiries: enqData.filter((e) => e.status === "Needs review" || e.status === "new" || e.status === "open" || !e.status).length,
        overdueTasks: taskData.filter((t) => t.due_date && t.due_date < today && t.status !== "done").length,
        openTasks: taskData.filter((t) => t.status !== "done").length,
        recentInsightPosts: postData.filter((p) => p.status === "published" && !isSocial(p)).slice(0, 3),
        upcomingSocialPosts: postData
          .filter((p) => isSocial(p) && isScheduled(p))
          .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""))
          .slice(0, 4),
        upcomingBlogPosts: postData
          .filter((p) => !isSocial(p) && isScheduled(p))
          .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""))
          .slice(0, 4),
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
  const todayStr = now.split("T")[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#111111]">Overview</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">
              Prospect assessment, outreach, enquiries, tasks, and Knowledge Hub — aligned to VAxAI wraparound support.
            </p>
          </div>

        </div>
        {!stats.loading && (stats.overdueTasks > 0 || stats.pendingQueue > 0 || stats.newEnquiries > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <AlertPill count={stats.overdueTasks} label="overdue task(s)" href="/admin/engagement/pipeline" color="bg-red-100 text-red-700" />
            <AlertPill count={stats.pendingQueue} label="unassigned prospect(s)" href="/admin/engagement/prospect-outreach?unassigned=true" color="bg-amber-100 text-amber-700" />
            <AlertPill count={stats.newEnquiries} label="new enquiry(ies)" href="/admin/enquiries" color="bg-blue-100 text-blue-700" />
          </div>
        )}
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3">
                  <div className="h-3 w-20 rounded bg-[#f7f4ea]" />
                  <div className="mt-3 h-8 w-12 rounded bg-[#f7f4ea]/80" />
                </div>
              ))
            : [
                { label: "Tasks overdue", value: stats.overdueTasks, href: "/admin/engagement/pipeline", color: "text-red-600" },
                { label: "Unassigned prospects", value: stats.pendingQueue, href: "/admin/engagement/prospect-outreach?unassigned=true", color: "text-amber-600" },
                { label: "New enquiries", value: stats.newEnquiries, href: "/admin/enquiries", color: "text-blue-600" },
              ].map(({ label, value, href, color }) => (
                <Link key={label} href={href} className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3 hover:border-[#063b32]/30 transition-colors">
                  <p className="text-xs font-semibold text-[#6f6b62]">{label}</p>
                  <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                </Link>
              ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Overdue tasks"
            action={<Link href="/admin/engagement/pipeline" className="text-xs font-semibold text-[#063b32] hover:underline">View all</Link>}
          >
            {workLoading ? (
              <p className="px-5 py-4 text-sm text-[#6f6b62]">Loading…</p>
            ) : !workToday?.overdueTasks.length ? (
              <p className="px-5 py-4 text-sm text-[#6f6b62]">None — good.</p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {workToday.overdueTasks.map((t) => (
                  <Link key={t.id} href={t.href} className="block px-5 py-3 hover:bg-red-50/40">
                    <p className="text-sm font-semibold text-[#111111] truncate">{t.title}</p>
                    {t.contact_name && <p className="mt-0.5 text-xs text-[#6f6b62] truncate">{t.contact_name}</p>}
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="New enquiries"
            action={<Link href="/admin/enquiries" className="text-xs font-semibold text-[#063b32] hover:underline">View all</Link>}
          >
            {workLoading ? (
              <p className="px-5 py-4 text-sm text-[#6f6b62]">Loading…</p>
            ) : !workToday?.newEnquiries.length ? (
              <p className="px-5 py-4 text-sm text-[#6f6b62]">Inbox clear.</p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {workToday.newEnquiries.map((e) => (
                  <Link key={e.id} href={e.href} className="block px-5 py-3 hover:bg-[#f7f4ea]/50">
                    <p className="text-sm font-semibold text-[#111111] truncate">{e.name}</p>
                    <p className="mt-0.5 text-xs text-[#6f6b62] truncate">{e.status}</p>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: PROSPECT_FINDER_LABEL, desc: "Researched organisations — assign, qualify, and move opportunities to the queue", href: "/admin/engagement/prospect-outreach", icon: Send },
            { label: "Prepare for a prospect", desc: "Sector guidance, personas, and VAT-informed prompts", href: "/admin/engagement/knowledge", icon: Users },
            { label: "Help with a pain point", desc: "Phrase-led support for workflow and admin pressure", href: "/admin/engagement/pain-points", icon: Zap },
          ].map(({ label, desc, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-[#111111]/10 bg-white px-4 py-3.5 hover:border-[#063b32]/25 hover:bg-[#f7f4ea]/40 transition-colors">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#063b32]/8 text-[#063b32]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111111]">{label}</p>
                <p className="text-xs text-[#6f6b62]">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#6f6b62]/40" />
            </Link>
          ))}
        </div>

        <SectionCard
          title="Common pain points"
          action={
            <Link href="/admin/engagement/pain-points" className="text-xs font-semibold text-[#063b32] hover:underline">
              All pain points
            </Link>
          }
        >
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {commonPainPoints.map((pp) => (
              <Link
                key={pp.id}
                href={`/admin/engagement/pain-points/${pp.id}`}
                className="flex items-center gap-1.5 rounded-full border border-[#111111]/10 bg-white px-3 py-1.5 text-sm text-[#111111] hover:border-[#063b32]/30 hover:bg-[#f7f4ea] transition-colors"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                {pp.title}
              </Link>
            ))}
          </div>
        </SectionCard>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#111111]">Content & publishing</p>
          <button
            type="button"
            onClick={() => setShowContent((v) => !v)}
            className="text-xs font-semibold text-[#063b32] hover:underline"
          >
            {showContent ? "Hide" : "Show"}
          </button>
        </div>

        {showContent && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard
            title="Recent insights"
            action={<Link href="/admin/posts" className="text-xs font-semibold text-[#063b32] hover:underline">All posts</Link>}
          >
            {stats.loading ? (
              <p className="px-5 py-6 text-sm text-[#6f6b62]">Loading…</p>
            ) : stats.recentInsightPosts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6f6b62]">
                No published posts yet. <Link href="/admin/posts/new" className="text-[#063b32] underline">Write one</Link>
              </p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {stats.recentInsightPosts.map((p) => (
                  <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#f7f4ea]/50 transition-colors">
                    <span className="text-sm font-semibold text-[#111111] truncate">{p.title}</span>
                    <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Published</span>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Upcoming social"
            action={<Link href="/admin/calendar" className="text-xs font-semibold text-[#063b32] hover:underline">Calendar</Link>}
          >
            {stats.loading ? (
              <p className="px-5 py-6 text-sm text-[#6f6b62]">Loading…</p>
            ) : stats.upcomingSocialPosts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6f6b62]">
                No scheduled social posts. <Link href="/admin/posts/new" className="text-[#063b32] underline">Create one</Link>
              </p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {stats.upcomingSocialPosts.map((p) => {
                  const overdue = p.scheduled_at && p.scheduled_at < now;
                  return (
                    <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#f7f4ea]/50 transition-colors">
                      <span className="text-sm font-semibold text-[#111111] truncate">{p.title}</span>
                      {p.scheduled_at && (
                        <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${overdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                          {overdue ? "Overdue" : new Date(p.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Upcoming blog"
            action={<Link href="/admin/calendar" className="text-xs font-semibold text-[#063b32] hover:underline">Calendar</Link>}
          >
            {stats.loading ? (
              <p className="px-5 py-6 text-sm text-[#6f6b62]">Loading…</p>
            ) : stats.upcomingBlogPosts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6f6b62]">
                No scheduled blog posts. <Link href="/admin/posts/new" className="text-[#063b32] underline">Schedule one</Link>
              </p>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {stats.upcomingBlogPosts.map((p) => {
                  const overdue = p.scheduled_at && p.scheduled_at < now;
                  return (
                    <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#f7f4ea]/50 transition-colors">
                      <span className="text-sm font-semibold text-[#111111] truncate">{p.title}</span>
                      {p.scheduled_at && (
                        <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {overdue ? "Overdue" : new Date(p.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
        )}

        {recentClients.length > 0 && (
          <SectionCard
            title="Clients"
            action={
              <Link href="/admin/engagement/prospect-outreach?is_client=true" className="text-xs font-semibold text-[#063b32] hover:underline">
                View all
              </Link>
            }
          >
            <div className="divide-y divide-[#111111]/5">
              {recentClients.map((c) => (
                <Link key={c.id} href={`/admin/engagement/prospect-outreach/${c.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-purple-50/40 transition-colors">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <UserCheck className="h-3 w-3 text-purple-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#111111] truncate">{c.organisation_name}</p>
                      <span className="shrink-0 rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-800">Now a client</span>
                    </div>
                    {c.client_note && (
                      <p className="mt-0.5 truncate text-xs text-[#6f6b62]">{c.client_note}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: "Knowledge Library", href: "/admin/engagement/knowledge", icon: BookOpen, desc: "Playbooks, sectors and scripts" },
            { label: "Website Enquiries", href: "/admin/enquiries", icon: Users, desc: "Contact form submissions" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-[#111111]/10 bg-white p-4 hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/40 transition-colors"
            >
              <item.icon className="h-5 w-5 text-[#063b32]" />
              <p className="mt-2 text-sm font-semibold text-[#111111]">{item.label}</p>
              <p className="mt-0.5 text-xs text-[#6f6b62]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}