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
        VAxAI helps organisations decide whether AI creates genuine Value, fits their organisation (Alignment) and can be Trusted by the people it affects. We hold our own use of AI to the same standard. This policy explains, in plain English, where we use it, how it works and how we keep human judgement at the centre.
      </div>

      <h2>Our approach</h2>
      <p>
        We use AI in a small number of clearly defined ways. We are open about where we use it and we never require anyone to use AI to work with us. A human route is always available — you can work with our team directly instead of, or alongside, any tool.
      </p>
      <p>
        We also use AI deliberately rather than by default. Wherever we can, we keep our use proportionate, choosing it where it adds genuine value and leaving it out where it does not.
      </p>

      <h2>Where we use AI</h2>

      <h3>Consulting and service delivery</h3>
      <p>
        We use AI to support the analysis, research and structuring that underpins our consultancy work — for example, to explore a landscape quickly, surface considerations across Value, Alignment and Trust, or shape a first draft of a framework or recommendation. A consultant always reviews, adjusts and takes responsibility for the final output.
      </p>

      <h3>Drafting and editing</h3>
      <p>
        We use AI to help draft, edit and structure text — for example, tidying wording, shaping a first draft or restructuring a document. A person always reviews what is produced before it is used or shared.
      </p>

      <h3>Everyday administration</h3>
      <p>
        We use AI to support routine administrative tasks, so we can spend more time on the work that matters. This includes tasks such as summarising, organising information and preparing materials.
      </p>

      <h3>Designing services and building solutions</h3>
      <p>
        We use AI to help design services and to develop and build digital solutions and platforms alongside hands-on design and engineering. This includes supporting work on bespoke tools and this website.
      </p>

      <h2>A person is always responsible</h2>
      <p>
        We do not use AI to make decisions about you or your organisation. Every piece of work we deliver is reviewed, shaped and owned by a member of our team. AI is assistive: it sharpens thinking and saves time on tasks that do not require human judgement, so that more human attention is available for the things that do.
      </p>

      <h2>A considered, transparent approach</h2>
      <p>
        The VAT Framework recognises that trust has to be earned, and that not everyone trusts AI in the same way. We are open about where we use it, and we never require anyone else to use it to work with us.
      </p>
      <p>
        Part of our longer-term thinking is to stay conscious of dependency. We aim to design our tools and ways of working so they are sustainable and can stand on their own, keeping a clear view of the non-AI way of doing things. That way the value of our work and our thinking continues whatever happens with any single technology — AI strengthens what we do rather than becoming the only way we can do it.
      </p>

      <h2>How it works</h2>
      <p>
        Where AI is used in our work, the text or data involved is sent to an established third-party AI service to generate a response or output. We design the prompts and structure the experience; the AI assists within that structure, and we review how it performs.
      </p>
      <p>
        We work with AI providers whose terms do not permit them to use API inputs or outputs to train their models. For more on how we handle personal information, see our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Accuracy and limitations</h2>
      <p>
        AI can be confident and still be wrong. Outputs may be incomplete, out of date or contain errors, and the same input will not always produce the same output. We treat AI outputs as starting points to test and refine, not facts to rely on, and we verify anything important independently before acting on it or sharing it with clients.
      </p>

      <h2>Fairness and inclusion</h2>
      <p>
        We design our AI-assisted work to be clear and usable, and we review it to reduce the risk of unfair, biased or misleading output. This is part of our broader EDI commitment — see our <a href="/edi-policy">EDI &amp; Social Mobility Policy</a> for more. If anything is unclear or hard to use, please tell us, and remember that a human route is always available.
      </p>

      <h2>The VAT Framework and AI</h2>
      <p>We apply the same framework to our own AI use that we use to advise clients:</p>
      <ul>
        <li><strong>Value</strong> — we use AI where it genuinely improves the quality or speed of our work, not as a default.</li>
        <li><strong>Alignment</strong> — our use of AI fits our values: transparent, proportionate and human-led.</li>
        <li><strong>Trust</strong> — we are open about where and how we use AI, and we maintain human oversight throughout.</li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>
        As our tools and the technology behind them evolve, we may update this policy. The current version will always be posted here with the date above.
      </p>
      <p>Questions: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a></p>
    </PolicyPage>
  );
}
