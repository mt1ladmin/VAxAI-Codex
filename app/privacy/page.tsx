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
        <strong>Plain English summary.</strong> We collect what is needed to do our work well. When you contact us we keep your name, email and message so we can respond. We also research potential clients using publicly available professional information to understand who could benefit from our services — we are transparent about this below. We do not sell your data or run advertising. You can ask us to stop using your data or to delete it at any time.
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

      <h3>Business research and outreach</h3>
      <p>
        As part of how we develop our work, we identify organisations that may benefit from our services and research them using publicly available professional information — for example, names, job titles, work email addresses and professional profiles from sources such as LinkedIn, company websites and public registries. We use this to understand whether there is a genuine fit and, where there is, to make contact.
      </p>
      <p>
        We only use information that individuals and organisations have made publicly available in a professional context and where they would reasonably expect to be visible to others in their field. We do not research or contact individuals in a personal capacity, and we do not use special-category data.
      </p>
      <p><strong>Legal basis:</strong> Legitimate interests (Article 6(1)(f) UK GDPR). We have assessed that our interest in understanding and developing our client base is proportionate and does not override the rights of the individuals concerned, given the professional and public nature of the information used. You have the right to object to this use at any time — see Your rights below.</p>

      <h3>What we do not do</h3>
      <p>We do not run advertising, use tracking pixels or share your data with third parties for their own marketing. We do not use cookies beyond those technically required. We do not collect special-category personal data (such as health, ethnicity or political opinion).</p>

      <h2>How long we keep your information</h2>
      <ul>
        <li><strong>Enquiry data</strong> — up to two years from last contact, or until you ask us to delete it.</li>
        <li><strong>Business research records</strong> — we review these regularly and remove records that are no longer relevant or where you have asked us to stop.</li>
      </ul>

      <h2>Who we share your information with</h2>
      <p>We do not sell or share your personal data with third parties for their own purposes. We use the following processors to deliver our services:</p>
      <ul>
        <li><strong>Supabase</strong> — our database provider. Data is stored on infrastructure within the EU or US under standard contractual clauses that comply with UK GDPR transfer requirements.</li>
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
        <li><strong>Objection</strong> — object to processing based on legitimate interests, including our B2B research activity. If you object, we will stop processing your data for that purpose and will not contact you further.</li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>. We will respond within one month. If you are not satisfied with our response you have the right to complain to the Information Commissioner&rsquo;s Office at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a>.</p>

      <h2>Security</h2>
      <p>We take reasonable technical and organisational steps to protect your information, including encrypted storage and access controls limited to people who need it. No system is completely secure, and we cannot guarantee the security of information transmitted over the internet.</p>

      <h2>How this reflects the VAT Framework</h2>
      <p>The VAT Framework asks whether something creates genuine Value, fits the organisation&rsquo;s values (Alignment) and can be Trusted by the people it affects. We apply the same thinking to how we handle data:</p>
      <ul>
        <li><strong>Value</strong> — we collect and use data only where it serves a clear and proportionate purpose.</li>
        <li><strong>Alignment</strong> — our data handling reflects our commitment to treating people with respect and transparency.</li>
        <li><strong>Trust</strong> — we are open about what we collect, why, and what rights you have — including the right to object.</li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>We may update this policy as our services develop. The current version will always be posted here with the date above. Material changes will be communicated directly where we hold contact details for you.</p>
    </PolicyPage>
  );
}
