"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileUp, Loader2, X } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import FilingTab from "@/components/FilingTab";
import PublicContactModal from "@/components/PublicContactModal";
import { openNewsletterPopup } from "@/components/NewsletterPopup";
import {
  VA_AI_KNOWLEDGE_OPTIONS,
  VA_CLIENT_SECTORS,
  VA_EXPERIENCE_YEARS,
  VA_INSURANCE_FORM_OPTIONS,
  VA_INSURANCE_LABELS,
  VA_SELF_EMPLOYED_FORM_OPTIONS,
  VA_SELF_EMPLOYED_LABELS,
  VA_SPECIALISMS,
  industriesForSectors,
  type VaClientSector,
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
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
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
  "To be based in the UK and have the right to work in the UK",
  "To be correctly set up (or ready to set up) as self-employed with HMRC, or to operate through a limited company",
  "Professional Indemnity insurance arranged before any client work begins",
  "A reliable computer, stable high-speed internet, and a quiet professional workspace",
  "Proven discretion, professionalism and attention to detail",
  "Experience handling confidential or sensitive information in a professional setting",
];

const CONVICTION_OPTIONS = ["No", "Yes", "I do not wish to say"] as const;
const START_SOON_OPTIONS = ["Yes", "No"] as const;

const partnerFaqs: [string, string][] = [
  [
    "Who can join the VAxAI VA partner network?",
    "We work with experienced UK-based freelance virtual assistants who want to deliver high-quality admin support on a flexible basis. You should meet our essentials for client work (including UK right to work, self-employment readiness and Professional Indemnity insurance before client work begins).",
  ],
  [
    "Do I need to be fully set up as self-employed first?",
    "You can register interest if you are already registered with HMRC as self-employed, or ready to register when required. Professional Indemnity insurance must be in place before any client work begins.",
  ],
  [
    "How does pay work?",
    "We do not publish fixed rates because every engagement is different. Rates and payment terms are discussed openly and confirmed in writing before any work begins.",
  ],
  [
    "What kind of work will I do?",
    "Work is matched to your skills and interests. It may include backlog recovery, organising information, day-to-day operational admin, process documentation, and human review of AI-assisted work for founders, growing businesses, charities and public sector teams.",
  ],
  [
    "Do I need strong AI experience?",
    "No. Curiosity and a willingness to learn help. We offer free workshops and events on practical AI and automation skills for admin roles. What matters most is reliable admin craft, discretion and clear communication.",
  ],
  [
    "How does matching work?",
    "We carefully match freelancers to projects and retainers so the fit is right for you and the organisation. You receive clear briefs and structured onboarding, and you can choose work that suits your strengths and availability.",
  ],
  [
    "What about confidentiality?",
    "This work often involves working with confidential information. Successful applicants are asked to sign a Non-Disclosure Agreement and Data Processing Agreement before client work begins, and will need to provide references to become a VAxAI VA partner.",
  ],
  [
    "How long until I hear back?",
    "After you register your interest and submit your CV, we review fit, specialisms, setup readiness and availability. We contact you if there is a good match and invite you to the next stage. Timing depends on current demand and how well your profile fits live work.",
  ],
];

/** Ordered wizard steps (one focus per screen) */
const STEPS = [
  "privacy",
  "contact",
  "setup",
  "equipment",
  "specialisms",
  "sector",
  "industries",
  "experience",
  "ai",
  "availability",
  "contracts",
  "cv",
  "notes",
] as const;

type StepId = (typeof STEPS)[number];

