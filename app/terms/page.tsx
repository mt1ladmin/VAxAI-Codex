import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of Service | VAxAI",
  description: "Terms governing the use of VAxAI services, provided by MT1L.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" lastUpdated="June 2025">
      <div className="callout">
        <strong>Plain English summary.</strong> These terms govern how we work together. They protect both sides: you get clarity on what to expect from us, and we get clarity on how the engagement is structured. If anything is unclear, please ask before we begin.
      </div>

      <h2>About VAxAI</h2>
      <p>
        VAxAI is a service provided by MT1L. References to &ldquo;VAxAI&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; in these terms mean MT1L operating under the VAxAI service. Our registered address and company information are available on request at <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
      </p>

      <h2>Our services</h2>
      <p>VAxAI provides AI and automation consultancy, virtual assistant (VA) support and related services. Our three core service tiers are:</p>
      <ul>
        <li><strong>Assess</strong> — a structured review of your current AI and automation landscape, identifying where change would create genuine value and where it would not.</li>
        <li><strong>Assess &amp; Implement</strong> — everything in Assess, plus hands-on implementation of agreed tools, workflows or processes.</li>
        <li><strong>Assess, Implement &amp; Support</strong> — everything in Assess &amp; Implement, plus ongoing process optimisation, team guidance and dedicated support hours within your agreed package.</li>
      </ul>
      <p>The specific scope, deliverables, timeline and fees for each engagement are set out in a separate written proposal or statement of work agreed before work begins.</p>

      <h2>Enquiries and discovery</h2>
      <p>Submitting a contact enquiry or booking a discovery call does not create a contract or obligation on either side. An engagement begins only once both parties have agreed the scope and fees in writing.</p>

      <h2>Fees and payment</h2>
      <p>Fees are agreed in writing before work begins and set out in your proposal or statement of work. Unless otherwise stated:</p>
      <ul>
        <li>Invoices are due within 14 days of the invoice date.</li>
        <li>Late payment may attract statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998.</li>
        <li>We reserve the right to pause work if invoices remain unpaid beyond the agreed terms.</li>
      </ul>

      <h2>What we deliver and how</h2>
      <p>We work in line with the VAT Framework, ensuring that what we recommend and implement creates genuine Value, fits your organisation (Alignment) and can be Trusted by the people it affects. This means we may advise against a course of action even if you have requested it, if we believe it would not serve those standards.</p>
      <p>We do not provide legal, financial, medical or regulated professional advice. Anything we produce is consultancy and should be reviewed with appropriately qualified advisers before acting on it where those domains are engaged.</p>

      <h2>Intellectual property</h2>
      <p>On full payment of agreed fees:</p>
      <ul>
        <li>Deliverables created specifically for your engagement become your property.</li>
        <li>We retain ownership of our underlying methodology, frameworks (including the VAT Framework), tools, templates and know-how. Nothing in these terms transfers those to you.</li>
        <li>We may reference the existence of the engagement in our own materials (for example, as a case study) unless you ask us in writing not to.</li>
      </ul>

      <h2>Confidentiality</h2>
      <p>Both parties agree to keep confidential any information disclosed during the engagement that is marked as confidential or is clearly sensitive in nature. This obligation does not apply to information that is publicly available, already known to the receiving party or required to be disclosed by law.</p>

      <h2>Limitation of liability</h2>
      <p>To the extent permitted by law, our total liability to you in connection with any engagement will not exceed the fees paid by you for that engagement. We are not liable for indirect, consequential or special losses, loss of profits or loss of data.</p>
      <p>Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.</p>

      <h2>Termination</h2>
      <p>Either party may end an engagement by giving written notice as specified in the relevant proposal. Where work is in progress, you will be invoiced for work completed up to the termination date. Fees already paid for future work that cannot be delivered will be refunded pro-rata where reasonable.</p>

      <h2>Governing law</h2>
      <p>These terms and any engagement are governed by the law of England and Wales. Any dispute will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

      <h2>The VAT Framework and how we work</h2>
      <p>Our approach to every engagement is shaped by the VAT Framework:</p>
      <ul>
        <li><strong>Value</strong> — we focus on changes that create genuine, measurable benefit.</li>
        <li><strong>Alignment</strong> — we check that what we recommend fits your organisation, culture and people.</li>
        <li><strong>Trust</strong> — we are transparent about what we are doing and why, and we keep human judgement at the centre.</li>
      </ul>

      <h2>Changes to these terms</h2>
      <p>We may update these terms from time to time. The version that applies to your engagement is the one in effect when your proposal or statement of work is agreed. The current version is always posted here with the date above.</p>

      <p>Questions: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a></p>
    </PolicyPage>
  );
}
