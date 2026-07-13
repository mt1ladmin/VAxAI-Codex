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
    role: "Founder and CEO, MT1L and VAxAI",
    copy: "Hi, I’m Thesia. I lead our Admin Review process, helping founders, small and medium-sized businesses (SMEs) and charities uncover where administrative pressure is building, how work is flowing across their organisation, and what support is needed for people to do their best work. My experience spans the charity, public, education and grant-making sectors, where I have led work across inclusion, safeguarding, co-production, governance and organisational change. That experience means I don’t start by asking what AI can do. I start by understanding the reality of your work, your people and your priorities. As the founder of MT1L and creator of the VAT Framework™ (Value • Alignment • Trust), I believe AI should only be introduced where it creates genuine value, aligns with the way people work and can be trusted by the people using it. My role is to help you make confident decisions about where AI and automation can genuinely reduce administrative burden, where human support remains essential, and how to create an approach that is practical, sustainable and tailored to your needs.",
    photo: "/thesia-profile.jpg",
    linkedin:
      "https://www.linkedin.com/in/thesia-nkoula?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    metaTitle: "Thesia Kouloungou",
    metaDescription:
      "Meet Thesia Kouloungou, Founder and CEO of MT1L and VAxAI, leading Admin Review, workflow support and practical AI, automation and human support for UK organisations.",
    showMt1lLink: true,
  },
  {
    slug: "rebecca-bradshaw",
    name: "Rebecca Bradshaw",
    role: "Co-founder and VA Operations Lead",
    copy: "Hi, I’m Rebecca. I lead the virtual assistance side of VAxAI, helping clients put the right human support around the work that should not be left to AI or automation. My experience spans the hospitality, travel, aviation and engineering sectors, working across operations, administration and executive support in fast-paced environments. This gives me a practical understanding of the systems, organisation and day-to-day operational support needed to keep businesses running smoothly. My role is to keep tasks, follow-ups and processes moving, support day-to-day delivery, and make sure any systems or automations continue to work as intended. Where additional capacity is needed, I also support the recruitment, vetting and onboarding of trusted virtual assistants.",
    photo: "/rebecca-bradshaw.jpg",
    linkedin:
      "https://www.linkedin.com/in/rebecca-louise-101b60343?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    metaTitle: "Rebecca Bradshaw",
    metaDescription:
      "Meet Rebecca Bradshaw, Co-founder and VA Operations Lead at VAxAI, providing practical virtual assistance and operational support for UK clients.",
    showStartConversation: true,
  },
];

export function getExpert(slug: string): Expert | undefined {
  return experts.find((expert) => expert.slug === slug);
}

export const expertPaths = experts.map((expert) => `/about/${expert.slug}`);