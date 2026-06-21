"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      {/* Bar */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-gray-100">
        <div
          className="h-full bg-[#063b32] transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Percentage badge */}
      {progress > 5 && progress < 99 && (
        <div className="fixed bottom-6 right-6 z-40 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-md">
          {Math.round(progress)}% read
        </div>
      )}
    </>
  );
}
