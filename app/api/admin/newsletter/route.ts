import { NextResponse } from "next/server";
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
      .from("newsletter_subscribers")
      .select("email, name, source, subscribed_at")
      .order("subscribed_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}