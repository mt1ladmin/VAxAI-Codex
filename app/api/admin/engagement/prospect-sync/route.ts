import { NextRequest, NextResponse } from "next/server";

/** Legacy CSV → prospect_queue sync retired with unified Prospect Queue. */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Legacy prospect_queue sync is retired. Use Prospect Finder and move-to-queue instead.",
      success: false,
    },
    { status: 410 },
  );
}