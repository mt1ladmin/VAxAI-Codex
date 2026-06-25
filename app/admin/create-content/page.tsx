"use client";

import { useState } from "react";
import { ContentCreateModal } from "@/components/admin/ContentCreateModal";

const BLOG_PROMPTS = [
  "How small charities can review their existing admin systems to find where AI and automation could save the most time — and what to consider before making any changes",
  "What AI and automation training actually looks like for non-technical teams in UK social enterprises — and why the learning curve is shorter than most people think",
  "The case for a virtual assistant in a growing professional services firm: what to delegate, how to brief them, and what good looks like",
  "Why reviewing your current systems before adopting AI is the step most organisations skip — and what it costs them",
  "How to use the MT1L VAT framework to decide whether AI, automation, or virtual admin support is the right fit for your organisation right now",
  "Five signs your admin systems are holding your mission back — and what to do about each one",
];

const LINKEDIN_PROMPTS = [
  "The value of reviewing your current admin systems before jumping to AI — what you'll learn that no vendor demo can tell you",
  "What genuine alignment looks like when you're adopting AI in a mission-driven organisation — and why it matters more than efficiency",
  "Why building trust with your team before implementing automation is the step most leaders skip",
  "How a virtual assistant changes the shape of your week — not just by doing tasks, but by thinking ahead",
  "AI and automation training that sticks: what it actually takes to help a small team feel confident with new tools",
  "Before asking 'which AI tool should we use', ask 'what are we actually trying to fix' — the MT1L VAT framework explained simply",
];

const INSTAGRAM_PROMPTS = [
  "The moment you realise your systems are holding you back more than your workload is",
  "A good VA doesn't just tick boxes — they think ahead so you don't have to",
  "AI training isn't about the tools. It's about helping your team feel confident with something new",
  "Before asking what AI to use — ask what you're actually trying to fix",
  "When your admin finally reflects how your organisation actually works",
  "Small team reminder: you don't have to figure out automation alone",
];

export default function CreateContentPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <div className="max-w-2xl">
        {/* Intro */}
        <div className="rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/60 px-6 py-5 space-y-3">
          <p className="text-sm font-semibold text-[#111111]">Create on-brand content using AI</p>
          <p className="text-sm text-[#6f6b62]">
            Generate blog posts, LinkedIn posts, and Instagram captions grounded in VAxAI&apos;s full offer — virtual administration, AI and automation support, system reviews, and training. The AI applies the MT1L VAT framework (Value, Alignment, Trust) as a lens throughout, embedding it naturally where it strengthens the content and referencing MT1L.com where advisory context is relevant.
          </p>
          <p className="text-sm text-[#6f6b62]">
            Blog posts include accompanying LinkedIn and Instagram copy. You can convert the post directly to a draft in your Posts section, and save the social versions to your content calendar with scheduled dates.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-[#063b32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            + Create content
          </button>
        </div>

        {/* Example prompts */}
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Example prompts</p>
          <div className="space-y-3">

            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <div className="bg-[#f7f4ea] px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Blog Post</p>
              </div>
              <ul className="divide-y divide-[#111111]/5">
                {BLOG_PROMPTS.map((prompt) => (
                  <li key={prompt} className="px-4 py-3 text-sm text-[#111111] leading-relaxed">{prompt}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <div className="bg-[#f7f4ea] px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">LinkedIn Post</p>
              </div>
              <ul className="divide-y divide-[#111111]/5">
                {LINKEDIN_PROMPTS.map((prompt) => (
                  <li key={prompt} className="px-4 py-3 text-sm text-[#111111] leading-relaxed">{prompt}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
              <div className="bg-[#f7f4ea] px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">Instagram Post</p>
              </div>
              <ul className="divide-y divide-[#111111]/5">
                {INSTAGRAM_PROMPTS.map((prompt) => (
                  <li key={prompt} className="px-4 py-3 text-sm text-[#111111] leading-relaxed">{prompt}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      <ContentCreateModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
