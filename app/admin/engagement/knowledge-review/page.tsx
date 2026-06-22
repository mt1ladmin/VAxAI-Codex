"use client";

import { KnowledgeReviewContent } from "./knowledge-review-content";

export default function KnowledgeReviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Client Engagement</p>
        <h1 className="mt-0.5 text-2xl font-semibold text-[#111111]">Knowledge Review</h1>
        <p className="mt-1 text-sm text-[#6f6b62]">Review AI-generated draft pain points before they enter the knowledge library.</p>
      </div>
      <div className="px-8 py-6">
        <KnowledgeReviewContent />
      </div>
    </div>
  );
}