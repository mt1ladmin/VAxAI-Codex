import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function GET() {
  try {
    await assertAuth();
    const db = createServiceClient();
    const { data, error } = await db
      .from("social_posts")
      .select("*")
      .order("scheduled_date", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAuth();
    const body = await req.json() as {
      title: string;
      platform: string;
      description?: string;
      content: string;
      scheduled_date: string;
      tags?: string[];
      link?: string;
    };
    if (!body.title || !body.platform || !body.scheduled_date) {
      return NextResponse.json({ error: "title, platform and scheduled_date are required" }, { status: 400 });
    }
    const db = createServiceClient();
    const { data, error } = await db.from("social_posts").insert({
      title: body.title,
      platform: body.platform,
      description: body.description ?? "",
      content: body.content ?? "",
      scheduled_date: body.scheduled_date,
      tags: body.tags ?? [],
      link: body.link ?? null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
