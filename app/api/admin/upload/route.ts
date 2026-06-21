import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const db = createServiceClient();
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await db.storage
      .from("vaxai-studio")
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = db.storage.from("vaxai-studio").getPublicUrl(data.path);
    return NextResponse.json({ url: publicUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    console.error("Upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
