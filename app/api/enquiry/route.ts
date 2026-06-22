import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const {
    name,
    email,
    supportType,
    preferredContact,
    telephone,
    details,
    wantsDiscoveryCall,
    connected_post_id,
    connected_post_title,
  } = body;

  if (!name || !email || !supportType || !details) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { createServiceClient } = await import("@/lib/supabase");
  const supabase = createServiceClient();

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    support_type: supportType,
    preferred_contact: preferredContact,
    telephone: telephone || null,
    details,
    wants_discovery_call: wantsDiscoveryCall === true,
    connected_post_id: connected_post_id ?? null,
    connected_post_title: connected_post_title ?? null,
    status: "Needs review",
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
