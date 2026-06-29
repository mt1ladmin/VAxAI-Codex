"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
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
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Intro */}
        <div className="space-y-4 rounded-xl border border-[#111111]/10 bg-[#f7f4ea]/60 px-8 py-8 text-center">
          <p className="text-lg font-semibold text-[#111111]">Create on-brand content using AI</p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#6f6b62]">
            Generate blog posts, LinkedIn posts, and Instagram captions grounded in VAxAI&apos;s full offer — virtual administration, AI and automation support, system reviews, and training. The AI applies the MT1L VAT framework (Value, Alignment, Trust) as a lens throughout, embedding it naturally where it strengthens the content and referencing MT1L.com where advisory context is relevant.
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#6f6b62]">
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => setShowExamples(true)} className="rounded-xl border border-[#111111]/10 p-5 text-left transition-colors hover:border-[#063b32]/25 hover:bg-[#f7f4ea]/40">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#063b32]" />
              <p className="text-sm font-semibold text-[#111111]">Review example prompts</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6b62]">Browse practical starting points for blogs, LinkedIn, and Instagram.</p>
          </button>
          <div className="rounded-xl border border-[#063b32]/15 bg-[#063b32]/5 p-5">
            <p className="text-sm font-semibold text-[#063b32]">A simple way to find an idea</p>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6b62]">
              Think of a relevant admin issue, where AI, automation or a VA could—or should not—help, then ask how the change creates value, aligns with how people work, and builds trust.
            </p>
          </div>
        </div>
      </div>

      <ContentCreateModal open={open} onClose={() => setOpen(false)} />

      {showExamples && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowExamples(false)} role="presentation">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#111111]/10 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="example-prompts-title">
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <div>
                <h2 id="example-prompts-title" className="text-base font-semibold text-[#111111]">Example prompts</h2>
                <p className="mt-0.5 text-xs text-[#6f6b62]">Use these as inspiration, then adapt them to the situation you want to explore.</p>
              </div>
              <button type="button" onClick={() => setShowExamples(false)} className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]" aria-label="Close examples">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {([
                ["Blog Post", BLOG_PROMPTS],
                ["LinkedIn Post", LINKEDIN_PROMPTS],
                ["Instagram Post", INSTAGRAM_PROMPTS],
              ] as [string, string[]][]).map(([label, prompts]) => (
                <section key={label} className="overflow-hidden rounded-xl border border-[#111111]/10">
                  <div className="bg-[#f7f4ea] px-4 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">{label}</p></div>
                  <ul className="divide-y divide-[#111111]/5">
                    {prompts.map((prompt) => <li key={prompt} className="px-4 py-3 text-sm leading-relaxed text-[#111111]">{prompt}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
