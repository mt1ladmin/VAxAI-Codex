"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { ContentCreateModal } from "@/components/admin/ContentCreateModal";

const BLOG_PROMPTS = [
  "Your team is busy, but is admin the real problem? How to tell whether you need better processes, automation or more human support",
  "What should you automate first? A practical way for small organisations to identify the tasks worth changing",
  "When automation creates more work: five warning signs that a process is not ready for AI",
  "A virtual assistant, an AI tool or both? How to choose the right support for the work that keeps piling up",
  "Why your team keeps avoiding the new system—and what that may be telling you about the system itself",
  "The hidden cost of workarounds: how spreadsheets, inboxes and informal processes quietly drain your team's time",
  "What happens after the AI demonstration? The practical work needed to make a new tool useful in everyday operations",
  "Should this task be automated at all? A Value, Alignment and Trust checklist for small teams",
  "From “we need AI” to a clearer problem: how to define what your organisation is actually trying to improve",
  "What good virtual assistance looks like when the work cannot be reduced to a task list",
];

const LINKEDIN_PROMPTS = [
  "Not every repetitive task should be automated. Some are repetitive because the process itself needs fixing.",
  "“We need AI” is often the proposed solution—not the original problem.",
  "The best place to find an automation opportunity may be the task your team has quietly created three workarounds for.",
  "If a new system only works when one person remembers every step, it is not really a system.",
  "A virtual assistant should not become another person you have to chase. Good support reduces the need to remember, follow up and hold everything together.",
  "Teams do not resist change only because they fear technology. Sometimes they can see problems the decision-makers have missed.",
  "Saving five minutes on a task means little if the new process creates uncertainty, duplication or extra checking.",
  "Before automating a process, ask the person who actually does the work what makes it difficult.",
  "The question is not simply, “Can AI do this?” It is, “What happens to the work, the people and the outcome if it does?”",
  "Sometimes the most useful AI decision is deciding not to introduce another tool.",
];

const INSTAGRAM_PROMPTS = [
  "You may not need another tool. You may need a clearer process.",
  "Repetitive does not always mean ready to automate.",
  "A system that depends on memory is not a system.",
  "Start with the task everyone avoids.",
  "Good support should reduce follow-up—not create more of it.",
  "The workaround is often where the real problem is hiding.",
  "Automate the right work, not simply the easiest work.",
  "Ask the person doing the task before changing the task.",
  "Sometimes the best automation decision is “not yet.”",
  "Less admin is good. Better admin is the goal.",
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
            Generate blog posts, LinkedIn posts, and Instagram captions grounded in VAxAI&apos;s full offer — virtual administration, AI and automation support, system reviews, and training. The AI applies the MT1L VAT framework (Value, Alignment, Trust) as a lens throughout, and every piece leads its call to action with how VAxAI could help — tailored to the content generated, including in the connected social posts — before any secondary MT1L.com reference. Tags are built for both Google and AI search, and always include the MT1L, VAT Framework, and VAxAI core tags so posts connect across the main page.
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-2xl">
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
              Start with an admin frustration, workaround or task people avoid. Ask whether a VA, AI or automation could help—or make things worse—then explore the value, fit and trust behind the decision.
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
