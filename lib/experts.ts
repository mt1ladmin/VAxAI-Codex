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
    copy: "Hi, I’m Thesia. I lead our AI consultations and workflow reviews, using the VAT Framework™ (Value, Alignment & Trust) which I developed to help clients decide where AI, automation, better processes, or human support will create the most value. My experience spans the charity, public, education, and grant-making sectors, where I have led work across inclusion, safeguarding, co-production, governance, and organisational change. I have built AI-enabled platforms and bring extensive hands-on experience using a wide range of AI and automation tools to solve real business challenges. I approach this from a practical angle — translating complex ideas into simple, usable solutions that fit your existing tools and ways of working. My role is to understand how work is currently happening, identify where pressure is building, and help you make confident decisions about what should change, what should stay human, and what needs to be in place for any solution to succeed in practice.",
    photo: "/thesia-profile.jpg",
    linkedin:
      "https://www.linkedin.com/in/thesia-nkoula?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    metaTitle: "Thesia Kouloungou",
    metaDescription:
      "Meet Thesia Kouloungou, Founder and CEO of MT1L and VAxAI, leading AI consultations, workflow reviews and practical support for UK organisations.",
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