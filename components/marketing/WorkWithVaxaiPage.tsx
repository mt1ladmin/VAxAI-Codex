"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileUp, Loader2, X } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import FilingTab from "@/components/FilingTab";
import {
  VA_APPLICANT_TYPE_LABELS,
  VA_CLIENT_SECTORS,
  VA_INDUSTRIES_BY_SECTOR,
  VA_INSURANCE_LABELS,
  VA_SELF_EMPLOYED_LABELS,
  VA_SPECIALISMS,
  type VaApplicantType,
  type VaClientSector,
  type VaInsuranceStatus,
  type VaSelfEmployedStatus,
} from "@/lib/va-applications/constants";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HERO_IMAGE = "/hero-remote-work-circles.jpg";

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
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white disabled:opacity-40",
  ghostDark:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-paper/90 transition-colors duration-300 hover:border-white/45 hover:text-paper",
};

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <FilingTab light={light}>{children}</FilingTab>;
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-pine-800";

const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

const errorClass =
  "mt-4 rounded-xl border border-pine-900/15 bg-cream px-3.5 py-3 text-sm leading-6 text-pine-900";

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
  "We provide training so you stay current on practical AI and automation skills for admin work.",
  "Some clients use AI tools; others do not. Either way, you apply the MT1L VAT Framework (Value, Alignment, Trust) so AI is only used where it helps, fits how the organisation works, and can be trusted.",
];

/** Ordered wizard steps (one focus per screen) */
const STEPS = [
  "privacy",
  "path",
  "contact",
  "setup",
  "specialisms",
  "sector",
  "industries",
  "work",
  "ai",
  "availability",
  "notes",
  "cv",
  "declaration",
] as const;

type StepId = (typeof STEPS)[number];

const STEP_TITLES: Record<StepId, string> = {
  privacy: "Before you start",
  path: "About you",
  contact: "Your details",
  setup: "Self-employment setup",
  specialisms: "Your specialisms",
  sector: "Who you want to support",
  industries: "Industries & domains",
  work: "Work you specialise in",
  ai: "AI & automation",
  availability: "Your availability",
  notes: "Anything else?",
  cv: "Your CV",
  declaration: "Declaration",
};

