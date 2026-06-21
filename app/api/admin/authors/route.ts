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
    const { data, error } = await db.from("authors").select("*").order("created_at", { ascending: true });
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
    const body = await req.json() as { name: string; bio?: string; avatar_url?: string; linkedin_url?: string };
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const db = createServiceClient();
    const { data, error } = await db.from("authors").insert({ name: body.name, bio: body.bio ?? "", avatar_url: body.avatar_url ?? null, linkedin_url: body.linkedin_url ?? null }).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
