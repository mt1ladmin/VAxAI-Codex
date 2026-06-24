import { NextResponse } from "next/server";

/** Legacy prospect_queue row API removed — use engagement contacts/opportunities. */
export async function GET() {
  return NextResponse.json(
    { error: "Legacy prospect_queue API removed. Use /api/admin/engagement/contacts/:id" },
    { status: 410 },
  );
}

export async function PATCH() {
  return NextResponse.json({ error: "Legacy prospect_queue API removed" }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Legacy prospect_queue API removed" }, { status: 410 });
}