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
        We use AI in a small number of clearly defined ways. We are open about where we use it. We do not require anyone to use AI to work with us, and we actively accommodate people who would rather not — see <em>Your choice about AI</em> below.
      </p>
      <p>
        We use AI deliberately rather than by default. We choose it where it adds genuine value and leave it out where it does not. It supports our work; it does not replace the thinking behind it.
      </p>

      <h2>Where we use AI</h2>

      <h3>Consulting and service delivery</h3>
      <p>
        We use AI to support analysis, research and structuring that underpins our consultancy work — for example, to explore a landscape quickly, surface considerations across Value, Alignment and Trust, or to sense-check a line of thinking we have already developed. A consultant always reviews, adjusts and takes responsibility for the final output.
      </p>

      <h3>Writing and editing</h3>
      <p>
        We do not use AI to write first drafts from scratch or to generate ideas we have not already worked through ourselves. The thinking, the foundation and the substance come from us first. Where AI comes in is afterwards — to help tighten wording, check for clarity, catch inconsistencies or restructure something we have already written. A person always reviews and owns what goes out.
      </p>

      <h3>Everyday administration</h3>
      <p>
        We use AI to support routine administrative tasks — summarising, organising, preparing materials — so that more time is available for the work that genuinely needs human attention.
      </p>

      <h3>Designing services and building solutions</h3>
      <p>
        We use AI to help design services and develop digital solutions alongside hands-on design and engineering. This includes supporting work on bespoke tools and this website — always alongside, not instead of, human design and decision-making.
      </p>

      <h2>A person is always responsible</h2>
      <p>
        We do not use AI to make decisions about you or your organisation. Every piece of work we deliver is reviewed, shaped and owned by a member of our team. AI is assistive — it handles tasks that do not require human judgement so that more human attention is available for the things that do.
      </p>

      <h2>Your choice about AI</h2>
      <p>
        We do not have a view on whether you use AI yourself, and we do not require you to interact with any AI tool to work with us. A fully human route is always available — you can work with our team directly at every stage.
      </p>
      <p>
        We recognise that people have different relationships with AI: some embrace it, some are cautious, some have principled objections, and some face practical barriers to access. All of those positions are reasonable. Our role is to help organisations make informed, considered decisions about AI — not to assume that using it is the right answer for everyone.
      </p>
      <p>
        This is part of our broader commitment to fairness and inclusion. Access to AI tools, confidence in using them and trust in their outputs are not equally distributed, and that matters. We aim to design our services so they work well regardless of whether clients use AI themselves, and we make sure no one is disadvantaged by choosing not to. For more on how this connects to equality and social mobility, see our <a href="/edi-policy">EDI &amp; Social Mobility Policy</a>.
      </p>

      <h2>A considered, transparent approach</h2>
      <p>
        The VAT Framework recognises that trust has to be earned, and that not everyone trusts AI in the same way. We are open about where we use it, and we never require anyone else to use it to work with us.
      </p>
      <p>
        Part of our longer-term thinking is to stay conscious of dependency. We design our tools and ways of working so they can stand on their own, keeping a clear view of the non-AI way of doing things. That way the value of our work continues whatever happens with any single technology.
      </p>

      <h2>How it works technically</h2>
      <p>
        Where AI is used in our work, the text or data involved is sent to an established third-party AI service to generate a response or output. We design the prompts and structure the process; the AI assists within that structure, and we review what it produces.
      </p>
      <p>
        We work with AI providers whose terms do not permit them to use API inputs or outputs to train their models. For more on how we handle personal information, see our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Accuracy and limitations</h2>
      <p>
        AI can be confident and still be wrong. Outputs may be incomplete, out of date or contain errors. We treat AI outputs as material to test and refine, not facts to rely on, and we verify anything important independently before acting on it or sharing it with clients.
      </p>

      <h2>Fairness and inclusion</h2>
      <p>
        We review our AI-assisted work to reduce the risk of unfair, biased or misleading output. This sits alongside our commitment to EDI and social mobility — the same questions we ask about any change apply here: who benefits, who might be left out, and who carries any risk. See our <a href="/edi-policy">EDI &amp; Social Mobility Policy</a> for more.
      </p>

      <h2>The VAT Framework and AI</h2>
      <p>We apply the same framework to our own AI use that we use to advise clients:</p>
      <ul>
        <li><strong>Value</strong> — we use AI where it genuinely improves our work, not as a default. The thinking always comes first.</li>
        <li><strong>Alignment</strong> — our use of AI fits our values: transparent, proportionate and human-led. We accommodate those who prefer not to use it.</li>
        <li><strong>Trust</strong> — we are open about where and how we use AI, and we maintain human oversight throughout. We support your right to choose a different path.</li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>
        As our tools and the technology behind them evolve, we may update this policy. The current version will always be posted here with the date above.
      </p>
      <p>Questions: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a></p>
    </PolicyPage>
  );
}
