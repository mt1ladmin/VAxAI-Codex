import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sector = searchParams.get("sector") || "";
  const limit = parseInt(searchParams.get("limit") || "100");

  let query = supabase
    .from("engagement_pain_points")
    .select("*")
    .eq("status", "approved")
    .order("category")
    .order("title")
    .limit(limit);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,category.ilike.%${q}%,plain_english_definition.ilike.%${q}%`
    );
  }
  if (category) query = query.eq("category", category);
  if (sector) query = query.contains("relevant_sectors", [sector]);

  const { data: painPoints, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach synonyms if searching
  if (q && painPoints) {
    const { data: synonyms } = await supabase
      .from("engagement_pain_point_synonyms")
      .select("pain_point_id, phrase")
      .ilike("phrase", `%${q}%`);

    if (synonyms) {
      const matchedIds = [...new Set(synonyms.map((s) => s.pain_point_id))];
      const newIds = matchedIds.filter((id) => !painPoints.find((p) => p.id === id));
      if (newIds.length > 0) {
        const { data: extra } = await supabase
          .from("engagement_pain_points")
          .select("*")
          .in("id", newIds)
          .eq("status", "approved");
        if (extra) painPoints.push(...extra);
      }
    }
  }

  // Attach synonym phrases for display
  if (painPoints && painPoints.length > 0) {
    const ids = painPoints.map((p) => p.id);
    const { data: allSynonyms } = await supabase
      .from("engagement_pain_point_synonyms")
      .select("pain_point_id, phrase")
      .in("pain_point_id", ids);
    for (const pp of painPoints) {
      (pp as Record<string, unknown>).synonyms = (allSynonyms || [])
        .filter((s) => s.pain_point_id === pp.id)
        .map((s) => s.phrase);
    }
  }

  return NextResponse.json({ data: painPoints });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { synonyms, ...pp } = body;

  const { data, error } = await supabase
    .from("engagement_pain_points")
    .insert(pp)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (synonyms && synonyms.length > 0) {
    await supabase.from("engagement_pain_point_synonyms").insert(
      synonyms.map((phrase: string) => ({ pain_point_id: data.id, phrase }))
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
