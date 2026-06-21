"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function SimplifiedModeToggle() {
  const [simplified, setSimplified] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vaxai-simplified") === "true";
    setSimplified(saved);
    if (saved) document.documentElement.classList.add("simplified-mode");
  }, []);

  const toggle = () => {
    const next = !simplified;
    setSimplified(next);
    localStorage.setItem("vaxai-simplified", String(next));
    document.documentElement.classList.toggle("simplified-mode", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`simplified-toggle fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_14px_35px_rgba(17,17,17,0.18)] transition ${
        simplified ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-800"
      }`}
      aria-pressed={simplified}
      aria-label={simplified ? "Turn full colour mode back on" : "Turn simplified black and white mode on"}
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span className="hidden sm:inline">{simplified ? "Show colour" : "Simplified mode"}</span>
    </button>
  );
}
