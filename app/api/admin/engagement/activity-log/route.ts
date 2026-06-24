import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const enquiryId = searchParams.get("enquiry_id");
  const queueId = searchParams.get("queue_id");
  const contactId = searchParams.get("contact_id");
  const outreachId = searchParams.get("outreach_id");
  const limit = Math.min(parseInt(searchParams.get("limit") || "80", 10), 200);

  if (!enquiryId && !queueId && !contactId && !outreachId) {
    return NextResponse.json(
      { error: "enquiry_id, queue_id, contact_id, or outreach_id is required" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const filters: string[] = [];
  if (enquiryId) filters.push(`enquiry_id.eq.${enquiryId}`);
  if (queueId) filters.push(`queue_id.eq.${queueId}`);
  if (contactId) filters.push(`contact_id.eq.${contactId}`);
  if (outreachId) filters.push(`outreach_id.eq.${outreachId}`);

  let query = supabase.from("engagement_activity_log").select("*");

  if (filters.length === 1) {
    const parts = filters[0].split(".");
    query = query.eq(parts[0], parts[2]);
  } else {
    query = query.or(filters.join(","));
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}