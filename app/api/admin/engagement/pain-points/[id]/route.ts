import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("engagement_pain_points")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: synonyms } = await supabase
    .from("engagement_pain_point_synonyms")
    .select("id, phrase")
    .eq("pain_point_id", id);

  const { data: vatPrompts } = await supabase
    .from("engagement_vat_prompts")
    .select("*")
    .contains("pain_point_ids", [id])
    .eq("status", "approved")
    .order("dimension")
    .order("sort_order");

  return NextResponse.json({
    data: { ...data, synonyms: synonyms || [], vat_prompts: vatPrompts || [] },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await req.json();
  const { synonyms, ...pp } = body;

  const { data, error } = await supabase
    .from("engagement_pain_points")
    .update(pp)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (synonyms !== undefined) {
    await supabase.from("engagement_pain_point_synonyms").delete().eq("pain_point_id", id);
    if (synonyms.length > 0) {
      await supabase.from("engagement_pain_point_synonyms").insert(
        synonyms.map((phrase: string) => ({ pain_point_id: id, phrase }))
      );
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const { error } = await supabase.from("engagement_pain_points").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
