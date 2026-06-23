"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Inbox,
  Plus,
  Users,
  Send,
  Zap,
} from "lucide-react";
import { STAGE_COLORS } from "@/lib/engagement/types";

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  status: string;
  organisation?: { name: string } | null;
  contact?: { first_name: string; last_name: string | null } | null;
};
type Opportunity = { id: string; title: string; stage: string; organisation?: { name: string } | null };
type PainPoint = { id: string; title: string; category: string; slug: string | null };
type PostItem = { id: string; title: string; status: string; scheduled_at?: string | null; content_type: string };

type Stats = {
  pendingQueue: number;
  newEnquiries: number;
  overdueTasks: number;
  openOpps: number;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [commonPainPoints, setCommonPainPoints] = useState<PainPoint[]>([]);
  const [stats, setStats] = useState<Stats>({
    pendingQueue: 0,
    newEnquiries: 0,
    overdueTasks: 0,
    openOpps: 0,
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

    Promise.all([
      fetch("/api/admin/engagement/tasks?limit=100").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/engagement/opportunities?limit=100").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/engagement/prospect-queue?status=Needs+review&limit=100").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/enquiries?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/posts?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([taskRes, oppRes, queueRes, enqRes, postRes]) => {
      const taskData = (taskRes.data || []) as Task[];
      const oppData = (oppRes.data || []) as Opportunity[];
      const queueData = (queueRes.data || []) as { status: string }[];
      const enqData = (enqRes.data || []) as { status?: string }[];
      const postData = (postRes.data || []) as PostItem[];

      setTasks(taskData.slice(0, 5));
      setOpportunities(oppData.slice(0, 8));

      const isSocial = (p: PostItem) => (p.content_type || "").toLowerCase().includes("social");
      const isScheduled = (p: PostItem) => !!p.scheduled_at && p.status !== "published";

      setStats({
        pendingQueue: queueData.filter((q) => q.status === "Needs review").length,
        newEnquiries: enqData.filter((e) => e.status === "Needs review" || e.status === "new" || e.status === "open" || !e.status).length,
        overdueTasks: taskData.filter((t) => t.due_date && t.due_date < today && t.status !== "done").length,
        openOpps: oppData.filter((o) => !["Closed", "Won", "Lost"].includes(o.stage)).length,
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

  const stageGroups = opportunities.reduce<Record<string, Opportunity[]>>((acc, o) => {
    (acc[o.stage] ??= []).push(o);
    return acc;
  }, {});

  const now = new Date().toISOString();

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#111111]">Overview</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">Your engagement hub at a glance.</p>
          </div>

        </div>
        {!stats.loading && (stats.overdueTasks > 0 || stats.pendingQueue > 0 || stats.newEnquiries > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <AlertPill count={stats.overdueTasks} label="overdue task(s)" href="/admin/engagement/pipeline?tab=tasks" color="bg-red-100 text-red-700" />
            <AlertPill count={stats.pendingQueue} label="prospect(s) needing review" href="/admin/engagement/prospect-queue" color="bg-amber-100 text-amber-700" />
            <AlertPill count={stats.newEnquiries} label="new enquiry(ies)" href="/admin/enquiries" color="bg-blue-100 text-blue-700" />
          </div>
        )}
      </div>

      <div className="px-8 py-6 space-y-6">
        {!stats.loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Open opportunities", value: stats.openOpps, href: "/admin/engagement/pipeline?tab=opportunities", color: "text-[#063b32]" },
              { label: "Prospects in queue", value: stats.pendingQueue, href: "/admin/engagement/prospect-queue", color: "text-amber-600" },
              { label: "New enquiries", value: stats.newEnquiries, href: "/admin/enquiries", color: "text-blue-600" },
              { label: "Tasks overdue", value: stats.overdueTasks, href: "/admin/engagement/pipeline?tab=tasks", color: "text-red-600" },
            ].map(({ label, value, href, color }) => (
              <Link key={href} href={href} className="rounded-xl border border-[#111111]/10 bg-white px-4 py-3 hover:border-[#063b32]/30 transition-colors">
                <p className="text-xs font-semibold text-[#6f6b62]">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Prospect outreach", desc: "1,000 targets (500 charities + 500 SMBs) · 23 Jun 2026", href: "/admin/engagement/prospect-outreach", icon: Send },
            { label: "Prepare for a prospect", desc: "Sector, profile and guidance", href: "/admin/engagement/knowledge", icon: Users },
            { label: "Help with a pain point", desc: "Phrase-led conversation support", href: "/admin/engagement/pain-points", icon: Zap },
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Follow-ups due"
            action={
              <Link href="/admin/engagement/pipeline?tab=tasks" className="text-xs font-semibold text-[#063b32] hover:underline">
                All tasks
              </Link>
            }
          >
            {tasks.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#6f6b62]">No follow-ups scheduled yet.</div>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {tasks.map((t) => (
                  <div key={t.id} className="px-5 py-3">
                    <p className="text-sm font-semibold text-[#111111] truncate">{t.title}</p>
                    {(t.organisation || t.contact) && (
                      <p className="mt-0.5 text-xs text-[#6f6b62] truncate">
                        {t.contact ? `${t.contact.first_name} ${t.contact.last_name || ""}`.trim() : t.organisation?.name}
                      </p>
                    )}
                    {t.due_date && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6f6b62]">
                        <Calendar className="h-3 w-3" />
                        {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#111111]/5 px-5 py-3">
              <Link
                href="/admin/engagement/pipeline?tab=tasks"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#063b32] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add task
              </Link>
            </div>
          </SectionCard>

          <SectionCard
            title="Open opportunities"
            action={
              <Link href="/admin/engagement/pipeline?tab=opportunities" className="text-xs font-semibold text-[#063b32] hover:underline">
                All opportunities
              </Link>
            }
          >
            {Object.keys(stageGroups).length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#6f6b62]">
                No open opportunities yet.{" "}
                <Link href="/admin/engagement/pipeline/opportunities/new" className="text-[#063b32] underline">
                  Add one
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#111111]/5">
                {Object.entries(stageGroups).map(([stage, opps]) => (
                  <div key={stage} className="px-5 py-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAGE_COLORS[stage] || "bg-gray-100 text-gray-600"}`}>
                        {stage}
                      </span>
                      <span className="text-xs text-[#6f6b62]">{opps.length}</span>
                    </div>
                    <div className="space-y-1">
                      {opps.map((o) => (
                        <Link
                          key={o.id}
                          href={`/admin/engagement/pipeline/opportunities/${o.id}`}
                          className="flex items-center justify-between text-sm text-[#111111] hover:text-[#063b32]"
                        >
                          <span className="truncate">{o.title}</span>
                          {o.organisation && <span className="ml-2 shrink-0 text-xs text-[#6f6b62]">{o.organisation.name}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Knowledge Library", href: "/admin/engagement/knowledge", icon: BookOpen, desc: "Playbooks, sectors and scripts" },
            { label: "Website Enquiries", href: "/admin/enquiries", icon: Users, desc: "Contact form submissions" },
            { label: "Prospect Queue", href: "/admin/engagement/prospect-queue", icon: Inbox, desc: "Imported prospects awaiting review" },
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