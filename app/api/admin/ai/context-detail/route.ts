import { assembleContextPackage } from "@/lib/ai/assemble-context-package";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "type and id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const assembled = await assembleContextPackage(supabase, type, id);

  return NextResponse.json({
    type,
    id,
    label: assembled.label,
    summary: assembled.package,
  });
}