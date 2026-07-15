"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isUnreviewedEnquiry } from "@/lib/enquiries/constants";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Search,
  Users,
} from "lucide-react";
import { PROSPECT_FINDER_LABEL, PROSPECT_FINDER_PATH } from "@/lib/engagement/journey";
import { useUserEmail } from "@/lib/user-email-context";
import { InfoTip, StudioPageHeader, studio } from "@/components/admin/studio-ui";

type WorkToday = {
  overdueTasks: Array<{ id: string; title: string; due_date: string | null; href: string; contact_name: string | null }>;
  dueSoonTasks: Array<{ id: string; title: string; due_date: string | null; href: string; contact_name: string | null }>;
  finderProspects: Array<{ id: string; organisation_name: string; engagement_status: string; next_action: string | null; href: string }>;
  newEnquiries: Array<{ id: string; name: string; status: string; href: string }>;
};

type PostItem = {
  id: string;
  title: string;
  status: string;
  scheduled_at?: string | null;
  content_type: string;
  cover_image_url?: string | null;
};

type Stats = {
  newEnquiries: number;
  overdueTasks: number;
  openTasks: number;
  recentPosts: PostItem[];
  upcomingPosts: PostItem[];
  loading: boolean;
};

function AlertPill({ count, label, href }: { count: number; label: string; href: string }) {
  if (count === 0) return null;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-pine-900/15 bg-white px-3.5 py-1.5 text-sm font-semibold text-pine-900 shadow-sm transition-colors hover:bg-cream"
    >
      <AlertCircle className="h-3.5 w-3.5 text-pine-800" />
      {count} {label}
    </Link>
  );
}

function SectionCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`${studio.card} overflow-hidden`}>
      <div className="flex items-start justify-between gap-3 border-b border-pine-900/8 bg-cream/40 px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-pine-900">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
        </div>
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
    const now = new Date().toISOString();

    Promise.all([
      fetch("/api/admin/engagement/tasks?limit=100").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/enquiries?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/admin/posts?limit=50").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([taskRes, enqRes, postRes]) => {
      const taskData = (taskRes.data || []) as Array<{ due_date: string | null; status: string }>;
      const enqData = (enqRes.data || []) as { status?: string }[];
      const postData = (postRes.data || []) as PostItem[];

      const isUpcoming = (p: PostItem) =>
        !!p.scheduled_at && p.status !== "published" && p.scheduled_at > now;

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

  return (
    <div className={`${studio.page} ${studio.pagePad}`}>
      <div className={studio.max}>
        <StudioPageHeader
          eyebrow="Client engagement"
          title="Overview"
          description="What needs attention today: enquiries, tasks, prospects and content — without digging through every list."
          info="Start here each day. Overdue tasks and new enquiries surface first. Shortcuts open Prospect Finder, Knowledge Hub and Content Hub with the same data as before."
          actions={
            <Link href="/admin/enquiries" className={studio.btnPrimary}>
              <MessageSquare className="h-4 w-4" />
              Enquiries
            </Link>
          }
        />

        {!stats.loading && (stats.overdueTasks > 0 || stats.newEnquiries > 0) ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <AlertPill count={stats.overdueTasks} label="overdue tasks" href="/admin/engagement/pipeline" />
            <AlertPill count={stats.newEnquiries} label="new enquiries" href="/admin/enquiries" />
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className={`${studio.card} px-4 py-3.5`}>
                  <div className="h-3 w-20 rounded bg-cream" />
                  <div className="mt-3 h-8 w-12 rounded bg-cream/80" />
                </div>
              ))
            : [
                {
                  label: "Tasks overdue",
                  value: stats.overdueTasks,
                  href: "/admin/engagement/pipeline",
                  hint: "Needs action",
                },
                {
                  label: "Open tasks",
                  value: stats.openTasks,
                  href: "/admin/engagement/pipeline",
                  hint: "All active",
                },
                {
                  label: "New enquiries",
                  value: stats.newEnquiries,
                  href: "/admin/enquiries",
                  hint: "Needs review",
                },
                {
                  label: "VAs",
                  value: "→",
                  href: "/admin/va-applications",
                  hint: "Freelance partners",
                },
              ].map(({ label, value, href, hint }) => (
                <Link
                  key={label}
                  href={href}
                  className={`${studio.card} px-4 py-3.5 transition-colors hover:border-pine-900/25`}
                >
                  <p className={studio.label}>{label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-pine-900">{value}</p>
                  <p className="mt-0.5 text-xs text-muted">{hint}</p>
                </Link>
              ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Overdue tasks"
            hint="From the task tracker — open one to continue"
            action={
              <Link href="/admin/engagement/pipeline" className="text-xs font-semibold text-pine-900 hover:underline">
                All tasks
              </Link>
            }
          >
            {workLoading ? (
              <p className="px-5 py-4 text-sm text-muted">Loading…</p>
            ) : !workToday?.overdueTasks.length ? (
              <p className="px-5 py-6 text-sm text-muted">None overdue.</p>
            ) : (
              <div className="divide-y divide-pine-900/8">
                {workToday.overdueTasks.map((t) => (
                  <Link key={t.id} href={t.href} className="block px-5 py-3 transition-colors hover:bg-cream/50">
                    <p className="truncate text-sm font-semibold text-pine-900">{t.title}</p>
                    {t.contact_name ? (
                      <p className="mt-0.5 truncate text-xs text-muted">{t.contact_name}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="New enquiries"
            hint="Inbound interest waiting for a first look"
            action={
              <Link href="/admin/enquiries" className="text-xs font-semibold text-pine-900 hover:underline">
                All enquiries
              </Link>
            }
          >
            {workLoading ? (
              <p className="px-5 py-4 text-sm text-muted">Loading…</p>
            ) : !workToday?.newEnquiries.length ? (
              <p className="px-5 py-6 text-sm text-muted">Inbox clear.</p>
            ) : (
              <div className="divide-y divide-pine-900/8">
                {workToday.newEnquiries.map((e) => (
                  <Link key={e.id} href={e.href} className="block px-5 py-3 transition-colors hover:bg-cream/50">
                    <p className="truncate text-sm font-semibold text-pine-900">{e.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{e.status || "Needs review"}</p>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-pine-900">Where to work next</h2>
            <InfoTip text="Prospect Finder is outbound research. Enquiries are inbound. Knowledge Hub holds scripts, sectors and objections for preparation. VAs is the freelance partner pipeline." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: PROSPECT_FINDER_LABEL,
                desc: "Research and qualify organisations before outreach",
                href: PROSPECT_FINDER_PATH,
                icon: Search,
              },
              {
                label: "Enquiries",
                desc: "Inbound website and direct interest",
                href: "/admin/enquiries",
                icon: MessageSquare,
              },
              {
                label: "Knowledge Hub",
                desc: "Sectors, pain points, scripts and objections",
                href: "/admin/engagement/knowledge",
                icon: BookOpen,
              },
              {
                label: "VAs",
                desc: "Freelance applications and active talent pool",
                href: "/admin/va-applications",
                icon: Users,
              },
            ].map(({ label, desc, href, icon: Icon }) => (
              <Link
                key={href + label}
                href={href}
                className={`${studio.card} flex items-start gap-3 p-4 transition-colors hover:border-pine-900/25`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine-900 text-paper">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-pine-900">{label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted">{desc}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-pine-900">Content</h2>
            <Link href="/admin/calendar" className="text-xs font-semibold text-pine-900 hover:underline">
              Open Content Hub
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Recent posts"
              action={
                <Link href="/admin/posts" className="text-xs font-semibold text-pine-900 hover:underline">
                  All posts
                </Link>
              }
            >
              {stats.loading ? (
                <p className="px-5 py-6 text-sm text-muted">Loading…</p>
              ) : stats.recentPosts.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">
                  No posts yet.{" "}
                  <Link href="/admin/posts/new" className="font-semibold text-pine-900 underline">
                    Write one
                  </Link>
                </p>
              ) : (
                <div className="divide-y divide-pine-900/8">
                  {stats.recentPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/posts/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/50 sm:px-5"
                    >
                      <span className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-cream ring-1 ring-pine-900/10">
                        {p.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.cover_image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[10px] font-semibold text-muted">
                            Post
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-pine-900">{p.title}</span>
                        <span className="mt-0.5 inline-flex rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold capitalize text-muted">
                          {p.status}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Upcoming on the calendar"
              action={
                <Link href="/admin/calendar" className="inline-flex items-center gap-1 text-xs font-semibold text-pine-900 hover:underline">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar
                </Link>
              }
            >
              {stats.loading ? (
                <p className="px-5 py-6 text-sm text-muted">Loading…</p>
              ) : stats.upcomingPosts.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">
                  Nothing scheduled.{" "}
                  <Link href="/admin/create-content" className="font-semibold text-pine-900 underline">
                    Create content
                  </Link>
                </p>
              ) : (
                <div className="divide-y divide-pine-900/8">
                  {stats.upcomingPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/posts/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/50 sm:px-5"
                    >
                      <span className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-cream ring-1 ring-pine-900/10">
                        {p.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.cover_image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[10px] font-semibold text-muted">
                            {(p.content_type || "").toLowerCase().includes("social") ? "Social" : "Blog"}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-pine-900">{p.title}</span>
                        <span className="text-[10px] text-muted">
                          {(p.content_type || "").toLowerCase().includes("social") ? "Social" : "Blog"}
                          {p.scheduled_at
                            ? ` · ${new Date(p.scheduled_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}`
                            : ""}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/admin/engagement/pipeline"
            className={`${studio.card} flex items-center gap-3 p-4 transition-colors hover:border-pine-900/25`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream text-pine-900">
              <CheckSquare className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-pine-900">Task tracker</p>
              <p className="text-xs text-muted">All follow-ups and work items in one list</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </div>
      </div>
    </div>
  );
}