/** Chip multi-select — keeps all options visible in the modal (no hidden dropdown). */
function ChipSelect({
  values,
  onChange,
  options,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  options: readonly string[];
}) {
  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition-colors md:text-sm ${
              active
                ? "border-pine-900 bg-pine-900 text-paper"
                : "border-ink/12 bg-white text-muted hover:border-ink/30"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function WorkWithVaxaiPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);

  const [policiesAccepted, setPoliciesAccepted] = useState(false);
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
  const [clientSector, setClientSector] = useState<VaClientSector | "">("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [workSpecialisesIn, setWorkSpecialisesIn] = useState("");
  const [aiKnowledge, setAiKnowledge] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const step = STEPS[stepIndex];
  const progress = success ? 100 : ((stepIndex + 1) / STEPS.length) * 100;

  const industryOptions = useMemo(() => {
    if (!clientSector) return [];
    return [...VA_INDUSTRIES_BY_SECTOR[clientSector]];
  }, [clientSector]);

  function openModal() {
    setModalOpen(true);
    setSuccess(false);
    setStepIndex(0);
    setError(null);
  }

  function closeModal() {
    if (submitting) return;
    setModalOpen(false);
    setError(null);
    if (success) {
      resetForm();
      setSuccess(false);
    }
  }

  function resetForm() {
    setStepIndex(0);
    setPoliciesAccepted(false);
    setApplicantType("");
    setFullName("");
    setEmail("");
    setTelephone("");
    setLocation("");
    setSelfEmployed("");
    setInsurance("will_arrange");
    setCanProveIdentity(false);
    setUkBased(true);
    setSpecialisms([]);
    setClientSector("");
    setIndustries([]);
    setWorkSpecialisesIn("");
    setAiKnowledge("");
    setAvailabilityHours("");
    setAvailabilityNotes("");
    setCoverNote("");
    setCvFile(null);
    setDeclarationAccepted(false);
    setError(null);
  }

  function validateStep(id: StepId): string | null {
    switch (id) {
      case "privacy":
        return policiesAccepted
          ? null
          : "Please confirm you have read and agree to our policies before continuing.";
      case "path":
        return applicantType ? null : "Please choose the option that best describes you.";
      case "contact":
        if (!fullName.trim()) return "Please enter your full name.";
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
          return "Please enter a valid email address.";
        }
        if (!ukBased) return "We currently only partner with UK-based freelancers.";
        if (!canProveIdentity) {
          return "You must be able to prove your identity to work with client organisations.";
        }
        return null;
      case "setup":
        return selfEmployed ? null : "Please select your self-employment setup.";
      case "specialisms":
        return specialisms.length ? null : "Please select at least one specialism.";
      case "sector":
        return clientSector ? null : "Please choose a sector.";
      case "industries":
        return industries.length ? null : "Please select at least one industry or domain.";
      case "work":
        return workSpecialisesIn.trim()
          ? null
          : "Please tell us about the work you specialise in.";
      case "ai":
        return aiKnowledge.trim()
          ? null
          : "Please share your knowledge of AI systems and automations (honesty is fine if you are new to this).";
      case "availability":
        return availabilityHours.trim() || availabilityNotes.trim()
          ? null
          : "Please tell us about your availability.";
      case "notes":
        return null;
      case "cv":
        return cvFile ? null : "Please upload your CV as a PDF or Word document.";
      case "declaration":
        return declarationAccepted
          ? null
          : "Please confirm that the information you have provided is true and accurate.";
      default:
        return null;
    }
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function goBack() {
    setError(null);
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function submitApplication() {
    const err = validateStep("declaration");
    if (err) {
      setError(err);
      return;
    }
    if (!cvFile || !applicantType || !selfEmployed || !clientSector) {
      setError("Please complete all required steps.");
      return;
    }

    setSubmitting(true);
    setError(null);
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
      form.set("sectors_interests", `${clientSector}: ${industries.join(", ")}`);
      form.set("client_sector", clientSector);
      form.set("industries", JSON.stringify(industries));
      form.set("work_specialises_in", workSpecialisesIn);
      form.set("ai_knowledge", aiKnowledge);
      form.set("availability_hours_per_week", availabilityHours);
      form.set("availability_notes", availabilityNotes);
      form.set("cover_note", coverNote);
      form.set("policies_accepted", "true");
      form.set("declaration_accepted", "true");
      form.set("cv", cvFile);

      const res = await fetch("/api/va-applications", { method: "POST", body: form });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setError(null);
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  const choiceCard = (active: boolean) =>
    `w-full rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
      active
        ? "border-pine-800 bg-pine-50 font-semibold text-pine-900"
        : "border-ink/10 bg-cream/30 text-muted hover:border-ink/25"
    }`;

  function renderStep() {
    switch (step) {
      case "privacy":
        return (
          <div className="space-y-5">
            <p className="text-sm leading-7 text-muted md:text-[15px] md:leading-8">
              Before you start, please read how we handle the information you submit on this
              application. By continuing you confirm you understand and agree to the policies linked
              below.
            </p>
            <div className="rounded-2xl border border-ink/10 bg-cream/40 px-5 py-5 text-sm leading-7 text-muted md:px-6 md:py-6 md:text-[15px] md:leading-8">
              <p className="font-semibold text-ink">What we collect</p>
              <p className="mt-3">
                Your contact details, location, self-employment and insurance readiness, identity
                confirmation, specialisms, preferred client sectors and industries, availability, CV,
                and any notes you choose to share. We use this only to review your application, contact
                you about partnership opportunities, and match you to suitable work with VAxAI.
              </p>
              <p className="mt-4">
                We do not sell your data. You can ask us to access, correct or delete your application
                information at any time by emailing{" "}
                <a href="mailto:hello@mt1l.com" className="font-semibold text-pine-800 underline">
                  hello@mt1l.com
                </a>
                .
              </p>
            </div>
            <ul className="grid gap-2.5 text-sm sm:grid-cols-2">
              <li>
                <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-pine-800 underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-pine-800 underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/ai-use-policy" target="_blank" rel="noreferrer" className="font-semibold text-pine-800 underline">
                  AI Use Policy
                </a>
              </li>
              <li>
                <a href="/edi-policy" target="_blank" rel="noreferrer" className="font-semibold text-pine-800 underline">
                  JEF / EDI Policy
                </a>
              </li>
            </ul>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm leading-6 text-muted md:px-5 md:py-4">
              <input
                type="checkbox"
                checked={policiesAccepted}
                onChange={(e) => setPoliciesAccepted(e.target.checked)}
                className="mt-1"
              />
              <span>
                I have read and agree to the Privacy Policy, Terms of Service, AI Use Policy and JEF
                Policy, and I am happy to proceed with this application.
              </span>
            </label>
          </div>
        );

      case "path":
        return (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-muted">
              Which best describes you? This helps us support you appropriately.
            </p>
            {(Object.keys(VA_APPLICANT_TYPE_LABELS) as VaApplicantType[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setApplicantType(key);
                  if (key === "early_career" && !selfEmployed) setSelfEmployed("need_setup_help");
                }}
                className={choiceCard(applicantType === key)}
              >
                {VA_APPLICANT_TYPE_LABELS[key]}
              </button>
            ))}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="va-full-name">
                Full name *
              </label>
              <input
                id="va-full-name"
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="va-email">
                Email *
              </label>
              <input
                id="va-email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="va-phone">
                Phone number
              </label>
              <input
                id="va-phone"
                type="tel"
                className={inputClass}
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="va-location">
                Location (town / region)
              </label>
              <input
                id="va-location"
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Manchester"
              />
            </div>
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
        );

      case "setup":
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className={labelClass}>Self-employment setup *</p>
              {(Object.keys(VA_SELF_EMPLOYED_LABELS) as VaSelfEmployedStatus[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelfEmployed(key)}
                  className={choiceCard(selfEmployed === key)}
                >
                  {VA_SELF_EMPLOYED_LABELS[key]}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className={labelClass}>Business insurance</p>
              {(Object.keys(VA_INSURANCE_LABELS) as VaInsuranceStatus[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInsurance(key)}
                  className={choiceCard(insurance === key)}
                >
                  {VA_INSURANCE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        );

      case "specialisms":
        return (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-muted">
              Select any that apply. You do not need every skill listed.
            </p>
            <ChipSelect values={specialisms} onChange={setSpecialisms} options={VA_SPECIALISMS} />
          </div>
        );

      case "sector":
        return (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-muted">
              Which type of organisation are you most interested in supporting?
            </p>
            {VA_CLIENT_SECTORS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => {
                  setClientSector(sector);
                  setIndustries([]);
                }}
                className={choiceCard(clientSector === sector)}
              >
                {sector}
              </button>
            ))}
          </div>
        );

      case "industries":
        return (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-muted">
              {clientSector
                ? `Select the industries or domains within ${clientSector.toLowerCase()} that interest you.`
                : "Select a sector first."}
            </p>
            {clientSector ? (
              <ChipSelect values={industries} onChange={setIndustries} options={industryOptions} />
            ) : null}
          </div>
        );

      case "work":
        return (
          <div>
            <label className={labelClass} htmlFor="va-work">
              Work you specialise in *
            </label>
            <textarea
              id="va-work"
              rows={6}
              className={inputClass}
              value={workSpecialisesIn}
              onChange={(e) => setWorkSpecialisesIn(e.target.value)}
              placeholder="Describe the kinds of admin or support work you do best."
            />
          </div>
        );

      case "ai":
        return (
          <div>
            <label className={labelClass} htmlFor="va-ai">
              Your knowledge of AI systems and automations *
            </label>
            <textarea
              id="va-ai"
              rows={6}
              className={inputClass}
              value={aiKnowledge}
              onChange={(e) => setAiKnowledge(e.target.value)}
              placeholder="Tools you have used, comfort level, or interest in learning."
            />
          </div>
        );

      case "availability":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="va-hours">
                Typical hours available per week *
              </label>
              <input
                id="va-hours"
                className={inputClass}
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                placeholder="e.g. 10–15 hours"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="va-avail-notes">
                Availability notes
              </label>
              <input
                id="va-avail-notes"
                className={inputClass}
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                placeholder="e.g. evenings, term-time only"
              />
            </div>
          </div>
        );

      case "notes":
        return (
          <div>
            <label className={labelClass} htmlFor="va-notes">
              Anything else you would like us to know?
            </label>
            <textarea
              id="va-notes"
              rows={5}
              className={inputClass}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Optional"
            />
          </div>
        );

      case "cv":
        return (
          <div>
            <label className={labelClass} htmlFor="va-cv">
              Upload your CV (PDF or Word) *
            </label>
            <label
              htmlFor="va-cv"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-cream/40 px-6 py-10 text-center transition-colors hover:border-pine-800/40"
            >
              <FileUp className="h-6 w-6 text-pine-800" />
              <span className="text-sm font-semibold text-ink">
                {cvFile ? cvFile.name : "Click to upload your CV"}
              </span>
              <span className="text-xs text-muted">PDF, DOC or DOCX · max 8MB</span>
              <input
                id="va-cv"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        );

      case "declaration":
        return (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              Please review and confirm before submitting. We will only use this information to assess
              your application and contact you about freelance opportunities with VAxAI.
            </p>
            <div className="rounded-2xl border border-ink/10 bg-cream/40 px-4 py-4 text-sm leading-6 text-muted">
              <p>
                <span className="font-semibold text-ink">Name:</span> {fullName || "—"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-ink">Email:</span> {email || "—"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-ink">Path:</span>{" "}
                {applicantType ? VA_APPLICANT_TYPE_LABELS[applicantType] : "—"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-ink">Sector focus:</span>{" "}
                {clientSector ? `${clientSector} (${industries.join(", ") || "—"})` : "—"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-ink">CV:</span> {cvFile?.name || "—"}
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-muted">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-1"
              />
              <span>
                I declare that the information I have provided in this application is true and accurate
                to the best of my knowledge.
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  }

  const modalBodyMin =
    step === "privacy"
      ? "min-h-[22rem] sm:min-h-[26rem]"
      : step === "specialisms" || step === "industries"
        ? "min-h-[18rem] sm:min-h-[22rem]"
        : "min-h-[12rem] sm:min-h-[14rem]";

  const modal =
    mounted && modalOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 px-3 py-4 backdrop-blur-md sm:px-4 sm:py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="va-apply-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div className="flex max-h-[min(96vh,920px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
              <div className="shrink-0 bg-pine-900 px-5 py-5 text-paper sm:px-7 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid">
                      Application
                    </p>
                    <h2 id="va-apply-title" className="mt-1.5 text-xl font-semibold leading-tight sm:text-2xl">
                      {success ? "Application received" : STEP_TITLES[step]}
                    </h2>
                    {!success ? (
                      <p className="mt-1.5 text-xs text-paper/55">
                        Step {stepIndex + 1} of {STEPS.length}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-paper"
                    aria-label="Close application"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-acid transition-all duration-300 ease-premium"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {success ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-14">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-pine-900 text-acid">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-ink sm:text-2xl">
                    Application received
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-muted sm:text-base sm:leading-8">
                    Thank you for applying to partner with VAxAI. We will review your application and
                    get in touch if there is a good fit.
                  </p>
                  <button type="button" onClick={closeModal} className={`${btn.primary} mt-8`}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`min-h-0 flex-1 overflow-y-auto scrollbar-none px-5 py-6 sm:px-7 sm:py-7 ${modalBodyMin}`}
                  >
                    {renderStep()}
                    {error ? <p className={errorClass}>{error}</p> : null}
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-ink/8 bg-white px-5 py-4 sm:px-7">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={stepIndex === 0 || submitting}
                      className={btn.ghost}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    {step === "declaration" ? (
                      <button
                        type="button"
                        onClick={() => void submitApplication()}
                        disabled={submitting}
                        className={btn.primary}
                      >
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
                    ) : (
                      <button type="button" onClick={goNext} className={btn.primary}>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-pine-900/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="dark" />
        </header>

        <main className="overflow-x-hidden">
          {/* Hero — stacked on mobile, image constrained and readable */}
          <section className="bg-pine-900 px-4 py-12 text-paper sm:py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <motion.div initial="hidden" animate="show" variants={fadeUp} className="order-1">
                <Eyebrow light>Partner with VAxAI</Eyebrow>
                <h1 className="mt-5 max-w-3xl text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:mt-6 sm:text-[2.35rem] md:text-5xl">
                  Become a VAxAI freelancer
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-paper/70 sm:mt-8 md:text-lg">
                  We are looking for talented UK-based freelance virtual assistants to help organisations
                  clear admin backlogs, prepare for AI and automation where it adds value, keep ongoing
                  admin systems running, and monitor work so problems do not return.
                </p>
                <p className="mt-4 max-w-2xl text-base leading-8 text-paper/70 md:text-lg">
                  Our freelancers support project-based work (backlog clearing and AI preparation) as well
                  as monthly retainer services (ongoing admin and maintenance of AI and automation outputs).
                </p>
                <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
                  <button type="button" onClick={openModal} className={btn.accent}>
                    Start your application
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a href="#who" className={btn.ghostDark}>
                    Who we partner with
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                className="relative order-2 mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none"
              >
                <div
                  className="simplified-hide absolute -inset-2 rotate-1 rounded-[28px] border border-white/10 bg-white/[0.04] sm:-inset-3 sm:rotate-2 sm:rounded-[36px]"
                  aria-hidden="true"
                />
                <div className="relative aspect-[16/11] overflow-hidden rounded-[22px] ring-1 ring-white/15 sm:aspect-[4/3] sm:rounded-[28px] lg:aspect-[0.92]">
                  <img
                    src={HERO_IMAGE}
                    alt="Freelance professionals collaborating remotely"
                    className="simplified-photo h-full w-full object-cover object-center"
                  />
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
                  We actively welcome experienced professionals and motivated people early in their careers
                  who want to build meaningful freelance work. If you are not fully set up yet, you can still
                  apply. We can help you understand the process of freelancing and getting ready for client
                  work.
                </p>
              </Reveal>

              <Reveal className="mt-10 max-w-2xl rounded-[28px] border border-ink/5 bg-white p-7 shadow-card md:p-8">
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
              </Reveal>
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

          {/* Why partner — includes training / VAT framing (no separate AI perk section) */}
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
                  <Reveal
                    key={item}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-5"
                  >
                    <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                      ✓
                    </span>
                    <p className="text-sm leading-7 text-paper/80 md:text-[15px]">{item}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Apply CTA — more visible card */}
          <section id="apply" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal className="overflow-hidden rounded-[28px] border border-ink/8 bg-white shadow-lift md:grid md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-8 md:p-10 lg:p-12">
                  <Eyebrow>Partner with VAxAI</Eyebrow>
                  <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                    Ready to partner with us?
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-muted">
                    Start your application when you are ready. We take you through one step at a time —
                    privacy, experience, specialisms, availability and CV — so nothing gets missed.
                  </p>
                  <button type="button" onClick={openModal} className={`${btn.primary} mt-8`}>
                    Start your application
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col justify-center border-t border-ink/5 bg-pine-900 p-8 text-paper md:border-l md:border-t-0 md:p-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid">
                    What happens next
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-paper/75">
                    <li>Submit your application and CV</li>
                    <li>We review fit, specialisms and availability</li>
                    <li>We get in touch if there is a good match</li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        <SiteFooter />
        <SimplifiedModeToggle />
      </div>
      {modal}
    </>
  );
}
