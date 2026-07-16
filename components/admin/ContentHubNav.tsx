"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/calendar", label: "Calendar", title: "Schedule posts & social" },
  { href: "/admin/create-content", label: "Create", title: "Draft with AI" },
  { href: "/admin/posts", label: "Posts", title: "All blog posts" },
  { href: "/admin/authors", label: "Authors", title: "Byline profiles" },
  { href: "/admin/newsletter", label: "Newsletter", title: "Subscribers" },
] as const;

/**
 * Content Hub section tabs — same filing-tab pattern as Knowledge Hub
 * (side by side, grey idle, light green when selected). Scrolls on narrow screens.
 */
export function ContentHubNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      aria-label="Content Hub sections"
      className={`-mx-1 flex max-w-full flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain border-b border-[#d5d8d1] px-1 pb-0 scrollbar-none [-webkit-overflow-scrolling:touch] md:flex-wrap md:overflow-visible ${className}`}
    >
      {TABS.map(({ href, label, title }) => {
        const active =
          href === "/admin/posts"
            ? pathname === "/admin/posts" || pathname.startsWith("/admin/posts/")
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            title={title}
            role="tab"
            aria-selected={active}
            className={`filing-tab-button shrink-0 touch-manipulation text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-800 max-md:min-h-11 max-md:px-3.5 max-md:py-2.5 ${
              active ? "is-active" : ""
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
