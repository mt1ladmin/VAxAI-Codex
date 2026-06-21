"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref = "/insights", label = "Back to Insights" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
