"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  content: string;
  maxLines?: number;
  className?: string;
  textClassName?: string;
};

const COLLAPSE_CHAR_THRESHOLD = 280;

export function CollapsibleNote({
  content,
  maxLines = 6,
  className = "",
  textClassName = "text-sm text-[#111111] leading-relaxed",
}: Props) {
  const lineCount = content.split("\n").length;
  const shouldCollapse =
    content.length > COLLAPSE_CHAR_THRESHOLD || lineCount > maxLines;
  const [expanded, setExpanded] = useState(false);

  if (!shouldCollapse) {
    return (
      <p className={`whitespace-pre-wrap ${textClassName} ${className}`}>
        {content}
      </p>
    );
  }

  return (
    <div className={className}>
      <p
        className={`whitespace-pre-wrap ${textClassName} ${
          expanded ? "" : "line-clamp-6"
        }`}
      >
        {content}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#063b32] hover:underline"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}