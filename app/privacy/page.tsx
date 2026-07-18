import { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | VAxAI",
  description: "How VAxAI and MT1L collect, use and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="July 2026">
      <h2>Who we are</h2>
      <p>
        VAxAI is a service provided by MT1L. MT1L (&ldquo;MT1L&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller for the personal information described in this policy. We handle it in line with UK data protection law, including the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
      </p>
      <p>
        VAxAI provides operational administration support and AI readiness services for founders, SMEs, charities, non-profits and public sector organisations. We collect very little personal information. This policy explains, in plain English, what we collect when you contact us, request a free Admin Review, apply to work with us as a freelance virtual assistant, or engage our services — and the rights you have. Questions are welcome at <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
      </p>

      <div className="callout">
        <strong>Summary.</strong> We use your information only to provide our services, to understand whether our work might be relevant to you or your organisation, and to meet our legal obligations. We do not sell your data or share it with third parties for their own marketing. We delete information when it is no longer needed.
      </div>

      <h2>Information we collect and why</h2>

      <h3>When you get in touch</h3>
      <p>
        If you submit a contact enquiry or email us directly, we collect your name, email address, preferred contact method, the type of support you are interested in, and the content of your message, along with any other information you choose to share. We use this to respond to your enquiry, arrange a free Admin Review or discovery call where relevant, and prepare for any follow-up conversation.
      </p>
      <p><em>Basis: Legitimate Interests; Performance of Contract.</em></p>

      <h3>If we identify you as a potential client</h3>
      <p>
        We may process limited professional information about individuals in organisations that could benefit from our services. This information is taken only from publicly available professional sources where it has been made available in a work context.
      </p>
      <p>
        We use it solely to assess whether there is a genuine fit and, where appropriate, to make contact. We do not process special-category data or any information from private contexts.
      </p>
      <p>
        <em>Basis: Legitimate Interests.</em> We have assessed that our interest in identifying organisations that may benefit from our work is necessary and does not override the rights and freedoms of those concerned. You have the right to object at any time. If you do, we will stop processing your information for this purpose immediately. See <em>Your rights</em> below.
      </p>

      <h3>During an engagement</h3>
      <p>
        If we work with you, we collect and use information shared in the course of that engagement — in calls, emails, meetings or materials — to deliver and improve the quality of our services.
      </p>
      <p><em>Basis: Performance of Contract; Legitimate Interests.</em></p>

      <h3>When you register interest in the VAxAI VA partner network</h3>
      <p>
        If you submit an application, we collect the information you provide. This typically includes contact details, location, confirmation of UK base and self-employment status, relevant experience, specialisms, availability, equipment and workspace confirmations, knowledge of AI tools for admin work, and any supporting documents such as a CV or portfolio link. We may also ask about professional indemnity insurance readiness, willingness to sign confidentiality agreements, and (optionally) whether you have ever been convicted of a criminal offence, fraud or financial misconduct. You may choose not to answer that question.
      </p>
      <p>
        We use this information to review your interest, assess suitability for client work (which often involves confidential information), match you to projects, coordinate onboarding and maintain accurate records of freelancers we work with or have considered.
      </p>
      <p>We do not use automated decision-making alone to accept or reject applications.</p>
      <p>
        <em>
          Basis: Performance of Contract (steps at your request before a freelance engagement);
          Legitimate Interests (recruiting and coordinating suitable freelancers for client delivery).
          Where conviction-related information is provided, we process it only as necessary for
          engagement purposes under UK data protection law.
        </em>
      </p>

      <h3>When you sign up to our newsletter</h3>
      <p>
        If you sign up to our newsletter we collect your email address (and, where you choose to provide it, your name) to send you VAxAI insights, practical admin support thinking and relevant updates about our work.
      </p>
      <p>
        We will only add you to the list after you actively submit your email address. No pre-selected opt-ins are used. Every newsletter email includes a clear link to unsubscribe. Alternatively, you can ask us to remove you at any time by emailing <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
      </p>
      <p>
        <em>Basis: Consent.</em> Withdrawal of consent does not affect the lawfulness of any processing carried out before you withdrew it.
      </p>

      <h3>Website analytics</h3>
      <p>
        Where you consent to analytics cookies, we collect limited, privacy-friendly analytics about how the site is used, such as aggregate page views. This does not identify you, and we do not use advertising or cross-site tracking. Analytics are only activated after you have accepted them in the cookie preference panel.
      </p>
      <p><em>Basis: Consent.</em></p>

      <h3>Cookies and browser storage</h3>
      <p>
        We use cookies and similar browser storage to make this website work and to understand how it is used. When you first visit the site, a cookie preference panel explains the categories in use and allows you to choose what you are comfortable with. You can revisit your preferences at any time using the Cookie settings link in the footer.
      </p>
      <ul>
        <li>
          <strong>Strictly necessary</strong> — Required for core functions such as security, session
          management, and storing your accessibility and cookie preferences. These are always active
          and cannot be disabled. <em>No separate consent required.</em>
        </li>
        <li>
          <strong>Analytics</strong> — Where you consent, we use privacy-friendly analytics to collect
          anonymised, aggregate data about how pages are used. No individual is identified and no
          advertising network receives this data. <em>Basis: Consent.</em>
        </li>
        <li>
          <strong>Marketing and communications</strong> — Where you consent, we may use information
          about your use of the site to tailor newsletter communications and measure their
          effectiveness. <em>Basis: Consent.</em>
        </li>
      </ul>
      <p>
        Your cookie preferences are stored in your browser&rsquo;s local storage so that the preference panel does not reappear on every visit. No personal information is sent to us as part of this storage.
      </p>

      <h3>Legal obligation</h3>
      <p>
        We may also need to process information in any of the above contexts to comply with a legal
        obligation to which we are subject.
      </p>

      <h2>Information from other sources</h2>
      <p>We may also receive personal information from:</p>
      <ul>
        <li>
          <strong>Public professional profiles and websites</strong> — where you or your organisation
          has made information publicly available in a professional context.{" "}
          <em>Basis: Legitimate Interests.</em>
        </li>
        <li>
          <strong>Referrals</strong> — where someone refers you to us or mentions you in the context
          of a potential engagement. <em>Basis: Legitimate Interests.</em>
        </li>
      </ul>

      <h2>Who we share your information with</h2>
      <p>
        We use third-party service providers to support our operations. A limited amount of your information may be processed by those providers on our behalf. We do not sell your data or share it with third parties for their own purposes.
      </p>
      <p>These may include:</p>
      <ul>
        <li>privacy-friendly website analytics (only where you have consented)</li>
        <li>transactional email delivery, if you subscribe to our newsletter</li>
        <li>
          AI processing where we use it in our work (see our{" "}
          <a href="/ai-use-policy">AI Use Policy</a>)
        </li>
      </ul>
      <p>
        Some providers may be based outside the UK or European Economic Area. Where this is the case, we ensure appropriate safeguards are in place in line with UK GDPR — for example, standard contractual clauses or equivalent protections. Contact us if you would like further detail.
      </p>
      <p>
        We will share personal information with law enforcement or other authorities if required by
        applicable law.
      </p>

      <h2>How long we keep your information</h2>
      <ul>
        <li>
          <strong>Enquiry data (where no engagement follows)</strong> — up to two years from your last
          interaction.
        </li>
        <li>
          <strong>Freelance applications (where no engagement follows)</strong> — up to two years from
          your last interaction, or sooner if you ask us to delete your application.
        </li>
        <li>
          <strong>Freelance partners we engage</strong> — for the duration of the working relationship
          and then up to five years for operational and legal records.
        </li>
        <li>
          <strong>Client data</strong> — for the duration of the engagement and then five years.
        </li>
        <li>
          <strong>B2B research records</strong> — reviewed regularly; removed when no longer relevant,
          when contact has concluded, or when you ask us to stop.
        </li>
        <li>
          <strong>Newsletter subscriber data</strong> — for as long as you remain subscribed. On
          unsubscribing, your email address will be removed within 30 days.
        </li>
        <li>
          <strong>Aggregate analytics</strong> that do not identify you may be kept for longer.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>Under the UK GDPR you have the right to:</p>
      <ul>
        <li>access the personal information we hold about you</li>
        <li>require us to correct any mistakes</li>
        <li>require the erasure of your personal information in certain circumstances</li>
        <li>
          receive your personal information in a structured, commonly used and machine-readable format
        </li>
        <li>
          object at any time to processing for direct marketing or outreach — we will stop immediately
        </li>
        <li>object in certain other circumstances to our continued processing</li>
        <li>restrict our processing in certain circumstances</li>
      </ul>
      <p>
        For further information see{" "}
        <a href="https://ico.org.uk/your-data-matters" target="_blank" rel="noreferrer">
          ico.org.uk/your-data-matters
        </a>
        . To exercise any right, email <a href="mailto:hello@mt1l.com">hello@mt1l.com</a> with enough
        information to identify you and describe your request. We will respond within one month.
      </p>

      <h2>Keeping your information secure</h2>
      <p>
        We have appropriate technical and organisational measures in place to prevent personal information from being accidentally lost, used or accessed in an unauthorised way. We limit access to those with a genuine need, and those who process it do so only in an authorised manner and subject to a duty of confidentiality.
      </p>

      <h2>How to complain</h2>
      <p>
        We hope we can resolve any concern directly. Please contact us first at{" "}
        <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
      </p>
      <p>
        You also have the right to lodge a complaint with the UK Information Commissioner&rsquo;s
        Office at{" "}
        <a href="https://ico.org.uk/concerns" target="_blank" rel="noreferrer">
          ico.org.uk/concerns
        </a>{" "}
        or by telephone on 0303 123 1113.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        The current version is always published here with the date above. We will communicate any
        meaningful changes directly where we hold contact details for you.
      </p>

      <hr />

      <h2>Legal bases for processing</h2>
      <ul>
        <li>
          <strong>Legitimate Interests</strong> — we have a genuine business interest in conducting
          and managing our work effectively. Before relying on this basis we consider and balance any
          potential impact on you and your rights.
        </li>
        <li>
          <strong>Performance of Contract</strong> — processing is necessary to carry out a contract
          between us, or to take steps at your request before entering into one.
        </li>
        <li>
          <strong>Legal obligation</strong> — processing is necessary to comply with a legal or
          regulatory obligation.
        </li>
        <li>
          <strong>Consent</strong> — where we rely on your consent, you may withdraw it at any time by
          contacting <a href="mailto:hello@mt1l.com">hello@mt1l.com</a>.
        </li>
      </ul>

      <div className="callout">
        <strong>How this reflects the VTA Framework.</strong> We apply the same test to how we handle
        data that we apply to any change: does it create genuine <em>Value</em>, can it be{" "}
        <em>Trusted</em> by the people it affects, and does it reflect our commitment to treating
        people with respect (<em>Alignment</em>)? We collect only what serves a clear purpose, handle
        it with care, and are transparent about what we do and what rights you have — including the
        right to say no.
      </div>
    </PolicyPage>
  );
}
