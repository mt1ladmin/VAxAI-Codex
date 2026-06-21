"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  content_type: string;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7; // Mon=0
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function getWeekDays(anchor: Date): Date[] {
  const dow = (anchor.getDay() + 6) % 7;
  const mon = new Date(anchor);
  mon.setDate(anchor.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week">("month");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [weekAnchor, setWeekAnchor] = useState(today);

  useEffect(() => {
    fetch("/api/admin/posts").then((r) => r.json()).then((j: { data: Post[] }) => {
      setPosts(j.data ?? []);
      setLoading(false);
    });
  }, []);

  function postsOnDay(day: Date) {
    return posts.filter((p) => {
      const dateStr = p.published_at ?? p.updated_at;
      return isSameDay(new Date(dateStr), day);
    });
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const prevWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); };
  const nextWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); };

  const monthDays = getMonthDays(year, month);
  const weekDays = getWeekDays(weekAnchor);

  return (
    <div className="min-h-screen bg-[#f7f4ea]">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Content Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-[#111111]/15 bg-white text-sm font-semibold">
              <button onClick={() => setView("month")} className={`px-4 py-2 ${view === "month" ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"}`}>Month</button>
              <button onClick={() => setView("week")} className={`px-4 py-2 ${view === "week" ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"}`}>Week</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Nav */}
        <div className="mb-5 flex items-center gap-4">
          <button onClick={view === "month" ? prevMonth : prevWeek} className="grid h-8 w-8 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="min-w-[180px] text-center text-base font-semibold text-[#111111]">
            {view === "month"
              ? `${MONTHS[month]} ${year}`
              : `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`}
          </h2>
          <button onClick={view === "month" ? nextMonth : nextWeek} className="grid h-8 w-8 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#6f6b62] hover:bg-[#f7f4ea]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setWeekAnchor(today); }}
            className="ml-2 rounded-md border border-[#111111]/15 bg-white px-3 py-1.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
            Today
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : view === "month" ? (
          <div className="overflow-hidden rounded-md border border-[#111111]/10 bg-white">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[#111111]/10">
              {DAYS.map((d) => (
                <div key={d} className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {monthDays.map((day, i) => {
                const dayPosts = day ? postsOnDay(day) : [];
                const isToday = day && isSameDay(day, today);
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border-b border-r border-[#111111]/8 p-2 last-row:border-b-0 ${!day ? "bg-[#f7f4ea]/50" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${isToday ? "bg-[#063b32] text-white" : "text-[#6f6b62]"}`}>
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayPosts.map((p) => (
                            <Link key={p.id} href={`/admin/posts/${p.id}`}
                              className={`block truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${
                                p.status === "published"
                                  ? "bg-[#063b32]/10 text-[#063b32] hover:bg-[#063b32]/20"
                                  : "bg-[#f5f274]/60 text-[#6f6b62] hover:bg-[#f5f274]"
                              }`}>
                              {p.title || "Untitled"}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Week view */
          <div className="overflow-hidden rounded-md border border-[#111111]/10 bg-white">
            <div className="grid grid-cols-7 divide-x divide-[#111111]/8">
              {weekDays.map((day) => {
                const dayPosts = postsOnDay(day);
                const isToday = isSameDay(day, today);
                return (
                  <div key={day.toISOString()} className="min-h-[300px]">
                    <div className={`border-b border-[#111111]/10 px-3 py-3 text-center ${isToday ? "bg-[#063b32]" : ""}`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${isToday ? "text-[#f5f274]" : "text-[#6f6b62]"}`}>
                        {DAYS[(day.getDay() + 6) % 7]}
                      </p>
                      <p className={`mt-0.5 text-xl font-semibold ${isToday ? "text-white" : "text-[#111111]"}`}>
                        {day.getDate()}
                      </p>
                    </div>
                    <div className="space-y-1.5 p-2">
                      {dayPosts.map((p) => (
                        <Link key={p.id} href={`/admin/posts/${p.id}`}
                          className={`block rounded px-2 py-1.5 text-xs font-semibold leading-snug ${
                            p.status === "published"
                              ? "bg-[#063b32]/10 text-[#063b32] hover:bg-[#063b32]/15"
                              : "bg-[#f5f274]/60 text-[#6f6b62] hover:bg-[#f5f274]"
                          }`}>
                          {p.title || "Untitled"}
                          <span className="mt-0.5 block text-[9px] font-normal opacity-70">{p.content_type}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-[#6f6b62]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#063b32]/20" /> Published
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f5f274]" /> Draft
          </span>
          <span className="ml-auto text-[10px]">Dates shown are publish date (or last edited for drafts)</span>
        </div>
      </div>
    </div>
  );
}
