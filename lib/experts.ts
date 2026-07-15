export type Expert = {
  slug: string;
  name: string;
  role: string;
  copy: string;
  photo: string;
  linkedin: string;
  metaTitle: string;
  metaDescription: string;
  showMt1lLink?: boolean;
  showStartConversation?: boolean;
};

export const experts: Expert[] = [
  {
    slug: "thesia-kouloungou",
    name: "Thesia Kouloungou",
    role: "Founder, MT1L and VAxAI",
    copy: `Hi, I'm Thesia.

I work with founders, SMEs, charities and public sector organisations to understand where administrative pressure is building, what is slowing work down, and what practical support is needed to create stronger operational foundations.

My understanding comes from experiencing administration from every angle. Early in my career, I worked in administrative roles supporting both growing and established organisations, including one of the UK's largest community funders, where I gained first-hand insight into operational administration, evolving systems, digital transformation and the realities of managing administrative backlogs.

As my career progressed into leadership roles, I experienced the hidden cost of administration from a different perspective-seeing how easily routine operational work can take senior leaders away from strategic thinking, decision-making and the work only they can do.

When I founded MT1L, I embraced AI early. I quickly discovered that while AI accelerates work, it also increases the amount of information that needs reviewing, organising and maintaining.

That's why I never start with "What can AI do?"

AI can make a disorganised foundation look more organised, but it cannot fix the underlying issues. A poorly structured process or outdated document remains a problem, even when technology makes it easier to access.

Real value comes from creating strong administrative foundations first. My role is to help organisations understand what needs to be in place, prepare for AI and automation, and work with our team to build and maintain the systems, processes and support needed for lasting results.`,
    photo: "/thesia-profile.jpg",
    linkedin:
      "https://www.linkedin.com/in/thesia-nkoula?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    metaTitle: "Thesia Kouloungou",
    metaDescription:
      "Meet Thesia Kouloungou, Founder of MT1L and VAxAI, leading Admin Review, workflow support and practical AI, automation and human support for UK organisations.",
    showMt1lLink: true,
  },
  {
    slug: "rebecca-bradshaw",
    name: "Rebecca Bradshaw",
    role: "Co-founder and VA Operations Lead",
    copy: `Hi, I'm Rebecca.

I lead the virtual assistance side of VAxAI, helping clients put the right human support around the work that still requires organisation, judgement and follow-through.

My experience spans hospitality, travel, aviation and engineering, working across operations, administration and executive support in fast-paced environments.

This has given me a practical understanding of the systems, organisation and day-to-day coordination needed to keep businesses running smoothly.

My role is to support ongoing delivery by keeping tasks, follow-ups and processes moving, helping maintain organised systems, and ensuring that any improvements or automations continue to work effectively in practice.

Where additional capacity is needed, I also support the recruitment, vetting and onboarding of trusted virtual assistants who can provide reliable administrative support tailored to each client's needs.`,
    photo: "/rebecca-bradshaw.jpg",
    linkedin:
      "https://www.linkedin.com/in/rebecca-louise-101b60343?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    metaTitle: "Rebecca Bradshaw",
    metaDescription:
      "Meet Rebecca Bradshaw, Co-founder and VA Operations Lead at VAxAI, providing practical virtual assistance and operational support for UK clients.",
    showStartConversation: true,
  },
];

