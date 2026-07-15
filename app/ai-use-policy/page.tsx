import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "AI Use Policy | VAxAI",
  description: "How VAxAI uses AI — transparently, deliberately and with human judgement at the centre.",
};

export default function AiUsePolicyPage() {
  return (
    <PolicyPage title="AI Use Policy" lastUpdated="July 2026">
      <div className="callout">
        VAxAI is a service provided by MT1L. VAxAI helps organisations reduce administrative pressure and prepare for AI and automation with people in the loop. MT1L&rsquo;s VAT Framework asks whether a change creates genuine Value, fits the organisation (Alignment) and can be Trusted by the people affected. We hold our own use of AI to the same standard. This policy explains, in plain English, where we use AI, how it works and how we keep human judgement at the centre.
      </div>

      <h2>Our approach</h2>
      <p>
        We use AI deliberately rather than by default. Strong administrative foundations come first: organised information, reliable data and clear processes. AI supports that work; it does not replace it. Wherever we can, we keep our use proportionate — choosing AI where it adds genuine value to our work and our clients, and leaving it out where it does not.
      </p>
      <p>
        We are open about where we use it, and we never require anyone else to use it to work with us. A fully human route is always available at every stage.
      </p>

      <h2>Where we use AI</h2>
      <p>We use AI in a small number of clearly defined ways:</p>
      <ul>
        <li>
          <strong>Service delivery and readiness work.</strong> AI helps us analyse information, organise material, surface considerations across Value, Alignment and Trust, and sense-check thinking we have already developed during Admin Reviews, project work and ongoing support. A person always reviews, adjusts and takes responsibility for the final output.
        </li>
        <li>
          <strong>Drafting and editing.</strong> We use AI to help draft, edit and structure text — for example, tidying wording, checking for clarity, or shaping a first draft that we then review and own. We do not use AI to generate ideas we have not worked through ourselves first. A person always reviews and owns what goes out.
        </li>
        <li>
          <strong>Everyday administration.</strong> We use AI to support routine administrative tasks — summarising, organising, preparing materials — so more time is available for the work that genuinely needs human attention.
        </li>
        <li>
          <strong>Internal tools and this website.</strong> We may use AI to help design internal workflows and digital tools that support delivery, always alongside, not instead of, human decision-making. We do not build complex or enterprise AI systems for clients ourselves; where that is needed, we can work with trusted external partners on your behalf.
        </li>
        <li>
          <strong>Freelance partner coordination.</strong> Where people apply to work with VAxAI as freelancers, we may use AI tools inside VAxAI Studio to help our team organise applications, draft internal notes or suggest possible matches to client work. A person always decides who to contact and who is engaged. We do not use automated decision-making alone to accept or reject applications.
        </li>
      </ul>

      <h2>A person is always responsible</h2>
      <p>
        We do not use AI to make decisions about you or your organisation. Every piece of work we deliver is reviewed, shaped and owned by a member of our team. AI handles tasks that do not require human judgement so that more human attention is available for the things that do. Responsibility for what we produce always sits with a person.
      </p>
      <p>
        AI output is assistive, not authoritative. It is a starting point to sharpen thinking — not a decision, recommendation, or professional, legal or financial advice. We review what AI produces, apply our own judgement and evidence, and involve the right people before acting or sharing with clients.
      </p>

      <h2>A considered, transparent approach</h2>
      <p>
        The VAT Framework recognises that trust has to be earned, and that not everyone trusts AI in the same way. We are open about where we use it, and we never require anyone to use it to work with us.
      </p>
      <p>
        Part of our longer-term thinking is to stay conscious of dependency. We aim to design our tools and ways of working so they are sustainable and can stand on their own, keeping a clear view of the non-AI way of doing things. That way the value of our work continues whatever happens with any single technology, and AI strengthens what we do rather than becoming the only way we can do it.
      </p>

      <h2>Your choice about AI</h2>
      <p>
        We do not have a view on whether you use AI yourself. We do not require you to interact with any AI tool to work with us, and a fully human route is always available — you can work with our team directly at every stage.
      </p>
      <p>
        We recognise that people have different relationships with AI: some embrace it, some are cautious, some have principled objections, and some face practical barriers to access. All of those positions are reasonable. Our role is to help organisations make informed, considered decisions about AI and automation — including when the better answer is stronger foundations, clearer processes or human support rather than a new tool.
      </p>

      <h2>How it works</h2>
      <p>
        Where AI is used in our work, the text or data involved is sent to an established third-party AI service to generate a response or output. We design the prompts and structure the process; the AI assists within that structure, and we review what it produces.
      </p>
      <p>
        We work with AI providers whose terms do not permit them to use API inputs or outputs to train their models. We do not enter personal, confidential or commercially sensitive information about clients into AI tools. For more on how we handle personal information, see our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Accuracy and limitations</h2>
      <p>
        AI can be confident and still be wrong. Outputs may be incomplete, out of date or contain errors, and the same input will not always produce the same output. We treat AI outputs as material to test and refine, not facts to rely on, and we verify anything important independently before acting on it or sharing it with clients.
      </p>

      <h2>Fairness and inclusion</h2>
      <p>
        We review our AI-assisted work to reduce the risk of unfair, biased or misleading output. AI can reflect and amplify historical bias if trained on data that contains stereotypes or structural inequalities, so we apply human oversight to catch and correct this. This sits alongside our broader commitment to Justice, Equity and Fairness (JEF). The same questions we ask about any change apply here: who benefits, who might be left out, and who carries any risk. See our <a href="/edi-policy">JEF Policy</a> for more.
      </p>

      <h2>The VAT Framework and our AI use</h2>
      <p>We apply the same framework to our own AI use that we use to advise clients:</p>
      <ul>
        <li><strong>Value</strong> — we use AI where it genuinely improves our work, not as a default. The thinking always comes first.</li>
        <li><strong>Alignment</strong> — our use of AI fits our values: transparent, proportionate and human-led. We accommodate those who prefer not to use it, and we check our AI-assisted work for fairness and bias.</li>
        <li><strong>Trust</strong> — we are open about where and how we use AI, we maintain human oversight throughout, and we support your right to choose a fully human path.</li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>
        As our tools and the technology behind them evolve, we may update this policy. We will review it at least every six months. The current version is always posted here with the date above.
      </p>
      <p>Questions: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a></p>
    </PolicyPage>
  );
}
