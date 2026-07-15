"use client";

import { useState, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, FileUp, Loader2 } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import FilingTab from "@/components/FilingTab";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { AppSelect } from "@/components/ui/AppSelect";
import {
  VA_APPLICANT_TYPE_LABELS,
  VA_INSURANCE_LABELS,
  VA_SECTOR_INTEREST_OPTIONS,
  VA_SELF_EMPLOYED_LABELS,
  VA_SPECIALISMS,
  type VaApplicantType,
  type VaInsuranceStatus,
  type VaSelfEmployedStatus,
} from "@/lib/va-applications/constants";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const viewport = { once: true, margin: "-70px" } as const;

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

const btn = {
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift",
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 ease-premium hover:bg-pine-800 hover:shadow-lift disabled:opacity-60",
  ghostLight:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white",
};

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <FilingTab light={light}>{children}</FilingTab>;
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-pine-800";

const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

const essentials = [
  "UK-based",
  "Able to prove your identity",
  "Set up (or ready to set up) as self-employed with HMRC when required",
  "Business insurance arranged before client work begins",
  "Discretion, professionalism and attention to detail",
];

const whyPartner = [
  "We carefully match freelancers to projects and retainers so the fit is right for you and the organisation.",
  "We handle coordination, quality review and client communication, so you can focus on delivering excellent work.",
  "You stay current on practical AI and automation skills for admin, without paying for separate training elsewhere.",
  "Some clients use AI tools; others do not. Either way, you will know how to work efficiently and only recommend tools that fit how the organisation already works and what they trust.",
];

