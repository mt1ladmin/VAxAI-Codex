import { createServiceClient } from "@/lib/supabase";
import { createChatSnapshotWithArchive } from "@/lib/engagement/chat-archive";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    contextType?: string;
    contextId?: string;
    sessionId?: string;
    messageCount?: number;
  };

  const { contextType, contextId, sessionId, messageCount } = body;

  if (!contextType || !contextId || !sessionId || !messageCount || messageCount <= 0) {
    return NextResponse.json({ error: "Invalid snapshot payload" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const result = await createChatSnapshotWithArchive(supabase, {
    sessionId,
    contextType,
    contextId,
    messageCount,
    logToActivity: true,
  });

  if (result.skipped && !result.snapshotId) {
    return NextResponse.json({ data: { skipped: true } });
  }

  return NextResponse.json({
    data: { snapshotId: result.snapshotId, skipped: result.skipped },
  });
}