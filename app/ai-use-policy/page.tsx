import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "AI Use Policy | VAxAI",
  description: "How VAxAI uses AI — transparently, deliberately and with human judgement at the centre.",
};

export default function AiUsePolicyPage() {
  return (
    <PolicyPage title="AI Use Policy" lastUpdated="June 2025">
      <div className="callout">
        VAxAI helps organisations decide whether AI creates genuine Value, fits their organisation (Alignment) and can be Trusted by the people it affects. We apply the same test to our own use of AI. This policy explains where we use it, how it works, and how we keep human judgement at the centre — structured around the VAT Framework itself.
      </div>

      <p>
        Artificial intelligence refers to computer systems capable of performing tasks that would ordinarily require human intelligence. This includes large language models (such as those powering tools like ChatGPT, Claude or similar), as well as automation tools, writing assistants and AI embedded within everyday software. The pace of development in this area is rapid, and this policy will be reviewed and updated regularly to reflect how the technology and the guidance around it evolves.
      </p>

      <hr />

      <h2>Value — where and why we use AI</h2>

      <h3>We use AI deliberately, not by default</h3>
      <p>
        We choose AI where it adds genuine value to our work and leave it out where it does not. AI is not a default; it is one option among many, and we apply the same VAT test to our own AI use that we use to advise clients: does this create genuine value, does it fit how we work, and can it be trusted by the people it affects?
      </p>

      <h3>Where we use AI</h3>
      <p>We use AI in a small number of clearly defined areas:</p>
      <ul>
        <li>
          <strong>Research and analysis</strong> — to explore a landscape quickly, surface relevant considerations, or sense-check lines of thinking we have already developed. A consultant always reviews, adjusts and takes responsibility for the output.
        </li>
        <li>
          <strong>Writing and editing</strong> — the thinking, foundation and substance of anything we produce comes from us first. AI comes in afterwards to help tighten wording, check for clarity, catch inconsistencies or restructure something we have already written. We do not use AI to generate first drafts from scratch. A person always reviews and owns what goes out.
        </li>
        <li>
          <strong>Everyday administration</strong> — summarising, organising and preparing materials, so more time is available for the work that genuinely needs human attention.
        </li>
        <li>
          <strong>Designing services and building solutions</strong> — alongside hands-on design and engineering work, including on this website. Always alongside, not instead of, human decision-making.
        </li>
      </ul>

      <h3>Accuracy and hallucination</h3>
      <p>
        AI can produce confident, plausible output that is factually wrong — this is known as hallucination. We treat AI output as material to test and refine, never as facts to rely on. Anything important is verified independently before we act on it or share it with clients. The person using the AI is accountable for the accuracy of what goes out.
      </p>

      <h3>Sustainability</h3>
      <p>
        AI systems carry an environmental cost through energy consumption and computing resource demands. We use AI only where it delivers clear value. We do not use it as a shortcut where a straightforward human approach would work equally well.
      </p>

      <hr />

      <h2>Alignment — how our AI use fits our values and the wider landscape</h2>

      <h3>Aligned to how we work</h3>
      <p>
        Our AI use is transparent, proportionate and human-led. It supports our work rather than replacing the thinking behind it. We do not use AI to make decisions about you or your organisation — every piece of work we deliver is reviewed, shaped and owned by a member of our team.
      </p>

      <h3>Aligned to data protection law</h3>
      <p>
        Where AI systems use or process personal data, they fall within the scope of UK GDPR and the Data Protection Act 2018. We comply with our obligations under that legislation in all AI-assisted work. We work with AI providers whose terms do not permit the use of API inputs or outputs to train their models. For full detail on how we handle personal information, see our <a href="/privacy">Privacy Policy</a>.
      </p>
      <p>
        We do not enter personal, confidential or commercially sensitive information into AI tools that are not designed for that purpose. AI is used only where the information involved is appropriate for that context.
      </p>

      <h3>Aligned to the risk landscape</h3>
      <p>
        Not all AI carries the same risk. The EU AI Act — while not directly applicable in the UK — provides a useful framework for thinking about AI risk in four levels:
      </p>
      <ul>
        <li><strong>Unacceptable risk</strong> — systems that pose a clear threat to people&rsquo;s rights or safety, such as social scoring or harmful manipulation. We do not use AI of this kind.</li>
        <li><strong>High risk</strong> — systems used in critical decisions affecting people, such as employment, credit or access to services. Any AI that could significantly affect individuals requires careful assessment, human oversight and clear accountability.</li>
        <li><strong>Limited risk</strong> — systems where transparency obligations apply, such as chatbots or AI-generated content. We are open about where AI has been used.</li>
        <li><strong>Minimal risk</strong> — systems such as spam filters or content structuring tools, where the risk is low and well understood.</li>
      </ul>
      <p>
        The AI tools we use in our own work fall in the limited and minimal risk categories. When we advise clients on AI, we help them understand where their proposals sit in this risk landscape and what that means in practice.
      </p>

      <h3>Aligned to copyright and intellectual property</h3>
      <p>
        We do not use AI to generate content that reproduces or infringes the intellectual property of others. AI-assisted outputs are reviewed for this risk before use or publication.
      </p>

      <h3>Aligned to equality and human rights</h3>
      <p>
        AI can reflect and amplify historical bias if it has been trained on data that contains stereotypes or structural inequalities. We review AI-assisted work to reduce the risk of unfair, biased or misleading output. This sits alongside our broader commitment to EDI and social mobility — the same questions we ask about any change apply here: who benefits, who might be left out, and who carries any risk. We do not allow AI to make final decisions about any individual. See our <a href="/edi-policy">EDI &amp; Social Mobility Policy</a> for more.
      </p>

      <h3>Aligned to digital inclusion</h3>
      <p>
        Access to AI tools, confidence in using them and trust in their outputs are not equally distributed. We design our services to work well regardless of whether clients use AI themselves, and we make sure no one is disadvantaged by choosing not to. For more on how this connects to our work on equality and social mobility, see our <a href="/edi-policy">EDI &amp; Social Mobility Policy</a>.
      </p>

      <h3>Receiving AI-generated content</h3>
      <p>
        As AI becomes more widely used, we may receive correspondence or materials from clients or others that have been wholly or partly generated by AI. We respond in the usual way and apply the same standards of review. Where content appears inaccurate or unclear, we will say so. We do not treat AI-generated input differently from any other communication.
      </p>

      <hr />

      <h2>Trust — keeping people informed and in control</h2>

      <h3>A person is always responsible</h3>
      <p>
        We do not use AI to make decisions about you or your organisation. Every piece of work we deliver is reviewed, shaped and owned by a member of our team. AI handles tasks that do not require human judgement so that more human attention is available for the things that do. Responsibility for what we produce always sits with a person.
      </p>

      <h3>Transparency</h3>
      <p>
        We are open about where we use AI. We never use it covertly or in a way that we would not be comfortable disclosing. Where AI has contributed to a piece of work delivered to a client, we make that clear.
      </p>
      <p>
        When AI is used in a client-facing context, the people involved are told. There is always a human route available.
      </p>

      <h3>Your choice about AI</h3>
      <p>
        We do not have a view on whether you use AI yourself, and we do not require you to interact with any AI tool to work with us. A fully human route is always available — you can work with our team directly at every stage.
      </p>
      <p>
        We recognise that people have different relationships with AI: some embrace it, some are cautious, some have principled objections, and some face practical barriers to access. All of those positions are reasonable. Our role is to help organisations make informed, considered decisions about AI — not to assume that using it is the right answer for everyone.
      </p>

      <h3>No AI where it is not appropriate</h3>
      <p>
        There are contexts where AI should not be used: where decisions significantly affect individuals and human judgement is essential, where sensitive or confidential information is involved, where accountability must be fully traceable, or where the people affected would reasonably expect a fully human process. We maintain a clear view of when AI is not the right tool and apply that judgement consistently.
      </p>

      <h3>Staying conscious of dependency</h3>
      <p>
        Part of our longer-term thinking is to avoid over-reliance on any single AI technology. We design our tools and ways of working so they can stand on their own. We keep a clear view of how we would do things without AI, because the value of our work should continue whatever happens with any particular technology.
      </p>

      <h3>How it works technically</h3>
      <p>
        Where AI is used in our work, the text or data involved is sent to an established third-party AI service to generate a response or output. We design the prompts and structure the process; the AI assists within that structure, and we review what it produces. We work with providers whose terms do not permit the use of API inputs or outputs for model training.
      </p>

      <hr />

      <h2>Changes to this policy</h2>
      <p>
        The technology and the guidance around it are both evolving quickly. We will review and update this policy at least every six months, and whenever a significant change in our practice or in the wider landscape makes an earlier update necessary. The current version is always posted here with the date above.
      </p>
      <p>Questions: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a></p>
    </PolicyPage>
  );
}
