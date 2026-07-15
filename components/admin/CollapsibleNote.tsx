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

function ToggleBar({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#111111]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#122428] transition-colors hover:border-[#122428]/25 hover:bg-[#122428]/5"
    >
      <ChevronDown
        className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
      {expanded ? "Show less" : "Show more"}
    </button>
  );
}

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

  const toggle = () => setExpanded((open) => !open);

  return (
    <div className={`space-y-2 ${className}`}>
      <p
        className={`whitespace-pre-wrap ${textClassName} ${
          expanded ? "" : "line-clamp-6"
        }`}
      >
        {content}
      </p>
      <ToggleBar expanded={expanded} onToggle={toggle} />
    </div>
  );
}
