import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import {
  allowlist,
  cleanEmail,
  cleanOptionalText,
  maxBodyBytes,
} from "@/lib/security/validate";
import { publicWriteClient } from "@/lib/security/public-db";
import { createServiceClient } from "@/lib/supabase";

function newsletterWriteClient() {
  // Prefer service role so sign-ups always land in Studio even if anon RLS is misconfigured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return createServiceClient();
    } catch {
      /* fall through */
    }
  }
  return publicWriteClient();
}

export async function POST(req: NextRequest) {
  if (!maxBodyBytes(req, 8_000)) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const ip = clientIp(req);
  const limited = rateLimit(`newsletter:${ip}`, { limit: 6, windowMs: 15 * 60_000 });
  const headers = rateLimitHeaders(limited);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  }

  try {
    const body = (await req.json()) ?? {};
    const email = cleanEmail(body.email);
    const name = cleanOptionalText(body.name, 120);
    const source = allowlist(body.source, ["footer", "popup"], "footer");

    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers },
      );
    }

    const db = newsletterWriteClient();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503, headers });
    }

    const { error } = await db.from("newsletter_subscribers").insert({
      email,
      name,
      source,
    });

    if (error && error.code !== "23505") {
      console.error("Newsletter insert error:", error.code ?? "unknown", error.message);
      return NextResponse.json({ error: "Unable to subscribe right now." }, { status: 500, headers });
    }

    return NextResponse.json({ ok: true }, { headers });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400, headers });
  }
}
