"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  ExternalLink,
  Handshake,
  Search,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Settings,
  X,
} from "lucide-react";
import { AIAssistantContextProvider } from "@/lib/ai-assistant-context";
import { AIAssistantWidget } from "@/components/admin/AIAssistantWidget";
import {
  PROSPECT_FINDER_LABEL,
  PROSPECT_FINDER_PATH,
} from "@/lib/engagement/journey";
import { isPlatformAdmin, type StudioRole } from "@/lib/studio-access";

type NavItem = {
  label: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navSections: Array<{ section: string; items: NavItem[] }> = [
  {
    section: "CLIENT ENGAGEMENT",
    items: [
      { label: "Overview", href: "/admin/engagement", icon: Handshake, subtitle: "Daily work" },
      { label: PROSPECT_FINDER_LABEL, href: PROSPECT_FINDER_PATH, icon: Search, subtitle: "Research & qualify" },
      { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare, subtitle: "Inbound" },
      { label: "Task Tracker", href: "/admin/engagement/pipeline", icon: CheckSquare, subtitle: "All tasks" },
      { label: "Knowledge Hub", href: "/admin/engagement/knowledge", icon: BookOpen, subtitle: "Playbooks & prep" },
    ],
  },
  {
    section: "CONTENT",
    items: [
      { label: "Content Hub", href: "/admin/calendar", icon: CalendarDays },
    ],
  },
];

// Routes that need exact-match active detection (startsWith would over-match)
const exactMatchRoutes = new Set(["/admin", "/admin/engagement"]);

const memberNavSections: Array<{ section: string; items: NavItem[] }> = [
  {
    section: "CLIENT ENGAGEMENT",
    items: [
      { label: "Overview", href: "/admin/engagement", icon: Handshake, subtitle: "Daily work" },
      { label: PROSPECT_FINDER_LABEL, href: PROSPECT_FINDER_PATH, icon: Search, subtitle: "Research & qualify" },
      { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare, subtitle: "Inbound" },
      { label: "Task Tracker", href: "/admin/engagement/pipeline", icon: CheckSquare, subtitle: "All tasks" },
      { label: "Knowledge Hub", href: "/admin/engagement/knowledge", icon: BookOpen, subtitle: "Playbooks & prep" },
    ],
  },
  {
    section: "CONTENT",
    items: [{ label: "Content Hub", href: "/admin/calendar", icon: CalendarDays }],
  },
];

export default function AdminShell({
  children,
  userEmail,
  studioRole,
}: {
  children: React.ReactNode;
  userEmail: string | null;
  studioRole?: StudioRole | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Default: open on desktop, closed on mobile
    setOpen(window.innerWidth >= 768);
  }, []);

  if (pathname === "/admin/login" || pathname === "/admin/forbidden") return <>{children}</>;

  const platformAdmin = studioRole ? isPlatformAdmin(studioRole) : true;
  const sections = platformAdmin ? navSections : memberNavSections;
  const homeHref = "/admin/engagement";

  const isActive = (href: string) =>
    exactMatchRoutes.has(href) ? pathname === href : pathname.startsWith(href);

  const isContentActive = pathname.startsWith("/admin/posts") || pathname.startsWith("/admin/calendar") || pathname.startsWith("/admin/authors");

  const shell = (
    <div className="flex h-screen overflow-hidden bg-[#f7f4ea] font-sans">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — drawer on mobile, inline on desktop */}
      <aside
        className={`flex h-full flex-col bg-[#0a1f18] text-white transition-all duration-200
          fixed inset-y-0 left-0 z-50
          md:relative md:z-auto md:shrink-0
          ${open ? "w-60 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-14"}
        `}
      >
        {/* Logo */}
        <div className={`flex h-14 items-center border-b border-white/10 px-3 ${open ? "justify-between" : "justify-center"}`}>
          {open && (
            <Link href={homeHref} className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f5f274] text-[10px] font-black text-[#0a1f18]">
                VA
              </span>
              <div className="leading-none">
                <span className="block text-sm font-semibold text-white">VAxAI</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">Studio</span>
              </div>
            </Link>
          )}
          {!open && (
            <Link href={homeHref}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f5f274] text-[10px] font-black text-[#0a1f18]">
                VA
              </span>
            </Link>
          )}
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 md:hidden" />
              <PanelLeftClose className="hidden h-4 w-4 md:block" />
            </button>
          )}
        </div>

        {platformAdmin && (
          <div className={`space-y-1 px-3 pt-3 pb-1 ${!open ? "flex flex-col items-center" : ""}`}>
            <Link
              href="/admin/posts/new"
              className={`flex items-center gap-2 rounded-md bg-[#1a5c42] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f6e4f] transition-colors ${
                !open ? "h-8 w-8 justify-center p-0" : "w-full"
              }`}
              title={!open ? "New post" : undefined}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {open && "New post"}
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {sections.map((section) => (
            <div key={section.section} className="mb-4">
              {open && (
                <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  {section.section}
                </p>
              )}
              {section.items.map((item) => {
                const active = section.section === "CONTENT" ? isContentActive : isActive(item.href);
                if (!mounted) {
                  return (
                    <div
                      key={item.href}
                      className={`mb-0.5 flex items-center gap-3 rounded-md px-2 py-2 ${!open ? "justify-center" : ""}`}
                      aria-hidden
                    >
                      <div className="h-4 w-4 shrink-0 rounded bg-white/10" />
                      {open && <div className="h-4 flex-1 max-w-[8rem] rounded bg-white/10" />}
                    </div>
                  );
                }
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
                    {open && (
                      <span className="min-w-0">
                        <span className="block">{item.label}</span>
                        {item.subtitle && (
                          <span className="block text-[10px] font-normal text-white/40">{item.subtitle}</span>
                        )}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-0.5 border-t border-white/10 px-2 py-3">
          {platformAdmin && (
            <>
              <Link
                href="/admin/engagement/settings"
                title={!open ? "Settings" : undefined}
                className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                  pathname.startsWith("/admin/engagement/settings") ? "bg-white/12 font-semibold text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
                } ${!open ? "justify-center" : ""}`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {open && "Settings"}
              </Link>
            </>
          )}
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
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Mobile top bar — always visible, shows hamburger + open sidebar button on desktop */}
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#111111]/10 bg-white px-4 py-2 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-md border border-[#111111]/15 text-[#063b32]"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#063b32] text-[9px] font-black text-[#f5f274]">VA</span>
            <span className="text-sm font-semibold text-[#111111]">VAxAI Studio</span>
          </Link>
        </div>

        {/* Desktop open sidebar button */}
        {!open && (
          <div className="hidden px-4 pt-2 md:block">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[#111111]/15 bg-white px-2.5 py-1 text-xs font-medium text-[#063b32] hover:bg-[#f7f4ea]"
              title="Open sidebar"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" />
              Open sidebar
            </button>
          </div>
        )}

        {(pathname === "/admin/calendar" || pathname === "/admin/posts" || pathname === "/admin/authors" || pathname === "/admin/create-content") && (
          <div className="sticky top-[41px] z-20 border-b border-[#111111]/10 bg-white px-4 py-3 md:top-0 md:px-8">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-[#111111]">Content Hub</span>
              <div className="flex overflow-x-auto overflow-y-hidden rounded-lg border border-[#111111]/15 scrollbar-none">
                <Link
                  href="/admin/calendar"
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold ${
                    pathname.startsWith("/admin/calendar")
                      ? "bg-[#063b32] text-white"
                      : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  Calendar
                </Link>
                <Link
                  href="/admin/create-content"
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold ${
                    pathname.startsWith("/admin/create-content")
                      ? "bg-[#063b32] text-white"
                      : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  Create
                </Link>
                <Link
                  href="/admin/posts"
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold ${
                    pathname.startsWith("/admin/posts")
                      ? "bg-[#063b32] text-white"
                      : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  Posts
                </Link>
                <Link
                  href="/admin/authors"
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold ${
                    pathname.startsWith("/admin/authors")
                      ? "bg-[#063b32] text-white"
                      : "text-[#6f6b62] hover:bg-[#f7f4ea]"
                  }`}
                >
                  Authors
                </Link>
              </div>
            </div>
          </div>
        )}

        {children}
      </main>
      <AIAssistantWidget />
    </div>
  );

  return <AIAssistantContextProvider>{shell}</AIAssistantContextProvider>;
}
