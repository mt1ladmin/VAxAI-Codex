"use client";

import { useState } from "react";

const INITIAL_LIMIT = 6;

export default function PostTags({ tags }: { tags: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) return null;

  const visible = expanded ? tags : tags.slice(0, INITIAL_LIMIT);
  const overflow = tags.length - INITIAL_LIMIT;

  return (
    <div className="mt-10 flex flex-wrap gap-2">
      {visible.map((tag) => (
        <span key={tag} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
          {tag}
        </span>
      ))}
      {!expanded && overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full border border-gray-100 px-3 py-1 text-xs font-medium text-gray-400 hover:border-gray-200 hover:text-gray-500"
        >
          +{overflow} more
        </button>
      )}
      {expanded && overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-full border border-gray-100 px-3 py-1 text-xs font-medium text-gray-400 hover:border-gray-200 hover:text-gray-500"
        >
          Show less
        </button>
      )}
    </div>
  );
}
