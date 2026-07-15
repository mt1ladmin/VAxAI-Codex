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
  VA_INSURANCE_STATUSES,
  VA_SELF_EMPLOYED_STATUSES,
  VA_SPECIALISMS,
} from "@/lib/va-applications/constants";

const MAX_CV_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function parseSpecialisms(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set<string>(VA_SPECIALISMS as unknown as string[]);
    return parsed
      .filter((s): s is string => typeof s === "string" && allowed.has(s))
      .slice(0, 20);
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => (VA_SPECIALISMS as readonly string[]).includes(s))
      .slice(0, 20);
  }
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
  const applicantType = allowlist(form.get("applicant_type"), VA_APPLICANT_TYPES, "");
  const selfEmployedStatus = allowlist(
    form.get("self_employed_status"),
    VA_SELF_EMPLOYED_STATUSES,
    "",
  );
  const hasInsurance = allowlist(form.get("has_business_insurance"), VA_INSURANCE_STATUSES, "will_arrange");
  const canProveIdentity = asBoolean(form.get("can_prove_identity"));
  const ukBased = form.get("uk_based") == null ? true : asBoolean(form.get("uk_based"));
  const specialisms = parseSpecialisms(form.get("specialisms"));
  const sectorsInterests = cleanOptionalText(form.get("sectors_interests"), 2_000);
  const workSpecialisesIn = cleanOptionalText(form.get("work_specialises_in"), 4_000);
  const aiKnowledge = cleanOptionalText(form.get("ai_knowledge"), 4_000);
  const availabilityHours = cleanOptionalText(form.get("availability_hours_per_week"), 80);
  const availabilityNotes = cleanOptionalText(form.get("availability_notes"), 2_000);
  const coverNote = cleanOptionalText(form.get("cover_note"), 4_000);

  if (!fullName || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400, headers });
  }
  if (!applicantType || !selfEmployedStatus) {
    return NextResponse.json(
      { error: "Please select your experience path and self-employment status" },
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
  if (!availabilityHours && !availabilityNotes) {
    return NextResponse.json(
      { error: "Please tell us about your availability" },
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
