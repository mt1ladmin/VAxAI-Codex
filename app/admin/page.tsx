"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3, BookOpen, CalendarDays, FileText, FlaskConical,
  Handshake, Inbox, MessageSquare, Phone, Search,
  Upload, Users, Zap, ArrowRight, AlertCircle,
} from "lucide-react";

type CountsState = {
  pendingQueue: number;
  newEnquiries: number;
  overdueTasks: number;
  openOpps: number;
  recentPosts: { id: string; title: string; status: string }[];
  recentEnquiries: { id: string; name: string; created_at: string }[];
  loading: boolean;
};

function Pill({ count, label, href, color }: { count: number; label: string; href: string; color: string }) {
  if (count === 0) return null;
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80 ${color}`}>
      <AlertCircle className="h-3.5 w-3.5" />
      {count} {label}
    </Link>
  );
}

function SectionCard({
  icon: Icon, title, color, links, cta, ctaHref,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  links: { label: string; href: string; badge?: number }[];
  cta: string;
  ctaHref: string;
}) {
  return (
    <div className="rounded-2xl border border-[#111111]/10 bg-white p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${color}`}>
          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </span>
        <h2 className="font-semibold text-[#111111]">{title}</h2>
      </div>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-[#6f6b62] hover:bg-[#f7f4ea] hover:text-[#111111] transition-colors group"
            >
              <span>{l.label}</span>
              {l.badge !== undefined && l.badge > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{l.badge}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-[#063b32] hover:underline"
      >
        {cta} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default function StudioHomePage() {
  const [state, setState] = useState<CountsState>({
    pendingQueue: 0, newEnquiries: 0, overdueTasks: 0, openOpps: 0,
    recentPosts: [], recentEnquiries: [], loading: true,
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      fetch("/api/admin/engagement/prospect-queue?status=Needs+review&limit=100").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/enquiries?limit=50").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/engagement/tasks?limit=100").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/engagement/opportunities?limit=100").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/posts?limit=5").then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([queue, enqs, tasks, opps, posts]) => {
      const queueData = (queue.data || []) as { status: string }[];
      const enqData = (enqs.data || []) as { id: string; name: string; created_at: string; status?: string }[];
      const taskData = (tasks.data || []) as { id: string; due_date: string | null; status: string }[];
      const oppData = (opps.data || []) as { id: string; stage: string }[];
      const postData = (posts.data || []) as { id: string; title: string; status: string }[];

      setState({
        pendingQueue: queueData.filter(q => q.status === "Needs review").length,
        newEnquiries: enqData.filter(e => e.status === "new" || e.status === "open" || !e.status).length,
        overdueTasks: taskData.filter(t => t.due_date && t.due_date < today && t.status !== "done").length,
        openOpps: oppData.filter(o => !["Closed", "Won", "Lost"].includes(o.stage)).length,
        recentPosts: postData.slice(0, 3),
        recentEnquiries: enqData.slice(0, 3),
        loading: false,
      });
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[#f7f4ea]">
      {/* Header */}
      <div className="bg-[#063b32] px-8 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#f5f274]/70 uppercase tracking-[0.18em]">{dateStr}</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{greeting}</h1>
            <p className="mt-1 text-sm text-white/60">VAxAI Studio — your workspace for client engagement, knowledge, and content.</p>
          </div>
          <Link
            href="/admin/engagement/live-call"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-[#f5f274] px-5 py-3 text-sm font-bold text-[#063b32] hover:bg-[#f0ee60] transition-colors"
          >
            <Phone className="h-4 w-4" /> Start live call
          </Link>
        </div>

        {/* Alert pills */}
        {!state.loading && (state.overdueTasks > 0 || state.pendingQueue > 0 || state.newEnquiries > 0) && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill count={state.overdueTasks} label="overdue task(s)" href="/admin/engagement/pipeline/tasks" color="bg-red-100 text-red-700" />
            <Pill count={state.pendingQueue} label="prospect(s) needing review" href="/admin/engagement/prospect-queue" color="bg-amber-100 text-amber-700" />
            <Pill count={state.newEnquiries} label="new enquiry(ies)" href="/admin/enquiries" color="bg-blue-100 text-blue-700" />
          </div>
        )}
      </div>

      <div className="px-8 py-8 space-y-8">

        {/* Pipeline stat strip */}
        {!state.loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Open opportunities", value: state.openOpps, href: "/admin/engagement/pipeline/opportunities", color: "text-[#063b32]" },
              { label: "Prospects in queue", value: state.pendingQueue, href: "/admin/engagement/prospect-queue", color: "text-amber-600" },
              { label: "New enquiries", value: state.newEnquiries, href: "/admin/enquiries", color: "text-blue-600" },
              { label: "Tasks overdue", value: state.overdueTasks, href: "/admin/engagement/pipeline/tasks", color: "text-red-600" },
            ].map(({ label, value, href, color }) => (
              <Link key={href} href={href} className="rounded-xl bg-white border border-[#111111]/10 px-4 py-3 hover:border-[#063b32]/30 transition-colors group">
                <p className="text-xs font-semibold text-[#6f6b62]">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <SectionCard
            icon={Handshake}
            title="Client Engagement"
            color="bg-[#063b32]/10 text-[#063b32]"
            links={[
              { label: "Engagement overview", href: "/admin/engagement" },
              { label: "Insights & reports", href: "/admin/engagement/insights" },
              { label: "Pipeline & CRM", href: "/admin/engagement/pipeline" },
            ]}
            cta="Go to overview"
            ctaHref="/admin/engagement"
          />

          <SectionCard
            icon={Inbox}
            title="Prospect Queue"
            color="bg-amber-50 text-amber-600"
            links={[
              { label: "Review queue", href: "/admin/engagement/prospect-queue", badge: state.pendingQueue },
              { label: "Import from CSV", href: "/admin/engagement/prospect-imports" },
              { label: "Website enquiries", href: "/admin/enquiries", badge: state.newEnquiries },
            ]}
            cta="Open prospect queue"
            ctaHref="/admin/engagement/prospect-queue"
          />

          <SectionCard
            icon={Users}
            title="Pipeline & CRM"
            color="bg-blue-50 text-blue-600"
            links={[
              { label: "Organisations", href: "/admin/engagement/pipeline/organisations" },
              { label: "Contacts", href: "/admin/engagement/pipeline/contacts" },
              { label: "Opportunities", href: "/admin/engagement/pipeline/opportunities" },
            ]}
            cta="View pipeline"
            ctaHref="/admin/engagement/pipeline"
          />

          <SectionCard
            icon={Phone}
            title="Live Call Tools"
            color="bg-indigo-50 text-indigo-600"
            links={[
              { label: "Live Call Assist", href: "/admin/engagement/live-call" },
              { label: "Profile Explorer", href: "/admin/engagement/profile-explorer" },
            ]}
            cta="Start a call"
            ctaHref="/admin/engagement/live-call"
          />

          <SectionCard
            icon={BookOpen}
            title="Knowledge Base"
            color="bg-teal-50 text-teal-700"
            links={[
              { label: "Pain Points navigator", href: "/admin/engagement/pain-points" },
              { label: "Knowledge Library", href: "/admin/engagement/knowledge" },
              { label: "Knowledge Review", href: "/admin/engagement/knowledge-review" },
            ]}
            cta="Open knowledge library"
            ctaHref="/admin/engagement/knowledge"
          />

          <SectionCard
            icon={FileText}
            title="Content"
            color="bg-rose-50 text-rose-600"
            links={[
              { label: "All posts", href: "/admin/posts" },
              { label: "Content Calendar", href: "/admin/calendar" },
              { label: "New post", href: "/admin/posts/new" },
            ]}
            cta="Go to posts"
            ctaHref="/admin/posts"
          />

        </div>

        {/* Recent activity row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent enquiries */}
          <div className="rounded-2xl bg-white border border-[#111111]/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#111111] text-sm">Recent enquiries</h3>
              <Link href="/admin/enquiries" className="text-xs text-[#063b32] hover:underline">View all</Link>
            </div>
            {state.loading ? (
              <p className="text-sm text-[#6f6b62]">Loading…</p>
            ) : state.recentEnquiries.length === 0 ? (
              <p className="text-sm text-[#6f6b62]">No enquiries yet.</p>
            ) : (
              <ul className="space-y-2">
                {state.recentEnquiries.map((e) => (
                  <li key={e.id}>
                    <Link href="/admin/enquiries" className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f7f4ea] transition-colors">
                      <span className="text-sm font-semibold text-[#111111] truncate">{e.name}</span>
                      <span className="text-xs text-[#6f6b62] shrink-0 ml-2">
                        {new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent posts */}
          <div className="rounded-2xl bg-white border border-[#111111]/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#111111] text-sm">Recent posts</h3>
              <Link href="/admin/posts" className="text-xs text-[#063b32] hover:underline">View all</Link>
            </div>
            {state.loading ? (
              <p className="text-sm text-[#6f6b62]">Loading…</p>
            ) : state.recentPosts.length === 0 ? (
              <p className="text-sm text-[#6f6b62]">No posts yet. <Link href="/admin/posts/new" className="text-[#063b32] underline">Write one →</Link></p>
            ) : (
              <ul className="space-y-2">
                {state.recentPosts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/posts/${p.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f7f4ea] transition-colors">
                      <span className="text-sm font-semibold text-[#111111] truncate">{p.title}</span>
                      <span className={`shrink-0 ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
