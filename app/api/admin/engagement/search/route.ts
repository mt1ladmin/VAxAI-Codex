import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const mode = searchParams.get("mode") || "everything";
  const limit = parseInt(searchParams.get("limit") || "20");

  const results: Array<{
    id: string; type: string; title: string; description: string | null;
    tags: string[]; status: string; last_reviewed: string | null;
  }> = [];

  const qLower = q.toLowerCase();

  // Pain points (with synonyms)
  if (mode === "everything" || mode === "pain_points") {
    const { data: painPoints } = await supabase
      .from("engagement_pain_points")
      .select("id, title, category, plain_english_definition, status, last_reviewed, relevant_sectors")
      .or(
        q
          ? `title.ilike.%${q}%,category.ilike.%${q}%,plain_english_definition.ilike.%${q}%`
          : "status.eq.approved"
      )
      .eq("status", "approved")
      .limit(limit);

    // Also search synonyms
    if (q) {
      const { data: synonymMatches } = await supabase
        .from("engagement_pain_point_synonyms")
        .select("pain_point_id, phrase")
        .ilike("phrase", `%${q}%`)
        .limit(20);

      if (synonymMatches && synonymMatches.length > 0) {
        const matchedIds = [...new Set(synonymMatches.map((s) => s.pain_point_id))];
        const { data: byId } = await supabase
          .from("engagement_pain_points")
          .select("id, title, category, plain_english_definition, status, last_reviewed, relevant_sectors")
          .in("id", matchedIds)
          .eq("status", "approved");
        if (byId) {
          for (const pp of byId) {
            if (!painPoints?.find((p) => p.id === pp.id)) {
              (painPoints as typeof byId)?.push(pp);
            }
          }
        }
      }
    }

    for (const pp of painPoints || []) {
      results.push({
        id: pp.id,
        type: "pain_point",
        title: pp.title,
        description: pp.plain_english_definition,
        tags: [pp.category, ...(pp.relevant_sectors || [])].filter(Boolean),
        status: pp.status,
        last_reviewed: pp.last_reviewed,
      });
    }
  }

  // Organisations
  if (mode === "everything" || mode === "profiles") {
    const query = supabase
      .from("engagement_organisations")
      .select("id, name, industry, audience_type, status, updated_at, tags")
      .limit(limit);
    if (q) query.or(`name.ilike.%${q}%,industry.ilike.%${q}%,audience_type.ilike.%${q}%`);
    const { data: orgs } = await query;
    for (const o of orgs || []) {
      results.push({
        id: o.id,
        type: "organisation",
        title: o.name,
        description: [o.audience_type, o.industry].filter(Boolean).join(" · "),
        tags: o.tags || [],
        status: o.status || "active",
        last_reviewed: o.updated_at,
      });
    }
  }

  // Contacts
  if (mode === "everything" || mode === "crm") {
    const query = supabase
      .from("engagement_contacts")
      .select("id, first_name, last_name, role, professional_email, updated_at")
      .limit(limit);
    if (q) {
      query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,role.ilike.%${q}%,professional_email.ilike.%${q}%`
      );
    }
    const { data: contacts } = await query;
    for (const c of contacts || []) {
      results.push({
        id: c.id,
        type: "contact",
        title: [c.first_name, c.last_name].filter(Boolean).join(" "),
        description: [c.role, c.professional_email].filter(Boolean).join(" · "),
        tags: [],
        status: "active",
        last_reviewed: c.updated_at,
      });
    }
  }

  // Opportunities
  if (mode === "everything" || mode === "crm") {
    const query = supabase
      .from("engagement_opportunities")
      .select("id, title, stage, recommended_pathway, updated_at")
      .limit(limit);
    if (q) query.ilike("title", `%${q}%`);
    const { data: opps } = await query;
    for (const o of opps || []) {
      results.push({
        id: o.id,
        type: "opportunity",
        title: o.title,
        description: o.stage,
        tags: [o.recommended_pathway].filter(Boolean) as string[],
        status: "active",
        last_reviewed: o.updated_at,
      });
    }
  }

  // Sectors
  if (mode === "everything" || mode === "knowledge") {
    const query = supabase
      .from("engagement_sector_profiles")
      .select("id, name, description, status, review_date, audience_types")
      .eq("status", "approved")
      .limit(limit);
    if (q) query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    const { data: sectors } = await query;
    for (const s of sectors || []) {
      results.push({
        id: s.id,
        type: "sector",
        title: s.name,
        description: s.description,
        tags: s.audience_types || [],
        status: s.status,
        last_reviewed: s.review_date,
      });
    }
  }

  // Scripts / knowledge
  if (mode === "everything" || mode === "knowledge") {
    const query = supabase
      .from("engagement_scripts")
      .select("id, title, channel, block_type, status, last_reviewed")
      .eq("status", "approved")
      .limit(limit);
    if (q) query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    const { data: scripts } = await query;
    for (const s of scripts || []) {
      results.push({
        id: s.id,
        type: "script",
        title: s.title,
        description: [s.channel, s.block_type].filter(Boolean).join(" · "),
        tags: [s.channel, s.block_type].filter(Boolean) as string[],
        status: s.status,
        last_reviewed: s.last_reviewed,
      });
    }
  }

  // Sort: exact title match first, then by recency
  const sorted = results.sort((a, b) => {
    const aExact = a.title.toLowerCase() === qLower ? 1 : 0;
    const bExact = b.title.toLowerCase() === qLower ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    return (b.last_reviewed || "").localeCompare(a.last_reviewed || "");
  });

  return NextResponse.json({ data: sorted.slice(0, limit) });
}
