"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ExternalLink,
  FileText,
  Handshake,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  Search,
  Settings,
  Users,
  Zap,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const navSections: Array<{ section: string; items: NavItem[] }> = [
  {
    section: "ENQUIRIES",
    items: [{ label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare }],
  },
  {
    section: "CONTENT",
    items: [
      { label: "Posts", href: "/admin/posts", icon: FileText },
      { label: "Content Calendar", href: "/admin/calendar", icon: CalendarDays },
    ],
  },
  {
    section: "CLIENT ENGAGEMENT",
    items: [
      { label: "Overview", href: "/admin/engagement", icon: Handshake },
      { label: "Profile Explorer", href: "/admin/engagement/profile-explorer", icon: Search },
      { label: "Pain Points", href: "/admin/engagement/pain-points", icon: Zap },
      { label: "Live Call Assist", href: "/admin/engagement/live-call", icon: Phone },
      { label: "Pipeline & CRM", href: "/admin/engagement/pipeline", icon: Users },
      { label: "Knowledge Library", href: "/admin/engagement/knowledge", icon: BookOpen },
      { label: "Insights", href: "/admin/engagement/insights", icon: BarChart3 },
      { label: "Settings", href: "/admin/engagement/settings", icon: Settings },
    ],
  },
];

export default function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f4ea] font-sans">
      {/* Sidebar */}
      <aside
        className={`flex h-full shrink-0 flex-col bg-[#0a1f18] text-white transition-all duration-200 ${
          open ? "w-60" : "w-14"
        }`}
      >
        {/* Logo */}
        <div className={`flex h-14 items-center border-b border-white/10 px-3 ${open ? "justify-between" : "justify-center"}`}>
          {open && (
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f5f274] text-[10px] font-black text-[#0a1f18]">
                VA
              </span>
              <div className="leading-none">
                <span className="block text-sm font-semibold text-white">VAxAI</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">Studio</span>
              </div>
            </div>
          )}
          {!open && (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f5f274] text-[10px] font-black text-[#0a1f18]">
              VA
            </span>
          )}
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-white"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* New post */}
        <div className={`px-3 pt-3 pb-1 ${!open ? "flex justify-center" : ""}`}>
          <Link
            href="/admin/posts/new"
            className={`flex items-center gap-2 rounded-md bg-[#1a5c42] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f6e4f] ${
              !open ? "h-8 w-8 justify-center p-0" : "w-full"
            }`}
            title={!open ? "New post" : undefined}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {open && "New post"}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {navSections.map((section) => (
            <div key={section.section} className="mb-4">
              {open && (
                <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  {section.section}
                </p>
              )}
              {section.items.map((item) => {
                const active = item.href === "/admin/engagement"
                  ? pathname === "/admin/engagement"
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!open ? item.label : undefined}
                    className={`mb-0.5 flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                      active ? "bg-white/12 font-semibold text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
                    } ${!open ? "justify-center" : ""}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {open && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-0.5 border-t border-white/10 px-2 py-3">
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="mb-2 flex w-full items-center justify-center rounded-md py-2 text-white/40 hover:bg-white/10 hover:text-white"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <Link
            href="/admin/authors"
            title={!open ? "Authors" : undefined}
            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
              pathname.startsWith("/admin/authors") ? "bg-white/12 font-semibold text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
            } ${!open ? "justify-center" : ""}`}
          >
            <Users className="h-4 w-4 shrink-0" />
            {open && "Authors"}
          </Link>
          <a
            href="/"
            target="_blank"
            title={!open ? "View site" : undefined}
            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white/60 hover:bg-white/8 hover:text-white ${!open ? "justify-center" : ""}`}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {open && "View site"}
          </a>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              title={!open ? "Sign out" : undefined}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-white/60 hover:bg-white/8 hover:text-white ${!open ? "justify-center" : ""}`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {open && "Sign out"}
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
