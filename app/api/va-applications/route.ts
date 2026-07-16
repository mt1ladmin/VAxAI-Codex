import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import {
  allowlist,
  asBoolean,
  cleanEmail,
  cleanOptionalText,
  cleanText,
} from "@/lib/security/validate";
import { createServiceClient } from "@/lib/supabase";
import {
  VA_APPLICANT_TYPES,
  VA_CLIENT_SECTORS,
  VA_EXPERIENCE_YEARS,
  VA_INSURANCE_STATUSES,
  VA_SELF_EMPLOYED_STATUSES,
  VA_SPECIALISMS,
  industriesForSectors,
  type VaClientSector,
} from "@/lib/va-applications/constants";

const MAX_CV_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function parseStringArray(
  raw: FormDataEntryValue | null,
  allowed: readonly string[],
  max = 30,
): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  const allowedSet = new Set(allowed);
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === "string" && allowedSet.has(s))
      .slice(0, max);
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => allowedSet.has(s))
      .slice(0, max);
  }
}

function parseSpecialisms(raw: FormDataEntryValue | null): string[] {
  return parseStringArray(raw, VA_SPECIALISMS as unknown as string[], 20);
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`va-app:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  const headers = rateLimitHeaders(limited);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many applications from this network. Please try again later." },
      { status: 429, headers },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400, headers });
  }

  const fullName = cleanText(form.get("full_name"), 120);
  const email = cleanEmail(form.get("email"));
  const telephone = cleanOptionalText(form.get("telephone"), 40);
  const location = cleanOptionalText(form.get("location"), 120);
  const applicantType =
    allowlist(form.get("applicant_type"), VA_APPLICANT_TYPES, "experienced") || "experienced";
  const selfEmployedStatus = allowlist(
    form.get("self_employed_status"),
    VA_SELF_EMPLOYED_STATUSES,
    "",
  );
  const hasInsurance = allowlist(
    form.get("has_business_insurance"),
    VA_INSURANCE_STATUSES,
    "will_arrange",
  );
  const canProveIdentity = asBoolean(form.get("can_prove_identity"));
  const ukBased = form.get("uk_based") == null ? true : asBoolean(form.get("uk_based"));
  const specialisms = parseSpecialisms(form.get("specialisms"));

  // Multi-select sectors (preferred) with single-sector fallback for older clients
  let clientSectors = parseStringArray(
    form.get("client_sectors"),
    VA_CLIENT_SECTORS as unknown as string[],
    8,
  ) as VaClientSector[];
  if (clientSectors.length === 0) {
    const clientSectorRaw = cleanText(form.get("client_sector"), 80);
    if (clientSectorRaw && (VA_CLIENT_SECTORS as readonly string[]).includes(clientSectorRaw)) {
      clientSectors = [clientSectorRaw as VaClientSector];
    }
  }

  const industryAllowed = industriesForSectors(clientSectors);
  const industries = parseStringArray(form.get("industries"), industryAllowed, 40);
  const sectorsInterests =
    cleanOptionalText(form.get("sectors_interests"), 2_000) ||
    (clientSectors.length
      ? clientSectors.map((s) => `${s}: ${industries.join(", ")}`).join(" | ")
      : null);
  const workSpecialisesIn = cleanOptionalText(form.get("work_specialises_in"), 4_000);
  const experienceYearsRaw = cleanOptionalText(form.get("experience_years"), 40);
  const experienceYears =
    experienceYearsRaw &&
    (VA_EXPERIENCE_YEARS as readonly string[]).includes(experienceYearsRaw)
      ? experienceYearsRaw
      : experienceYearsRaw;
  const aiKnowledge = cleanOptionalText(form.get("ai_knowledge"), 4_000);
  const availabilityHours = cleanOptionalText(form.get("availability_hours_per_week"), 80);
  const availabilityNotes = cleanOptionalText(form.get("availability_notes"), 2_000);
  const coverNote = cleanOptionalText(form.get("cover_note"), 4_000);
  const linkedinUrl = cleanOptionalText(form.get("linkedin_url"), 500);
  const hasComputer = asBoolean(form.get("has_computer"));
  const hasInternet = asBoolean(form.get("has_internet"));
  const hasQuietSpace = asBoolean(form.get("has_quiet_space"));
  const agreeNda = asBoolean(form.get("agree_nda"));
  const agreeReferences = asBoolean(form.get("agree_references"));
  const agreeBackgroundCheck = asBoolean(form.get("agree_background_check"));
  const policiesAccepted = asBoolean(form.get("policies_accepted"));
  const declarationAccepted = asBoolean(form.get("declaration_accepted"));

  if (!fullName || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400, headers });
  }
  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400, headers });
  }
  if (!selfEmployedStatus) {
    return NextResponse.json(
      { error: "Please select your self-employment status" },
      { status: 400, headers },
    );
  }
  if (!ukBased) {
    return NextResponse.json(
      { error: "We currently only work with UK-based freelancers" },
      { status: 400, headers },
    );
  }
  if (!canProveIdentity) {
    return NextResponse.json(
      { error: "You must be able to prove your identity to work with client organisations" },
      { status: 400, headers },
    );
  }
  if (!policiesAccepted || !declarationAccepted) {
    return NextResponse.json(
      { error: "You must accept our policies and confirm the application statements" },
      { status: 400, headers },
    );
  }
  if (!availabilityHours && !availabilityNotes) {
    return NextResponse.json(
      { error: "Please tell us about your availability" },
      { status: 400, headers },
    );
  }
  if (clientSectors.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one organisation type you have worked with" },
      { status: 400, headers },
    );
  }
  if (!agreeNda || !agreeReferences || !agreeBackgroundCheck) {
    return NextResponse.json(
      { error: "Please confirm the contracts and professionalism statements" },
      { status: 400, headers },
    );
  }

  const cv = form.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ error: "Please upload your CV (PDF or Word)" }, { status: 400, headers });
  }
  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json({ error: "CV must be 8MB or smaller" }, { status: 400, headers });
  }
  const cvType = cv.type || "application/pdf";
  const cvName = cv.name || "cv.pdf";
  const ext = (cvName.split(".").pop() || "pdf").toLowerCase();
  if (!ALLOWED_CV_TYPES.has(cvType) && !["pdf", "doc", "docx"].includes(ext)) {
    return NextResponse.json(
      { error: "CV must be a PDF or Word document" },
      { status: 400, headers },
    );
  }

  let db;
  try {
    db = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Database not configured" }, { status: 503, headers });
  }

  const safeExt = ["pdf", "doc", "docx"].includes(ext) ? ext : "pdf";
  const cvPath = `va-applications/cvs/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  const arrayBuffer = await cv.arrayBuffer();
  const { error: uploadError } = await db.storage
    .from("vaxai-studio")
    .upload(cvPath, arrayBuffer, {
      contentType: cvType,
      upsert: false,
    });

  if (uploadError) {
    console.error("VA CV upload error:", uploadError.message);
    return NextResponse.json(
      { error: "Failed to upload CV. Please try again." },
      { status: 500, headers },
    );
  }

  const {
    data: { publicUrl },
  } = db.storage.from("vaxai-studio").getPublicUrl(cvPath);

  const { error: insertError } = await db.from("va_applications").insert({
    applicant_type: applicantType,
    full_name: fullName,
    email,
    telephone: telephone || null,
    location: location || null,
    uk_based: true,
    self_employed_status: selfEmployedStatus,
    has_business_insurance: hasInsurance,
    can_prove_identity: true,
    specialisms,
    sectors_interests: sectorsInterests,
    work_specialises_in: workSpecialisesIn,
    ai_knowledge: aiKnowledge,
    availability_hours_per_week: availabilityHours,
    availability_notes: availabilityNotes,
    cv_path: cvPath,
    cv_file_name: cvName.slice(0, 200),
    cv_url: publicUrl,
    cover_note: coverNote,
    status: "new",
    last_action: "Application submitted via website",
    last_action_date: new Date().toISOString(),
    profile_extras: {
      client_sectors: clientSectors,
      client_sector: clientSectors[0] ?? null,
      industries,
      experience_years: experienceYears || null,
      linkedin_url: linkedinUrl || null,
      equipment: {
        computer: hasComputer,
        internet: hasInternet,
        quiet_space: hasQuietSpace,
      },
      contracts: {
        nda_dpa: agreeNda,
        references: agreeReferences,
        background_check: agreeBackgroundCheck,
      },
      policies_accepted: true,
      declaration_accepted: true,
    },
  });

  if (insertError) {
    console.error("VA application insert error:", insertError.code ?? insertError.message);
    // Best-effort cleanup of orphaned CV
    await db.storage.from("vaxai-studio").remove([cvPath]).catch(() => undefined);
    return NextResponse.json(
      { error: "Failed to save application. Please try again." },
      { status: 500, headers },
    );
  }

  return NextResponse.json({ success: true }, { headers });
}
