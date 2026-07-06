import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, source } = (await req.json()) ?? {};

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : anonClient();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const allowedSources = ["footer", "popup"];
    const { error } = await db.from("newsletter_subscribers").insert({
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      source: allowedSources.includes(source) ? source : "footer",
    });

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}