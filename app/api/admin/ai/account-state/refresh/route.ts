import { NextRequest, NextResponse } from "next/server";
import { assembleContextPackage } from "@/lib/ai/assemble-context-package";
import {
  findStaleAccountStates,
  refreshAccountStateFromPackage,
} from "@/lib/ai/account-state";
import { createServiceClient } from "@/lib/supabase";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AI_BATCH_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { limit?: number };
  const limit = Math.min(Math.max(body.limit ?? 15, 1), 30);

  const supabase = createServiceClient();
  const targets = await findStaleAccountStates(supabase, limit);

  if (targets.length === 0) {
    return NextResponse.json({ data: { refreshed: 0, skipped: 0, targets: [] } });
  }

  const results: Array<{ context_type: string; context_id: string; ok: boolean }> = [];

  for (const target of targets) {
    const assembled = await assembleContextPackage(
      supabase,
      target.context_type,
      target.context_id,
      { includeWorkingState: false },
    );

    const { data: session } = await supabase
      .from("ai_chat_sessions")
      .select("summary")
      .eq("context_type", target.context_type)
      .eq("context_id", target.context_id)
      .maybeSingle();

    const ok = await refreshAccountStateFromPackage(
      supabase,
      target.context_type,
      target.context_id,
      assembled.package,
      session?.summary ?? null,
    );

    results.push({
      context_type: target.context_type,
      context_id: target.context_id,
      ok,
    });
  }

  const refreshed = results.filter((r) => r.ok).length;

  return NextResponse.json({
    data: {
      refreshed,
      skipped: results.length - refreshed,
      targets: results,
    },
  });
}