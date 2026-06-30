import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "EDI & Social Mobility Policy | VAxAI",
  description: "VAxAI's commitment to equality, diversity, inclusion and social mobility.",
};

export default function EdiPolicyPage() {
  return (
    <PolicyPage title="EDI & Social Mobility Policy" lastUpdated="June 2025">
      <div className="callout">
        VAxAI is a service by MT1L — More Than 1 Label. The name is a deliberate recognition that people, and the organisations they belong to, are not defined by a single label. They are complex, layered and shaped by many experiences at once. This policy reflects that.
      </div>

      <h2>Our commitment</h2>
      <p>
        We are committed to fairness, to treating everyone with dignity and respect, and to meeting our responsibilities under the Equality Act 2010. That commitment extends across all nine protected characteristics: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex and sexual orientation.
      </p>
      <p>
        Our commitment goes further than compliance. It is about understanding people and organisations as they really are — complex and shaped by many identities at once — and working within that complexity rather than reducing anyone to a category.
      </p>

      <h2>Embedded, not separate</h2>
      <p>
        We do not treat EDI and social mobility as an isolated workstream or a one-off exercise. They are part of how we think, how we work and what we help organisations achieve. Rather than adding inclusion at the end, we build it in from the start — in how we design services, how we engage with clients and how we recruit and work with collaborators.
      </p>

      <h2>Embedded in the VAT Framework</h2>
      <p>
        The VAT Framework guides everything we do, and EDI is embedded within it. The framework was itself shaped by EDI thinking. It asks not just whether something creates value, but &ldquo;value, for whom?&rdquo;: who is included, who might be left out, and who carries any risk.
      </p>
      <p>
        By making those questions explicit, the framework helps surface assumptions, widen whose voice counts, and design change that works for the full range of people it affects. When we assess whether an AI or automation initiative is worth pursuing, fairness and inclusion are part of that assessment — not an afterthought.
      </p>

      <h2>Rooted in our founder&rsquo;s practice</h2>
      <p>
        This policy is grounded in lived professional experience. Our founder&rsquo;s background spans inclusion, safeguarding and co-production, alongside wider work on fairness and participation. That experience is woven into the VAT Framework and into how we engage with organisations, which is why EDI and social mobility are embedded in everything we do rather than treated as a separate piece of work.
      </p>

      <h2>Social mobility</h2>
      <p>Social mobility matters to us, and we are deliberate about what we mean by it. We define social mobility as:</p>
      <div className="callout">
        The process by which individuals receive genuine, fair opportunities to improve their socio-economic status, regardless of their starting point in life and the characteristics and experiences that shape their identity.
      </div>
      <p>
        Our work is intended to help enable those outcomes. By helping organisations improve their cultures and their services, we support them to widen genuine opportunity, remove barriers, and make fairer outcomes more achievable for the people and communities they serve.
      </p>

      <h2>How this shows up in our work</h2>
      <p>In practice, this means we aim to:</p>
      <ul>
        <li>keep asking &ldquo;for whom?&rdquo; throughout our work, so that value and fairness are considered together;</li>
        <li>see people and organisations in the round, rather than reducing them to a single label or category;</li>
        <li>work <em>with</em>, not just <em>for</em>, the people affected by a decision, drawing on co-production wherever we can;</li>
        <li>be informed by safeguarding and inclusion, taking care over who could be harmed or left out;</li>
        <li>help organisations build cultures and services that are fairer, more inclusive and more trusted; and</li>
        <li>challenge AI and automation proposals that risk embedding or amplifying existing inequalities.</li>
      </ul>

      <h2>Our own practice</h2>
      <p>Within our own operations we aim to:</p>
      <ul>
        <li>engage collaborators and clients on the basis of their skills, values and fit — not background, characteristics or connections;</li>
        <li>price our services in a way that does not systematically exclude smaller organisations or those with limited budgets;</li>
        <li>be transparent about how we work and who we are; and</li>
        <li>keep our own use of AI fair, transparent and subject to human oversight (see our <a href="/ai-use-policy">AI Use Policy</a>).</li>
      </ul>

      <h2>Accessibility</h2>
      <p>
        Inclusion includes how you experience this website. We aim to write in plain language and to design for accessibility in line with WCAG 2.2. Every page offers an Accessibility panel allowing you to switch to a high-contrast simplified view, increase text size, reduce motion and apply dyslexia-friendly spacing. If you find anything difficult to use, please tell us so we can improve it.
      </p>

      <h2>Our ongoing commitment</h2>
      <p>
        This work is never finished. We keep listening, learning and improving, and we welcome challenge. We review this policy and our practice regularly, and we will update it as our work and understanding develops.
      </p>
      <p>
        If you have feedback on this policy or how we work: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>
      </p>
    </PolicyPage>
  );
}
