import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | VAxAI",
  description: "How VAxAI and MT1L collect, use and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="June 2025">
      <p>
        Please read this privacy notice carefully as it contains important information on who we are, how and why we collect, store, use and share personal information, your rights in relation to your personal information, and how to contact us and supervisory authorities if you have a complaint.
      </p>

      <div className="callout">
        <strong>Summary.</strong> We use your data to provide our services to you, to understand whether our services might be relevant to you or your organisation, and to meet our legal obligations. We delete data when it is no longer needed for these purposes. We do not sell your data or share it with third parties for their own marketing. We use external service providers to power our operations — some of these may be outside the UK. We are happy to answer any questions: <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>
      </div>

      <h2>Who we are</h2>
      <p>
        VAxAI is a service provided by MT1L. MT1L (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses and is responsible for certain personal information about you. When we do so we are regulated under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, and we are the controller of that personal information for the purposes of those laws.
      </p>
      <p>
        This privacy notice applies to you if you are enquiring about or using our services, or if we have identified you or your organisation as potentially benefiting from what we do.
      </p>

      <h2>The personal information we collect and use</h2>

      <h3>If you enquire about or use our services</h3>
      <p>We collect the following personal information when you provide it to us. References to the legal basis (e.g. &ldquo;Basis: Legitimate Interests&rdquo;) refer to the article of the UK GDPR under which we carry out that processing. Further detail on each basis is set out at the end of this notice.</p>
      <ul>
        <li>
          <strong>Information you provide when making an enquiry</strong> — your name, email address, message and any preferences or context you share (such as how you prefer to be contacted or the kind of support you are exploring). We use this to respond to your enquiry and, where relevant, to prepare for a conversation with you. <em>Basis: Legitimate Interests; Performance of Contract.</em>
        </li>
        <li>
          <strong>Further information you share in follow-up conversations</strong> — details you provide in calls, emails or meetings as we scope a potential or actual engagement. We use this to understand your needs, design the right approach and deliver our services. <em>Basis: Performance of Contract; Legitimate Interests.</em>
        </li>
        <li>
          <strong>Information generated in the course of an engagement</strong> — communications and materials exchanged while we are working together. We use this to deliver and improve the quality of our services. <em>Basis: Performance of Contract; Legitimate Interests.</em>
        </li>
        <li>
          <strong>Any feedback you give us</strong> — on your experience or the work we have produced. We use this to improve how we work. <em>Basis: Legitimate Interests.</em>
        </li>
      </ul>
      <p>We may also need to process your data to comply with a legal obligation to which we are subject.</p>

      <h3>If we have identified you as a potential client</h3>
      <p>
        As part of developing our work, we research organisations and individuals who may benefit from our services. We collect and use publicly available professional information — such as names, job titles, work email addresses and professional profiles from sources including public professional networks, company websites and public registries. We use this to understand whether there is a genuine fit and, where there is, to make contact.
      </p>
      <p>
        We only use information that individuals have made available in a professional context, where they would reasonably expect visibility among others working in their field. We do not use personal information in a private or non-professional capacity, and we do not collect special-category data.
      </p>
      <p><em>Basis: Legitimate Interests.</em> We have assessed that our interest in identifying and reaching organisations that could genuinely benefit from our services is proportionate and does not override the rights of the individuals concerned, given the professional and public nature of the information. You have the right to object to this use at any time — see <em>Your rights</em> below, and we will stop immediately.</p>

      <h2>Information from other sources</h2>
      <p>We may also receive or obtain personal information from the following sources:</p>
      <ul>
        <li>
          <strong>Public professional profiles and websites</strong> — where you or your organisation has made information publicly available in a professional context, such as on a professional network, company website or public registry. <em>Basis: Legitimate Interests.</em>
        </li>
        <li>
          <strong>Referrals</strong> — where someone refers you to us or mentions you in the context of a potential engagement. <em>Basis: Legitimate Interests.</em>
        </li>
      </ul>

      <h2>Who we share your personal information with</h2>
      <p>
        We use external service providers to help us operate and deliver our services. As a result, a limited amount of your information may be processed by those providers on our behalf. We do not sell your data or share it with third parties for their own purposes.
      </p>
      <p>
        Some of our service providers may be based outside the UK or European Economic Area. Where this is the case, we ensure appropriate safeguards are in place in accordance with UK GDPR requirements — see <em>Transfer of your information</em> below.
      </p>
      <p>We will share personal information with law enforcement or other authorities if required by applicable law.</p>
      <p>We will not otherwise share your personal information with any other third party.</p>

      <h2>How long we keep your personal information</h2>
      <ul>
        <li><strong>Enquiry data (where no engagement follows)</strong> — up to two years from your last interaction with us.</li>
        <li><strong>Client data</strong> — for the duration of our engagement and then five years.</li>
        <li><strong>B2B research records</strong> — reviewed regularly; removed when no longer relevant, when contact has concluded, or when you ask us to stop.</li>
      </ul>

      <h2>Transfer of your information</h2>
      <p>
        Some of the external service providers we work with may be located outside the UK or European Economic Area. Where we transfer personal data to such providers, we ensure that appropriate safeguards are in place as required under UK GDPR — for example, standard contractual clauses or equivalent protections. If you would like further information about any such safeguards, please contact us at <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
      </p>

      <h2>Your rights</h2>
      <p>Under the UK GDPR you have a number of important rights, free of charge. In summary, these include the right to:</p>
      <ul>
        <li>access the personal information we hold about you;</li>
        <li>require us to correct any mistakes in your information;</li>
        <li>require the erasure of your personal information in certain circumstances;</li>
        <li>receive your personal information in a structured, commonly used and machine-readable format;</li>
        <li>object at any time to processing for direct marketing or outreach purposes — we will stop immediately;</li>
        <li>object in certain other circumstances to our continued processing of your personal information; and</li>
        <li>restrict our processing of your personal information in certain circumstances.</li>
      </ul>
      <p>
        For further detail on each right, see the guidance from the UK Information Commissioner&rsquo;s Office at <a href="https://ico.org.uk/your-data-matters" target="_blank" rel="noreferrer">ico.org.uk/your-data-matters</a>.
      </p>
      <p>
        To exercise any of these rights, email us at <a href="mailto:hello@mt1l.com">hello@mt1l.com</a> with enough information to identify you and describe your request. We will respond within one month.
      </p>

      <h2>Keeping your information secure</h2>
      <p>
        We have appropriate technical and organisational measures in place to prevent personal information from being accidentally lost, used or accessed in an unauthorised way. We limit access to your personal information to those with a genuine need to know it, and those who process it do so only in an authorised manner and subject to a duty of confidentiality.
      </p>
      <p>
        We have procedures to deal with any suspected data security breach and will notify you and any applicable regulator where we are legally required to do so.
      </p>

      <h2>How to complain</h2>
      <p>
        We hope we can resolve any concern you have about our use of your information. Please contact us in the first instance at <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
      </p>
      <p>
        You also have the right to lodge a complaint with the UK supervisory authority, the Information Commissioner&rsquo;s Office, at <a href="https://ico.org.uk/concerns" target="_blank" rel="noreferrer">ico.org.uk/concerns</a> or by telephone on 0303 123 1113.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        We may update this privacy notice from time to time. Where any change affects you in a meaningful way, we will communicate it directly where we hold contact details for you. The current version is always published here with the date above.
      </p>

      <hr />

      <h2>Legal bases for processing</h2>
      <p>Throughout this notice we refer to the following legal bases:</p>
      <ul>
        <li>
          <strong>Legitimate Interests</strong> — we have a genuine business interest in conducting and managing our work in a way that enables us to provide the best possible service. Before relying on this basis we consider and balance any potential impact on you and your rights. We do not use your personal data for activities where our interests are clearly overridden by the impact on you. You can obtain further information about our assessment by contacting us.
        </li>
        <li>
          <strong>Performance of Contract</strong> — processing is necessary to carry out a contract between us or to take steps at your request before entering into one.
        </li>
        <li>
          <strong>Legal obligation</strong> — processing is necessary to comply with a legal or regulatory obligation we are subject to.
        </li>
        <li>
          <strong>Consent</strong> — where we rely on your consent, you may withdraw it at any time by contacting us at <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
        </li>
      </ul>

      <div className="callout">
        <strong>How this reflects the VAT Framework.</strong> The VAT Framework asks whether something creates genuine Value, fits the organisation&rsquo;s values (Alignment) and can be Trusted by the people it affects. We apply the same test to how we handle data: we collect only what serves a clear purpose, we handle it in a way that reflects our commitment to treating people with respect, and we are transparent about what we do and what rights you have — including the right to say no.
      </div>
    </PolicyPage>
  );
}
