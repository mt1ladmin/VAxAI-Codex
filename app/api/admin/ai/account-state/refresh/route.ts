import { NextRequest, NextResponse } from "next/server";
import { assembleContextPackage } from "@/lib/ai/assemble-context-package";
import {
  findStaleAccountStates,
  refreshAccountStateFromPackage,
} from "@/lib/ai/account-state";
import { createServiceClient } from "@/lib/supabase";

import { bearerAuthorized } from "@/lib/security/validate";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AI_BATCH_SECRET;
  return bearerAuthorized(req, secret);
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

  const CONCURRENCY = 5;
  const results: Array<{ context_type: string; context_id: string; ok: boolean }> = [];

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (target) => {
        const [assembled, sessionRes] = await Promise.all([
          assembleContextPackage(supabase, target.context_type, target.context_id, {
            includeWorkingState: false,
          }),
          supabase
            .from("ai_chat_sessions")
            .select("summary")
            .eq("context_type", target.context_type)
            .eq("context_id", target.context_id)
            .maybeSingle(),
        ]);

        const ok = await refreshAccountStateFromPackage(
          supabase,
          target.context_type,
          target.context_id,
          assembled.package,
          sessionRes.data?.summary ?? null,
        );

        return { context_type: target.context_type, context_id: target.context_id, ok };
      }),
    );
    results.push(...batchResults);
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