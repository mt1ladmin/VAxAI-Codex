"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress({ contentId }: { contentId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(contentId);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const elTop = rect.top + window.scrollY;
      const elHeight = el.offsetHeight;

      // How far into the content have we scrolled (viewport top reaching end of element)
      const scrolled = window.scrollY + window.innerHeight - elTop;
      const total = elHeight;

      const pct = total > 0 ? Math.max(0, Math.min((scrolled / total) * 100, 100)) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [contentId]);

  return (
    <>
      {/* Progress bar — sits below the site nav (top-[52px] accounts for nav height) */}
      <div className="fixed left-0 top-[52px] z-40 h-0.5 w-full bg-gray-100">
        <div
          className="h-full bg-[#122428] transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage badge */}
      {progress > 3 && progress < 98 && (
        <div className="fixed bottom-6 right-6 z-40 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-gray-500 shadow-md">
          {Math.round(progress)}%
        </div>
      )}
    </>
  );
}
