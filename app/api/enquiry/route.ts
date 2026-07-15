import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import {
  allowlist,
  asBoolean,
  cleanEmail,
  cleanOptionalText,
  cleanText,
  maxBodyBytes,
} from "@/lib/security/validate";
import { publicWriteClient } from "@/lib/security/public-db";

const SUPPORT_TYPES = [
  "Reduce backlog",
  "Prepare for AI and automation",
  "Ongoing admin support",
  "Maintain and improve",
  "Access to Work",
  "General enquiry",
  "Admin Review",
  "Admin Support",
] as const;

const PREFERRED_CONTACT = ["Email", "Telephone"] as const;

export async function POST(req: NextRequest) {
  if (!maxBodyBytes(req, 48_000)) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const ip = clientIp(req);
  const limited = rateLimit(`enquiry:${ip}`, { limit: 8, windowMs: 15 * 60_000 });
  const headers = rateLimitHeaders(limited);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers });
  }

  const name = cleanText(body.name, 120);
  const email = cleanEmail(body.email);
  const supportType = allowlist(body.supportType, SUPPORT_TYPES, "General enquiry");
  const preferredContact = allowlist(body.preferredContact, PREFERRED_CONTACT, "Email");
  const telephone = cleanOptionalText(body.telephone, 40);
  const details = cleanText(body.details, 8_000);
  const wantsDiscoveryCall = asBoolean(body.wantsDiscoveryCall);
  const connected_post_id = cleanOptionalText(body.connected_post_id, 80);
  const connected_post_title = cleanOptionalText(body.connected_post_title, 200);

  if (!name || !email || !details) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers });
  }

  if (preferredContact === "Telephone" && !telephone) {
    return NextResponse.json(
      { error: "Telephone number is required when telephone contact is preferred" },
      { status: 400, headers },
    );
  }

  const supabase = publicWriteClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503, headers });
  }

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    support_type: supportType,
    preferred_contact: preferredContact,
    telephone: telephone || null,
    details,
    wants_discovery_call: wantsDiscoveryCall,
    connected_post_id: connected_post_id ?? null,
    connected_post_title: connected_post_title ?? null,
    status: "Needs review",
    source: "Website enquiry",
  });

  if (error) {
    console.error("Enquiry insert error:", error.code ?? "unknown");
    return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500, headers });
  }

  return NextResponse.json({ success: true }, { headers });
}
