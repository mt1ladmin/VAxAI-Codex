import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | VAxAI",
  description: "How VAxAI and MT1L collect, use and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="June 2025">
      <div className="callout">
        <strong>Plain English summary.</strong> We collect very little. When you contact us we keep your name, email and message so we can respond. We do not sell your data, run advertising or build profiles. You can ask us to delete anything we hold at any time.
      </div>

      <h2>Who we are</h2>
      <p>
        VAxAI is a service by MT1L. MT1L (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller for the personal information described in this policy. We handle it in line with UK data protection law, including the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
      </p>
      <p>Questions about this policy or your data: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a></p>

      <h2>What we collect and why</h2>

      <h3>Contact enquiries</h3>
      <p>When you use the contact form or book a discovery call, we collect your name, email address, message and any preferences you share (such as how you prefer to be contacted or the type of support you are exploring). We use this information to respond to your enquiry and, where relevant, to prepare for a conversation with you.</p>
      <p><strong>Legal basis:</strong> Legitimate interests — responding to a contact request you have initiated. Where the enquiry leads to an engagement, the basis becomes performance of a contract.</p>

      <h3>VAxAI Studio accounts</h3>
      <p>If you are given access to VAxAI Studio (our internal platform), we hold your email address and a securely hashed password. We use this solely to authenticate your access.</p>
      <p><strong>Legal basis:</strong> Performance of a contract (access to the platform).</p>

      <h3>What we do not collect</h3>
      <p>We do not run advertising, use tracking pixels or build marketing profiles. We do not use cookies beyond those strictly necessary to keep the Studio session secure. We do not collect any special-category personal data.</p>

      <h2>How long we keep your information</h2>
      <ul>
        <li><strong>Enquiry data</strong> — up to two years from last contact, or until you ask us to delete it.</li>
        <li><strong>Studio account data</strong> — until the account is closed or you ask us to remove it.</li>
      </ul>

      <h2>Who we share your information with</h2>
      <p>We do not sell or share your personal data with third parties for their own purposes. We use the following processors to deliver our services:</p>
      <ul>
        <li><strong>Supabase</strong> — our database and authentication provider. Data is stored on infrastructure within the EU or US under standard contractual clauses that comply with UK GDPR transfer requirements.</li>
        <li><strong>Calendly</strong> — if you book a discovery call, your booking is processed by Calendly under their own privacy policy.</li>
      </ul>
      <p>We may disclose information if required by law or to protect the rights and safety of our team or others.</p>

      <h2>Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li><strong>Access</strong> — ask for a copy of the personal data we hold about you.</li>
        <li><strong>Rectification</strong> — ask us to correct inaccurate information.</li>
        <li><strong>Erasure</strong> — ask us to delete your data where there is no compelling reason to keep it.</li>
        <li><strong>Restriction</strong> — ask us to limit how we use your data while a concern is resolved.</li>
        <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
        <li><strong>Objection</strong> — object to processing based on legitimate interests.</li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>. We will respond within one month. If you are not satisfied with our response you have the right to complain to the Information Commissioner&rsquo;s Office at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a>.</p>

      <h2>Security</h2>
      <p>We take reasonable technical and organisational steps to protect your information, including encrypted storage, hashed passwords and access controls limited to people who need it. No system is completely secure, and we cannot guarantee the security of information transmitted over the internet.</p>

      <h2>How this reflects the VAT Framework</h2>
      <p>The VAT Framework asks whether something creates genuine Value, fits the organisation&rsquo;s values (Alignment) and can be Trusted by the people it affects. We apply the same thinking to how we handle data:</p>
      <ul>
        <li><strong>Value</strong> — we collect only what is needed to respond to you and deliver our work.</li>
        <li><strong>Alignment</strong> — data handling reflects our commitment to treating people with respect and transparency.</li>
        <li><strong>Trust</strong> — we are open about what we collect, why, and what rights you have.</li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>We may update this policy as our services develop. The current version will always be posted here with the date above. Material changes will be communicated directly where we hold contact details for you.</p>
    </PolicyPage>
  );
}
