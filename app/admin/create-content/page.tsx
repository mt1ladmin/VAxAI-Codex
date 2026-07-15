"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { ContentCreateModal } from "@/components/admin/ContentCreateModal";

const BLOG_PROMPTS = [
  "Administration doesn't fix itself: why backlogs build gradually as organisations grow, and how to start clearing one",
  "Before you roll out Microsoft Copilot: how to organise a shared drive so an AI assistant has something reliable to work from",
  "The admin audit nobody wants to do: a practical way to find out where your organisation's time is actually going",
  "Why AI projects inherit your filing system: what disorganised information does to automation, and how to prepare",
  "Grant reporting backlogs: a practical route for charities to catch up without pulling staff away from delivery",
  "What 'AI readiness' actually means in practice: data quality, documented processes and organised information",
  "The hidden cost of routine administration: how inboxes, filing and reporting quietly consume senior leaders' time",
  "A cleared backlog returns unless someone maintains it: why monitoring and data hygiene matter as much as the cleanup",
  "Records, retention and readiness: why public sector transformation usually starts with information management",
  "Documenting processes that live in someone's head: a practical first step before any workflow automation",
];

const LINKEDIN_PROMPTS = [
  "AI projects rarely fail because of the technology. They fail because the information underneath was never organised.",
  "Most organisations don't have an AI problem. They have a filing problem that AI makes visible.",
  "A backlog is not a sign that people aren't working hard enough. It's a sign that demand grew and capacity didn't.",
  "Point an AI assistant at a messy shared drive and you don't get time savings. You get confident answers built on the wrong files.",
  "Before automating a process, write it down. If it can't be documented, it can't be automated.",
  "Senior people spending hours on routine admin isn't dedication. It's an operations gap that nobody has had capacity to fix.",
  "Clean data is not a technical requirement. It's an operational habit, and someone has to own it.",
  "The most valuable AI preparation work looks nothing like AI: organising records, removing duplicates, documenting workflows.",
  "Maintenance is the unglamorous half of transformation. Improvements slip the moment nobody is checking.",
  "The question is not 'can AI do this task?' It's 'is the information behind this task ready for anything to do it?'",
];

const INSTAGRAM_PROMPTS = [
  "Organise the shared drive before you buy the AI tool.",
  "A backlog builds slowly, then all at once. Start with one drawer.",
  "If the process lives in someone's head, it isn't a process yet.",
  "Duplicate files are where good automations go to die.",
  "Your future AI assistant can only be as good as your filing.",
  "Ten minutes of data hygiene a week beats a rescue project a year.",
  "Admin doesn't fix itself. Even with AI.",
  "Write the process down before you automate it.",
  "Clean records first. Clever tools second.",
  "The unglamorous work is the work that makes AI work.",
];

const FACEBOOK_PROMPTS = [
  "That filing backlog everyone avoids: a gentle way to finally start clearing it",
  "The relief of an organised shared drive, and three small habits that keep it that way",
  "Drowning in an inbox that never empties? A practical routine that helps",
  "Why the 'we'll sort the paperwork later' pile keeps growing, and what actually works",
  "One simple weekly habit that stops admin building up again after a big cleanup",
  "For small charities: an easier way to keep volunteer records tidy without extra software",
  "When everyone is too busy for the admin, that's usually the sign it needs help",
  "Before trying an AI tool, try this: tidy the folder it would be reading from",
  "The to-do list isn't the problem. The forty places information lives might be.",
  "A calmer way to handle the end-of-month reporting scramble",
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
            Generate blog posts, LinkedIn, Instagram and Facebook copy grounded in VAxAI&apos;s
            positioning: strong administrative foundations first, AI and automation second. The AI
            understands the four service areas (backlog recovery, AI readiness, ongoing operational
            administration, monitoring and maintenance), writes for the audience your brief implies,
            keeps every example honest and hypothetical, and shapes each piece to its platform.
            Content streams in live, closes with a call to action tailored to the topic, and tags are
            built for both Google and AI search with VAxAI always included.
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#6f6b62]">
            Blog posts include accompanying social copy. You can convert the post directly to a draft
            in your Posts section, and save the social versions to your content calendar with
            scheduled dates.
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
            <p className="mt-2 text-sm leading-relaxed text-[#6f6b62]">Browse practical starting points for blogs, LinkedIn, Instagram and Facebook.</p>
          </button>
          <div className="rounded-xl border border-[#063b32]/15 bg-[#063b32]/5 p-5">
            <p className="text-sm font-semibold text-[#063b32]">A simple way to find an idea</p>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6b62]">
              Start with a real operational pressure: a backlog that keeps growing, a shared drive
              nobody trusts, a process that lives in someone&apos;s head, or an AI tool that
              disappointed because the information behind it wasn&apos;t ready. Then ask what
              practical, human-led work would fix the foundations, and write about that.
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
                ["Facebook Post", FACEBOOK_PROMPTS],
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