const STEP_TITLES: Record<StepId, string> = {
  privacy: "Before you start",
  contact: "Your details",
  setup: "Self-employment and insurance readiness",
  equipment: "Equipment and workspace",
  specialisms: "Specialisms",
  sector: "Sectors you have worked with",
  industries: "Industries and domains",
  experience: "Experience",
  ai: "AI and automation",
  availability: "Availability",
  contracts: "Confidentiality, integrity and checks",
  cv: "Your CV",
  notes: "Anything else",
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

function PartnerFaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-5 py-1 md:px-6">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold leading-snug text-ink md:text-[15px]">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-pine-800 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-premium ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-7 text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function WorkWithVaxaiPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);

  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [location, setLocation] = useState("");
  const [selfEmployed, setSelfEmployed] = useState<VaSelfEmployedStatus | "">("");
  const [insurance, setInsurance] = useState<VaInsuranceStatus | "">("");
  const [canProveIdentity, setCanProveIdentity] = useState(false);
  const [ukBased, setUkBased] = useState(false);
  const [hasComputer, setHasComputer] = useState(false);
  const [hasInternet, setHasInternet] = useState(false);
  const [hasQuietSpace, setHasQuietSpace] = useState(false);
  const [specialisms, setSpecialisms] = useState<string[]>([]);
  const [clientSectors, setClientSectors] = useState<VaClientSector[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceNote, setExperienceNote] = useState("");
  const [aiKnowledge, setAiKnowledge] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [agreeNda, setAgreeNda] = useState(false);
  const [agreeReferences, setAgreeReferences] = useState(false);
  const [agreeBackgroundCheck, setAgreeBackgroundCheck] = useState(false);
  const [convictionDisclosure, setConvictionDisclosure] = useState("");
  const [availableStartSoon, setAvailableStartSoon] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
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

  const industryOptions = useMemo(() => industriesForSectors(clientSectors), [clientSectors]);

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
    setFullName("");
    setEmail("");
    setTelephone("");
    setLocation("");
    setSelfEmployed("");
    setInsurance("");
    setCanProveIdentity(false);
    setUkBased(false);
    setHasComputer(false);
    setHasInternet(false);
    setHasQuietSpace(false);
    setSpecialisms([]);
    setClientSectors([]);
    setIndustries([]);
    setExperienceYears("");
    setExperienceNote("");
    setAiKnowledge("");
    setAvailabilityHours("");
    setAvailabilityNotes("");
    setAgreeNda(false);
    setAgreeReferences(false);
    setAgreeBackgroundCheck(false);
    setConvictionDisclosure("");
    setAvailableStartSoon("");
    setCoverNote("");
    setCvFile(null);
    setLinkedinUrl("");
    setError(null);
  }

  function toggleSector(sector: VaClientSector) {
    setClientSectors((prev) => {
      const next = prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector];
      const allowed = new Set(industriesForSectors(next));
      setIndustries((inds) => inds.filter((i) => allowed.has(i)));
      return next;
    });
  }

  function validateStep(id: StepId): string | null {
    switch (id) {
      case "privacy":
        return policiesAccepted
          ? null
          : "Please confirm you have read and agree to our policies before continuing.";
      case "contact":
        if (!fullName.trim()) return "Please enter your full name.";
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
          return "Please enter a valid email address.";
        }
        if (!location.trim()) return "Please enter your location (town / region).";
        if (!ukBased) return "We currently only partner with UK-based freelancers.";
        if (!canProveIdentity) {
          return "You must be able to prove your identity to work with client organisations.";
        }
        return null;
      case "setup":
        if (!selfEmployed) return "Please select your self-employment setup.";
        if (!insurance) return "Please select your business insurance status.";
        return null;
      case "equipment":
        if (!hasComputer || !hasInternet || !hasQuietSpace) {
          return "Please confirm you have a reliable computer, stable internet and a quiet workspace.";
        }
        return null;
      case "specialisms":
        return specialisms.length ? null : "Please select at least one specialism.";
      case "sector":
        return clientSectors.length
          ? null
          : "Please select at least one type of organisation you have worked with.";
      case "industries":
        return industries.length
          ? null
          : "Please select at least one industry or domain for the sectors you chose.";
      case "experience":
        return experienceYears ? null : "Please select your years of relevant experience.";
      case "ai":
        return aiKnowledge
          ? null
          : "Please select your current knowledge of AI tools and automations.";
      case "availability":
        if (!availabilityHours.trim()) {
          return "Please tell us your typical hours available per week.";
        }
        if (!availableStartSoon) {
          return "Please tell us if you are available to start within the next 2–4 weeks.";
        }
        return null;
      case "contracts":
        if (!agreeNda || !agreeReferences || !agreeBackgroundCheck) {
          return "Please confirm all three confidentiality and integrity statements to continue.";
        }
        if (!convictionDisclosure) {
          return "Please answer the disclosure question about criminal offences, fraud or financial misconduct.";
        }
        return null;
      case "cv":
        return cvFile ? null : "Please upload your CV as a PDF or Word document.";
      case "notes":
        return null;
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
    const err = validateStep("notes");
    if (err) {
      setError(err);
      return;
    }
    // Re-validate critical prior steps before submit
    for (const id of STEPS) {
      if (id === "notes") continue;
      const stepErr = validateStep(id);
      if (stepErr) {
        setError(stepErr);
        setStepIndex(STEPS.indexOf(id));
        return;
      }
    }
    if (!cvFile || !selfEmployed || !insurance) {
      setError("Please complete all required steps.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("applicant_type", "experienced");
      form.set("full_name", fullName);
      form.set("email", email);
      form.set("telephone", telephone);
      form.set("location", location);
      form.set("uk_based", String(ukBased));
      form.set("self_employed_status", selfEmployed);
      form.set("has_business_insurance", insurance);
      form.set("can_prove_identity", String(canProveIdentity));
      form.set("specialisms", JSON.stringify(specialisms));
      form.set("client_sectors", JSON.stringify(clientSectors));
      form.set("industries", JSON.stringify(industries));
      form.set(
        "sectors_interests",
        clientSectors.map((s) => `${s}: ${industries.filter((i) => industriesForSectors([s]).includes(i)).join(", ") || industries.join(", ")}`).join(" | "),
      );
      form.set("work_specialises_in", experienceNote);
      form.set("experience_years", experienceYears);
      form.set("ai_knowledge", aiKnowledge);
      form.set("availability_hours_per_week", availabilityHours);
      form.set("availability_notes", availabilityNotes);
      form.set("available_start_soon", availableStartSoon);
      form.set("conviction_disclosure", convictionDisclosure);
      form.set("cover_note", coverNote);
      form.set("linkedin_url", linkedinUrl);
      form.set("has_computer", String(hasComputer));
      form.set("has_internet", String(hasInternet));
      form.set("has_quiet_space", String(hasQuietSpace));
      form.set("agree_nda", String(agreeNda));
      form.set("agree_references", String(agreeReferences));
      form.set("agree_background_check", String(agreeBackgroundCheck));
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
              Please read how we handle the information you submit. By continuing you confirm you
              understand and agree to the policies linked below.
            </p>
            <div className="rounded-2xl border border-ink/10 bg-cream/40 px-5 py-5 text-sm leading-7 text-muted md:px-6 md:py-6 md:text-[15px] md:leading-8">
              <p className="font-semibold text-ink">What we collect</p>
              <p className="mt-3">
                Your contact details (name, email, phone if provided), location (town / region),
                confirmation that you are based in the UK and can prove you are human,
                self-employment and Professional Indemnity insurance readiness, equipment and
                workspace status, specialisms, sectors and industries you have worked with,
                years of experience and optional experience notes, AI and automation knowledge,
                availability (hours, preferred days or times, and whether you can start within
                2–4 weeks), confidentiality and integrity confirmations (including willingness to
                sign an NDA and Data Processing Agreement, provide references, and complete a basic
                background check if required), your answer to a question about criminal offences,
                fraud or financial misconduct, your CV, optional LinkedIn or portfolio link, and any
                other notes you choose to share. We use this only to review your interest, contact you
                about partnership opportunities, and match you to suitable work with VAxAI.
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
                I have read and agree to the Privacy Policy, Terms of Service, AI Use Policy and JEF /
                EDI Policy, and I am happy to proceed with this application.
              </span>
            </label>
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
                Location (town / region) *
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
              I can prove I am human *
            </label>
          </div>
        );

      case "setup":
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className={labelClass}>Self-employment setup *</p>
              {VA_SELF_EMPLOYED_FORM_OPTIONS.map((key) => (
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
              <p className={labelClass}>Business insurance (Professional Indemnity as a minimum) *</p>
              {VA_INSURANCE_FORM_OPTIONS.map((key) => (
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

      case "equipment":
        return (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-muted">
              Confirm you have what you need for professional remote work.
            </p>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-muted">
              <input
                type="checkbox"
                checked={hasComputer}
                onChange={(e) => setHasComputer(e.target.checked)}
                className="mt-1"
              />
              I have a reliable computer/laptop suitable for professional work *
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-muted">
              <input
                type="checkbox"
                checked={hasInternet}
                onChange={(e) => setHasInternet(e.target.checked)}
                className="mt-1"
              />
              I have a stable, high-speed internet connection *
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-muted">
              <input
                type="checkbox"
                checked={hasQuietSpace}
                onChange={(e) => setHasQuietSpace(e.target.checked)}
                className="mt-1"
              />
              I have a quiet space where I can work without major interruptions *
            </label>
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
              Which types of organisation have you worked with? Select all that apply. On the next
              step you can choose industries within the sectors you select.
            </p>
            {VA_CLIENT_SECTORS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={choiceCard(clientSectors.includes(sector))}
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
              {clientSectors.length
                ? `Select the industries or domains within ${clientSectors.join(", ").toLowerCase()} that you have worked with.`
                : "Select at least one sector first."}
            </p>
            {clientSectors.length ? (
              <ChipSelect values={industries} onChange={setIndustries} options={industryOptions} />
            ) : null}
          </div>
        );

      case "experience":
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className={labelClass}>
                Roughly how many years of relevant admin / PA / support experience do you have? *
              </p>
              {VA_EXPERIENCE_YEARS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setExperienceYears(opt)}
                  className={choiceCard(experienceYears === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div>
              <label className={labelClass} htmlFor="va-experience-note">
                Optional: Brief note on your most relevant recent experience (2–3 sentences)
              </label>
              <textarea
                id="va-experience-note"
                rows={4}
                className={inputClass}
                value={experienceNote}
                onChange={(e) => setExperienceNote(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-2">
            <p className={labelClass}>
              Your current knowledge of AI tools and automations for admin work *
            </p>
            {VA_AI_KNOWLEDGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAiKnowledge(opt)}
                className={choiceCard(aiKnowledge === opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "availability":
        return (
          <div className="space-y-5">
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
            <div className="space-y-2">
              <p className={labelClass}>Are you available to start within the next 2–4 weeks? *</p>
              {START_SOON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAvailableStartSoon(opt)}
                  className={choiceCard(availableStartSoon === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div>
              <label className={labelClass} htmlFor="va-avail-notes">
                Preferred working days / times (optional)
              </label>
              <input
                id="va-avail-notes"
                className={inputClass}
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                placeholder="e.g. mornings, term-time only"
              />
            </div>
          </div>
        );

      case "contracts":
        return (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              This work often involves working with confidential information.
            </p>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm leading-6 text-muted">
              <input
                type="checkbox"
                checked={agreeNda}
                onChange={(e) => setAgreeNda(e.target.checked)}
                className="mt-1"
              />
              I understand the confidential nature of the work and am willing to sign a Non-Disclosure
              Agreement and Data Processing Agreement before any client work begins *
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm leading-6 text-muted">
              <input
                type="checkbox"
                checked={agreeReferences}
                onChange={(e) => setAgreeReferences(e.target.checked)}
                className="mt-1"
              />
              I am willing to provide professional references if requested *
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm leading-6 text-muted">
              <input
                type="checkbox"
                checked={agreeBackgroundCheck}
                onChange={(e) => setAgreeBackgroundCheck(e.target.checked)}
                className="mt-1"
              />
              I am willing to complete a basic background check if required for certain client work *
            </label>
            <div className="space-y-2 pt-1">
              <p className={labelClass}>
                Have you ever been convicted of a criminal offence, fraud, or financial misconduct? *
              </p>
              {CONVICTION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setConvictionDisclosure(opt)}
                  className={choiceCard(convictionDisclosure === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case "cv":
        return (
          <div className="space-y-5">
            <div>
              <label className={labelClass} htmlFor="va-cv">
                Upload your CV *
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
            <div>
              <label className={labelClass} htmlFor="va-linkedin">
                Optional: Link to LinkedIn or portfolio
              </label>
              <input
                id="va-linkedin"
                type="url"
                className={inputClass}
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
        );

      case "notes":
        return (
          <div>
            <label className={labelClass} htmlFor="va-notes">
              Is there anything else you would like us to know? (optional)
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
                    Thank you for registering your interest in the VAxAI VA partner network. We will
                    review fit, specialisms, setup readiness and availability, and get in touch if
                    there is a good match.
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
                    {step === "notes" ? (
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
                            Register your interest
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
          {/* Hero */}
          <section className="bg-pine-900 px-4 py-12 text-paper sm:py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <motion.div initial="hidden" animate="show" variants={fadeUp} className="order-1">
                <Eyebrow light>Partner with VAxAI</Eyebrow>
                <h1 className="mt-5 max-w-3xl text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:mt-6 sm:text-[2.35rem] md:text-5xl">
                  Join the VAxAI VA partner network
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-paper/70 sm:mt-8 md:text-lg">
                  We work with skilled UK-based freelance virtual assistants who help organisations
                  clear admin backlogs, prepare for practical AI and automation, keep systems running
                  smoothly, and prevent problems from returning.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
                  <button type="button" onClick={openModal} className={btn.accent}>
                    Register your interest
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a href="/about" className={btn.ghostDark}>
                    Learn about VAxAI
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
                <div className="relative aspect-[16/11] overflow-hidden rounded-[22px] bg-pine-900 ring-1 ring-white/15 sm:aspect-[4/3] sm:rounded-[28px] lg:aspect-[0.92]">
                  <img
                    src="/pexels-diva-plavalaguna-6937658.jpg"
                    alt="Professional remote work"
                    className="simplified-photo h-full w-full object-cover object-center"
                  />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Why partner + What you'll need */}
          <section id="who" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-12 md:items-start">
              <Reveal>
                <Eyebrow>Why partner with VAxAI</Eyebrow>
                <div className="mt-5 space-y-5 text-base leading-8 text-muted">
                  <p>
                    Get involved in varied, well-matched work with founders, growing businesses,
                    charities and public sector teams. You&rsquo;ll receive clear briefs and proper
                    onboarding so you can focus on doing excellent work.
                  </p>
                  <p>
                    You&rsquo;ll also have access to free workshops and events that help you build
                    practical AI and automation skills for admin roles, while keeping the flexibility
                    to choose projects that suit your strengths and availability.
                  </p>
                  <p>
                    We don&rsquo;t publish fixed rates because every engagement is different. Rates and
                    payment terms are always discussed openly and confirmed in writing before any work
                    begins.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="rounded-[28px] border border-ink/5 bg-white p-7 shadow-card md:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                    What you&rsquo;ll need
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    To work with us on client projects, freelancers will normally need:
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
                  <p className="mt-5 border-t border-ink/8 pt-4 text-sm leading-7 text-muted">
                    These standards help us maintain the quality, security and professionalism that our
                    clients expect, particularly when work involves confidential information, systems
                    access, or personal data.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Supporting early careers */}
          <section id="early-careers" className="scroll-mt-24 bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow light>Supporting early careers</Eyebrow>
                <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Pathways into freelance admin work
                </h2>
                <p className="mt-6 max-w-3xl text-base leading-8 text-paper/70 md:text-lg">
                  AI and automation are reshaping many traditional entry-level and admin roles, reducing
                  some of the opportunities that young people have historically used to start their
                  careers. If you are interested in a career in freelance administrative work, get in
                  touch or sign up to our newsletter, and be the first to know about opportunities for
                  early-career professionals as they arise.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setContactOpen(true)} className={btn.accent}>
                    Get in touch
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={openNewsletterPopup} className={btn.ghostDark}>
                    Sign up to our newsletter
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* FAQ for freelancers */}
          <section id="faq" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
              <Reveal>
                <Eyebrow>FAQ</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Questions about joining the network?
                </h2>
                <p className="mt-6 max-w-prose text-sm leading-7 text-muted md:text-base md:leading-8">
                  Practical answers on eligibility, pay, matching, confidentiality and what happens after
                  you register your interest.
                </p>
                <button type="button" onClick={openModal} className={`${btn.primary} mt-8`}>
                  Register your interest
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Reveal>
              <Reveal className="divide-y divide-ink/5 self-start rounded-[28px] border border-ink/5 bg-white shadow-card">
                {partnerFaqs.map(([question, answer], index) => (
                  <PartnerFaqItem
                    key={question}
                    question={question}
                    answer={answer}
                    open={openFaq === index}
                    onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                  />
                ))}
              </Reveal>
            </div>
          </section>

          {/* Apply CTA */}
          <section id="apply" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal className="overflow-hidden rounded-[28px] border border-ink/8 bg-white shadow-lift md:grid md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-8 md:p-10 lg:p-12">
                  <Eyebrow>Join our network</Eyebrow>
                  <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                    Ready to join our network?
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-muted">
                    Register your interest and we&rsquo;ll review your experience and strengths, then
                    get in touch if there&rsquo;s a good fit for well-matched projects or retainers.
                  </p>
                  <button type="button" onClick={openModal} className={`${btn.primary} mt-8`}>
                    Register your interest
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col justify-center border-t border-ink/5 bg-pine-900 p-8 text-paper md:border-l md:border-t-0 md:p-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid">
                    What happens next
                  </p>
                  <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-paper/75">
                    <li>Submit your application and CV</li>
                    <li>We review fit, specialisms, setup readiness and availability</li>
                    <li>We contact you if there is a good match and invite you to the next stage</li>
                  </ol>
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        <div id="site-newsletter">
          <SiteFooter />
        </div>
        <SimplifiedModeToggle />
      </div>
      {modal}
      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
