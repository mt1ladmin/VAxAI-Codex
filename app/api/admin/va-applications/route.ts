import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import {
  isVaApplicationStatus,
  type VaApplicationStatus,
} from "@/lib/va-applications/constants";

async function assertAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function GET(req: NextRequest) {
  try {
    await assertAuth();
    const tab = req.nextUrl.searchParams.get("tab"); // applications | approved | all
    const status = req.nextUrl.searchParams.get("status");
    const db = createServiceClient();

    let query = db
      .from("va_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all" && isVaApplicationStatus(status)) {
      query = query.eq("status", status);
    } else if (tab === "approved") {
      query = query.in("status", ["approved", "joined"]);
    } else if (tab === "applications" || !tab) {
      query = query.in("status", ["new", "contacted", "verified", "not_suitable"]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await assertAuth();
    const { ids } = (await req.json()) as { ids: string[] };
    if (!ids?.length) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const db = createServiceClient();
    const { data: rows } = await db
      .from("va_applications")
      .select("id, cv_path")
      .in("id", ids);

    const { error } = await db.from("va_applications").delete().in("id", ids);
    if (error) throw error;

    const paths = (rows ?? [])
      .map((r) => r.cv_path as string | null)
      .filter((p): p is string => !!p);
    if (paths.length) {
      await db.storage.from("vaxai-studio").remove(paths).catch(() => undefined);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export type { VaApplicationStatus };