export default function WorkWithVaxaiPage() {
  const [applicantType, setApplicantType] = useState<VaApplicantType | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [location, setLocation] = useState("");
  const [selfEmployed, setSelfEmployed] = useState<VaSelfEmployedStatus | "">("");
  const [insurance, setInsurance] = useState<VaInsuranceStatus>("will_arrange");
  const [canProveIdentity, setCanProveIdentity] = useState(false);
  const [ukBased, setUkBased] = useState(true);
  const [specialisms, setSpecialisms] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [workSpecialisesIn, setWorkSpecialisesIn] = useState("");
  const [aiKnowledge, setAiKnowledge] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const scrollToForm = () => {
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!applicantType) {
      setError("Please choose whether you are an experienced freelancer or early career.");
      return;
    }
    if (!selfEmployed) {
      setError("Please tell us about your self-employment setup.");
      return;
    }
    if (!ukBased) {
      setError("We currently only partner with UK-based freelancers.");
      return;
    }
    if (!canProveIdentity) {
      setError("You must be able to prove your identity to work with client organisations.");
      return;
    }
    if (!cvFile) {
      setError("Please upload your CV as a PDF or Word document.");
      return;
    }
    if (!availabilityHours.trim() && !availabilityNotes.trim()) {
      setError("Please tell us about your availability.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("applicant_type", applicantType);
      form.set("full_name", fullName);
      form.set("email", email);
      form.set("telephone", telephone);
      form.set("location", location);
      form.set("uk_based", String(ukBased));
      form.set("self_employed_status", selfEmployed);
      form.set("has_business_insurance", insurance);
      form.set("can_prove_identity", String(canProveIdentity));
      form.set("specialisms", JSON.stringify(specialisms));
      form.set("sectors_interests", sectors.join(", "));
      form.set("work_specialises_in", workSpecialisesIn);
      form.set("ai_knowledge", aiKnowledge);
      form.set("availability_hours_per_week", availabilityHours);
      form.set("availability_notes", availabilityNotes);
      form.set("cover_note", coverNote);
      form.set("cv", cvFile);

      const res = await fetch("/api/va-applications", { method: "POST", body: form });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-pine-900/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="dark" />
        </header>

        <main className="overflow-x-hidden">
          {/* Hero */}
          <section className="bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <Eyebrow light>Partner with VAxAI</Eyebrow>
                <h1 className="mt-6 max-w-3xl text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.025em] md:text-5xl">
                  Become a VAxAI freelancer
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-8 text-paper/70 md:text-lg">
                  We are looking for talented UK-based freelance virtual assistants to help organisations
                  clear admin backlogs, prepare for AI and automation where it adds value, keep ongoing
                  admin systems running, and monitor work so problems do not return.
                </p>
                <p className="mt-4 max-w-2xl text-base leading-8 text-paper/70 md:text-lg">
                  Our freelancers support project-based work (backlog clearing and AI preparation) as well
                  as monthly retainer services (ongoing admin and maintenance of AI and automation outputs).
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <button type="button" onClick={scrollToForm} className={btn.accent}>
                    Apply to partner with us
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a href="#who" className={btn.ghostLight.replace("text-ink", "text-paper border-white/25 hover:border-white/50")}>
                    Who we partner with
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Who we partner with */}
          <section id="who" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow>Who we partner with</Eyebrow>
                <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Essentials first. Experience can grow with the work.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
                  We actively welcome experienced professionals and motivated people early in their careers,
                  including students and those who would traditionally enter entry-level admin roles, who
                  are impacted by AI and automation. If you are not fully set up yet, you can still apply.
                  We can help you understand the process of freelancing and getting ready for client work.
                </p>
              </Reveal>

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <Reveal className="rounded-[28px] border border-ink/5 bg-white p-7 shadow-card md:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                    Essential for this work
                  </p>
                  <ul className="mt-5 space-y-3">
                    {essentials.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-7 text-muted md:text-[15px]">
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm leading-7 text-muted">
                    In the UK, sole traders do not register with Companies House. When self-employed earnings
                    go over the £1,000 trading allowance in a tax year, you register for Self Assessment with
                    HMRC as a sole trader. You can start before registering; we can help early-career
                    applicants understand what that involves.
                  </p>
                </Reveal>

                <Reveal className="rounded-[28px] border border-pine-900/10 bg-pine-50/50 p-7 md:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                    Two ways in
                  </p>
                  <div className="mt-5 space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">Experienced freelancers</h3>
                      <p className="mt-2 text-sm leading-7 text-muted md:text-[15px]">
                        Already working independently (or nearly ready) and looking for well-matched client
                        work with clear coordination and quality standards.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">Early career / getting started</h3>
                      <p className="mt-2 text-sm leading-7 text-muted md:text-[15px]">
                        Motivated talent building experience. You may not be fully set up yet. Tell us, and
                        we can support you in understanding freelancing, HMRC setup when it applies, and how
                        VAxAI work is delivered. Your CV still helps us see your strengths.
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Specialisms */}
          <section className="bg-cream/40 px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow>Specialisms we value</Eyebrow>
                <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Useful strengths, not hard gates
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
                  These map to the work we actually deliver for founders, SMEs, charities and public sector
                  organisations. You do not need every skill on the list. Treat them as a guide, and apply if
                  you can contribute. Some people join to deepen skills through real projects.
                </p>
              </Reveal>
              <div className="mt-8 flex flex-wrap gap-2">
                {VA_SPECIALISMS.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/80 md:text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-8 max-w-2xl text-sm leading-7 text-muted">
                Discretion, professionalism and careful attention to detail matter on every engagement.
              </p>
            </div>
          </section>

          {/* AI upskilling + young talent */}
          <section className="px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <Eyebrow>AI skills as a perk</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-3xl">
                  Stay current without paying for separate training
                </h2>
                <div className="mt-6 space-y-4 text-base leading-8 text-muted">
                  <p>
                    A benefit of partnering with VAxAI is practical upskilling on AI and automation for
                    admin work, so freelancers do not need to buy that learning elsewhere. We help you
                    understand how AI tools can make admin tasks more efficient across different contexts.
                  </p>
                  <p>
                    Not every organisation wants AI. Some prefer traditional admin support. We only train and
                    recommend AI strategies where they add real value, align with how the organisation works,
                    and use tools they already trust. You decide, with us, what is appropriate for each client.
                  </p>
                  <p>
                    For early-career freelancers we offer more guidance to get started. For experienced
                    professionals, support is lighter and focused on staying aligned with client standards and
                    new tools, not on hand-holding.
                  </p>
                </div>
              </Reveal>
              <Reveal className="rounded-[28px] border border-ink/5 bg-white p-7 shadow-card md:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                  Opportunities for young talent
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
                  A path into meaningful freelance work
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted md:text-[15px]">
                  Where clients are open to working with talented young professionals entering freelancing,
                  we can offer reduced rates. These freelancers receive structured orientation and ongoing
                  access to AI and admin upskilling. Less years of experience does not mean less value: fresh
                  perspectives, relevant qualifications and strong motivation matter. It is a practical way
                  for organisations to access motivated talent while creating opportunities for the generation
                  most affected by AI-driven changes in admin roles.
                </p>
              </Reveal>
            </div>
          </section>

          {/* Why partner */}
          <section className="bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow light>Why partner with VAxAI</Eyebrow>
                <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Focus on the work. We handle the rest.
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {whyPartner.map((item) => (
                  <Reveal key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-5">
                    <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                      ✓
                    </span>
                    <p className="text-sm leading-7 text-paper/80 md:text-[15px]">{item}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Application form */}
          <section id="apply" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <Eyebrow>Application</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Apply to work with VAxAI
                </h2>
                <p className="mt-6 text-base leading-8 text-muted">
                  Upload your CV and tell us about your sectors, specialisms, availability and AI knowledge.
                  That helps us match you to the right projects and retainers.
                </p>
              </Reveal>

              {success ? (
                <Reveal className="mt-10 rounded-[28px] border border-emerald-200 bg-emerald-50/80 px-7 py-10 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">Application received</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Thank you. We will review your application and get in touch if there is a good fit. If you
                    applied as early career, we may also follow up with practical next steps on getting set up.
                  </p>
                </Reveal>
              ) : (
                <form onSubmit={onSubmit} className="mt-10 space-y-8 rounded-[28px] border border-ink/5 bg-white p-6 shadow-card md:p-8">
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold text-ink">How would you describe yourself?</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(Object.keys(VA_APPLICANT_TYPE_LABELS) as VaApplicantType[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setApplicantType(key);
                            if (key === "early_career" && !selfEmployed) {
                              setSelfEmployed("need_setup_help");
                            }
                          }}
                          className={`rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
                            applicantType === key
                              ? "border-pine-800 bg-pine-50 font-semibold text-pine-900"
                              : "border-ink/10 bg-cream/30 text-muted hover:border-ink/25"
                          }`}
                        >
                          {VA_APPLICANT_TYPE_LABELS[key]}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="full_name">
                        Full name *
                      </label>
                      <input
                        id="full_name"
                        required
                        className={inputClass}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="telephone">
                        Telephone
                      </label>
                      <input
                        id="telephone"
                        type="tel"
                        className={inputClass}
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="location">
                        Location (town / region)
                      </label>
                      <input
                        id="location"
                        className={inputClass}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Manchester"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={ukBased}
                        onChange={(e) => setUkBased(e.target.checked)}
                        className="mt-1"
                      />
                      I am based in the UK *
                    </label>
                    <label className="flex items-start gap-3 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={canProveIdentity}
                        onChange={(e) => setCanProveIdentity(e.target.checked)}
                        className="mt-1"
                      />
                      I can prove my identity for client onboarding *
                    </label>
                  </div>

                  <div>
                    <label className={labelClass}>Self-employment setup *</label>
                    <AppSelect
                      value={selfEmployed}
                      onChange={(v) => setSelfEmployed(v as VaSelfEmployedStatus)}
                      options={[
                        { value: "", label: "Select…" },
                        ...Object.entries(VA_SELF_EMPLOYED_LABELS).map(([value, label]) => ({
                          value,
                          label,
                        })),
                      ]}
                    />
                    <p className="mt-2 text-xs leading-5 text-muted">
                      You do not need Companies House registration as a sole trader. HMRC Self Assessment
                      applies when self-employed earnings exceed the £1,000 trading allowance in a tax year.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Business insurance</label>
                    <AppSelect
                      value={insurance}
                      onChange={(v) => setInsurance(v as VaInsuranceStatus)}
                      options={Object.entries(VA_INSURANCE_LABELS).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Specialisms (select any that apply)</label>
                    <MultiSelect
                      values={specialisms}
                      onChange={setSpecialisms}
                      options={[...VA_SPECIALISMS]}
                      placeholder="Choose specialisms…"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Sectors / interests</label>
                    <MultiSelect
                      values={sectors}
                      onChange={setSectors}
                      options={[...VA_SECTOR_INTEREST_OPTIONS]}
                      placeholder="Sectors you enjoy supporting…"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="work_specialises">
                      Work you specialise in
                    </label>
                    <textarea
                      id="work_specialises"
                      rows={4}
                      className={inputClass}
                      value={workSpecialisesIn}
                      onChange={(e) => setWorkSpecialisesIn(e.target.value)}
                      placeholder="Describe the kinds of admin or support work you do best."
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ai_knowledge">
                      Your knowledge of AI systems and automations
                    </label>
                    <textarea
                      id="ai_knowledge"
                      rows={4}
                      className={inputClass}
                      value={aiKnowledge}
                      onChange={(e) => setAiKnowledge(e.target.value)}
                      placeholder="Tools you have used, comfort level, or interest in learning. Honesty is fine if you are new to this."
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="availability_hours">
                        Typical hours available per week *
                      </label>
                      <input
                        id="availability_hours"
                        className={inputClass}
                        value={availabilityHours}
                        onChange={(e) => setAvailabilityHours(e.target.value)}
                        placeholder="e.g. 10–15 hours"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="availability_notes">
                        Availability notes
                      </label>
                      <input
                        id="availability_notes"
                        className={inputClass}
                        value={availabilityNotes}
                        onChange={(e) => setAvailabilityNotes(e.target.value)}
                        placeholder="e.g. evenings, term-time only"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="cover_note">
                      Anything else we should know?
                    </label>
                    <textarea
                      id="cover_note"
                      rows={3}
                      className={inputClass}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="cv">
                      CV (PDF or Word) *
                    </label>
                    <label
                      htmlFor="cv"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-cream/40 px-6 py-8 text-center transition-colors hover:border-pine-800/40"
                    >
                      <FileUp className="h-6 w-6 text-pine-800" />
                      <span className="text-sm font-semibold text-ink">
                        {cvFile ? cvFile.name : "Click to upload your CV"}
                      </span>
                      <span className="text-xs text-muted">PDF, DOC or DOCX · max 8MB</span>
                      <input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="sr-only"
                        onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  {error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" disabled={submitting} className={`${btn.primary} w-full sm:w-auto`}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit application
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </section>
        </main>

        <SiteFooter />
        <SimplifiedModeToggle />
      </div>
    </>
  );
}
